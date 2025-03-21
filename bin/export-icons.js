#!/usr/bin/env node

const SvgProcessor = require('../src/svg-processor');
const { validateColors } = require('../src/utils');
const { INPUT_FILE } = require('../src/constants');

(async () => {
  try {
    // Parse command line arguments
    const [fgColor, bgColor] = process.argv.slice(2);
    
    // Validate input colors
    const { validFg, validBg } = validateColors(fgColor, bgColor);
    
    // Process SVG
    const processor = new SvgProcessor({
      inputFile: INPUT_FILE,
      outputDir: 'out',
      fgColor: validFg,
      bgColor: validBg
    });
    
    await processor.processIcons();
    console.log('Done! Exported icons to out/ directory');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
