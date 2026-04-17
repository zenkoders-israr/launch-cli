/**
 * Wrap controller return values with a custom message.
 * The ResponseInterceptor will unwrap this into { status, message, data }.
 *
 * Usage:
 *   return ok('User created successfully', user);
 *   return ok('Logged in', { accessToken });
 */
export function ok<T>(message: string, data: T): { message: string; data: T } {
  return { message, data };
}
