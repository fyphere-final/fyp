/* Repairs unit titles that were corrupted to '???' when units.unitTitle was VARCHAR.
   Titles are taken verbatim from the original Online-Obaid-Qaida.sql inserts.
   Only rows whose title has no real characters (only '?') are touched. Idempotent. */
UPDATE dbo.units SET unitTitle = N'آسان قرآنی الفاظ'
WHERE unitno = 1 AND LTRIM(RTRIM(REPLACE(ISNULL(unitTitle, N''), N'?', N''))) = N'';
GO
UPDATE dbo.units SET unitTitle = N'آسان اور عام الفاظ جو اکثر قرآن میں آتے ہیں'
WHERE unitno = 2 AND LTRIM(RTRIM(REPLACE(ISNULL(unitTitle, N''), N'?', N''))) = N'';
GO
