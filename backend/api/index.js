// Vercel Serverless Entry Point - Export Express App
// This file is the entry point for Vercel's serverless function infrastructure
// The actual app is defined in src/server.js

require('dotenv').config();

// Set Vercel flag
process.env.VERCEL = '1';

// Import the Express app
const app = require('../src/server');

// Export the Express app as the serverless function
module.exports = app;
