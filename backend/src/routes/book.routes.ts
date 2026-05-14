import { Router } from 'express';
import { createBook, deleteBook, getAllBooks, getOneBook, updateOneBook } from '#controllers';
import { authenticate, hasRole, validateBody } from '#middleware';
import { bookSchema } from '#schemas';

const bookRoutes = Router();

bookRoutes.post('/', authenticate, validateBody(bookSchema), createBook);

bookRoutes.get('/', getAllBooks);

bookRoutes.get('/:id', authenticate, hasRole('reader'), getOneBook);

bookRoutes.put('/:id', authenticate, hasRole('librarian'), validateBody(bookSchema), updateOneBook);

bookRoutes.delete('/:id', authenticate, hasRole('admin'), deleteBook);

export default bookRoutes;
