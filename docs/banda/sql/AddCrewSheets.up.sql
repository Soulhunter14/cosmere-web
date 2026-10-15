START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261014124014_AddCrewSheets') THEN
    CREATE TABLE "CrewSheets" (
        "CampaignId" bigint NOT NULL,
        "State" text NOT NULL DEFAULT '{}',
        "GmState" text NOT NULL DEFAULT '{}',
        "SharedWith" bigint[] NOT NULL DEFAULT ('{}'),
        "Version" integer NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_CrewSheets" PRIMARY KEY ("CampaignId"),
        CONSTRAINT "FK_CrewSheets_Campaigns_CampaignId" FOREIGN KEY ("CampaignId") REFERENCES "Campaigns" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261014124014_AddCrewSheets') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20261014124014_AddCrewSheets', '8.0.11');
    END IF;
END $EF$;
COMMIT;

