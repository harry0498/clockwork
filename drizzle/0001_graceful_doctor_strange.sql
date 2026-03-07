ALTER TABLE "clients" ADD COLUMN "address_line1" varchar(255) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "address_line2" varchar(255);--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "county" varchar(100) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "postcode" varchar(20) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "vat_number" varchar(50);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "address_line1" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "address_line2" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "county" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "postcode" varchar(20);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "mobile" varchar(20);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bank_name" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "account_number" varchar(20);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "sort_code" varchar(10);--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN "address";