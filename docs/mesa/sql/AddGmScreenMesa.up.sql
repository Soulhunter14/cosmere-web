START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261023121824_AddGmScreenMesa') THEN
    ALTER TABLE "GmScreens" ADD "Mesa" text NOT NULL DEFAULT '{}';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261023121824_AddGmScreenMesa') THEN
    ALTER TABLE "GmScreens" ADD "MesaUpdatedAt" timestamp with time zone;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261023121824_AddGmScreenMesa') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20261023121824_AddGmScreenMesa', '8.0.11');
    END IF;
END $EF$;
COMMIT;

