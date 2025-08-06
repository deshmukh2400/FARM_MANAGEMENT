#!/bin/bash

# Farm Manager Mobile App - Publishing Script
echo "📱 Farm Manager - Publishing Script"
echo "==================================="

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g eas-cli
fi

# Check if logged in to Expo
echo "🔐 Checking Expo authentication..."
if ! eas whoami &> /dev/null; then
    echo "❌ Not logged in to Expo. Please login:"
    eas login
fi

# Initialize EAS if not already done
if [ ! -f "eas.json" ]; then
    echo "🔧 Initializing EAS..."
    eas init
fi

echo ""
echo "📋 Pre-flight Checklist:"
echo "  □ PNG assets created (icon.png, splash.png, etc.)"
echo "  □ App store accounts ready"
echo "  □ App metadata prepared"
echo ""

# Menu for build options
echo "🚀 What would you like to do?"
echo "1) Build for testing (APK)"
echo "2) Build for production (both platforms)"
echo "3) Submit to app stores"
echo "4) Check build status"
echo "5) Exit"

read -p "Choose an option (1-5): " choice

case $choice in
    1)
        echo "🔨 Building APK for testing..."
        eas build --platform android --profile preview
        ;;
    2)
        echo "🔨 Building for production..."
        eas build --platform all --profile production
        ;;
    3)
        echo "📤 Submitting to app stores..."
        echo "Make sure you have completed builds first!"
        eas submit --platform all
        ;;
    4)
        echo "📊 Checking build status..."
        eas build:list
        ;;
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "✅ Done! Check the output above for results."
echo "📖 For more help, see MOBILE_APP_PUBLISHING_GUIDE.md" 