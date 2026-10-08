START TRANSACTION;


DO $EF$
BEGIN
    IF EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261008064239_SeedMistbornAdversarios') THEN
    DELETE FROM "GlobalNpcs" WHERE "World" = 'mistborn' AND "Source" = 'Guía del mundo';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261008064239_SeedMistbornAdversarios') THEN
    DELETE FROM "__EFMigrationsHistory"
    WHERE "MigrationId" = '20261008064239_SeedMistbornAdversarios';
    END IF;
END $EF$;
COMMIT;

