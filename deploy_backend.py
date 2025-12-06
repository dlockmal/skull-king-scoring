import subprocess
import sys
import json
import os

def run_command(command, shell=True):
    try:
        result = subprocess.run(command, shell=shell, check=True, text=True, capture_output=True)
        print(result.stdout)
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"Error executing command: {command}")
        print(e.stderr)
        sys.exit(1)

def deploy_backend():
    aws_cmd = r'"C:\Program Files\Amazon\AWSCLIV2\aws.exe"'
    sam_cmd = r'"C:\Users\david\AppData\Roaming\Python\Python314\Scripts\sam.exe"'

    print("Building SAM application...")
    run_command(f"{sam_cmd} build --use-container")

    print("Deploying SAM application...")
    # --resolve-s3 automatically creates a bucket for SAM artifacts if needed
    # --capabilities CAPABILITY_IAM is required for creating IAM roles
    run_command(f"{sam_cmd} deploy --stack-name skull-king-stack --resolve-s3 --capabilities CAPABILITY_IAM --region us-east-1")

    print("Retrieving API URL...")
    # Fetch the output value for ApiUrl
    output_json = run_command(f"{aws_cmd} cloudformation describe-stacks --stack-name skull-king-stack --query \"Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue\" --output text")
    api_url = output_json.strip()
    
    print("-" * 50)
    print(f"Backend deployed successfully!")
    print(f"API URL: {api_url}")
    print("-" * 50)
    
    return api_url

if __name__ == "__main__":
    deploy_backend()
