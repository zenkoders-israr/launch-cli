import { Module } from '@nestjs/common';
import { UserController } from './presentation/http/controllers/user.controller';
import { GetUserUseCase } from './application/use-cases/get-user.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';
import { InMemoryUserRepository } from './infrastructure/repositories/in-memory-user.repository';
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface';

@Module({
  controllers: [UserController],
  providers: [
    GetUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    { provide: USER_REPOSITORY, useClass: InMemoryUserRepository },
  ],
  exports: [GetUserUseCase, USER_REPOSITORY],
})
export class UserModule {}
