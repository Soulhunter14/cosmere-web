START TRANSACTION;


DO $EF$
BEGIN
    IF EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261014124014_AddCrewSheets') THEN
    DROP TABLE "CrewSheets";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261014124014_AddCrewSheets') THEN
    DELETE FROM "__EFMigrationsHistory"
    WHERE "MigrationId" = '20261014124014_AddCrewSheets';
    END IF;
END $EF$;
COMMIT;

