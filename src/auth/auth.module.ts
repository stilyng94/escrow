import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from '../guards/jwt.stratergy';
import { RefreshJwtStrategy } from '../guards/refresh-jwt.stratergy';
import { UserModule } from '@/user/user.module';
import { AuthListener } from './auth.listener';
import { NotificationModule } from '@/notification/notification.module';
import { PaymentGatewayModule } from '@/payment-gateway/payment-gateway.module';

@Module({
  providers: [AuthService, JwtStrategy, RefreshJwtStrategy, AuthListener],
  controllers: [AuthController],
  imports: [UserModule, NotificationModule, PaymentGatewayModule],
  exports: [AuthService],
})
export class AuthModule {}
