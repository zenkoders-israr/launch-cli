import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const WsCurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const client = ctx.switchToWs().getClient();
    const user = client.data?.user;
    return data ? user?.[data] : user;
  },
);
