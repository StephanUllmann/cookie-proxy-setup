import jwt, { type JwtPayload } from 'jsonwebtoken';
import type { RequestHandler } from 'express';

// authenticate ist eine Middleware – sie läuft vor dem eigentlichen Route-Handler
// und entscheidet, ob der Request weiterdarf oder abgelehnt wird.
const authenticate: RequestHandler = (req, res, next) => {
  const { accessToken } = req.cookies;

  // Kein Cookie vorhanden → direkt abweisen, ohne JWT-Prüfung.
  if (!accessToken) {
    throw new Error('thou shall not pass', { cause: { status: 401 } });
  }

  try {
    // jwt.verify() prüft zwei Dinge gleichzeitig:
    // 1. Ist die Signatur gültig? (wurde der Token mit unserem SECRET erstellt?)
    // 2. Ist der Token noch nicht abgelaufen? (expiresIn aus dem Sign-Schritt)
    // Schlägt eines davon fehl, wirft verify() einen Error → catch-Block.
    const decoded = jwt.verify(accessToken, process.env.ACCESS_JWT_SECRET!) as JwtPayload;

    // Aus dem verifizierten Token die User-Daten extrahieren und an req.user hängen.
    // Alle nachfolgenden Route-Handler können damit auf den eingeloggten User zugreifen.
    // sub (subject) haben wir beim Signieren auf die User-ID gesetzt.
    req.user = {
      _id: decoded.sub!.toString(),
      roles: decoded.roles as string[]
    };

    // next() übergibt den Request an den nächsten Handler in der Middleware-Kette.
    next();
  } catch (error) {
    // Sonderfall: Token war gültig signiert, ist aber abgelaufen.
    // Wir unterscheiden diesen Fall bewusst vom "ungültiger Token"-Fall,
    // damit der Client weiß: nicht neu einloggen, sondern /refresh aufrufen.
    if (error instanceof jwt.TokenExpiredError) {
      // WWW-Authenticate ist ein HTTP-Standard-Header für Auth-Fehler.
      // Er signalisiert dem Client (z.B. einem Axios-Interceptor), was zu tun ist.
      res.setHeader(
        'WWW-Authenticate',
        'Bearer error="token_expired", error_description="The access token expired"'
      );
      res.status(401).json({ message: 'Token expired' });
    }

    // Alle anderen Fehler (gefälschte Signatur, falsches Format, etc.)
    // führen zur gleichen generischen Ablehnung wie kein Token.
    throw new Error('thou shall not pass', { cause: { status: 401 } });
  }
};

export default authenticate;
