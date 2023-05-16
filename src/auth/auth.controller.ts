import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { parse } from 'date-fns';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { Auth } from './auth.decorator';
// NA PG DE AUTH DA FERRARI
@Controller('auth')
export class AuthController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}
  // VERIFICA SE O EMAIL EXISTE, CASO NÃO DEVE REDIRECIONAR P PG REGISTER
  @Post()
  async verifyEmail(@Body('email') email) {
    try {
      await this.userService.getByEmail(email);
      return { exits: true };
    } catch (e) {
      return { exits: false };
    }
  }
  // SOLICITAR REGISTRO DO USER ao userSErvice
  @Post('register')
  async register(
    @Body('name') name,
    @Body('email') email,
    @Body('birthAt') birthAt,
    @Body('phone') phone,
    @Body('document') document,
    @Body('password') password,
  ) {
    // converter o date para fomato de data com api date-fns
    if (birthAt) {
      try {
        birthAt = parse(birthAt, 'yyyy-MM-dd', new Date());
      } catch (e) {
        throw new BadRequestException('Birth date is inavalid');
      }
    }
    // criar os dados do usuário
    const user = await this.userService.create({
      name,
      email,
      password,
      phone,
      document,
      birthAt,
    });
    // criar um token desses dados
    const token = await this.authService.getToken(user.id);

    return { user, token };
  }
  // solicitar a autenticação de login
  @Post('login')
  async login(@Body('email') email, @Body('password') password) {
    return this.authService.login({ email, password });
  }
  // Autenticar a rota essa rota só vai ser acessada se o token for válido
  // Esse decorator @Auth não existe eu vou criar
  @UseGuards(AuthGuard)
  @Get('me')
  async me(@Auth() auth) {
    return {
      auth,
    };
  }
}
