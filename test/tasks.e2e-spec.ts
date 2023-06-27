import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Repository } from 'typeorm';
import { Task } from '../src/tasks/task.entity';
import { User } from '../src/auth/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateTaskDto } from '../src/tasks/dto/create-task.dto';
import { TaskStatus } from '../src/tasks/task.model';

const mockUser = {
  email: 'testing@gmail.com',
  username: 'testing1234',
  password: 'Testing123!',
};

const mockTask: CreateTaskDto = {
  title: 'string',
  description: 'string',
};

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let bearerToken: string;
  let taskRepository: Repository<Task>;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    taskRepository = app.get<Repository<Task>>(getRepositoryToken(Task));
    userRepository = app.get<Repository<User>>(getRepositoryToken(User));

    let result = await request(app.getHttpServer())
      .post('/auth/signup')
      .send(mockUser);
    result = await request(app.getHttpServer())
      .post('/auth/signin')
      .send(mockUser);
    bearerToken = result.body.accessToken;
  });

  afterAll(async () => {
    await taskRepository
      .createQueryBuilder()
      .delete()
      .from(Task)
      .where('title = :title', { title: mockTask.title })
      .execute();

    await userRepository
      .createQueryBuilder()
      .delete()
      .from(User)
      .where('email = :email', { email: mockUser.email })
      .execute();
  });

  describe('/api/tasks get all tasks', () => {
    it('should be return tasks[]', async () => {
      const result = await request(app.getHttpServer())
        .get('/tasks')
        .set({
          Authorization: `Bearer ${bearerToken}`,
        });
      expect(result.statusCode).toEqual(200);
    });
  });

  describe('/api/tasks create tasks tasks', () => {
    it('should be return tasks[]', async () => {
      const result = await request(app.getHttpServer())
        .post('/tasks')
        .set({
          Authorization: `Bearer ${bearerToken}`,
        })
        .send(mockTask);
      expect(result.statusCode).toEqual(201);
      expect(result.body.title).toEqual(mockTask.title);
    });

    it('should be throw bad request parameter', async () => {
      const result = await request(app.getHttpServer())
        .post('/tasks')
        .set({
          Authorization: `Bearer ${bearerToken}`,
        });
      expect(result.statusCode).toEqual(400);
    });
  });

  describe('/api/tasks/ detail tasks', () => {
    it('should be return tasks', async () => {
      const create = await request(app.getHttpServer())
        .post('/tasks')
        .set({
          Authorization: `Bearer ${bearerToken}`,
        })
        .send(mockTask);
      const result = await request(app.getHttpServer())
        .get(`/tasks/${create.body.id}`)
        .set({
          Authorization: `Bearer ${bearerToken}`,
        });
      expect(result.body.id).toEqual(create.body.id);
    });
  });

  describe('/api/tasks update tasks status', () => {
    it('should be return tasks[]', async () => {
      let result = await request(app.getHttpServer())
        .post('/tasks')
        .set({
          Authorization: `Bearer ${bearerToken}`,
        })
        .send(mockTask);
      result = await request(app.getHttpServer())
        .patch(`/tasks/${result.body.id}/status`)
        .set({
          Authorization: `Bearer ${bearerToken}`,
        })
        .send({ status: TaskStatus.DONE });
      expect(result.statusCode).toEqual(200);
    });

    it('should be throw bad request parameter', async () => {
      const result = await request(app.getHttpServer())
        .patch(`/tasks/123412312/status`)
        .set({
          Authorization: `Bearer ${bearerToken}`,
        });
      expect(result.statusCode).toEqual(400);
    });
  });
});
