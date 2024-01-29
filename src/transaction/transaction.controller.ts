import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateTransactionDto,
  HandleTransactionCreatedEventDto,
  HandleTransactionDeliveryEventDto,
  HandleTransactionToggledEventDto,
  PaginatedTransactionsResponseDto,
  TRANSACTION_EVENTS,
  ToggleTransactionDto,
} from './transaction.dto';
import { PaginationParamsDto } from '@/shared/shared.dto';
import { TransactionDto } from '@/prisma/generated/zod';
import { JwtGuard } from '@/guards/jwt.guard';
import { UseRoles } from 'nest-access-control';
import { RoleGuard } from '@/guards/role.guard';
import { UserWithRoleDto } from '@/user/user.dto';
import { CurrentUser } from '@/user/currentuser.decorator';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ReleaseTransactionFundsEventDto,
  WALLET_EVENTS,
} from '@/payment-gateway/payment-gateway.dto';

@Controller('transactions')
@ApiTags('transactions')
@ApiBearerAuth()
@UseGuards(JwtGuard, RoleGuard)
export class TransactionController {
  private readonly logger = new Logger(TransactionController.name);

  constructor(
    private readonly transactionService: TransactionService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @ApiOkResponse({ type: TransactionDto })
  @ApiBody({ type: CreateTransactionDto })
  @HttpCode(HttpStatus.CREATED)
  @Post('')
  @UseRoles({ resource: 'transactions', action: 'create', possession: 'own' })
  async create(@Body() dto: CreateTransactionDto) {
    const txn = await this.transactionService.createTransaction({
      dto,
    });
    const payload: HandleTransactionCreatedEventDto = {
      buyerId: txn.buyerId,
      id: txn.id,
      sellerId: txn.sellerId,
    };
    this.eventEmitter.emit(TRANSACTION_EVENTS.txnCreated.event, payload);
    return txn;
  }

  @ApiOkResponse({ type: TransactionDto })
  @ApiParam({ name: 'id' })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  @UseRoles({ resource: 'transactions', action: 'read', possession: 'own' })
  async get(@Param('id') id: string, @CurrentUser() user: UserWithRoleDto) {
    return this.transactionService.getTransaction({ id, user: user });
  }

  @ApiOkResponse({ type: PaginatedTransactionsResponseDto })
  @ApiQuery({ type: PaginationParamsDto })
  @HttpCode(HttpStatus.OK)
  @Get('')
  @UseRoles({ resource: 'transactions', action: 'read', possession: 'own' })
  async getAll(
    @Query() query: PaginationParamsDto,
    @CurrentUser() user: UserWithRoleDto,
  ) {
    return this.transactionService.getTransactions({ dto: query, user });
  }

  @ApiOkResponse({ type: String })
  @ApiBody({ type: ToggleTransactionDto })
  @ApiParam({ name: 'id' })
  @HttpCode(HttpStatus.OK)
  @Put(':id/toggle')
  @UseRoles({ resource: 'transactions', action: 'update', possession: 'own' })
  async toggleTransaction(
    @Body() dto: ToggleTransactionDto,
    @Param('id') id: string,
  ) {
    const txn = await this.transactionService.toggle({ id, dto });
    const payload: HandleTransactionToggledEventDto = {
      buyerId: txn.buyerId,
      id: txn.id,
      sellerId: txn.sellerId,
      toggleValue: dto.toggleValue,
    };
    this.eventEmitter.emit(TRANSACTION_EVENTS.txnToggled.event, payload);
    return id;
  }

  @ApiOkResponse({ type: String })
  @ApiParam({ name: 'id' })
  @HttpCode(HttpStatus.OK)
  @Put(':id/seller-confirm-delivery')
  @UseRoles({ resource: 'transactions', action: 'update', possession: 'own' })
  async sellerConfirmTransactionDelivery(
    @Param('id') id: string,
    @CurrentUser() user: UserWithRoleDto,
  ) {
    const txn = await this.transactionService.sellerConfirmTransactionDelivery({
      id,
      user,
    });
    const payload: HandleTransactionDeliveryEventDto = {
      buyerId: txn.buyerId,
      id: txn.id,
      sellerId: txn.sellerId,
    };
    this.eventEmitter.emit(
      TRANSACTION_EVENTS.txnSellerConfirmDelivery.event,
      payload,
    );
    return id;
  }

  @ApiOkResponse({ type: String })
  @ApiParam({ name: 'id' })
  @HttpCode(HttpStatus.OK)
  @Put(':id/buyer-confirm-delivery')
  @UseRoles({ resource: 'transactions', action: 'update', possession: 'own' })
  async buyerConfirmTransactionDelivery(
    @Param('id') id: string,
    @CurrentUser() user: UserWithRoleDto,
  ) {
    const txn = await this.transactionService.buyerConfirmTransactionDelivery({
      id,
      user,
    });
    const payload: HandleTransactionDeliveryEventDto = {
      buyerId: txn.buyerId,
      id: txn.id,
      sellerId: txn.sellerId,
    };
    this.eventEmitter.emit(
      TRANSACTION_EVENTS.txnBuyerConfirmDelivery.event,
      payload,
    );

    //Send notification to seller about funds released
    const releaseTransactionFundsEventDto: ReleaseTransactionFundsEventDto = {
      actorId: txn.buyerId,
      userId: txn.sellerId,
      amount: txn.amount,
    };
    this.eventEmitter.emit(
      WALLET_EVENTS.releaseTransactionFundsEvent.event,
      releaseTransactionFundsEventDto,
    );
    return id;
  }
}
