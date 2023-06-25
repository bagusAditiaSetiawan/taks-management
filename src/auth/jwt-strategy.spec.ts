import { Test } from '@nestjs/testing';
import { JwtStrategy } from './jwt-strategy';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { JwtPayload } from './jwt-payload.interface';
import { UnauthorizedException } from '@nestjs/common';

describe('Testing Jwt Strategy', () => {
  let jwtStrategy: JwtStrategy;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn,
          },
        },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('testing jwt strategy', () => {
    it('it should be valid and return {username}', async () => {
      const payload: JwtPayload = {
        username: 'braditya12',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(payload as User);
      const result = await jwtStrategy.validate(payload);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: {
          username: payload.username,
        },
      });
      expect(result).toEqual(payload);
    });

    it('it should be throw unauthorization', async () => {
      const payload: JwtPayload = {
        username: 'braditya12',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      expect(jwtStrategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
