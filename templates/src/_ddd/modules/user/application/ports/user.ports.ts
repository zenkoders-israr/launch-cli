import { UserResponseDto } from '../dto/user.dto';

export interface IGetUserUseCase {
  execute(id: string): Promise<UserResponseDto>;
}

export interface IUpdateUserUseCase {
  execute(id: string, name: string): Promise<UserResponseDto>;
}

export interface IDeleteUserUseCase {
  execute(id: string): Promise<void>;
}

export const GET_USER_USE_CASE = 'GET_USER_USE_CASE';
export const UPDATE_USER_USE_CASE = 'UPDATE_USER_USE_CASE';
export const DELETE_USER_USE_CASE = 'DELETE_USER_USE_CASE';
