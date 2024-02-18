import { ArgumentsHost, Catch, HttpStatus } from "@nestjs/common";
import { BaseWsExceptionFilter } from "@nestjs/websockets";
import { PrismaClientInitializationError, PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { PrismaError } from "prisma-error-enum";
import { Socket } from "socket.io";

@Catch(PrismaClientKnownRequestError, PrismaClientInitializationError)
export class PrismaExceptionWebSocketFilter extends BaseWsExceptionFilter {

    catch(exception: any, host: ArgumentsHost) {
        super.catch(exception, host);

        const socket: Socket = host.switchToWs().getClient();

        if (exception instanceof PrismaClientInitializationError) {
            socket.emit("exception", {
                message: "Can't reach database server",
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
            });
            return;
        }

        if (exception instanceof PrismaClientKnownRequestError) {

            switch (exception.code) {

                case PrismaError.UniqueConstraintViolation:
                    socket.emit("exception", {
                        error: "Unprocessable Entity",
                        message: "Some of your given fields is not available",
                        statusCode: HttpStatus.UNPROCESSABLE_ENTITY
                    });
                    break;

                case PrismaError.RecordsNotFound:
                    socket.emit("exception", ({
                        error: "Not Found",
                        message: "Some of your given field was not found",
                        statusCode: HttpStatus.NOT_FOUND
                    }));
                    break;

                default:
                    socket.emit("exception", ({
                        error: "Database related error.",
                        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
                    }));

            }
            // console.error(exception);
        }
    }
}