import 'express';
import 'multer';

declare global {
  namespace Express {
    interface Request {
      files?: { [fieldname: string]: Multer.File[] } | Multer.File[];
    }
  }
}