ALTER TABLE "users" ADD COLUMN "invoice_template" text;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "company_name";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "invoice_accent_color";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "invoice_footer_notes";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "invoice_show_bank_details";