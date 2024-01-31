import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { JsonWebTokenError, TokenExpiredError } from "@nestjs/jwt";
import { Response } from "express";

@Catch(TokenExpiredError, JsonWebTokenError)
export default class JwtExceptionFilter implements ExceptionFilter {

    catch(exception: TokenExpiredError | JsonWebTokenError, host: ArgumentsHost) {

        const res: Response = host.switchToHttp().getResponse()

        res.status(HttpStatus.UNPROCESSABLE_ENTITY)
            .json({
                error: exception.name,
                message: exception.message.toUpperCase(),
                statusCode: HttpStatus.UNPROCESSABLE_ENTITY
            });

    }

}