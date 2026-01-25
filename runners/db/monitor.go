package db

import (
	"context"
	"time"

	"github.com/uptrace/bun"
)

type Monitor struct {
	ID             int64     `bun:"id,pk,autoincrement"`
	UserID         string    `bun:"userId"`
	Type           string    `bun:"type"`
	Target         string    `bun:"target"`
	Method         *string   `bun:"method"`
	Headers        []byte    `bun:"type:jsonb"`
	Body           *string   `bun:"body"`
	IntervalSec    int       `bun:"intervalSeconds"`
	NextRunAt      time.Time `bun:"nextRunAt"`
	Enabled        bool      `bun:"enabled"`
	TimeoutMs      int       `bun:"timeoutMs"`
	ExpectedStatus *int      `bun:"expectedStatus"`
	Name           string    `bun:"name"`
	CreatedAt      time.Time `bun:"createdAt"`
	UpdatedAt      time.Time `bun:"updatedAt"`
}

func (db *DB) GetDueMonitors(ctx context.Context) ([]Monitor, error) {
	var monitors []Monitor

	err := db.NewSelect().
		Model(&monitors).
		Where("enabled = ?", true).
		Where("? <= ?", bun.Ident("nextRunAt"), time.Now()).
		OrderExpr("? ASC", bun.Ident("nextRunAt")).
		Limit(100).
		Scan(ctx)

	return monitors, err
}

func (db *DB) UpdateNextRun(ctx context.Context, id int64, nextRun time.Time) error {
	_, err := db.NewUpdate().
		Model(&Monitor{}).
		Set("? = ?", bun.Ident("nextRunAt"), nextRun).
		Set("? = ?", bun.Ident("updatedAt"), time.Now()).
		Where("id = ?", id).
		Exec(ctx)

	return err
}
