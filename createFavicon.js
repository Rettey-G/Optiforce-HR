const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create a 32x32 canvas
const canvas = createCanvas(32, 32);
const ctx = canvas.getContext('2d');

// Draw blue circle background
ctx.fillStyle = '#2563EB';
ctx.beginPath();
ctx.arc(16, 16, 16, 0, Math.PI * 2);
ctx.fill();

// Draw three white vertical bars
ctx.fillStyle = 'white';
ctx.fillRect(8, 12, 4, 12);  // Left bar
ctx.fillRect(14, 12, 4, 12); // Middle bar
ctx.fillRect(20, 12, 4, 12); // Right bar

// Save as PNG
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(path.join(__dirname, 'public', 'images', 'favicon.png'), buffer); 