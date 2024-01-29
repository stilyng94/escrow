import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { TransactionListener } from './transaction.listener';
import { NotificationService } from '@/notification/notification.service';
import { PushNotificationGatewayModule } from '@/push-notification-gateway/push-notification-gateway.module';
import { SmsGatewayModule } from '@/sms-gateway/sms-gateway.module';

@Module({
  controllers: [TransactionController],
  providers: [TransactionService, TransactionListener, NotificationService],
  imports: [PushNotificationGatewayModule, SmsGatewayModule],
})
export class TransactionModule {}
