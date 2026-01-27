package db

import (
	"context"
	"fmt"
	"log"
)


func (db *DB) SetupTimescale(ctx context.Context) error {
	if err := db.ensureHypertable(ctx); err != nil {
		return fmt.Errorf("hypertable: %w", err)
	}

	if err := db.ensureCompression(ctx); err != nil {
		return fmt.Errorf("compression: %w", err)
	}

	if err := db.ensureContinuousAggregate(ctx); err != nil {
		return fmt.Errorf("continuous aggregate: %w", err)
	}

	if err := db.ensureRetentionPolicies(ctx); err != nil {
		return fmt.Errorf("retention policies: %w", err)
	}

	return nil
}

func (db *DB) ensureHypertable(ctx context.Context) error {
	var isHypertable bool
	err := db.QueryRowContext(ctx, `
		SELECT EXISTS (
			SELECT 1 FROM timescaledb_information.hypertables
			WHERE hypertable_name = 'monitor_runs'
		)
	`).Scan(&isHypertable)

	if err != nil {
		return fmt.Errorf("check hypertable: %w", err)
	}

	if isHypertable {
		log.Println("TimescaleDB: hypertable already exists")
		return nil
	}

	// TimescaleDB requires partitioning column in all unique constraints
	// We need to drop the id-only primary key and add a composite one
	_, err = db.ExecContext(ctx, `
		ALTER TABLE monitor_runs DROP CONSTRAINT IF EXISTS monitor_runs_pkey
	`)
	if err != nil {
		return fmt.Errorf("drop primary key: %w", err)
	}

	_, err = db.ExecContext(ctx, `
		ALTER TABLE monitor_runs ADD PRIMARY KEY (id, "runAt")
	`)
	if err != nil {
		return fmt.Errorf("add composite primary key: %w", err)
	}

	_, err = db.ExecContext(ctx, `
		SELECT create_hypertable('monitor_runs', 'runAt',
			chunk_time_interval => INTERVAL '1 day',
			migrate_data => true
		)
	`)
	if err != nil {
		return fmt.Errorf("create hypertable: %w", err)
	}

	log.Println("TimescaleDB: created hypertable for monitor_runs")
	return nil
}

func (db *DB) ensureCompression(ctx context.Context) error {
	var compressionEnabled bool
	err := db.QueryRowContext(ctx, `
		SELECT compression_enabled
		FROM timescaledb_information.hypertables
		WHERE hypertable_name = 'monitor_runs'
	`).Scan(&compressionEnabled)

	if err != nil {
		return fmt.Errorf("check compression: %w", err)
	}

	if compressionEnabled {
		log.Println("TimescaleDB: compression already enabled")
		return db.ensureCompressionPolicy(ctx)
	}

	_, err = db.ExecContext(ctx, `
		ALTER TABLE monitor_runs SET (
			timescaledb.compress,
			timescaledb.compress_segmentby = '"monitorId"'
		)
	`)
	if err != nil {
		return fmt.Errorf("enable compression: %w", err)
	}

	log.Println("TimescaleDB: enabled compression on monitor_runs")
	return db.ensureCompressionPolicy(ctx)
}

func (db *DB) ensureCompressionPolicy(ctx context.Context) error {
	var hasPolicy bool
	err := db.QueryRowContext(ctx, `
		SELECT EXISTS (
			SELECT 1 FROM timescaledb_information.jobs
			WHERE hypertable_name = 'monitor_runs'
			AND proc_name = 'policy_compression'
		)
	`).Scan(&hasPolicy)

	if err != nil {
		return fmt.Errorf("check compression policy: %w", err)
	}

	if hasPolicy {
		log.Println("TimescaleDB: compression policy already exists")
		return nil
	}

	_, err = db.ExecContext(ctx, `
		SELECT add_compression_policy('monitor_runs', INTERVAL '7 days')
	`)
	if err != nil {
		return fmt.Errorf("add compression policy: %w", err)
	}

	log.Println("TimescaleDB: added compression policy (7 days)")
	return nil
}

