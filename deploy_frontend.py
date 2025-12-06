import subprocess
import sys
import os
import shutil

def run_command(command, shell=True):
    try:
        # Stream output to console for long-running commands like npm install
        process = subprocess.Popen(command, shell=shell, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        stdout, stderr = process.communicate()
        
        if process.returncode != 0:
            print(f"Error executing command: {command}")
            print(stderr)
            sys.exit(1)
            
        print(stdout)
        return stdout
    except Exception as e:
        print(f"An error occurred: {e}")
        sys.exit(1)

def deploy_frontend():
    api_url = input("Enter the Backend API URL (from deploy_backend.py output): ").strip()
    bucket_name = input("Enter a unique name for your S3 Bucket (e.g., skull-king-frontend-yourname): ").strip()

    if not api_url or not bucket_name:
        print("API URL and Bucket Name are required.")
        sys.exit(1)

    # Ensure API URL ends with /api
    if not api_url.endswith("/api"):
        if api_url.endswith("/"):
            api_url += "api"
        else:
            api_url += "/api"

    print(f"Configuring frontend for API: {api_url}")

    # Create .env.production
    env_path = os.path.join("frontend", ".env.production")
    with open(env_path, "w") as f:
        f.write(f"VITE_API_URL={api_url}\n")
    print("Created frontend/.env.production")

    # Build Frontend
    print("Building Frontend (this may take a minute)...")
    os.chdir("frontend")
    run_command("npm install")
    run_command("npm run build")
    os.chdir("..")

    if not os.path.exists(os.path.join("frontend", "dist")):
        print("Build failed. frontend/dist not found.")
        sys.exit(1)

    # Define AWS command path
    aws_cmd = r'"C:\Program Files\Amazon\AWSCLIV2\aws.exe"'

    # Create S3 Bucket
    print(f"Creating/Checking S3 Bucket: {bucket_name}...")
    try:
        run_command(f"{aws_cmd} s3api head-bucket --bucket {bucket_name}", shell=True)
        print("Bucket exists.")
    except SystemExit:
        # head-bucket fails if bucket doesn't exist (or no permission), so we try to create it
        print("Bucket not found or not accessible. Attempting to create...")
        run_command(f"{aws_cmd} s3 mb s3://{bucket_name}")
        print("Bucket created.")

    # Configure Static Website Hosting
    print("Configuring Static Website Hosting...")
    run_command(f"{aws_cmd} s3 website s3://{bucket_name} --index-document index.html --error-document index.html")

    # Unblock Public Access
    print("Disabling Block Public Access...")
    run_command(f"{aws_cmd} s3api put-public-access-block --bucket {bucket_name} --public-access-block-configuration \"BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false\"")

    # Add Bucket Policy
    print("Adding Bucket Policy...")
    policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "PublicReadGetObject",
                "Effect": "Allow",
                "Principal": "*",
                "Action": "s3:GetObject",
                "Resource": f"arn:aws:s3:::{bucket_name}/*"
            }
        ]
    }
    
    # Escape quotes for command line
    import json
    policy_json = json.dumps(policy)
    # On Windows, we need to be careful with quotes in the command line. 
    # Writing to a temp file is safer.
    with open("bucket_policy.json", "w") as f:
        f.write(policy_json)
        
    run_command(f"{aws_cmd} s3api put-bucket-policy --bucket {bucket_name} --policy file://bucket_policy.json")
    os.remove("bucket_policy.json")

    # Sync Files
    print("Deploying files to S3...")
    run_command(f"{aws_cmd} s3 sync frontend/dist s3://{bucket_name} --delete")

    # Get Region
    region = run_command(f"{aws_cmd} configure get region").strip()
    website_url = f"http://{bucket_name}.s3-website-{region}.amazonaws.com"

    print("-" * 50)
    print("Deployment Complete!")
    print(f"Your App is live at: {website_url}")
    print("-" * 50)

if __name__ == "__main__":
    deploy_frontend()
