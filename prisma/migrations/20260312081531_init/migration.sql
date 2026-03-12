-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('corporation', 'llc', 'partnership', 'sole_proprietorship', 'investment_fund', 'societies', 'trust', 'government', 'dao');

-- CreateEnum
CREATE TYPE "AccountPurpose" AS ENUM ('charitable_donations', 'ecommerce_retail_payments', 'investment_purposes', 'other', 'payments_to_friends_or_family_abroad', 'payroll', 'personal_or_living_expenses', 'protect_wealth', 'purchase_goods_and_services', 'receive_payments_for_goods_and_services', 'tax_optimization', 'third_party_money_transmission', 'treasury_management');

-- CreateEnum
CREATE TYPE "SourceOfFunds" AS ENUM ('business_loans', 'grants', 'inter_company_funds', 'investment_proceeds', 'legal_settlement', 'owners_capital', 'pension_retirement', 'sale_of_assets', 'sales_of_goods_and_services', 'tax_refund', 'third_party_funds', 'treasury_reserves');

-- CreateEnum
CREATE TYPE "SourceOfWealth" AS ENUM ('business_dividends_or_profits', 'investments', 'asset_sales', 'client_investor_contributions', 'gambling', 'charitable_contributions', 'inheritance', 'affiliate_or_royalty_income');

-- CreateEnum
CREATE TYPE "DocType" AS ENUM ('aml_comfort_letter', 'constitutional_document', 'directors_registry', 'cert_of_incumbency', 'e_signature_certificate', 'evidence_of_good_standing', 'flow_of_funds', 'formation_document', 'marketing_materials', 'other', 'ownership_chart', 'ownership_information', 'proof_of_account_purpose', 'proof_of_address', 'proof_of_entity_name_change', 'proof_of_nature_of_business', 'proof_of_nature_of_business_license', 'proof_of_nature_of_business_aml_policy', 'proof_of_signatory_authority', 'proof_of_source_of_funds', 'proof_of_source_of_wealth', 'proof_of_tax_identification', 'registration_document', 'shareholder_register', 'evidence_of_directors_and_controllers', 'tax_exempt_entity_confirmation');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clerk_user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "onemoney_customer_id" TEXT,
    "onemoney_kyb_status" TEXT,
    "business_legal_name" TEXT,
    "business_description" TEXT,
    "business_type" "BusinessType",
    "business_industry" TEXT,
    "business_registration_number" TEXT,
    "date_of_incorporation" TEXT,
    "primary_website" TEXT,
    "publicly_traded" BOOLEAN,
    "tax_id" TEXT,
    "tax_type" TEXT,
    "tax_country" TEXT,
    "account_purpose" "AccountPurpose",
    "source_of_funds" "SourceOfFunds"[],
    "source_of_wealth" "SourceOfWealth"[],
    "estimated_annual_revenue_usd" TEXT,
    "expected_monthly_fiat_deposits" TEXT,
    "expected_monthly_fiat_withdrawals" TEXT,
    "registered_address_street_line_1" TEXT,
    "registered_address_street_line_2" TEXT,
    "registered_address_city" TEXT,
    "registered_address_state" TEXT,
    "registered_address_country" TEXT,
    "registered_address_subdivision" TEXT,
    "registered_address_postal_code" TEXT,
    "signed_agreement_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "associated_persons" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "middle_name" TEXT,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "birth_date" TEXT NOT NULL,
    "primary_nationality" TEXT NOT NULL,
    "onemoney_associated_person_id" TEXT,
    "has_ownership" BOOLEAN NOT NULL,
    "ownership_percentage" DOUBLE PRECISION,
    "has_control" BOOLEAN NOT NULL,
    "is_signer" BOOLEAN NOT NULL,
    "is_director" BOOLEAN NOT NULL,
    "country_of_tax" TEXT NOT NULL,
    "tax_type" TEXT NOT NULL,
    "tax_id" TEXT NOT NULL,
    "poa" TEXT,
    "poa_type" TEXT,
    "residential_address_street_line_1" TEXT NOT NULL,
    "residential_address_street_line_2" TEXT,
    "residential_address_city" TEXT NOT NULL,
    "residential_address_state" TEXT NOT NULL,
    "residential_address_country" TEXT NOT NULL,
    "residential_address_subdivision" TEXT,
    "residential_address_postal_code" TEXT,
    "doc_type" TEXT,
    "doc_issuing_country" TEXT,
    "doc_national_identity_number" TEXT,
    "doc_image_front_url" TEXT,
    "doc_image_back_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "associated_persons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "detail" TEXT,
    "metadata" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_documents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "doc_type" "DocType" NOT NULL,
    "file_url" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerk_user_id_key" ON "users"("clerk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_onemoney_customer_id_key" ON "users"("onemoney_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "associated_persons_onemoney_associated_person_id_key" ON "associated_persons"("onemoney_associated_person_id");

-- CreateIndex
CREATE INDEX "activity_logs_user_id_created_at_idx" ON "activity_logs"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "activity_logs_user_id_category_idx" ON "activity_logs"("user_id", "category");

-- AddForeignKey
ALTER TABLE "associated_persons" ADD CONSTRAINT "associated_persons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_documents" ADD CONSTRAINT "business_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
