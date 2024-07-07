-- CreateTable
CREATE TABLE "ApiKeys" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "value" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "CommPorts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "commPort" INTEGER NOT NULL,
    "connected" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Sensors" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "sensorId" INTEGER NOT NULL,
    "commPortId" INTEGER NOT NULL,
    CONSTRAINT "Sensors_commPortId_fkey" FOREIGN KEY ("commPortId") REFERENCES "CommPorts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Card" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "suit" TEXT NOT NULL,
    "card" TEXT NOT NULL,
    "uid" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CardToSensors" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_CardToSensors_A_fkey" FOREIGN KEY ("A") REFERENCES "Card" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CardToSensors_B_fkey" FOREIGN KEY ("B") REFERENCES "Sensors" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ApiKeys_value_key" ON "ApiKeys"("value");

-- CreateIndex
CREATE UNIQUE INDEX "CommPorts_commPort_key" ON "CommPorts"("commPort");

-- CreateIndex
CREATE UNIQUE INDEX "Card_uid_key" ON "Card"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "_CardToSensors_AB_unique" ON "_CardToSensors"("A", "B");

-- CreateIndex
CREATE INDEX "_CardToSensors_B_index" ON "_CardToSensors"("B");
