FROM golang:1.24-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o runners .

FROM alpine:3.21

RUN apk add --no-cache ca-certificates

RUN addgroup -S runner && adduser -S runner -G runner

WORKDIR /app
COPY --from=builder /app/runners .

USER runner

CMD ["./runners"]
