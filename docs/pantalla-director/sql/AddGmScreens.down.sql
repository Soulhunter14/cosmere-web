START TRANSACTION;


DO $EF$
BEGIN
    IF EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261007220052_AddGmScreens') THEN
    DROP TABLE "GmScreens";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261007220052_AddGmScreens') THEN
    DELETE FROM "__EFMigrationsHistory"
    WHERE "MigrationId" = '20261007220052_AddGmScreens';
    END IF;
END $EF$;
COMMIT;