func (db *DB) ensureContinuousAggregate(ctx context.Context) error {
	var exists bool
	err := db.QueryRowContext(ctx, `
		SELECT EXISTS (
			SELECT 1 FROM timescaledb_information.continuous_aggregates
			WHERE view_name = 'monitor_daily_stats'
		)
	`).Scan(&exists)

	if err != nil {
		return fmt.Errorf("check continuous aggregate: %w", err)
	}

	if exists {
		log.Println("TimescaleDB: continuous aggregate already exists")
		return db.ensureAggregateRefreshPolicy(ctx)
	}

	_, err = db.ExecContext(ctx, `
		CREATE MATERIALIZED VIEW monitor_daily_stats
		WITH (timescaledb.continuous) AS
		SELECT
			"monitorId",
			time_bucket('1 day', "runAt") AS day,
			COUNT(*) AS total_checks,
			COUNT(*) FILTER (WHERE status >= 200 AND status < 300) AS success_count,
			COUNT(*) FILTER (WHERE status < 200 OR status >= 300) AS failure_count,
			MIN(status) AS min_status,
			MAX(status) AS max_status,
			AVG("latencyMs")::int AS avg_latency_ms,
			MIN("latencyMs") AS min_latency_ms,
			MAX("latencyMs") AS max_latency_ms
		FROM monitor_runs
		GROUP BY "monitorId", time_bucket('1 day', "runAt")
		WITH NO DATA
	`)
	if err != nil {
		return fmt.Errorf("create continuous aggregate: %w", err)
	}

	log.Println("TimescaleDB: created continuous aggregate monitor_daily_stats")
	return db.ensureAggregateRefreshPolicy(ctx)
}

func (db *DB) ensureAggregateRefreshPolicy(ctx context.Context) error {
	var hasPolicy bool
	err := db.QueryRowContext(ctx, `
		SELECT EXISTS (
			SELECT 1 FROM timescaledb_information.jobs
			WHERE hypertable_name = 'monitor_daily_stats'
			AND proc_name = 'policy_refresh_continuous_aggregate'
		)
	`).Scan(&hasPolicy)

	if err != nil {
		return fmt.Errorf("check refresh policy: %w", err)
	}

	if hasPolicy {
		log.Println("TimescaleDB: aggregate refresh policy already exists")
		return nil
	}

	_, err = db.ExecContext(ctx, `
		SELECT add_continuous_aggregate_policy('monitor_daily_stats',
			start_offset => INTERVAL '3 days',
			end_offset => INTERVAL '1 hour',
			schedule_interval => INTERVAL '1 hour'
		)
	`)
	if err != nil {
		return fmt.Errorf("add refresh policy: %w", err)
	}

	log.Println("TimescaleDB: added aggregate refresh policy (hourly)")
	return nil
}

func (db *DB) ensureRetentionPolicies(ctx context.Context) error {
	if err := db.ensureRawDataRetention(ctx); err != nil {
		return err
	}
	return db.ensureAggregateRetention(ctx)
}

func (db *DB) ensureRawDataRetention(ctx context.Context) error {
	var hasPolicy bool
	err := db.QueryRowContext(ctx, `
		SELECT EXISTS (
			SELECT 1 FROM timescaledb_information.jobs
			WHERE hypertable_name = 'monitor_runs'
			AND proc_name = 'policy_retention'
		)
	`).Scan(&hasPolicy)

	if err != nil {
		return fmt.Errorf("check raw retention policy: %w", err)
	}

	if hasPolicy {
		log.Println("TimescaleDB: raw data retention policy already exists")
		return nil
	}

	_, err = db.ExecContext(ctx, `
		SELECT add_retention_policy('monitor_runs', INTERVAL '90 days')
	`)
	if err != nil {
		return fmt.Errorf("add raw retention policy: %w", err)
	}

	log.Println("TimescaleDB: added raw data retention policy (90 days)")
	return nil
}

func (db *DB) ensureAggregateRetention(ctx context.Context) error {
	var hasPolicy bool
	err := db.QueryRowContext(ctx, `
		SELECT EXISTS (
			SELECT 1 FROM timescaledb_information.jobs
			WHERE hypertable_name = 'monitor_daily_stats'
			AND proc_name = 'policy_retention'
		)
	`).Scan(&hasPolicy)

	if err != nil {
		return fmt.Errorf("check aggregate retention policy: %w", err)
	}

	if hasPolicy {
		log.Println("TimescaleDB: aggregate retention policy already exists")
		return nil
	}

	_, err = db.ExecContext(ctx, `
		SELECT add_retention_policy('monitor_daily_stats', INTERVAL '1 year')
	`)
	if err != nil {
		return fmt.Errorf("add aggregate retention policy: %w", err)
	}

	log.Println("TimescaleDB: added aggregate retention policy (1 year)")
	return nil
}
