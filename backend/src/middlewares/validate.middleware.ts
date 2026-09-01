import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';  // ✅ Changed from AnyZodObject to ZodObject
import { ApiError } from '@utils/ApiError.js';

export const validate = (schema: ZodObject<any>) => {  // ✅ Changed type
  return async (req: Request, _res: Response, next: NextFunction) => {  // ✅ Added underscore
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err: any) => ({  // ✅ Changed .errors to .issues
          field: err.path.join('.'),
          message: err.message,
        }));
        throw new ApiError(400, 'Validation error', errors);
      }
      next(error);
    }
  };
};

export default validate;