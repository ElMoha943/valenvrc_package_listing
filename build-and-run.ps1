#!/usr/bin/env pwsh
# Build and Run Script for ValenVRC Website

Write-Host "🚀 Building ValenVRC Website with Docker..." -ForegroundColor Cyan

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Stop and remove existing container
Write-Host "`n🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose down 2>$null

# Build the image
Write-Host "`n🔨 Building Docker image..." -ForegroundColor Cyan
docker-compose build

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Build failed!" -ForegroundColor Red
    exit 1
}

# Start the container
Write-Host "`n▶️  Starting container..." -ForegroundColor Cyan
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to start container!" -ForegroundColor Red
    exit 1
}

Write-Host "`n✓ Website is running!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "🌐 Open your browser to: http://localhost:8080" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "`nCommands:" -ForegroundColor White
Write-Host "  View logs:    docker-compose logs -f" -ForegroundColor Gray
Write-Host "  Stop:         docker-compose down" -ForegroundColor Gray
Write-Host "  Restart:      docker-compose restart" -ForegroundColor Gray

# Optionally open browser
$response = Read-Host "`nOpen in browser now? (Y/n)"
if ($response -eq "" -or $response -eq "Y" -or $response -eq "y") {
    Start-Process "http://localhost:8080"
}
