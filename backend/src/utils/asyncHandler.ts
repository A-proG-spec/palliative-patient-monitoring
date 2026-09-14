import { Request, Response, NextFunction } from 'express';

/**
 * Wraps an async Express handler so that:
 *   1. Any thrown/rejected error is forwarded to the error middleware.
 *   2. If the handler returns a plain object shaped like an ApiResponse
 *      (i.e. `{ statusCode, success, message, data }`) and the response
 *      has not already been sent, we send it here.
 *
 * This makes controllers that use `return SuccessResponse(...)` work
 * without needing to call `res.json(...)` themselves.
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next))
      .then((result) => {
        // Auto-send an ApiResponse-shaped return value if the handler
        // didn't already finish the response itself.
        if (
          result &&
          typeof result === 'object' &&
          typeof (result as any).statusCode === 'number' &&
          'data' in result &&
          !res.headersSent
        ) {
          res.status((result as any).statusCode).json(result);
        }
      })
      .catch(next);
  };
};

export default asyncHandler;