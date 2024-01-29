import { EnvServiceDto } from '@/config/env.service';
import { NextFunction, Request, Response } from 'express';

const parseAuthHeader = (input: string): { name?: string; pass?: string } => {
  const [, encodedPart] = input.split(' ');
  if (!encodedPart) {
    return {};
  }
  const buff = Buffer.from(encodedPart, 'base64');
  const text = buff.toString('ascii');
  const [name, pass] = text.split(':');
  return { name, pass };
};

export const swaggerMiddleware = (envServiceDto: EnvServiceDto) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers || !req.headers.authorization) {
      res.status(401);
      res.set('WWW-Authenticate', 'Basic');
      return next();
    }
    const credentials = parseAuthHeader(req.headers.authorization);

    if (
      credentials.name !== envServiceDto.API_DOC_USERNAME ||
      credentials.pass !== envServiceDto.API_DOC_PASSWORD
    ) {
      res.status(401);
      res.set('WWW-Authenticate', 'Basic');
      return next();
    }
    return next();
  };
};
