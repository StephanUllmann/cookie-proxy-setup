/* For custom types used in more than one module */

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        roles: string[];
      };
    }
  }
}
