import { CLIENT_BASE_URL, PORT } from '#config';
import '#db';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler, notFoundHandler } from '#middleware';
import { authRoutes, bookRoutes } from '#routes';

const app = express();

// CORS ist eine Sicherheitsmaßnahme in Browsern
// POST, PUT, DELETE requests von Frontends mit abweichenden origins (protocol, domain, port)
// werden standardmäßig geblockt.
// Mit der cors() middleware können wir bestimmte origins zulassen
app.use(
  cors({
    // origin: 'http://localhost:5173'
    origin: CLIENT_BASE_URL, // aus der env
    credentials: true, // für secure cookies
    exposedHeaders: ['WWW-Authenticate'] // für den Refresh-Token-Cycle
  })
);

app.use(express.json(), cookieParser());

app.use('/auth', authRoutes);
app.use('/books', bookRoutes);

app.use('*splat', notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Auth Server listening on http://localhost:${PORT}`);
});
