package check

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type Result struct {
	MonitorID int64
	Status    int
	LatencyMs int
	Error     string
}

type Config struct {
	Method         string
	URL            string
	Headers        map[string]string
	Body           *string
	TimeoutMs      int
	ExpectedStatus *int
}

func Perform(ctx context.Context, cfg Config) Result {
	client := &http.Client{
		Timeout: time.Duration(cfg.TimeoutMs) * time.Millisecond,
	}

	start := time.Now()

	req, err := http.NewRequestWithContext(ctx, cfg.Method, cfg.URL, nil)
	if err != nil {
		return Result{
			Status:    0,
			LatencyMs: int(time.Since(start).Milliseconds()),
			Error:     fmt.Sprintf("create request: %v", err),
		}
	}

	for k, v := range cfg.Headers {
		req.Header.Set(k, v)
	}

	if cfg.Body != nil {
		req.Body = io.NopCloser(nil)
	}

	resp, err := client.Do(req)
	if err != nil {
		return Result{
			Status:    0,
			LatencyMs: int(time.Since(start).Milliseconds()),
			Error:     fmt.Sprintf("request failed: %v", err),
		}
	}
	defer resp.Body.Close()

	_, _ = io.Copy(io.Discard, resp.Body)

	latency := int(time.Since(start).Milliseconds())

	if cfg.ExpectedStatus != nil && resp.StatusCode != *cfg.ExpectedStatus {
		return Result{
			Status:    resp.StatusCode,
			LatencyMs: latency,
			Error:     fmt.Sprintf("expected status %d, got %d", *cfg.ExpectedStatus, resp.StatusCode),
		}
	}

	return Result{
		Status:    resp.StatusCode,
		LatencyMs: latency,
		Error:     "",
	}
}

func ParseHeaders(data []byte) map[string]string {
	if len(data) == 0 {
		return nil
	}

	var headers map[string]string
	if err := json.Unmarshal(data, &headers); err != nil {
		return nil
	}

	return headers
}
