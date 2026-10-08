START TRANSACTION;


DO $EF$
BEGIN
    IF EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261008073931_SeedLegadoAdversarios') THEN
    DELETE FROM "GlobalNpcs" WHERE "World" = 'mistborn' AND "Source" = 'El legado';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261008073931_SeedLegadoAdversarios') THEN
    DELETE FROM "__EFMigrationsHistory"
    WHERE "MigrationId" = '20261008073931_SeedLegadoAdversarios';
    END IF;
END $EF$;
COMMIT;

