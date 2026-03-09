export enum ActivityAction {
  // Auth
  USER_CREATED = "USER_CREATED",
  USER_LOGIN = "USER_LOGIN",

  // KYB
  KYB_SUBMITTED = "KYB_SUBMITTED",
  KYB_UPDATED = "KYB_UPDATED",
  KYB_STATUS_VIEWED = "KYB_STATUS_VIEWED",
  TOS_LINK_CREATED = "TOS_LINK_CREATED",
  TOS_SIGNED = "TOS_SIGNED",

  // Storage
  FILE_UPLOAD_URL_GENERATED = "FILE_UPLOAD_URL_GENERATED",
  FILE_UPLOADED = "FILE_UPLOADED",
  FILE_DOWNLOAD_URL_GENERATED = "FILE_DOWNLOAD_URL_GENERATED",

  // Conversion
  CONVERSION_RULE_CREATED = "CONVERSION_RULE_CREATED",
  CONVERSION_RULE_DELETED = "CONVERSION_RULE_DELETED",
  CONVERSION_RULES_VIEWED = "CONVERSION_RULES_VIEWED",
  CONVERSION_RULE_VIEWED = "CONVERSION_RULE_VIEWED",
  CONVERSION_ORDERS_VIEWED = "CONVERSION_ORDERS_VIEWED",
  CONVERSION_ORDER_VIEWED = "CONVERSION_ORDER_VIEWED",

  // Deposit
  DEPOSIT_INSTRUCTIONS_VIEWED = "DEPOSIT_INSTRUCTIONS_VIEWED",

  // Transaction
  TRANSACTION_SIMULATED = "TRANSACTION_SIMULATED",

  // Profile
  BUSINESS_DATA_VIEWED = "BUSINESS_DATA_VIEWED",
}

export enum ActivityCategory {
  AUTH = "auth",
  KYB = "kyb",
  STORAGE = "storage",
  CONVERSION = "conversion",
  DEPOSIT = "deposit",
  TRANSACTION = "transaction",
  PROFILE = "profile",
}

export interface ActivityContext {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface LogActivityParams {
  context: ActivityContext;
  action: ActivityAction;
  category: ActivityCategory;
  detail?: string;
  metadata?: Record<string, unknown>;
}
