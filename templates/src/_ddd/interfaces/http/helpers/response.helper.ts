export function ok<T>(message: string, data: T): { message: string; data: T } {
  return { message, data };
}
