import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}
  // método p assinar um token
  async getToken(userId: number) {
    const { email, photo, id, person } = await this.userService.get(userId);
    const { name } = person;

    return this.jwtService.sign({ name, email, photo, id });
  }
  //   método p fazer login
  async login({ email, password }: { email: string; password: string }) {
    const user = await this.userService.getByEmail(email);
    await this.userService.checkPassword(user.id, password);

    const token = await this.getToken(user.id);
    return {
      token,
    };
  }
  //   método p verificar se o token é válido:
  async decodeToken(token: string) {
    try {
      await this.jwtService.verify(token);
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }
    return this.jwtService.decode(token);
  }
}
