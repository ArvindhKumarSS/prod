const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const COMICS_DIR = path.join(__dirname, '../public/images/comics');

// Ensure comics directory exists
if (!fs.existsSync(COMICS_DIR)) {
    fs.mkdirSync(COMICS_DIR, { recursive: true });
}

async function generateComics() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set viewport size
    await page.setViewport({ width: 800, height: 600 });

    // Generate each comic panel
    for (let i = 1; i <= 5; i++) {
        const htmlPath = path.join(__dirname, `../public/images/comic-${i}.html`);
        const outputPath = path.join(COMICS_DIR, `comic-${i}.png`);

        // Load the HTML file
        await page.goto(`file://${htmlPath}`);

        // Wait for the content to be rendered
        await page.waitForSelector('.panel');

        // Take a screenshot
        await page.screenshot({
            path: outputPath,
            fullPage: false
        });

        console.log(`Generated comic-${i}.png`);
    }

    await browser.close();
    console.log('All comic panels generated successfully!');
}

generateComics().catch(console.error); 