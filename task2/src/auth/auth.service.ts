import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import * as process from 'process';
import { NotFoundError } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const password = await this.hash(createUserDto.password);
    const user = {
      ...createUserDto,
      password,
    };
    return this.userService.create(user);
  }

  async login({ email, password }: LoginDto) {
    const user = await this.userService.findOne(email);
    if (!user) {
      throw new NotFoundError('user not found');
    }
    const checkPassword = await this.checkPassword(password, user.password);
    if (!checkPassword) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id, username: user.email };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  private async hash(password: string) {
    const salt = await bcrypt.genSalt(Number(process.env.SALT) || 10);
    return await bcrypt.hash(password, salt);
  }

  async checkPassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }
}
