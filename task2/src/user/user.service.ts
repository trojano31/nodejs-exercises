import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';


@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private userRepository: typeof User,
  ) {
  }


  create(createUserDto: CreateUserDto) {
    return this.userRepository.create(createUserDto as any);
  }


  findAll() {
    return this.userRepository.findAll();
  }
}