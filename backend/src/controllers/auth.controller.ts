import bcrypt from 'bcrypt';
import { RefreshToken, User } from '#models';
import type { RequestHandler } from 'express';
import { createToken, getCookieOpts } from '#utils';
import { REFRESH_TOKEN_TTL } from '#config';

export const register: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

  const userExists = await User.exists({ email });

  if (userExists) throw new Error('User already exists', { cause: { status: 409 } });

  const salt = await bcrypt.genSalt(13);
  const hashedPW = await bcrypt.hash(password, salt);

  const user = (await User.create({ ...req.body, password: hashedPW })).toObject();

  // Passwort-Feld aus dem User-Objekt entfernen, bevor wir es weiterverwenden.
  // Der Unterstrich (_) ist eine Konvention für "diese Variable ignorieren wir bewusst".
  const { password: _, ...data } = user;

  // Beide Token auf einmal erstellen – createToken kümmert sich um JWT (access)
  // und speichert den Refresh Token in MongoDB.
  const { accessToken, refreshToken } = await createToken(data);

  const cookieOpts = getCookieOpts();

  // Access Token: kurzlebig, läuft nach wenigen Minuten ab (Ablauf steckt im JWT selbst).
  res.cookie('accessToken', accessToken, cookieOpts);

  // Refresh Token: langlebig, bekommt zusätzlich ein explizites Cookie-Ablaufdatum,
  // damit der Browser ihn nach REFRESH_TOKEN_TTL Sekunden automatisch löscht.
  res.cookie('refreshToken', refreshToken, {
    ...getCookieOpts(),
    expires: new Date(Date.now() + REFRESH_TOKEN_TTL * 1000)
  });

  res.json({ msg: 'Success', user: data });
};

export const login: RequestHandler = async (req, res) => {
  const { password, email } = req.body;

  const user = await User.findOne({ email }).select('+password').lean();

  if (!user) {
    throw new Error('Invalid credentials', { cause: { status: 401 } });
  }

  const match = await bcrypt.compare(password, user.password!);

  if (!match) {
    throw new Error('Invalid credentials', { cause: { status: 401 } });
  }

  const { password: _, ...data } = user;

  // Token Rotation beim Login:
  // Bisherige Refresh Tokens dieses Users werden gelöscht.
  // So kann sich niemand anderes mit einem alten Token einloggen,
  // selbst wenn er ihn irgendwie abgegriffen hat.
  // Alternativ könnte auch nur der Token des aktuellen Devices gelösht werden
  await RefreshToken.deleteMany({ userId: data._id });

  const { accessToken, refreshToken } = await createToken(data);

  res.cookie('accessToken', accessToken, getCookieOpts());
  res.cookie('refreshToken', refreshToken, {
    ...getCookieOpts(),
    expires: new Date(Date.now() + REFRESH_TOKEN_TTL * 1000)
  });

  res.json({ msg: 'Success', user: data });
};

export const logout: RequestHandler = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (refreshToken) {
    // Nur den einen aktiven Refresh Token löschen (nicht alle).
    // Sinnvoll, wenn ein User auf mehreren Geräten eingeloggt sein kann.
    await RefreshToken.deleteOne({ token: refreshToken });
  }

  // Cookies auf Client-Seite löschen – der Browser entfernt sie
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.json({ message: 'Logged out' });
};

export const me: RequestHandler = async (req, res) => {
  // req.user wurde von der auth-Middleware gesetzt (aus dem validierten Access Token).
  const user = await User.findById(req.user?._id);
  res.json({ user });
};

export const refresh: RequestHandler = async (req, res) => {
  const { refreshToken } = req.cookies;

  // Schritt 1: Ist überhaupt ein Refresh Token im Cookie?
  if (!refreshToken) {
    throw new Error('Please log in again', { cause: { status: 401 } });
  }

  // Schritt 2: Kennt die Datenbank diesen Token?
  // Unbekannte Tokens (abgelaufen, bereits rotiert oder gefälscht) werden abgelehnt.
  const storedToken = await RefreshToken.findOne({ token: refreshToken }).lean();
  if (!storedToken) {
    throw new Error('Please log in again', { cause: { status: 401 } });
  }

  // Schritt 3: Gibt es den zugehörigen User noch?
  const user = await User.findById(storedToken.userId);
  if (!user) {
    throw new Error('Please log in again', { cause: { status: 401 } });
  }

  // Token Rotation:
  // Den alten Refresh Token (und alle anderen dieses Users) löschen,
  // dann sofort ein frisches Token-Paar ausstellen.
  // Jeder Refresh Token ist damit nur genau einmal verwendbar.
  // Wird ein Token gestohlen und zuerst vom Angreifer genutzt, ist
  // der Token des echten Users beim nächsten Request bereits ungültig.
  await RefreshToken.deleteMany({ userId: user._id });

  const { accessToken, refreshToken: rToken } = await createToken(user);

  res.cookie('accessToken', accessToken, getCookieOpts());
  res.cookie('refreshToken', rToken, {
    ...getCookieOpts(),
    expires: new Date(Date.now() + REFRESH_TOKEN_TTL * 1000)
  });

  res.json({ msg: 'Success', user });
};
