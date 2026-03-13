-- CreateTable
CREATE TABLE "auto_conversion_rules" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "onemoney_rule_id" TEXT NOT NULL,
    "onemoney_customer_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "source_asset" TEXT NOT NULL,
    "source_network" TEXT NOT NULL,
    "destination_asset" TEXT NOT NULL,
    "destination_network" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auto_conversion_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auto_conversion_orders" (
    "id" TEXT NOT NULL,
    "rule_id" TEXT NOT NULL,
    "onemoney_order_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "failure_reason" TEXT,
    "payload" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auto_conversion_orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auto_conversion_rules_onemoney_rule_id_key" ON "auto_conversion_rules"("onemoney_rule_id");

-- CreateIndex
CREATE UNIQUE INDEX "auto_conversion_orders_onemoney_order_id_key" ON "auto_conversion_orders"("onemoney_order_id");

-- AddForeignKey
ALTER TABLE "auto_conversion_rules" ADD CONSTRAINT "auto_conversion_rules_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auto_conversion_orders" ADD CONSTRAINT "auto_conversion_orders_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "auto_conversion_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
