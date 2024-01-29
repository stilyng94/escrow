import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { PaymentGatewayModule } from '@/payment-gateway/payment-gateway.module';
import { WalletListener } from './wallet.listener';
import { NotificationModule } from '@/notification/notification.module';

@Module({
  controllers: [WalletController],
  providers: [WalletService, WalletListener],
  exports: [WalletService],
  imports: [PaymentGatewayModule, NotificationModule],
})
export class WalletModule {}
