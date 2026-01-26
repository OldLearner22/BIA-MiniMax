#!/bin/bash

# Railway Deployment Setup Script
# This script helps set up the Railway deployment configuration

echo "🚂 Railway Deployment Setup for BIA MiniMax"
echo "=========================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "npm install -g @railway/cli"
    exit 1
fi

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged in to Railway. Please run:"
    echo "railway login"
    exit 1
fi

echo "✅ Railway CLI is installed and authenticated"

# Create Railway project
echo "📦 Creating Railway project..."
railway init "bia-minimax"

# Link to project (user will need to select)
echo "🔗 Linking to Railway project..."
railway link

# Add PostgreSQL database
echo "🗄️ Adding PostgreSQL database..."
railway add postgres

# Set environment variables
echo "🔧 Setting up environment variables..."
railway variables set NODE_ENV=production
railway variables set PORT=3001
railway variables set SESSION_SECRET=$(openssl rand -base64 32)

echo "✅ Railway project setup complete!"
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub"
echo "2. Connect Railway to your GitHub repository"
echo "3. Railway will automatically deploy your application"
echo "4. Set up the CORS_ORIGIN variable to your frontend URL after deployment"
echo ""
echo "Useful commands:"
echo "- railway logs: View deployment logs"
echo "- railway variables: Manage environment variables"
echo "- railway domains: View your application URLs"