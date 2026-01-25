package db

import (
	"context"
	"time"
)

type MonitorRun struct {
	ID        int64     `bun:"id,pk,autoincrement"`
	MonitorID int64     `bun:"monitorId"`
	RunAt     time.Time `bun:"runAt"`
	Status    int       `bun:"status"`
	LatencyMs *int      `bun:"latencyMs"`
	Error     *string   `bun:"error"`
}

func (db *DB) SaveRun(ctx context.Context, run *MonitorRun) error {
	_, err := db.NewInsert().
		Model(run).
		Exec(ctx)

	return err
}

func (db *DB) SaveRuns(ctx context.Context, runs []MonitorRun) error {
	if len(runs) == 0 {
		return nil
	}

	_, err := db.NewInsert().
		Model(&runs).
		Exec(ctx)

	return err
}
