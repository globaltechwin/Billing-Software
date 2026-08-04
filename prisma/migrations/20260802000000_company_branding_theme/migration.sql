-- Add per-company branding / theme fields
ALTER TABLE company
  ADD COLUMN shortCode VARCHAR(10) NULL,
  ADD COLUMN themePrimary VARCHAR(20) NULL,
  ADD COLUMN themePrimaryDark VARCHAR(20) NULL,
  ADD COLUMN themeAccent VARCHAR(20) NULL,
  ADD COLUMN themeWarm VARCHAR(20) NULL,
  ADD COLUMN themeBgDark VARCHAR(20) NULL,
  ADD COLUMN themeBgDarker VARCHAR(20) NULL,
  ADD COLUMN themeCardDark VARCHAR(20) NULL,
  ADD COLUMN themeNavBg VARCHAR(20) NULL;
