/*
  Warnings:

  - You are about to drop the column `cardId` on the `Sensors` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "_CardToSensors" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_CardToSensors_A_fkey" FOREIGN KEY ("A") REFERENCES "Card" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CardToSensors_B_fkey" FOREIGN KEY ("B") REFERENCES "Sensors" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Sensors" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "sensorId" INTEGER NOT NULL,
    "commPortId" INTEGER NOT NULL,
    CONSTRAINT "Sensors_commPortId_fkey" FOREIGN KEY ("commPortId") REFERENCES "CommPorts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Sensors" ("commPortId", "createdAt", "id", "sensorId", "updatedAt") SELECT "commPortId", "createdAt", "id", "sensorId", "updatedAt" FROM "Sensors";
DROP TABLE "Sensors";
ALTER TABLE "new_Sensors" RENAME TO "Sensors";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "_CardToSensors_AB_unique" ON "_CardToSensors"("A", "B");

-- CreateIndex
CREATE INDEX "_CardToSensors_B_index" ON "_CardToSensors"("B");
