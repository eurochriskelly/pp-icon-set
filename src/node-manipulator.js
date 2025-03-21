/**
 * Handles SVG node manipulation and styling
 * @class
 */
class NodeManipulator {
  /**
   * Create a NodeManipulator instance
   * @param {Object} config - Configuration object
   * @param {string} config.fgColor - Foreground color
   * @param {string} config.bgColor - Background color
   */
  constructor(config) {
    const { DEFAULT_FG, DEFAULT_BG } = require('./constants');
    this.config = {
      fgColor: config.fgColor || DEFAULT_FG,
      bgColor: config.bgColor || DEFAULT_BG
    };
  }

  processNode(node) {
    const { DOMParser } = require('@xmldom/xmldom');
    const clone = node.cloneNode(true);
    
    // Process child nodes recursively if this is a group
    if (clone.nodeName.toLowerCase() === 'g') {
      Array.from(clone.childNodes).forEach(child => {
        if (child.nodeType === 1) { // Only process element nodes
          const processedChild = this.processNode(child);
          // Replace child with processed version
          clone.replaceChild(
            new DOMParser().parseFromString(processedChild, 'text/xml').documentElement,
            child
          );
        }
      });
    }
    
    // Apply styling rules based on node type and attributes
    this.applyStylingRules(clone);
    
    return clone.toString();
  }

  applyStylingRules(node) {
    const { fgColor = 'red', bgColor = 'yellow' } = this.config;
    
    // Handle clickable area first
    if (this.isClickableArea(node)) {
      this.handleClickableArea(node, bgColor);
      this.addClass(node, 'bg');
      return;
    }

    // Handle inversion group
    if (this.isInversionGroup(node)) {
      this.handleInversionGroup(node, bgColor);
      this.addClass(node, 'bg');
      return;
    }

    // Handle text elements specially
    if (node.nodeName.toLowerCase() === 'text') {
      node.setAttribute('fill', fgColor);
      node.removeAttribute('stroke');
      node.setAttribute('fill-opacity', '1');
      node.removeAttribute('stroke-opacity');
      this.addClass(node, 'fg');
      
      // Handle tspan children
      const tspans = Array.from(node.getElementsByTagName('tspan'));
      tspans.forEach(tspan => {
        tspan.setAttribute('fill', fgColor);
        tspan.removeAttribute('stroke');
        tspan.setAttribute('fill-opacity', '1');
        tspan.removeAttribute('stroke-opacity');
        this.addClass(tspan, 'fg');
      });
    }
    // Handle path elements with no fill
    else if (node.nodeName.toLowerCase() === 'path' && !node.hasAttribute('fill')) {
      node.setAttribute('fill', 'none');
      node.setAttribute('fill-opacity', '0');
      this.addClass(node, 'no-fill');
    }
    // Handle regular elements with fill
    else if (node.hasAttribute('fill') && node.getAttribute('fill') !== 'none') {
      node.setAttribute('fill', fgColor);
      node.removeAttribute('stroke');
      node.setAttribute('fill-opacity', '1');
      node.removeAttribute('stroke-opacity');
      this.addClass(node, 'fg');
    }
    // Handle elements with stroke
    else if (node.hasAttribute('stroke')) {
      node.setAttribute('stroke', fgColor);
      node.removeAttribute('fill');
      node.setAttribute('stroke-opacity', '1');
      node.setAttribute('fill-opacity', '0');  // Explicitly set fill-opacity to 0
      this.addClass(node, 'fg');
    }
    
    // Clean up any undefined attributes
    ['fill', 'stroke', 'fill-opacity', 'stroke-opacity', 'opacity'].forEach(attr => {
      if (node.getAttribute(attr) === 'undefined') {
        node.removeAttribute(attr);
      }
    });
  }

  isInversionGroup(node) {
    return node.getAttribute('id')?.endsWith('-invert');
  }

  handleInversionGroup(node, bgColor) {
    Array.from(node.childNodes).forEach(child => {
      if (child.nodeType === 1) { // Only process element nodes
        if (child.hasAttribute('fill') && child.getAttribute('fill') !== 'none') {
          child.setAttribute('fill', bgColor);
          child.removeAttribute('stroke');
          child.setAttribute('fill-opacity', '1');
          child.removeAttribute('stroke-opacity');
        }
        else if (child.hasAttribute('stroke')) {
          child.setAttribute('stroke', bgColor);
          child.removeAttribute('fill');
          child.setAttribute('stroke-opacity', '1');
          child.setAttribute('fill-opacity', '0');  // Explicitly set fill-opacity to 0
        }
        child.removeAttribute('opacity');
      }
    });
  }

  isClickableArea(node) {
    return node.getAttribute('id')?.includes('-clickable');
  }

  handleClickableArea(node, bgColor) {
    const color = bgColor || this.config.bgColor || 'yellow';
    
    // Get current dimensions
    const width = parseFloat(node.getAttribute('width'));
    const height = parseFloat(node.getAttribute('height'));
    const x = parseFloat(node.getAttribute('x'));
    const y = parseFloat(node.getAttribute('y'));
    
    // Calculate scale factor (20% larger)
    const scale = 1.2;
    
    // Calculate new dimensions and position to keep centered
    const newWidth = width * scale;
    const newHeight = height * scale;
    const newX = x - (newWidth - width) / 2;
    const newY = y - (newHeight - height) / 2;
    
    // Update attributes
    node.setAttribute('width', newWidth);
    node.setAttribute('height', newHeight);
    node.setAttribute('x', newX);
    node.setAttribute('y', newY);
    
    // Apply styling
    this.addClass(node, 'bg-item');
    node.setAttribute('fill', color);
    node.removeAttribute('stroke');
    node.setAttribute('fill-opacity', '1');
    node.removeAttribute('stroke-opacity');
    node.removeAttribute('opacity');
  }

  addClass(node, className) {
    const existingClasses = node.getAttribute('class') || '';
    if (!existingClasses.split(' ').includes(className)) {
      node.setAttribute('class', `${existingClasses} ${className}`.trim());
    }
  }

  setAttributeIfExists(node, attrName, value) {
    if (!node.hasAttribute(attrName)) return;

    const newValue = typeof value === 'function' 
      ? value(node.getAttribute(attrName))
      : value;

    if (newValue !== null) {
      node.setAttribute(attrName, newValue);
    }
  }
}

module.exports = NodeManipulator;
