#!/usr/bin/env node

/**
 * Icon Generation Script
 * 
 * This script generates PNG icons from the SVG source files.
 * 
 * Prerequisites:
 * - Install sharp: npm install sharp --save-dev
 * 
 * Usage:
 * - node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Try to use sharp if available, otherwise provide instructions
async function generateIcons() {
  let sharp;
  
  try {
    sharp = require('sharp');
  } catch (e) {
    console.log('Sharp is not installed. To generate PNG icons:');
    console.log('1. Run: npm install sharp --save-dev');
    console.log('2. Run this script again: node scripts/generate-icons.js');
    console.log('\nAlternatively, manually convert SVG files to PNG using an online converter.');
    
    // Create placeholder PNGs using simple colored squares
    createPlaceholderIcons();
    return;
  }

  const sizes = [16, 32, 48, 64, 96, 128];
  const iconDir = path.join(__dirname, '..', 'assets', 'icons');
  
  // Active icons
  const activeSvg = fs.readFileSync(path.join(iconDir, 'icon.svg'));
  
  for (const size of sizes) {
    await sharp(activeSvg)
      .resize(size, size)
      .png()
      .toFile(path.join(iconDir, `icon${size}.png`));
    
    console.log(`Created icon${size}.png`);
  }
  
  // Inactive icons
  const inactiveSvg = fs.readFileSync(path.join(iconDir, 'icon-inactive.svg'));
  
  for (const size of [16, 32, 64]) {
    await sharp(inactiveSvg)
      .resize(size, size)
      .png()
      .toFile(path.join(iconDir, `icon${size}-inactive.png`));
    
    console.log(`Created icon${size}-inactive.png`);
  }
  
  console.log('\nAll icons generated successfully!');
}

function createPlaceholderIcons() {
  const iconDir = path.join(__dirname, '..', 'assets', 'icons');
  
  // Create a simple PNG header for a 1x1 blue pixel (placeholder)
  // This is a minimal valid PNG that browsers will accept
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // width = 1
    0x00, 0x00, 0x00, 0x01, // height = 1
    0x08, 0x02, // bit depth = 8, color type = 2 (RGB)
    0x00, 0x00, 0x00, // compression, filter, interlace
    0x90, 0x77, 0x53, 0xDE, // IHDR CRC
    0x00, 0x00, 0x00, 0x0C, // IDAT chunk length
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x08, 0xD7, 0x63, 0x60, 0x60, 0xF8, 0x0F, 0x00, // compressed data
    0x01, 0x04, 0x01, 0x00, // 
    0x05, 0xFE, 0x02, 0xFE, // IDAT CRC
    0x00, 0x00, 0x00, 0x00, // IEND chunk length
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82  // IEND CRC
  ]);

  const sizes = [16, 32, 48, 64, 96, 128];
  
  sizes.forEach(size => {
    fs.writeFileSync(path.join(iconDir, `icon${size}.png`), pngHeader);
    console.log(`Created placeholder icon${size}.png`);
  });
  
  [16, 32, 64].forEach(size => {
    fs.writeFileSync(path.join(iconDir, `icon${size}-inactive.png`), pngHeader);
    console.log(`Created placeholder icon${size}-inactive.png`);
  });
  
  console.log('\nPlaceholder icons created. For proper icons, install sharp and run again.');
}

generateIcons().catch(console.error);

