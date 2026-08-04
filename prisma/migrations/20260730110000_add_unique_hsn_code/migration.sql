-- Add unique constraint to HSNSac.code
ALTER TABLE `hsn_sac` ADD UNIQUE INDEX `HSNSac_code_key` (`code`);
