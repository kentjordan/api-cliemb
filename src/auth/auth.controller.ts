import { Body, Controller, Get, Post, Req, Res, UseFilters } from '@nestjs/common';
import { AuthService } from './auth.service';
import SignupAdminDto from './dto/signupAdmin.dto';
import SignupStudentDto from './dto/signupStudent.dto';
import { PrismaExceptionFilter } from 'src/utils/filters/PrismaException.filter';
import { Request, Response } from 'express';
import LoginAdminDto from './dto/loginAdmin.dto';
import JwtExceptionFilter from 'src/utils/filters/JwtException.filter';
import LoginStudentDto from './dto/loginStudent.dto';

@UseFilters(PrismaExceptionFilter)
@Controller('auth')
export class AuthController {

  // In days, here we have 7 days before expiration
  RT_COOKIE_EXP = 7

  constructor(private readonly authService: AuthService) { }

  @UseFilters(JwtExceptionFilter)
  @Get('refresh')
  refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {

    const refresh_token = req.cookies['refresh_token'];

    const refreshedTokens = this.authService.refreshToken(refresh_token)

    res.cookie('refresh_token', refreshedTokens.refresh_token);

    return {
      access_token: refreshedTokens.access_token
    }

  }

  @Post('signup/student')
  signupStudent(@Body() dto: SignupStudentDto) {
    return this.authService.signupStudent(dto);
  }

  @Post('login/student')
  loginStudent(
    @Body() dto: LoginStudentDto) {
    return this.authService.loginStudent(dto);
  }

  @Post('signup/admin')
  async signupAdmin(@Res({ passthrough: true }) res: Response, @Body() dto: SignupAdminDto) {

    const { access_token, refresh_token } = await this.authService.signupAdmin(dto);

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * this.RT_COOKIE_EXP
    });

    return {
      access_token
    }

  }

  @Post('login/admin')
  async loginAdmin(@Res({ passthrough: true }) res: Response, @Body() body: LoginAdminDto) {

    const { access_token, refresh_token } = await this.authService.loginAdmin(body);

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * this.RT_COOKIE_EXP,
    });

    return {
      access_token
    }

  }

}
