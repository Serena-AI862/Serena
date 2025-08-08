# Create key pair and save private key locally
aws ec2 create-key-pair --key-name my-n8n-key --query 'KeyMaterial' --output text > my-n8n-key.pem
chmod 400 my-n8n-key.pem

# Then deploy CloudFormation with existing key
aws cloudformation create-stack \
  --stack-name n8n-stack \
  --template-body file://template.yaml \
  --parameters ParameterKey=KeyPairName,ParameterValue=my-n8n-key

# Wait for stack creation to complete
echo "Waiting for stack creation to complete..."
aws cloudformation wait stack-create-complete --stack-name n8n-stack

if [ $? -eq 0 ]; then
    echo "✅ Stack created successfully!"
    
    # Get stack outputs
    echo "Stack outputs:"
    aws cloudformation describe-stacks --stack-name n8n-stack --query 'Stacks[0].Outputs'
    
else
    echo "❌ Stack creation failed or timed out"
    echo "Check the CloudFormation console for details:"
    echo "https://console.aws.amazon.com/cloudformation/"
    
    # Show stack events for debugging
    echo "Recent stack events:"
    aws cloudformation describe-stack-events --stack-name n8n-stack --max-items 10
    exit 1
fi