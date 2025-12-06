import boto3
from app.core.config import settings

def get_dynamodb_table():
    dynamodb = boto3.resource('dynamodb', region_name=settings.AWS_REGION)
    return dynamodb.Table(settings.DYNAMODB_TABLE)
