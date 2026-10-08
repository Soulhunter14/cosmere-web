START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261007220052_AddGmScreens') THEN
    CREATE TABLE "GmScreens" (
        "CampaignId" bigint NOT NULL,
        "State" text NOT NULL DEFAULT '{}',
        "Version" integer NOT NULL,
        "UpdatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_GmScreens" PRIMARY KEY ("CampaignId"),
        CONSTRAINT "FK_GmScreens_Campaigns_CampaignId" FOREIGN KEY ("CampaignId") REFERENCES "Campaigns" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261007220052_AddGmScreens') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20261007220052_AddGmScreens', '8.0.11');
    END IF;
END $EF$;
COMMIT;

