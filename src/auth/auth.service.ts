import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    const { username, email, password } = createUserDto;
    const exist = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });
    if (exist) throw new BadRequestException('Username or email is exist');
    const user = new User();
    user.email = email;
    user.username = username;
    user.salt = await bcrypt.genSalt(10);
    user.password = await this.hashPassword(password, user.salt);
    return await user.save();
  }

  async hashPassword(password: string, salt: string) {
    return await bcrypt.hash(password, salt);
  }
}
