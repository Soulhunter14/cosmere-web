START TRANSACTION;


DO $EF$
BEGIN
    IF EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261023122038_AddCampaignImages') THEN
    DROP TABLE "CampaignImages";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261023122038_AddCampaignImages') THEN
    DELETE FROM "__EFMigrationsHistory"
    WHERE "MigrationId" = '20261023122038_AddCampaignImages';
    END IF;
END $EF$;
COMMIT;

