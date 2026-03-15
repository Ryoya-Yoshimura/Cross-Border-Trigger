-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Question" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL DEFAULT 'evergreen',
    "text" TEXT NOT NULL DEFAULT '',
    "choices" TEXT NOT NULL,
    "sourceMetadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Question" ("choices", "createdAt", "date", "id") SELECT "choices", "createdAt", "date", "id" FROM "Question";
DROP TABLE "Question";
ALTER TABLE "new_Question" RENAME TO "Question";
CREATE UNIQUE INDEX "Question_date_key" ON "Question"("date");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
