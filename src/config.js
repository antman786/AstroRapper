const path = require('node:path');
const os = require('node:os');

function expandHome(filePath) {
  if (filePath.startsWith('~/')) {
    return path.join(os.homedir(), filePath.slice(2));
  }
  return filePath;
}

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  astrologPath: expandHome(process.env.ASTROLOG_PATH || '~/Documents/Astrolog/astrolog'),
  processTimeout: parseInt(process.env.ASTROLOG_TIMEOUT, 10) || 10000,
};

module.exports = config;
