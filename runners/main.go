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

	if err := database.SetupTimescale(ctx); err != nil {
		log.Fatalf("timescale setup: %v", err)
	}

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

	// Update nextRunAt first to prevent monitors getting stuck if checks fail
	for _, m := range monitors {
		nextRun := time.Now().Add(time.Duration(m.IntervalSec) * time.Second)
		if err := database.UpdateNextRun(ctx, m.ID, nextRun); err != nil {
			log.Printf("update nextRun for monitor %d: %v", m.ID, err)
		}
	}

	var runs []db.MonitorRun
	for _, m := range monitors {
		log.Printf("Performing check for monitor to %s", m.Target)
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
	}

	if len(runs) > 0 {
		log.Printf("Saving %d runs", len(runs))
		if err := database.SaveRuns(ctx, runs); err != nil {
			return err
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
