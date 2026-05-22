// User entity — replace with your ORM entity (TypeORM @Entity, Mongoose Schema, Prisma model)
export interface UserEntity {
  id: string;
  name: string;
  email: string;
  password: string;
  resetPasswordToken: string | null;
  resetPasswordExpiry: Date | null;
{{#isTrue rbac}}
  role: 'admin' | 'user' | 'moderator';
{{/isTrue}}
{{#isTrue twoFactor}}
  twoFactorEnabled: boolean;
  twoFactorSecret: string | null;
{{/isTrue}}
{{#isTrue multiTenancy}}
  tenantId: string;
{{/isTrue}}
  createdAt: Date;
  updatedAt: Date;
}
