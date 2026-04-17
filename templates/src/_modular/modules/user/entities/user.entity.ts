// User entity — replace with your ORM entity (TypeORM @Entity, Mongoose Schema, Prisma model)
export interface UserEntity {
  id: string;
  name: string;
  email: string;
  password: string;
  resetPasswordToken: string | null;
  resetPasswordExpiry: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
