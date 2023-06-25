import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from './task.model';
import { CreateTaskDto } from './dto/create-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { Repository } from 'typeorm';
import { FilterTaskDto } from './dto/filter-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private taskRepository: Repository<Task>,
  ) {}

  async getAllTasks(filterTaskDto: FilterTaskDto): Promise<Task[]> {
    const { status, search } = filterTaskDto;
    const tasks = this.taskRepository.createQueryBuilder('task');
    if (status) {
      tasks.andWhere('task.status = :status', { status });
    }
    if (search) {
      tasks.andWhere(
        'taks.title like :title or task.description like :description',
        {
          title: `%${search}%`,
          description: `%${search}%`,
        },
      );
    }
    return await tasks.getMany();
  }

  async getTaskById(id: number): Promise<Task> {
    const founded = await this.taskRepository.findOne({
      where: {
        id,
      },
    });
    if (!founded) throw new NotFoundException();
    return founded;
  }

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const { title, description } = createTaskDto;
    const task = new Task();
    task.title = title;
    task.description = description;
    task.status = TaskStatus.OPEN;
    return await task.save();
  }

  async updateTaskById(id: number, status: TaskStatus): Promise<Task> {
    const task = await this.getTaskById(id);
    task.status = status;
    return await task.save();
  }

  async deleteTaskById(id: number): Promise<Task> {
    const task = await this.getTaskById(id);
    await this.taskRepository.delete(id);
    return task;
  }
}
