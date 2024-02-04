import { ExecutionContext, createParamDecorator } from "@nestjs/common";

const User = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest()['user'];
});

export default User;