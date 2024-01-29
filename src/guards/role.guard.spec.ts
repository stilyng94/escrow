import { Reflector } from '@nestjs/core';
import { RoleGuard } from './role.guard';
import { RolesBuilder } from 'nest-access-control';

describe('RoleGuard', () => {
  it('should be defined', () => {
    expect(new RoleGuard(new Reflector(), new RolesBuilder())).toBeDefined();
  });
});
