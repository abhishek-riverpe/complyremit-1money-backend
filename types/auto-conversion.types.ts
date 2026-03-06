export interface CreateAutoConversionRuleRequest {
  source: {
    asset: string;
    network: string;
  };
  destination: {
    asset: string;
    network?: string;
    wallet_address?: string;
    external_account_id?: string;
  };
}

export interface AutoConversionRuleResponse {
  rule_id: string;
  customer_id: string;
  status: string;
  source_asset: string;
  source_network: string;
  destination_asset: string;
  destination_network?: string;
  source_deposit_info?: unknown;
  created_at: string;
  updated_at: string;
}

export interface AutoConversionRuleListResponse {
  auto_conversion_rules: AutoConversionRuleResponse[];
  total: number;
}

export interface AutoConversionOrderResponse {
  order_id: string;
  status: string;
  fee_receipt?: unknown;
  sub_transactions?: unknown[];
}

export interface AutoConversionOrderListResponse {
  orders: AutoConversionOrderResponse[];
  total: number;
}
