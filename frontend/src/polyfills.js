// Critical polyfills that must load BEFORE any other modules
// This ensures Buffer, process, and global are available for all dependencies

import { Buffer } from 'buffer';
import process from 'process/browser';

// Make Buffer available globally
window.Buffer = Buffer;
globalThis.Buffer = Buffer;

// Make process available globally
window.process = process;
globalThis.process = process;

// Ensure global is available
window.global = window;
globalThis.global = globalThis;

// Set up process.env
if (!window.process.env) {
  window.process.env = {};
}

console.log('✅ Polyfills loaded successfully');
console.log('- Buffer available:', typeof window.Buffer !== 'undefined');
console.log('- process available:', typeof window.process !== 'undefined');
console.log('- global available:', typeof window.global !== 'undefined');
