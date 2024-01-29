import { Request } from 'express';
import {
  CreateCustomerDto,
  InitializePaymentDto,
  WebhookResponseDto,
  initiateWithdrawalSchema,
} from './payment-gateway.dto';

export abstract class PaymentGatewayService {
  abstract handleWebhook(req: Request): Promise<WebhookResponseDto | undefined>;
  abstract initializePayment(
    dto: InitializePaymentDto,
  ): Promise<{ authorizationUrl: string; reference: string }>;
  abstract createCustomer(
    dto: CreateCustomerDto,
  ): Promise<{ customerCode: string }>;

  abstract getBanks(currency: string): Promise<
    {
      name: string;
      code: string;
      active: boolean;
    }[]
  >;

  abstract getMomoBanks(currency: string): Promise<
    {
      name: string;
      code: string;
      active: boolean;
    }[]
  >;

  abstract createTransferRecipient({
    type,
    accountNumber,
    bankCode,
    currency,
    name,
  }: {
    type: 'bank' | 'mobile_money';
    accountNumber: string;
    bankCode: string;
    currency: string;
    name: string;
  }): Promise<string>;

  abstract initiateWithdrawal(
    dto: initiateWithdrawalSchema,
  ): Promise<'pending' | 'failed'>;
}
export const PAYMENT_GATEWAY_SERVICE_TOKEN = 'PAYMENT-GATEWAY-SERVICE-TOKEN';
