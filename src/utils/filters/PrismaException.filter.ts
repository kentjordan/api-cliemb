import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaClientInitializationError, PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Response } from "express";
import { PrismaError } from "prisma-error-enum";

@Catch(PrismaClientKnownRequestError, PrismaClientInitializationError)
export class PrismaExceptionFilter implements ExceptionFilter {

    catch(exception: any, host: ArgumentsHost) {

        const res: Response = host.switchToHttp().getResponse();

        if (exception instanceof PrismaClientInitializationError) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Can't reach database server",
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR
            });
        }

        if (exception instanceof PrismaClientKnownRequestError) {

            switch (exception.code) {

                case PrismaError.UniqueConstraintViolation:
                    res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
                        error: "Unprocessable Entity",
                        message: "Some of your given fields is not available",
                        statusCode: HttpStatus.UNPROCESSABLE_ENTITY
                    });
                    return;

                case PrismaError.RecordsNotFound:
                    res.status(HttpStatus.NOT_FOUND).json({
                        error: "Not Found",
                        message: "Some of your given field was not found",
                        statusCode: HttpStatus.NOT_FOUND
                    });
                    return;

                default:
                    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                        error: "Database related error.",
                        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
                    });
            }

            console.error(exception);

        }
    }
}