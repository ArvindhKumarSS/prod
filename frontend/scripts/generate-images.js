const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Function to open HTML file in default browser and wait
function openInBrowser(htmlPath) {
    execSync(`open ${htmlPath}`);
    // Wait for browser to open
    execSync('sleep 2');
}

// Function to take screenshot
function takeScreenshot(outputPath, width, height) {
    execSync(`screencapture -x -R 0,0,${width},${height} ${outputPath}`);
}

// Generate OG Image
const ogHtmlPath = path.join(__dirname, '../public/images/og-image.html');
const ogPngPath = path.join(__dirname, '../public/images/og-image.png');
openInBrowser(ogHtmlPath);
takeScreenshot(ogPngPath, 1200, 630);

// Generate Logo
const logoHtmlPath = path.join(__dirname, '../public/images/logo.html');
const logoPngPath = path.join(__dirname, '../public/images/logo.png');
openInBrowser(logoHtmlPath);
takeScreenshot(logoPngPath, 512, 512);

console.log('Images generated successfully!'); 