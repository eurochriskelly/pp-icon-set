const SvgProcessor = require('./svg-processor');
const { validateColors } = require('./utils');

module.exports = {
  SvgProcessor,
  validateColors,
  processIcons: async (config) => {
    const { validFg, validBg } = validateColors(config.fgColor, config.bgColor);
    const processor = new SvgProcessor({
      ...config,
      fgColor: validFg,
      bgColor: validBg
    });
    return processor.processIcons();
  }
};
