# deploy_frontend.ps1

param(
    [string]$ApiUrl,
    [string]$BucketName
)

# Check if params are provided, if not ask for them
if ([string]::IsNullOrEmpty($ApiUrl)) {
    $ApiUrl = Read-Host "Enter the Backend API URL (from deploy.ps1 output)"
}
if ([string]::IsNullOrEmpty($BucketName)) {
    $BucketName = Read-Host "Enter a unique name for your S3 Bucket (e.g., skull-king-frontend-yourname)"
}

# Ensure API URL ends with /api if not present, but usually the user provides the base
# The code expects VITE_API_URL. If the user gives "https://.../Prod/", we might need to append nothing if the code appends /api, 
# or ensure it matches what api.ts expects.
# api.ts: const API_BASE = import.meta.env.VITE_API_URL || ...
# And it uses `${API_BASE}/games/`
# So VITE_API_URL should be "https://.../Prod/api"
if (-not $ApiUrl.EndsWith("/api")) {
    if ($ApiUrl.EndsWith("/")) {
        $ApiUrl = "$($ApiUrl)api"
    } else {
        $ApiUrl = "$($ApiUrl)/api"
    }
}

Write-Host "Configuring frontend for API: $ApiUrl"

# Create .env.production
$EnvContent = "VITE_API_URL=$ApiUrl"
Set-Content -Path "frontend/.env.production" -Value $EnvContent
Write-Host "Created frontend/.env.production"

# Build Frontend
Write-Host "Building Frontend..."
Push-Location frontend
npm install
npm run build
Pop-Location

if (-not (Test-Path "frontend/dist")) {
    Write-Error "Build failed. frontend/dist not found."
    exit 1
}

# Create S3 Bucket
Write-Host "Creating/Checking S3 Bucket: $BucketName..."
if (aws s3api head-bucket --bucket $BucketName 2>$null) {
    Write-Host "Bucket exists."
} else {
    aws s3 mb s3://$BucketName
    Write-Host "Bucket created."
}

# Configure Static Website Hosting
Write-Host "Configuring Static Website Hosting..."
aws s3 website s3://$BucketName --index-document index.html --error-document index.html

# Unblock Public Access (Required for static hosting without CloudFront OAI)
# WARNING: This makes the bucket public. For production, CloudFront + OAI is better.
Write-Host "Disabling Block Public Access..."
aws s3api put-public-access-block --bucket $BucketName --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# Add Bucket Policy for Public Read
$BucketPolicy = @"
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BucketName/*"
        }
    ]
}
"@
aws s3api put-bucket-policy --bucket $BucketName --policy $BucketPolicy

# Sync Files
Write-Host "Deploying files to S3..."
aws s3 sync frontend/dist s3://$BucketName --delete

$WebsiteUrl = "http://$BucketName.s3-website-$(aws configure get region).amazonaws.com"
Write-Host "--------------------------------------------------"
Write-Host "Deployment Complete!"
Write-Host "Your App is live at: $WebsiteUrl"
Write-Host "--------------------------------------------------"
