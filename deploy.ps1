# Build the SAM application
sam build

# Deploy the application
# --guided is removed for automation, but for the first run you might want to run it manually or provide parameters
# Here we assume a stack name 'skull-king-stack'
sam deploy --stack-name skull-king-stack --resolve-s3 --capabilities CAPABILITY_IAM --region us-east-1

# Output the API URL
$stackOutput = aws cloudformation describe-stacks --stack-name skull-king-stack --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" --output text
Write-Host "API URL: $stackOutput"

# Update frontend .env.production (manual step or automated here if we want)
# Write-Host "Please update frontend/.env.production with VITE_API_URL=$stackOutput/api"
