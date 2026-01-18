-- CreateTable
CREATE TABLE "monitor_runs" (
    "id" BIGSERIAL NOT NULL,
    "monitorId" BIGINT NOT NULL,
    "runAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" INTEGER NOT NULL,
    "latencyMs" INTEGER,
    "error" TEXT,

    CONSTRAINT "monitor_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "monitor_runs_monitorId_runAt_idx" ON "monitor_runs"("monitorId", "runAt" DESC);

-- AddForeignKey
ALTER TABLE "monitor_runs" ADD CONSTRAINT "monitor_runs_monitorId_fkey" FOREIGN KEY ("monitorId") REFERENCES "monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
