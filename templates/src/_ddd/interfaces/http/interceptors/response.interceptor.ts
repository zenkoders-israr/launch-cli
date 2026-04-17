import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((payload) => {
        const isStructured =
          payload !== null &&
          typeof payload === 'object' &&
          'data' in payload &&
          'message' in payload;

        return {
          status: response.statusCode,
          message: isStructured ? payload.message : 'Success',
          data: isStructured ? payload.data : payload,
        };
      }),
    );
  }
}
