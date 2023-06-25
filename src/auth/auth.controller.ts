import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthCredentailDto } from './dto/auth-credential.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './get-user.decorator';
import { User } from './user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  async signup(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return await this.authService.signup(createUserDto);
  }

  @Post('/signin')
  async signin(
    @Body(ValidationPipe) authCredentialDto: AuthCredentailDto,
  ): Promise<{ accessToken: string }> {
    return await this.authService.signin(authCredentialDto);
  }

  @Post('/test')
  @UseGuards(AuthGuard())
  async test(@GetUser() user: User) {
    console.log(user);
  }
}
