import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { QueryBuilder, Repository, SelectQueryBuilder } from 'typeorm';
import { Task } from './task.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FilterTaskDto } from './dto/filter-task.dto';
import { TaskStatus } from './task.model';
import { User } from '../auth/user.entity';
import { NotFoundException } from '@nestjs/common';

const mockUser = {
  id: 12,
  username: 'testing user',
} as User;

const mockTaskRepository = {
  findOne: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockReturnValue([]),
  })),
};

describe('Task service testing', () => {
  let taskService: TasksService;
  let taskRepository: Repository<Task>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
        },
      ],
    }).compile();

    taskService = module.get<TasksService>(TasksService);
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
  });

  describe('get all tasks users', () => {
    it('suucess get all task user', async () => {
      const filterTaskDto: FilterTaskDto = {
        search: '',
        status: TaskStatus.OPEN,
      };
      const result = await taskService.getAllTasks(filterTaskDto, mockUser);
      expect(result).toEqual([]);
    });
  });

  describe('getTaskById', () => {
    it('it call taskRepository.findOne() and success return the task', async () => {
      const mockTask = { title: 'string', description: 'string' } as Task;
      jest.spyOn(taskRepository, 'findOne').mockResolvedValue(mockTask);
      const result = await taskService.getTaskById(1, mockUser);
      expect(result.title).toEqual(mockTask.title);
      expect(result.description).toEqual(mockTask.description);

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
          user: {
            id: mockUser.id,
          },
        },
      });
    });

    it('it throw not found task', async () => {
      jest.spyOn(taskRepository, 'findOne').mockResolvedValue(null);
      expect(taskService.getTaskById(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete task', () => {
    it('it should be delete task and return the deleted task', async () => {
      const mockTask = { title: 'string', description: 'string' } as Task;
      jest.spyOn(taskRepository, 'findOne').mockResolvedValue(mockTask);

      const result = await taskService.deleteTaskById(1, mockUser);
      expect(result).toEqual(mockTask);
      expect(taskRepository.delete).toHaveBeenCalled();
    });

    it('it should be throw error not found task', async () => {
      jest.spyOn(taskRepository, 'findOne').mockResolvedValue(null);
      expect(taskService.deleteTaskById(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
