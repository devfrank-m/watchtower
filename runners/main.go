package main

import (
	"context"
	"log"
	"time"

	"github.com/joho/godotenv"
	"runners/check"
	"runners/db"
)

func main() {
	if err := godotenv.Load("../.env.local"); err != nil {
		log.Fatalf("load env: %v", err)
	}

	database, err := db.NewFromEnv()
	if err != nil {
		log.Fatalf("db connection: %v", err)
	}
	defer database.Close()

	ctx := context.Background()
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	log.Println("Starting monitor runner...")

	for range ticker.C {
		if err := processMonitors(ctx, database); err != nil {
			log.Printf("process error: %v", err)
		}
	}
}

func processMonitors(ctx context.Context, database *db.DB) error {
	monitors, err := database.GetDueMonitors(ctx)
	if err != nil {
		return err
	}

	if len(monitors) == 0 {
		return nil
	}

	log.Printf("Processing %d monitors", len(monitors))

	var runs []db.MonitorRun
	var updates []struct {
		id       int64
		nextRun  time.Time
		interval int
	}

	for _, m := range monitors {
		result := check.Perform(ctx, check.Config{
			Method:    getMethod(m.Method),
			URL:       m.Target,
			Headers:   check.ParseHeaders(m.Headers),
			Body:      m.Body,
			TimeoutMs: m.TimeoutMs,
		})

		log.Printf("Monitor %d: %v", m.ID, result)

		runs = append(runs, db.MonitorRun{
			MonitorID: m.ID,
			RunAt:     time.Now(),
			Status:    result.Status,
			LatencyMs: &result.LatencyMs,
			Error:     getErrorPtr(result.Error),
		})

		updates = append(updates, struct {
			id       int64
			nextRun  time.Time
			interval int
		}{
			id:       m.ID,
			nextRun:  time.Now().Add(time.Duration(m.IntervalSec) * time.Second),
			interval: m.IntervalSec,
		})
	}

	log.Printf("Saving %d runs", len(runs))

	if err := database.SaveRuns(ctx, runs); err != nil {
		return err
	}

	log.Printf("Updating %d monitors", len(updates))
	
	for _, u := range updates {
		if err := database.UpdateNextRun(ctx, u.id, u.nextRun); err != nil {
			log.Printf("update monitor %d: %v", u.id, err)
		}
	}

	return nil
}

func getMethod(m *string) string {
	if m == nil {
		return "GET"
	}
	return *m
}

func getErrorPtr(err string) *string {
	if err == "" {
		return nil
	}
	return &err
}
