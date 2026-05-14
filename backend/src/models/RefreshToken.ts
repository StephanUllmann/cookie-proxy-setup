// Importiert die konfigurierte TTL (Time-to-live) für Refresh Tokens in Sekunden
import { REFRESH_TOKEN_TTL } from '#config';
import { model, Schema, Types } from 'mongoose';

const refreshTokenSchema = new Schema({
  // Der eigentliche Token-String (z.B. ein zufälliger UUID oder crypto-Wert).
  // unique: true → MongoDB legt automatisch einen Index an, der Duplikate verhindert.
  token: {
    type: String,
    unique: true,
    required: true
  },

  // Verknüpfung zum User, dem dieser Refresh Token gehört.
  // Types.ObjectId ist der Datentyp für MongoDB-IDs.
  userId: {
    type: Types.ObjectId,
    ref: 'User'
  },

  // Ablaufzeitpunkt des Tokens – wird automatisch beim Erstellen gesetzt.
  // Date.now() gibt die aktuelle Zeit in Millisekunden zurück.
  // REFRESH_TOKEN_TTL ist in Sekunden, daher * 1000 für die Umrechnung in ms.
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + REFRESH_TOKEN_TTL * 1000)
  }
});

// TTL-Index: MongoDB prüft regelmäßig dieses Feld und löscht Dokumente automatisch,
// sobald das Datum in 'expiresAt' erreicht ist.
// expireAfterSeconds: 0 bedeutet: genau zum Zeitpunkt in expiresAt löschen (keine zusätzliche Wartezeit).
// Das erspart uns manuelles Aufräumen abgelaufener Tokens.
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Zusätzlicher Index auf userId, damit Abfragen wie "alle Tokens eines Users" schnell laufen –
// besonders wichtig beim Logout (alle Tokens eines Users löschen).
refreshTokenSchema.index({ userId: 1 });

export default model('RefreshToken', refreshTokenSchema);
