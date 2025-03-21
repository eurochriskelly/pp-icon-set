const fs = require('fs');
const path = require('path');
const xpath = require('xpath');
const { DOMParser } = require('@xmldom/xmldom');
const NodeManipulator = require('./node-manipulator');

/**
 * Main SVG processing class that handles icon extraction and export
 * @class
 */
class SvgProcessor {
  /**
   * Create an SvgProcessor instance
   * @param {Object} config - Configuration object
   * @param {string} config.inputFile - Path to input SVG file
   * @param {string} config.outputDir - Output directory path
   * @param {string} [config.fgColor='red'] - Foreground color
   * @param {string} [config.bgColor='yellow'] - Background color
   */
  constructor(config) {
    this.config = {
      inputFile: config.inputFile,
      outputDir: config.outputDir,
      fgColor: config.fgColor || 'red',
      bgColor: config.bgColor || 'yellow'
    };
    this.manipulator = new NodeManipulator(config);
    this.svgConstants = {
      header: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">',
      footer: '</svg>'
    };
  }

  async processIcons() {
    const doc = this.loadSvgDocument();
    const iconIds = this.extractIconIds(doc);
    
    // Create output directory
    if (fs.existsSync(this.config.outputDir)) {
      fs.rmSync(this.config.outputDir, { recursive: true, force: true });
    }
    fs.mkdirSync(this.config.outputDir, { recursive: true });

    console.log(`Found ${iconIds.length} icons to process`);
    
    for (const iconId of iconIds) {
      console.log(`Exporting ${iconId}...`);
      await this.processIcon(iconId, doc);
    }

    // Generate index.html after all icons are processed
    this.generateIndexHtml(iconIds);
  }

  generateIndexHtml(iconIds) {
    const iconElements = iconIds.map(iconId => {
      const svgContent = fs.readFileSync(path.join(this.config.outputDir, `${iconId}.svg`), 'utf8');
      return `
      <div class="icon-container">
        <div class="icon-name">${iconId}</div>
        <div class="icon-image">${svgContent}</div>
      </div>
    `}).join('\n');

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Icon Preview</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
    }
    .icon-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 20px;
    }
    .icon-container {
      text-align: center;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .icon-name {
      margin-bottom: 10px;
      font-weight: bold;
    }
    .icon-image {
      width: 100%;
      height: auto;
      max-width: 100px;
    }
    .icon-image svg {
      width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  <h1>Icon Preview</h1>
  <div class="icon-grid">
    ${iconElements}
  </div>
</body>
</html>`;

    const outputPath = path.join(this.config.outputDir, 'index.html');
    fs.writeFileSync(outputPath, htmlContent);
    console.log(`Generated preview at ${outputPath}`);
  }

  loadSvgDocument() {
    try {
      const svgContent = fs.readFileSync(this.config.inputFile, 'utf8');
      return new DOMParser().parseFromString(svgContent);
    } catch (error) {
      throw new Error(`Failed to parse SVG file: ${error.message}`);
    }
  }

  extractIconIds(doc) {
    const iconNodes = xpath.select("//*[@id='id-icon-collection']/*[@id]", doc);
    const iconIds = iconNodes.map(node => node.getAttribute('id'));
    
    if (!iconIds.length) {
      throw new Error('No icons found in SVG file. Check if id-icon-collection exists.');
    }
    return iconIds;
  }

  async processIcon(iconId, doc) {
    const clickableNode = this.findClickableArea(iconId, doc);
    const { x, y, width, height } = this.getBoundingBox(clickableNode);
    const processedContent = this.processIconContent(iconId, doc);
    
    this.writeSvgFile(iconId, {
      viewBox: `${x} ${y} ${width} ${height}`,
      content: processedContent
    });
  }

  findClickableArea(iconId, doc) {
    const clickableId = `${iconId}-clickable`;
    const clickableNode = xpath.select(`//*[@id='${clickableId}']`, doc)[0];
    
    if (!clickableNode) {
      throw new Error(`Clickable area ${clickableId} not found`);
    }
    return clickableNode;
  }

  getBoundingBox(node) {
    return {
      x: parseFloat(node.getAttribute('x')),
      y: parseFloat(node.getAttribute('y')),
      width: parseFloat(node.getAttribute('width')),
      height: parseFloat(node.getAttribute('height'))
    };
  }

  processIconContent(iconId, doc) {
    const iconContentNodes = xpath.select(`//*[@id='${iconId}']/*`, doc);
    return iconContentNodes
      .map(node => this.manipulator.processNode(node))
      .join('\n');
  }

  writeSvgFile(iconId, { viewBox, content }) {
    const svgContent = `${this.svgConstants.header.replace('>', ` viewBox="${viewBox}">`)}
${content}
${this.svgConstants.footer}`;

    // Support multiple output formats
    const formats = this.config.formats || ['svg'];
    formats.forEach(format => {
      const outputPath = path.join(this.config.outputDir, `${iconId}.${format}`);
      
      switch(format) {
        case 'svg':
          fs.writeFileSync(outputPath, svgContent);
          break;
        case 'png':
          // TODO: Add PNG export support
          break;
        case 'jpg':
          // TODO: Add JPG export support
          break;
        default:
          console.warn(`Unsupported format: ${format}`);
      }
    });
  }
}

module.exports = SvgProcessor;
