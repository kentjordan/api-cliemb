
ALTER TABLE "user" ADD CONSTRAINT user_email_unique UNIQUE (email);
ALTER TABLE "user" ADD CONSTRAINT user_sr_code_unique UNIQUE (sr_code);
ALTER TABLE "user" ADD COLUMN is_account_approved BOOLEAN DEFAULT false;