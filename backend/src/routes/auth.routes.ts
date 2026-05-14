import { login, logout, me, refresh, register } from '#controllers';
import { authenticate, hasRole, validateBody } from '#middleware';
import { registerSchema } from '#schemas';
import { Router } from 'express';

const authRoutes = Router();

authRoutes.post('/register', validateBody(registerSchema), register); // erstellt neuen Nutzer

authRoutes.post('/login', login); // habe ich einen eintrag in der DB? -> Token

authRoutes.delete('/logout', logout); // löscht  Bearer Token

authRoutes.get('/refresh', refresh);

authRoutes.get('/me', authenticate, me);

authRoutes.put('/settings/:id', authenticate, hasRole('self'), () => {});

export default authRoutes;
