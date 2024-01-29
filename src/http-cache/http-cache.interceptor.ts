import { CACHE_KEY_METADATA, CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const { httpAdapter } = this.httpAdapterHost;
    const request = context.switchToHttp().getRequest<Request>();

    const cacheKey = this.reflector.get(
      CACHE_KEY_METADATA,
      context.getHandler(),
    );

    const excludePaths: any[] = [
      // Routes to be excluded
    ];

    const isGetRequest = httpAdapter.getRequestMethod(request) === 'GET';

    if (
      !isGetRequest ||
      (isGetRequest &&
        excludePaths.includes(httpAdapter.getRequestUrl(request)))
    ) {
      return undefined;
    }

    if (cacheKey) {
      return `${cacheKey}-${request.query}`;
    }

    return super.trackBy(context);
  }
}
