export enum TransactionStatus {
  initiated = 'initiated',
  inProgress = 'inProgress',
  completed = 'completed',
  disputed = 'disputed',
  declined = 'declined',
  cancelled = 'cancelled',
}

export enum TransactionType {
  electronic = 'electronic',
  realEstate = 'realEstate',
  others = 'others',
}

export enum NotificationType {
  dispute = 'dispute',
  milestoneReached = 'milestoneReached',
  others = 'others',
  initialTransaction = 'initialTransaction',
}

export enum DisputeStatus {
  pending = 'pending',
  resolved = 'resolved',
}

export enum EntityType {
  transactions = 'transactions',
  disputes = 'disputes',
  wallets = 'wallets',
  docs = 'docs',
  users = 'users',
}

export enum PaymentType {
  funding = 'funding',
  withdrawal = 'withdrawal',
}

export enum PaymentStatus {
  success = 'success',
  failed = 'failed',
  pending = 'pending',
}

export enum WalletHistoryType {
  locked = 'locked',
  released = 'released',
  funding = 'funding',
  withdrawal = 'withdrawal',
  returned = 'returned',
}
