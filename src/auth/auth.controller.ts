import { Body, Controller, Get, Patch, Post, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import SignupAdminDto from './dto/signupAdmin.dto';
import SignupUserDto from './dto/signupUser.dto';
import { PrismaExceptionFilter } from 'src/utils/filters/PrismaException.filter';
import { Request, Response } from 'express';
import LoginAdminDto from './dto/loginAdmin.dto';
import JwtExceptionFilter from 'src/utils/filters/JwtException.filter';
import LoginUserDto from './dto/loginUser.dto';
import UserRefreshTokenDto from './dto/userRefreshToken.dto';

@UseFilters(PrismaExceptionFilter)
@Controller('auth')
export class AuthController {

  // In days, here we have 7 days before expiration
  RT_COOKIE_EXP = 7

  constructor(private readonly authService: AuthService) { }

  @UseFilters(JwtExceptionFilter)
  @Get('refresh/admin')
  refreshAdminToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {

    const refresh_token = req.cookies['refresh_token'];

    const refreshedTokens = this.authService.refreshToken(refresh_token)

    res.cookie('refresh_token', refreshedTokens.refresh_token);

    return {
      access_token: refreshedTokens.access_token
    }

  }

  @UseFilters(JwtExceptionFilter)
  @Patch('refresh/user')
  refreshUserToken(@Body() body: UserRefreshTokenDto, @Res({ passthrough: true }) res: Response) {

    return this.authService.refreshToken(body.refresh_token)

  }

  @Post('signup/user')
  signupUser(@Body() dto: SignupUserDto) {
    return this.authService.signupUser(dto);
  }

  @Post('login/user')
  loginUser(
    @Body() dto: LoginUserDto) {
    return this.authService.loginUser(dto);
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
