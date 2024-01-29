import { BadRequestException, Logger } from '@nestjs/common';
import { Request } from 'express';
import { EnvServiceDto } from '@/config/env.service';
import crypto from 'node:crypto';
import {
  CreateCustomerDto,
  InitializePaymentDto,
  WebhookResponseDto,
  initiateWithdrawalSchema,
} from '@/payment-gateway/payment-gateway.dto';
import { PaymentGatewayService } from '@/payment-gateway/payment-gateway.service';

export class PaystackPaymentGatewayService implements PaymentGatewayService {
  private readonly logger = new Logger(PaystackPaymentGatewayService.name);
  private readonly baseUrl = 'https://api.paystack.co';

  constructor(private readonly envService: EnvServiceDto) {}

  async initializePayment(
    dto: InitializePaymentDto,
  ): Promise<{ authorizationUrl: string; reference: string }> {
    const parsedAmount: InitializePaymentDto = {
      ...dto,
      amount: dto.amount * 100,
    };

    const client = await fetch(`${this.baseUrl}/transaction/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.envService.PAYMENT_GATEWAY_SECRET}`,
      },
      body: JSON.stringify({
        ...parsedAmount,
        channels: ['card', 'mobile_money'],
      }),
    });
    const data = await client.json();
    this.logger.log(data);
    return {
      authorizationUrl: data.data.authorization_url,
      reference: data.data.reference,
    };
  }

  async createCustomer(
    dto: CreateCustomerDto,
  ): Promise<{ customerCode: string }> {
    const client = await fetch(`${this.baseUrl}/customer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.envService.PAYMENT_GATEWAY_SECRET}`,
      },
      body: JSON.stringify({
        ...dto,
      }),
    });
    const data = await client.json();
    this.logger.log(data);
    return {
      customerCode: data.data.customer_code,
    };
  }

  async handleWebhook(req: Request): Promise<WebhookResponseDto | undefined> {
    const hash = crypto
      .createHmac('sha512', this.envService.PAYMENT_GATEWAY_WEBHOOK_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');
    if (hash == req.headers['x-paystack-signature']) {
      const eventType = req.body['event'];
      const eventBody = req.body.data;

      this.logger.log(req.body);

      switch (eventType) {
        case 'charge.success':
          return {
            metadata: {
              walletId: eventBody.metadata.walletId,
              paymentType: eventBody.metadata.paymentType,
            },
            reference: eventBody.reference,
            status: 'success',
          };
        case 'charge.failed':
          return {
            metadata: {
              walletId: eventBody.metadata.walletId,
              paymentType: eventBody.metadata.paymentType,
            },
            reference: eventBody.reference,
            status: 'failed',
          };
        case 'transfer.success':
          return {
            reference: eventBody.reference,
            status: 'success',
            metadata: {
              walletId: eventBody.metadata.walletId,
              paymentType: eventBody.metadata.paymentType,
            },
          };
        case 'transfer.failed':
          return {
            reference: eventBody.reference,
            status: 'failed',
            metadata: {
              walletId: eventBody.metadata.walletId,
              paymentType: eventBody.metadata.paymentType,
            },
          };
        default:
          return;
      }
    }
  }

  async getBanks(currency: string): Promise<
    {
      name: string;
      code: string;
      active: boolean;
    }[]
  > {
    const client = await fetch(`${this.baseUrl}/bank?currency=${currency}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.envService.PAYMENT_GATEWAY_SECRET}`,
      },
    });
    const data = await client.json();
    this.logger.log(data);
    return data.data.map((bank) => ({
      name: bank.name,
      code: bank.code,
      active: bank.active,
    }));
  }

  async getMomoBanks(currency: string): Promise<
    {
      name: string;
      code: string;
      active: boolean;
    }[]
  > {
    const client = await fetch(
      `${this.baseUrl}/bank?currency=${currency}&type=mobile_money`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.envService.PAYMENT_GATEWAY_SECRET}`,
        },
      },
    );
    const data = await client.json();
    this.logger.log(data);
    return data.data.map((bank) => ({
      name: bank.name,
      code: bank.code,
      active: bank.active,
    }));
  }

  async createTransferRecipient({
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
  }): Promise<string> {
    if (type === 'bank') {
      const isVerifiedAccount = await this.isVerifiedRecipientAccount(
        accountNumber,
        bankCode,
      );
      if (!isVerifiedAccount) {
        throw new BadRequestException(
          `Account number ${accountNumber} can not resolved.\nPlease verify you input it correctly`,
        );
      }
    }

    const client = await fetch(`${this.baseUrl}/transferrecipient`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.envService.PAYMENT_GATEWAY_SECRET}`,
      },
      body: JSON.stringify({
        type: type === 'bank' ? 'ghipss' : 'mobile_money',
        currency,
        account_number: accountNumber,
        bank_code: bankCode,
        name,
      }),
    });
    const data = await client.json();
    this.logger.log(data);
    return data.data.recipient_code; //save with the customer's records in your database;
  }

  private async isVerifiedRecipientAccount(
    accountNumber: string,
    bankCode: string,
  ) {
    const client = await fetch(
      `${this.baseUrl}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.envService.PAYMENT_GATEWAY_SECRET}`,
        },
      },
    );
    const data = await client.json();
    this.logger.log(data);
    return data.status;
  }

  async initiateWithdrawal(
    dto: initiateWithdrawalSchema,
  ): Promise<'pending' | 'failed'> {
    const client = await fetch(`${this.baseUrl}/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.envService.PAYMENT_GATEWAY_SECRET}`,
      },
      body: JSON.stringify({
        source: 'balance',
        reason: 'Savings',
        amount: dto.amount * 100,
        reference: dto.reference,
        recipient: dto.recipientCode,
        metadata: dto.metadata,
      }),
    });
    const data = await client.json();
    this.logger.log(data);
    if (!data.status) {
      throw new BadRequestException(data.message);
    }
    return data.data.status;
  }
}
