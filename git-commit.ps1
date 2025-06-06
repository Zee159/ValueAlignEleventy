param (
    [Parameter(Mandatory=$true)]
    [string]$CommitMessage
)

Write-Host "🚀 Starting Git commit process..." -ForegroundColor Cyan

# Check git status
Write-Host "📋 Checking current status..." -ForegroundColor Yellow
git status

# Ask for confirmation
$confirmation = Read-Host "❓ Do you want to proceed with committing all changes? (y/n)"
if ($confirmation -ne 'y') {
    Write-Host "❌ Operation cancelled." -ForegroundColor Red
    exit
}

# Add all files
Write-Host "➕ Adding all changed files..." -ForegroundColor Yellow
git add .

# Commit with provided message
Write-Host "💾 Committing changes with message: '$CommitMessage'" -ForegroundColor Yellow
git commit -m $CommitMessage

# Push to remote
Write-Host "☁️ Pushing to GitHub..." -ForegroundColor Yellow
git push

Write-Host "✅ All done! Changes have been committed and pushed to GitHub." -ForegroundColor Green
