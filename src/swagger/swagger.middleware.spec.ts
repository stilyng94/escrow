import { EnvServiceDto } from '@/config/env.service';
import { Test, TestingModule } from '@nestjs/testing';
import { NextFunction, Request, Response } from 'express';
import { swaggerMiddleware } from './swagger.middleware';

describe('SwaggerMiddleware', () => {
  let service: EnvServiceDto;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNextFunction: NextFunction;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EnvServiceDto],
    }).compile();

    service = module.get<EnvServiceDto>(EnvServiceDto);
    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      status: jest.fn(),
      set: jest.fn(),
    };
    mockNextFunction = jest.fn();
  });

  it('without headers', () => {
    const middleware = swaggerMiddleware(service);
    middleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNextFunction,
    );
    expect(mockResponse.status).toHaveBeenCalledWith(401);
  });

  it('without "authorization" header', () => {
    const middleware = swaggerMiddleware(service);
    mockRequest = {
      headers: {},
    };
    middleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNextFunction,
    );
    expect(mockResponse.status).toHaveBeenCalledWith(401);
  });

  it('with "authorization" header', () => {
    const middleware = swaggerMiddleware(service);
    mockRequest = {
      headers: { authorization: 'username password' },
    };
    middleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNextFunction,
    );

    expect(mockNextFunction).toHaveBeenCalledTimes(1);
  });
});
