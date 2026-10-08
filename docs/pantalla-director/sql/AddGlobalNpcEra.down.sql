START TRANSACTION;


DO $EF$
BEGIN
    IF EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261008074753_AddGlobalNpcEra') THEN
    ALTER TABLE "GlobalNpcs" DROP COLUMN "Era";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261008074753_AddGlobalNpcEra') THEN
    DELETE FROM "__EFMigrationsHistory"
    WHERE "MigrationId" = '20261008074753_AddGlobalNpcEra';
    END IF;
END $EF$;
COMMIT;

