const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [192, 512];
const inputFile = path.join(__dirname, '../public/icons/icon.svg');
const outputDir = path.join(__dirname, '../public/icons');

async function generateIcons() {
  for (const size of sizes) {
    const outputFile = path.join(outputDir, `icon-${size}x${size}.png`);
    
    await sharp(inputFile)
      .resize(size, size)
      .png()
      .toFile(outputFile);
      
    console.log(`Generated ${outputFile}`);
  }
}

generateIcons().catch(console.error); 