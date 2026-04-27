# AWS Deployment Guide

## Quick Deploy

### Option 1: EC2 + Docker
```bash
# SSH into EC2
ssh -i key.pem ec2-user@your-instance

# Install Docker
sudo yum update -y
sudo yum install docker -y
sudo systemctl start docker

# Clone repo
git clone https://github.com/hamisi911ltd-debug/CampusMart-V2.git
cd CampusMart-V2

# Build & Run
docker build -t campusmart .
docker run -d -p 80:3001 campusmart
```

### Option 2: Elastic Beanstalk
```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p "Node.js 18 running on 64bit Amazon Linux 2"

# Deploy
eb create campusmart-env
eb deploy
```

### Option 3: ECS + ECR
```bash
# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

docker build -t campusmart .
docker tag campusmart:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/campusmart:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/campusmart:latest

# Deploy via ECS
```

## Environment Variables
```
NODE_ENV=production
PORT=3001
```

## Database
- Uses local JSON file (database.json)
- For production, consider RDS or DynamoDB

## Health Check
```
GET /api/health
```

## Monitoring
- CloudWatch logs
- CloudWatch metrics
- Auto-scaling groups