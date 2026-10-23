START TRANSACTION;


DO $EF$
BEGIN
    IF EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261023121824_AddGmScreenMesa') THEN
    ALTER TABLE "GmScreens" DROP COLUMN "Mesa";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261023121824_AddGmScreenMesa') THEN
    ALTER TABLE "GmScreens" DROP COLUMN "MesaUpdatedAt";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261023121824_AddGmScreenMesa') THEN
    DELETE FROM "__EFMigrationsHistory"
    WHERE "MigrationId" = '20261023121824_AddGmScreenMesa';
    END IF;
END $EF$;
COMMIT;

