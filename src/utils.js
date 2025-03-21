/**
 * Validates and normalizes color values
 * @param {string} fg - Foreground color
 * @param {string} bg - Background color
 * @returns {Object} Normalized colors
 */
function validateColors(fg, bg) {
  const colorRegex = /^(#[0-9a-fA-F]{3,6}|[a-zA-Z]+|rgba?\([^)]+\)|hsla?\([^)]+\))$/;
  const { DEFAULT_FG, DEFAULT_BG } = require('./constants');
  const defaultColors = {
    fg: DEFAULT_FG,
    bg: DEFAULT_BG
  };
  
  return {
    validFg: colorRegex.test(fg) ? fg : defaultColors.fg,
    validBg: colorRegex.test(bg) ? bg : defaultColors.bg
  };
}

/**
 * Converts color to RGBA format
 * @param {string} color - Color value
 * @returns {string} RGBA color string
 */
function toRGBA(color) {
  // TODO: Implement color conversion logic
  return color;
}

module.exports = {
  validateColors,
  toRGBA
};
