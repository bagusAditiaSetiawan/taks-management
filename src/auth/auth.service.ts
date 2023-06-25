import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthCredentailDto } from './dto/auth-credential.dto';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    const { username, email, password } = createUserDto;
    const exist = await this.existUsernameEmail(username, email);
    if (exist) throw new BadRequestException('Username or email is exist');
    const user = new User();
    user.email = email;
    user.username = username;
    user.salt = await bcrypt.genSalt(10);
    user.password = await this.hashPassword(password, user.salt);
    return await user.save();
  }

  async signin(
    authCredentialDto: AuthCredentailDto,
  ): Promise<{ accessToken: string }> {
    const username = await this.validateUserPassword(authCredentialDto);

    const payload: JwtPayload = { username };
    const accessToken = await this.jwtService.sign(payload);
    return {
      accessToken,
    };
  }

  async validateUserPassword(
    authCredentialDto: AuthCredentailDto,
  ): Promise<string> {
    const { username, email, password } = authCredentialDto;
    const user = await this.existUsernameEmail(username, email);
    const isValid = await user.validatePassword(password);
    if (!user || !isValid) {
      throw new UnauthorizedException();
    }
    return username;
  }

  async hashPassword(password: string, salt: string) {
    return await bcrypt.hash(password, salt);
  }

  async existUsernameEmail(username: string, email: string) {
    return await this.userRepository.findOne({
      where: [{ username }, { email }],
    });
  }
}
