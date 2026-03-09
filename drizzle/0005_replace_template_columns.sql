ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "invoice_template" text;
ALTER TABLE "users" DROP COLUMN IF EXISTS "company_name";
ALTER TABLE "users" DROP COLUMN IF EXISTS "invoice_accent_color";
ALTER TABLE "users" DROP COLUMN IF EXISTS "invoice_footer_notes";
ALTER TABLE "users" DROP COLUMN IF EXISTS "invoice_show_bank_details";
