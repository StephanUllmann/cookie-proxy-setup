import type { RequestHandler } from 'express';

const hasRole =
  (...roles: string[]): RequestHandler =>
  (req, res, next) => {
    console.log(req.user);
    const { user } = req;

    const { id } = req.params;

    if (!user) {
      throw new Error('Not authenticated', { cause: { status: 401 } });
    }

    const { roles: userRoles, _id } = user;

    if (roles.includes('self') && id === _id) {
      next();
      return;
    }

    if (userRoles.includes('admin')) {
      next();
      return;
    }

    // ["reader", "librarian"]
    if (userRoles.some(role => roles.includes(role))) {
      next();
      return;
    }

    throw new Error('Not Authorized', { cause: { status: 403 } });
  };

export default hasRole;
