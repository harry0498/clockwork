ALTER TABLE "users" ADD COLUMN "company_name" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "invoice_accent_color" varchar(7);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "invoice_footer_notes" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "invoice_show_bank_details" boolean DEFAULT true NOT NULL;