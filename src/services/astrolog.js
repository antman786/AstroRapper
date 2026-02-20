const { execFile } = require('node:child_process');
const config = require('../config');

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

function validateInteger(value, min, max, fieldName) {
  const num = Number(value);
  if (!Number.isInteger(num) || num < min || num > max) {
    throw new ValidationError(`${fieldName} must be an integer between ${min} and ${max}`);
  }
  return num;
}

function validateFloat(value, min, max, fieldName) {
  const num = Number(value);
  if (!Number.isFinite(num) || num < min || num > max) {
    throw new ValidationError(`${fieldName} must be a number between ${min} and ${max}`);
  }
  return num;
}

function validateTime(value) {
  if (value === undefined || value === null) return null;
  const match = String(value).match(/^(\d{1,2}):(\d{2})$/);
  if (!match) throw new ValidationError('time must be in HH:MM format');
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new ValidationError('time hours must be 0-23, minutes 0-59');
  }
  return `${hours}:${String(minutes).padStart(2, '0')}`;
}

function validateNatalInput(data) {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Request body must be a JSON object');
  }
  return {
    month: validateInteger(data.month, 1, 12, 'month'),
    day: validateInteger(data.day, 1, 31, 'day'),
    year: validateInteger(data.year, 1, 9999, 'year'),
    time: validateTime(data.time),
    longitude: validateFloat(data.longitude, -180, 180, 'longitude'),
    latitude: validateFloat(data.latitude, -90, 90, 'latitude'),
    timezone: validateFloat(data.timezone, -24, 24, 'timezone'),
  };
}

function validateTransitInput(data) {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('transit must be a JSON object');
  }
  const result = {
    month: validateInteger(data.month, 1, 12, 'transit.month'),
    year: validateInteger(data.year, 1, 9999, 'transit.year'),
  };
  if (data.day !== undefined && data.day !== null) {
    result.day = validateInteger(data.day, 1, 31, 'transit.day');
  }
  return result;
}

function buildNatalArgs(natal) {
  const args = [];
  if (natal.time) {
    args.push('-q', String(natal.month), String(natal.day), String(natal.year), natal.time);
  } else {
    args.push('-qd', String(natal.month), String(natal.day), String(natal.year));
  }
  args.push('-zl', String(natal.longitude), String(natal.latitude));
  args.push('-z', String(natal.timezone));
  return args;
}

function buildTransitArgs(natal, transit) {
  const args = buildNatalArgs(natal);
  if (transit.day !== undefined) {
    args.push('-T', String(transit.month), String(transit.day), String(transit.year));
  } else {
    args.push('-t', String(transit.month), String(transit.year));
  }
  return args;
}

function runAstrolog(args) {
  return new Promise((resolve, reject) => {
    execFile(config.astrologPath, args, {
      timeout: config.processTimeout,
      maxBuffer: 1024 * 512,
      encoding: 'utf-8',
    }, (error, stdout, stderr) => {
      if (error) {
        if (error.code === 'ENOENT') {
          reject(new Error(`Astrolog binary not found at: ${config.astrologPath}`));
        } else if (error.killed) {
          reject(new Error('Astrolog process timed out'));
        } else {
          reject(new Error(`Astrolog error (exit ${error.code}): ${stderr || error.message}`));
        }
        return;
      }
      resolve(stdout);
    });
  });
}

module.exports = {
  ValidationError,
  validateNatalInput,
  validateTransitInput,
  buildNatalArgs,
  buildTransitArgs,
  runAstrolog,
};
