#!/bin/bash

# Exit on any error
set -e

echo "Starting n8n setup..."

# Start HTTP-only setup
echo "Starting containers with HTTP configuration..."
sudo docker-compose up -d

# Wait for containers to start and be healthy
echo "Waiting for containers to be ready..."
sleep 30

# Check if containers are running
if ! sudo docker-compose ps | grep -q "Up"; then
    echo "ERROR: Containers failed to start properly"
    sudo docker-compose logs
    exit 1
fi

echo "Containers are running. Getting SSL certificate..."

# Get SSL certificate using correct volume approach
sudo docker run --rm \
--volumes-from nginx \
-v ubuntu_certbot_conf:/etc/letsencrypt \
certbot/certbot certonly \
--webroot --webroot-path=/var/www/certbot \
--email johnadeyo@hotmail.com \
--agree-tos --no-eff-email \
-d serenan8n.ddnsfree.com

if [ $? -eq 0 ]; then
    echo "SSL certificate obtained successfully"
else
    echo "ERROR: Failed to obtain SSL certificate"
    exit 1
fi

# Stop HTTP-only setup
echo "Stopping HTTP setup..."
sudo docker-compose down

# Wait for containers to stop
sleep 10

# Start HTTPS setup
echo "Starting HTTPS setup..."
sudo docker-compose -f docker-compose-https.yml up -d

# Wait for containers to start
sleep 30

# Check if containers are running
if ! sudo docker-compose -f docker-compose-https.yml ps | grep -q "Up"; then
    echo "ERROR: HTTPS containers failed to start properly"
    sudo docker-compose -f docker-compose-https.yml logs
    exit 1
fi

echo "n8n setup completed successfully!"
echo "Access your n8n instance at: https://serenan8n.ddnsfree.com"