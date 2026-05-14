import jwt from 'jsonwebtoken';
import { ACCESS_JWT_SECRET, ACCESS_TOKEN_TTL } from '#config';
import type { Types } from 'mongoose';
import { randomUUID } from 'node:crypto';
import { RefreshToken } from '#models';

type UserData = {
  _id: Types.ObjectId;
  roles: string[];
};

const createToken = async (userData: UserData) => {
  const options = {
    // Access Token läuft nach ACCESS_TOKEN_TTL ab – dieser Wert wird direkt
    // ins JWT eingebettet und kann nicht nachträglich verändert werden.
    expiresIn: ACCESS_TOKEN_TTL,
    // subject ist ein JWT-Standard-Feld (sub) und identifiziert den Eigentümer des Tokens.
    // Wir konvertieren die MongoDB ObjectId zu einem String, weil JWTs nur Text kennen.
    subject: userData._id.toString()
  };

  // jwt.sign() erstellt den Access Token: signiert die Payload ({ roles })
  // mit dem geheimen Schlüssel. Nur der Server kann damit Tokens erstellen und prüfen.
  const accessToken = jwt.sign({ roles: userData.roles }, ACCESS_JWT_SECRET, options);

  // Refresh Token ist kein JWT – nur eine zufällige ID (UUID v4).
  // Er trägt keine Daten, ist nicht entschlüsselbar und nur durch
  // den DB-Eintrag mit einem User verknüpft.
  const refreshToken = randomUUID();

  // Refresh Token in der DB speichern. expiresAt wird automatisch
  // vom Schema-Default gesetzt (Date.now() + REFRESH_TOKEN_TTL).
  await RefreshToken.create({
    token: refreshToken,
    userId: userData._id.toString()
  });

  return { accessToken, refreshToken };
};

const getCookieOpts = () => ({
  // httpOnly: true → JavaScript im Browser kann diesen Cookie nicht lesen (document.cookie).
  // Schützt vor XSS-Angriffen, bei denen eingeschleuster Code Tokens stiehlt.
  httpOnly: true,

  // secure: true → Cookie wird nur über HTTPS übertragen, nie über plain HTTP.
  secure: true,

  // sameSite: 'none' → Cookie wird auch bei Cross-Origin-Requests mitgeschickt.
  // Notwendig, wenn Frontend und Backend auf unterschiedlichen Domains laufen.
  // 'none' erfordert zwingend secure: true.
  sameSite: 'none' as const

  // expires ist hier auskommentiert → der Access-Token-Cookie wird ein Session-Cookie.
  // Der Browser löscht ihn beim Schließen. Das Ablaufdatum steckt ohnehin im JWT selbst.
  // expires: new Date(Date.now() + ACCESS_TOKEN_TTL * 1000)
});

export { createToken, getCookieOpts };
