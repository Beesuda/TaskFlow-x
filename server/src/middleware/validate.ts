import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';

// Validate req.body against a zod schema. On success, replaces req.body with the
// parsed (typed/coerced) result. On failure, responds 400 with field issues.
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        issues: result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      });
      return;
    }
    req.body = result.data;
    next();
  };
}
