#!/bin/bash

# Delete CloudFormation stack
echo "Deleting CloudFormation stack: n8n-stack"
aws cloudformation delete-stack --stack-name n8n-stack

# Wait for stack deletion to complete (optional)
echo "Waiting for stack deletion to complete..."
aws cloudformation wait stack-delete-complete --stack-name n8n-stack

if [ $? -eq 0 ]; then
    echo "Stack deleted successfully!"
    # Clean up local key pair file
    echo "Cleaning up local key pair file..."
    rm -f my-n8n-key.pem

    # Delete the key pair from AWS
    echo "Deleting key pair from AWS..."
    aws ec2 delete-key-pair --key-name my-n8n-key

    echo "Cleanup complete!"
else
    echo "Stack deletion failed or timed out. Check AWS Console for details."
fi