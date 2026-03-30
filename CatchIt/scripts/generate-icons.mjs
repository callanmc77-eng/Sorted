#!/usr/bin/env node
/**
 * Generates placeholder PNG icons for the Catch It PWA.
 * Uses pure Node.js with no external dependencies — writes SVGs as PNGs via base64 encoding.
 * These are placeholder icons; replace with real designs before publishing.
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '..', 'public', 'icons');
if (!existsSync(iconsDir)) mkdirSync(iconsDir, { recursive: true });

// We'll write SVG files which the vite manifest will reference as PNGs
// For proper PNG generation without deps, we use a minimal BMP approach

function createSvgIcon(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#4f46e5"/>
  <!-- Bus icon scaled to fit -->
  <g transform="translate(${size * 0.15}, ${size * 0.2}) scale(${size * 0.007})">
    <!-- Bus body -->
    <rect x="0" y="10" width="90" height="55" rx="8" fill="white"/>
    <!-- Roof -->
    <rect x="5" y="2" width="80" height="15" rx="4" fill="white" opacity="0.9"/>
    <!-- Windows -->
    <rect x="10" y="15" width="18" height="14" rx="3" fill="#4f46e5"/>
    <rect x="36" y="15" width="18" height="14" rx="3" fill="#4f46e5"/>
    <rect x="62" y="15" width="18" height="14" rx="3" fill="#4f46e5"/>
    <!-- Door -->
    <rect x="36" y="38" width="18" height="22" rx="2" fill="#c7d2fe"/>
    <!-- Wheels -->
    <circle cx="20" cy="68" r="10" fill="white"/>
    <circle cx="20" cy="68" r="5" fill="#4f46e5"/>
    <circle cx="70" cy="68" r="10" fill="white"/>
    <circle cx="70" cy="68" r="5" fill="#4f46e5"/>
    <!-- Bumper -->
    <rect x="0" y="62" width="90" height="6" rx="3" fill="white" opacity="0.6"/>
  </g>
  <!-- "Catch It" text at bottom -->
  <text x="${size/2}" y="${size * 0.92}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="${size * 0.1}" font-weight="bold" fill="white" opacity="0.9">Catch It</text>
</svg>`;
}

// Write SVGs — these will be used as icon sources
const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

for (const { name, size } of sizes) {
  const svgContent = createSvgIcon(size);
  // Write as .svg first (Vite can serve these; rename to .png for PWA manifest compatibility)
  // Since we can't easily generate real PNGs without deps, we write SVG data as a PNG-named file
  // This works in most browsers for PWA icons when the MIME type is served correctly
  // For production, use a proper icon generator
  const svgName = name.replace('.png', '.svg');
  writeFileSync(join(iconsDir, svgName), svgContent);
  console.log(`  Created ${svgName} (${size}x${size})`);
}

// Create a simple data-URI PNG using a minimal approach
// We'll generate actual minimal valid PNGs using raw bytes
function createSimplePng(width, height) {
  // Create a simple solid-color PNG with the bus icon as text
  // This is a minimal valid PNG: IHDR + IDAT (solid indigo #4f46e5) + IEND
  const { createHash } = await import('crypto');
  // ... this gets complex without deps, so let's just copy the SVG as the icon source
  // and note that vite-plugin-pwa will accept SVG icons too if manifest type is image/svg+xml
}

console.log('\nIcon SVGs created in public/icons/');
console.log('Note: These are SVG placeholders. Update manifest to use SVG or run a PNG converter for production.\n');

// Also update the vite config to reference SVGs where possible
// For maximum compatibility, let's create a small valid PNG using canvas API via node:canvas
// Since we may not have canvas, let's create a fallback
import { createCanvas } from 'canvas';

async function createPng(size, name) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#4f46e5';
  const r = size * 0.2;
  ctx.beginPath();
  ctx.moveTo(r, 0); ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fill();

  // Bus body
  const s = size / 100;
  const ox = size * 0.12, oy = size * 0.2;
  ctx.fillStyle = 'white';
  // body
  ctx.beginPath(); ctx.roundRect(ox, oy + 10*s, 75*s, 50*s, 6*s); ctx.fill();
  // windows
  ctx.fillStyle = '#4f46e5';
  ctx.fillRect(ox + 8*s, oy + 13*s, 15*s, 12*s);
  ctx.fillRect(ox + 30*s, oy + 13*s, 15*s, 12*s);
  ctx.fillRect(ox + 52*s, oy + 13*s, 15*s, 12*s);
  // door
  ctx.fillStyle = '#c7d2fe';
  ctx.fillRect(ox + 30*s, oy + 32*s, 15*s, 18*s);
  // wheels
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(ox + 15*s, oy + 62*s, 9*s, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(ox + 60*s, oy + 62*s, 9*s, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#4f46e5';
  ctx.beginPath(); ctx.arc(ox + 15*s, oy + 62*s, 4*s, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(ox + 60*s, oy + 62*s, 4*s, 0, Math.PI*2); ctx.fill();

  // Text
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.11}px system-ui`;
  ctx.textAlign = 'center';
  ctx.fillText('Catch It', size / 2, size * 0.93);

  const buffer = canvas.toBuffer('image/png');
  writeFileSync(join(iconsDir, name), buffer);
  console.log(`  Created ${name} (${size}x${size} PNG)`);
}

// Try to use canvas
import('canvas').then(({ createCanvas }) => {
  Promise.all(sizes.map(({ name, size }) => createPng(size, name))).then(() => {
    console.log('PNG icons created successfully!');
  }).catch(console.error);
}).catch(() => {
  console.log('Canvas not available — using SVG icons (rename to .png or install canvas)');
  // Rename SVGs to .png — browsers will handle them since Content-Type is set by Vite dev server
  for (const { name } of sizes) {
    const svgName = name.replace('.png', '.svg');
    try {
      const content = readFileSync(join(iconsDir, svgName));
      writeFileSync(join(iconsDir, name), content);
      console.log(`  Copied ${svgName} → ${name}`);
    } catch {}
  }
});
