#!/usr/bin/env node

/**
 * Asset Conversion Script for Farm Manager App
 * 
 * This script helps convert SVG assets to PNG format required for app stores.
 * You'll need to manually convert the SVG files or use online tools.
 */

console.log('📱 Farm Manager - Asset Conversion Guide');
console.log('==========================================');
console.log('');

console.log('🎯 Required PNG Assets:');
console.log('');

console.log('📱 Mobile App Icon (from assets/images/icon.svg):');
console.log('   → assets/images/icon.png (1024×1024px)');
console.log('   → No transparency, PNG format');
console.log('');

console.log('🎨 Adaptive Icon (from assets/images/icon.svg):');
console.log('   → assets/images/adaptive-icon.png (1024×1024px)');
console.log('   → Foreground element only, transparent background');
console.log('');

console.log('🚀 Splash Screen (from assets/images/splash.svg):');
console.log('   → assets/images/splash.png (1242×2688px for iPhone)');
console.log('   → Can be resized, maintain aspect ratio');
console.log('');

console.log('🌐 Favicon (from web/public/assets/images/favicon.svg):');
console.log('   → assets/images/favicon.png (32×32px)');
console.log('');

console.log('📄 Additional Required Assets:');
console.log('   → assets/notification-icon.png (96×96px)');
console.log('   → assets/notification-sound.wav (optional)');
console.log('');

console.log('🔧 Conversion Methods:');
console.log('');
console.log('1. Online Tools:');
console.log('   • https://convertio.co/svg-png/');
console.log('   • https://cloudconvert.com/svg-to-png');
console.log('   • https://svgtopng.com/');
console.log('');

console.log('2. Command Line (if you have ImageMagick):');
console.log('   convert assets/images/icon.svg -resize 1024x1024 assets/images/icon.png');
console.log('');

console.log('3. Design Tools:');
console.log('   • Figma: Import SVG, export as PNG');
console.log('   • Adobe Illustrator: Save As → PNG');
console.log('   • Inkscape: File → Export PNG Image');
console.log('');

console.log('📋 Asset Checklist:');
console.log('   □ icon.png (1024×1024px, no transparency)');
console.log('   □ adaptive-icon.png (1024×1024px, transparent background)');
console.log('   □ splash.png (1242×2688px or similar)');
console.log('   □ favicon.png (32×32px)');
console.log('   □ notification-icon.png (96×96px)');
console.log('');

console.log('✅ After converting assets, run:');
console.log('   cd mobile');
console.log('   npm install -g @expo/cli eas-cli');
console.log('   eas init');
console.log('   eas build:configure');
console.log('');

console.log('🚀 Then build your app:');
console.log('   eas build --platform android --profile preview  # Test build');
console.log('   eas build --platform all --profile production   # Production build');
console.log(''); 