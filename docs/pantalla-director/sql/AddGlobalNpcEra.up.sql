START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261008074753_AddGlobalNpcEra') THEN
    ALTER TABLE "GlobalNpcs" ADD "Era" smallint;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261008074753_AddGlobalNpcEra') THEN
    UPDATE "GlobalNpcs" SET "Era" = 1 WHERE "World" = 'mistborn' AND "Source" = 'Guía del mundo' AND "Name" IN ('Feruquimista', 'Inquisidor de Acero', 'Asesino nacido de la bruma', 'Cortesano nacido de la bruma', 'Obligador');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261008074753_AddGlobalNpcEra') THEN
    UPDATE "GlobalNpcs" SET "Era" = 2 WHERE "World" = 'mistborn' AND "Source" = 'Guía del mundo' AND "Name" IN ('Agente del grupo', 'Alguacil', 'Vigilante de la ley', 'Avatar de Trell', 'Oficial de sangre koloss', 'Piloto malwish', 'Quimera hemalúrgica', 'Quimera hemalúrgica, líder de manada', 'Sangre espectral');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261008074753_AddGlobalNpcEra') THEN
    UPDATE "GlobalNpcs" SET "Era" = 1 WHERE "World" = 'mistborn' AND "Source" = 'El legado' AND "Name" IN ('Anastas Elariel', 'Ashweather Cett', 'Bezryl', 'Bestia hemalúrgica', 'Delina Tekiel', 'Duvall Haught', 'Guiverre Seeris', 'Caridus Buvidas', 'Silia Buvidas');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261008074753_AddGlobalNpcEra') THEN
    UPDATE "GlobalNpcs" SET "Era" = 2 WHERE "World" = 'mistborn' AND "Source" = 'El legado' AND "Name" IN ('Azmine Wilko', 'Bayron Conrad', 'Capitana Eliane Vorn', 'Monstruosidad hemalúrgica', 'Operativo de Conrad', 'Operativo de élite de Conrad', 'Ingeniero de Conrad', 'Informador ojo de estaño de Conrad', 'Kwylliam Elariel', 'Luchador por la libertad', 'Lysarra Tekiel', 'Iniciado de una sociedad', 'Aspirante de una sociedad', 'Protector del clan koloss', 'Yunque');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261008074753_AddGlobalNpcEra') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20261008074753_AddGlobalNpcEra', '8.0.11');
    END IF;
END $EF$;
COMMIT;

