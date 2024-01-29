import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateTransactionDto,
  PaginatedTransactionsResponseDto,
  ToggleTransactionDto,
} from './transaction.dto';
import { PrismaService } from 'nestjs-prisma';
import { PaginationParamsDto } from '@/shared/shared.dto';
import { TransactionDto } from '@/prisma/generated/zod';
import { UserWithRoleDto } from '@/user/user.dto';

@Injectable()
export class TransactionService {
  constructor(private readonly prismaService: PrismaService) {}

  async createTransaction({ dto }: { dto: CreateTransactionDto }) {
    return this.prismaService.$transaction(async (tx) => {
      const wallet = await tx.wallet.update({
        where: { userId: dto.buyerId },
        data: {
          balance: { decrement: dto.amount },
          lockedFunds: { increment: dto.amount },
        },
      });
      if (wallet.balance < 0) {
        throw new BadRequestException('Insufficient funds');
      }

      await tx.walletHistory.create({
        data: {
          historyType: 'locked',
          amount: dto.amount,
          walletId: wallet.id,
        },
      });

      return await tx.transaction.create({
        data: {
          ...dto,
        },
      });
    });
  }

  async getTransaction({ id, user }: { id: string; user: UserWithRoleDto }) {
    const userId = user.role.name === 'USER' ? user.id : undefined;

    const txn = await this.prismaService.transaction.findFirst({
      where: { id, buyerId: userId, sellerId: userId },
    });
    if (!txn) {
      throw new NotFoundException(`transaction with id ${id} not found`);
    }
    return txn;
  }

  async getTransactions({
    dto,
    user,
  }: {
    dto: PaginationParamsDto;
    user: UserWithRoleDto;
  }): Promise<PaginatedTransactionsResponseDto> {
    const userId = user.role.name === 'USER' ? user.id : undefined;

    const [count, txns] = await this.prismaService.$transaction([
      this.prismaService.transaction.count({
        where: { buyerId: userId, sellerId: userId },
      }),
      this.prismaService.transaction.findMany({
        take: dto.limit,
        skip: dto.offset,
        cursor: dto.cursor ? { id: dto.cursor } : undefined,
        where: { buyerId: userId, sellerId: userId },
      }),
    ]);

    return {
      count,
      items: txns satisfies Array<TransactionDto>,
      cursor: txns.at(-1)?.id ?? dto.cursor ?? '',
    };
  }

  async toggle({ id, dto }: { id: string; dto: ToggleTransactionDto }) {
    const txn = await this.prismaService.transaction.findFirst({
      where: { id, transactionStatus: 'initiated' },
    });
    if (!txn) {
      throw new NotFoundException(`transaction with id ${id} not found`);
    }
    if (dto.toggleValue === 'approved') {
      return this.prismaService.transaction.update({
        where: { id },
        data: {
          transactionStatus: 'inProgress',
        },
      });
    }

    return this.prismaService.transaction.update({
      where: { id },
      data: {
        buyer: {
          update: {
            wallet: {
              update: {
                where: { userId: txn.buyerId },
                data: {
                  balance: { increment: txn.amount },
                  lockedFunds: { decrement: txn.amount },
                  walletHistory: {
                    create: {
                      amount: txn.amount,
                      historyType: 'returned',
                    },
                  },
                },
              },
            },
          },
        },
        transactionStatus: 'declined',
      },
    });
  }

  async sellerConfirmTransactionDelivery({
    id,
    user,
  }: {
    id: string;
    user: UserWithRoleDto;
  }) {
    const txn = await this.prismaService.transaction.findFirst({
      where: { id, transactionStatus: 'inProgress' },
    });
    if (!txn) {
      throw new NotFoundException(`transaction with id ${id} not found`);
    }
    if (txn.sellerId != user.id) {
      throw new ForbiddenException();
    }
    return this.prismaService.transaction.update({
      where: { id },
      data: {
        deliveredOn: new Date().toISOString(),
      },
    });
  }

  async buyerConfirmTransactionDelivery({
    id,
    user,
  }: {
    id: string;
    user: UserWithRoleDto;
  }) {
    const txn = await this.prismaService.transaction.findFirst({
      where: { id, transactionStatus: 'inProgress' },
    });
    if (!txn) {
      throw new NotFoundException(`transaction with id ${id} not found`);
    }
    if (txn.buyerId != user.id) {
      throw new ForbiddenException();
    }
    return this.prismaService.transaction.update({
      where: { id },
      data: {
        receivedOn: new Date().toISOString(),
        transactionStatus: 'completed',
      },
    });
  }
}
