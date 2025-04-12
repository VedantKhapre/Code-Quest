-- CreateTable
CREATE TABLE "Progress" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "questionId" INTEGER NOT NULL,
    "solved" BOOLEAN NOT NULL DEFAULT true,
    "solvedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "code" TEXT,
    "language" TEXT NOT NULL DEFAULT 'cpp',
    CONSTRAINT "Progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Progress_userId_questionId_key" ON "Progress"("userId", "questionId");
