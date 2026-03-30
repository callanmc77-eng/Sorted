#!/usr/bin/env node
/**
 * process-gtfs.mjs
 *
 * Downloads TFI Ireland GTFS static feed, filters to Galway city bus routes,
 * and outputs three lean JSON files to public/gtfs-static/.
 *
 * Run with: node scripts/process-gtfs.mjs
 */

import { createWriteStream, mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

// Load API key from .env
const envPath = join(ROOT, '.env');
const envContent = readFileSync(envPath, 'utf8');
const envVars = Object.fromEntries(
  envContent.split('\n')
    .filter(l => l.includes('='))
    .map(l => {
      const idx = l.indexOf('=');
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
);
const API_KEY = envVars['VITE_TFI_API_KEY'];
if (!API_KEY) {
  console.error('VITE_TFI_API_KEY not found in .env');
  process.exit(1);
}

// Galway city bus route short names (confirmed from TFI GTFS feed, agency 7778020)
const GALWAY_ROUTE_NAMES = new Set([
  '401','402','404','405','407','409',   // core city routes
  '417','419','424','425','434',          // regional Galway routes
]);

const OUTPUT_DIR = join(ROOT, 'public', 'gtfs-static');
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

// ── helpers ──────────────────────────────────────────────────────────────────

function parseCsv(text) {
  const lines = text.split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].replace(/\r/g, '').split(',');
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const raw = lines[i].replace(/\r/g, '');
    if (!raw.trim()) continue;
    // Simple CSV parse (handles quoted fields with commas inside)
    const fields = [];
    let inQuote = false;
    let cur = '';
    for (const ch of raw) {
      if (ch === '"') { inQuote = !inQuote; continue; }
      if (ch === ',' && !inQuote) { fields.push(cur); cur = ''; continue; }
      cur += ch;
    }
    fields.push(cur);
    const obj = {};
    for (let j = 0; j < headers.length; j++) obj[headers[j]] = fields[j] ?? '';
    rows.push(obj);
  }
  return rows;
}

async function fetchGtfsZip() {
  // Try local cached zip first
  const localZip = join(ROOT, 'nta_gtfs.zip');
  if (existsSync(localZip)) {
    const { readFileSync } = await import('fs');
    console.log('Using local nta_gtfs.zip...');
    return readFileSync(localZip);
  }
  // Download from public TFI URL
  console.log('Downloading GTFS static feed from TFI...');
  const url = 'https://www.transportforireland.ie/transitData/Data/GTFS_Realtime.zip';
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Failed to fetch GTFS static: ${resp.status} ${resp.statusText}`);
  }
  const buf = Buffer.from(await resp.arrayBuffer());
  // Cache it locally
  const { writeFileSync: wfs } = await import('fs');
  wfs(localZip, buf);
  console.log(`Downloaded and cached ${(buf.length / 1024 / 1024).toFixed(1)} MB`);
  return buf;
}

async function extractZipFile(zipBuffer, filename) {
  // Use JSZip-style unzip via dynamic import attempt, fallback to manual
  // We'll use the built-in zlib + buffer approach for zip extraction
  // Zip format: local file headers + data
  // Simple zip reader for uncompressed or DEFLATE entries

  const buf = zipBuffer;
  const entries = [];

  // Find End of Central Directory record
  let eocdOffset = -1;
  for (let i = buf.length - 22; i >= 0; i--) {
    if (buf[i] === 0x50 && buf[i+1] === 0x4B && buf[i+2] === 0x05 && buf[i+3] === 0x06) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset === -1) throw new Error('Invalid zip file');

  const cdOffset = buf.readUInt32LE(eocdOffset + 16);
  const cdSize = buf.readUInt32LE(eocdOffset + 12);
  const numEntries = buf.readUInt16LE(eocdOffset + 10);

  let pos = cdOffset;
  const fileMap = {};

  for (let e = 0; e < numEntries; e++) {
    if (buf.readUInt32LE(pos) !== 0x02014B50) break;
    const compressionMethod = buf.readUInt16LE(pos + 10);
    const compressedSize = buf.readUInt32LE(pos + 20);
    const uncompressedSize = buf.readUInt32LE(pos + 24);
    const fileNameLen = buf.readUInt16LE(pos + 28);
    const extraLen = buf.readUInt16LE(pos + 30);
    const commentLen = buf.readUInt16LE(pos + 32);
    const localHeaderOffset = buf.readUInt32LE(pos + 42);
    const name = buf.toString('utf8', pos + 46, pos + 46 + fileNameLen);
    fileMap[name] = { compressionMethod, compressedSize, uncompressedSize, localHeaderOffset };
    pos += 46 + fileNameLen + extraLen + commentLen;
  }

  async function readEntry(name) {
    const entry = fileMap[name];
    if (!entry) return null;
    const lhPos = entry.localHeaderOffset;
    if (buf.readUInt32LE(lhPos) !== 0x04034B50) return null;
    const lhFileNameLen = buf.readUInt16LE(lhPos + 26);
    const lhExtraLen = buf.readUInt16LE(lhPos + 28);
    const dataStart = lhPos + 30 + lhFileNameLen + lhExtraLen;
    const compData = buf.slice(dataStart, dataStart + entry.compressedSize);
    if (entry.compressionMethod === 0) {
      return compData.toString('utf8');
    } else if (entry.compressionMethod === 8) {
      const { inflateRaw } = await import('zlib');
      const { promisify } = await import('util');
      const inflate = promisify(inflateRaw);
      const decompressed = await inflate(compData);
      return decompressed.toString('utf8');
    }
    return null;
  }

  return { readEntry, files: Object.keys(fileMap) };
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  let zip;
  try {
    const zipBuffer = await fetchGtfsZip();
    console.log(`Downloaded ${(zipBuffer.length / 1024 / 1024).toFixed(1)} MB`);
    zip = await extractZipFile(zipBuffer);
    console.log('ZIP extracted. Files found:', zip.files.slice(0, 10).join(', '), '...');
  } catch (err) {
    console.error('Failed to fetch/extract GTFS zip:', err.message);
    console.log('\nGenerating sample Galway data for development...');
    generateSampleData();
    return;
  }

  // 1. Read routes.txt
  console.log('Parsing routes.txt...');
  const routesTxt = await zip.readEntry('routes.txt') || await zip.readEntry('Routes.txt');
  if (!routesTxt) { console.error('routes.txt not found in zip'); generateSampleData(); return; }
  const allRoutes = parseCsv(routesTxt);

  const galwayRoutes = allRoutes.filter(r =>
    GALWAY_ROUTE_NAMES.has(r.route_short_name)
  );
  console.log(`Found ${galwayRoutes.length} Galway routes`);

  if (galwayRoutes.length === 0) {
    console.log('No Galway routes matched. Dumping sample route names:',
      [...new Set(allRoutes.slice(0, 20).map(r => r.route_short_name))].join(', '));
    console.log('Generating sample data...');
    generateSampleData();
    return;
  }

  const galwayRouteIds = new Set(galwayRoutes.map(r => r.route_id));

  // 2. Read trips.txt to get trip_ids for galway routes
  console.log('Parsing trips.txt...');
  const tripsTxt = await zip.readEntry('trips.txt');
  if (!tripsTxt) { console.error('trips.txt not found'); generateSampleData(); return; }
  const allTrips = parseCsv(tripsTxt);
  const galwayTrips = allTrips.filter(t => galwayRouteIds.has(t.route_id));
  const galwayTripIds = new Set(galwayTrips.map(t => t.trip_id));
  console.log(`Found ${galwayTrips.length} trips`);

  // 3. Read stop_times.txt (large file)
  console.log('Parsing stop_times.txt (this may take a moment)...');
  const stopTimesTxt = await zip.readEntry('stop_times.txt');
  if (!stopTimesTxt) { console.error('stop_times.txt not found'); generateSampleData(); return; }
  const allStopTimes = parseCsv(stopTimesTxt);
  const galwayStopTimes = allStopTimes.filter(st => galwayTripIds.has(st.trip_id));
  const galwayStopIds = new Set(galwayStopTimes.map(st => st.stop_id));
  console.log(`Found ${galwayStopTimes.length} stop times, ${galwayStopIds.size} unique stops`);

  // 4. Read stops.txt
  console.log('Parsing stops.txt...');
  const stopsTxt = await zip.readEntry('stops.txt');
  if (!stopsTxt) { console.error('stops.txt not found'); generateSampleData(); return; }
  const allStops = parseCsv(stopsTxt);
  const galwayStops = allStops.filter(s => galwayStopIds.has(s.stop_id));
  console.log(`Found ${galwayStops.length} stops`);

  // 5. Build output JSON
  const routesOutput = galwayRoutes.map(r => ({
    route_id: r.route_id,
    route_short_name: r.route_short_name,
    route_long_name: r.route_long_name,
    route_type: parseInt(r.route_type) || 3,
    agency_id: r.agency_id,
  }));

  const stopsOutput = galwayStops.map(s => ({
    stop_id: s.stop_id,
    stop_name: s.stop_name,
    stop_lat: parseFloat(s.stop_lat),
    stop_lon: parseFloat(s.stop_lon),
  }));

  // For stop_times, keep only what's needed: trip_id, stop_id, stop_sequence, arrival_time
  // Also add route_id via trip lookup
  const tripToRoute = Object.fromEntries(galwayTrips.map(t => [t.trip_id, { route_id: t.route_id, direction_id: t.direction_id, trip_headsign: t.trip_headsign }]));

  // Keep only the fields we query on — drop departure_time/stop_sequence to shrink file size
  const stopTimesOutput = galwayStopTimes.map(st => ({
    trip_id: st.trip_id,
    arrival_time: st.arrival_time || st.departure_time,
    stop_id: st.stop_id,
  }));

  const tripsOutput = galwayTrips.map(t => ({
    trip_id: t.trip_id,
    route_id: t.route_id,
    direction_id: parseInt(t.direction_id) || 0,
    trip_headsign: t.trip_headsign || '',
    service_id: t.service_id,
    shape_id: t.shape_id || '',
  }));

  writeFileSync(join(OUTPUT_DIR, 'galway_routes.json'), JSON.stringify(routesOutput, null, 2));
  writeFileSync(join(OUTPUT_DIR, 'galway_stops.json'), JSON.stringify(stopsOutput, null, 2));
  writeFileSync(join(OUTPUT_DIR, 'galway_stop_times.json'), JSON.stringify(stopTimesOutput));
  writeFileSync(join(OUTPUT_DIR, 'galway_trips.json'), JSON.stringify(tripsOutput));

  console.log('\nSuccess! Output files written to public/gtfs-static/:');
  console.log(`  galway_routes.json    (${routesOutput.length} routes)`);
  console.log(`  galway_stops.json     (${stopsOutput.length} stops)`);
  console.log(`  galway_stop_times.json (${stopTimesOutput.length} entries)`);
  console.log(`  galway_trips.json     (${tripsOutput.length} trips)`);
}

function generateSampleData() {
  console.log('Generating sample Galway GTFS data for development...');

  const routes = [
    { route_id: 'r401', route_short_name: '401', route_long_name: 'City Centre - Merlin Park', route_type: 3, agency_id: '7' },
    { route_id: 'r402', route_short_name: '402', route_long_name: 'City Centre - Knocknacarra', route_type: 3, agency_id: '7' },
    { route_id: 'r403', route_short_name: '403', route_long_name: 'City Centre - Salthill', route_type: 3, agency_id: '7' },
    { route_id: 'r404', route_short_name: '404', route_long_name: 'City Centre - Westside', route_type: 3, agency_id: '7' },
    { route_id: 'r405', route_short_name: '405', route_long_name: 'City Centre - Rahoon', route_type: 3, agency_id: '7' },
    { route_id: 'r406', route_short_name: '406', route_long_name: 'City Centre - Dangan', route_type: 3, agency_id: '7' },
    { route_id: 'r407', route_short_name: '407', route_long_name: 'City Centre - Newcastle', route_type: 3, agency_id: '7' },
    { route_id: 'r408', route_short_name: '408', route_long_name: 'City Centre - Barna', route_type: 3, agency_id: '7' },
    { route_id: 'r409', route_short_name: '409', route_long_name: 'City Centre - Renmore', route_type: 3, agency_id: '7' },
    { route_id: 'r410', route_short_name: '410', route_long_name: 'City Centre - Mervue', route_type: 3, agency_id: '7' },
    { route_id: 'r411', route_short_name: '411', route_long_name: 'City Centre - Ballybane', route_type: 3, agency_id: '7' },
    { route_id: 'r412', route_short_name: '412', route_long_name: 'City Centre - Galway Racecourse', route_type: 3, agency_id: '7' },
  ];

  const stops = [
    { stop_id: 's001', stop_name: 'Eyre Square', stop_lat: 53.2743, stop_lon: -9.0488 },
    { stop_id: 's002', stop_name: 'Salthill Promenade', stop_lat: 53.2604, stop_lon: -9.0810 },
    { stop_id: 's003', stop_name: 'Galway Cathedral', stop_lat: 53.2760, stop_lon: -9.0560 },
    { stop_id: 's004', stop_name: 'Shop Street', stop_lat: 53.2730, stop_lon: -9.0537 },
    { stop_id: 's005', stop_name: 'Westside Shopping Centre', stop_lat: 53.2760, stop_lon: -9.0850 },
    { stop_id: 's006', stop_name: 'NUI Galway', stop_lat: 53.2834, stop_lon: -9.0611 },
    { stop_id: 's007', stop_name: 'Knocknacarra', stop_lat: 53.2620, stop_lon: -9.1050 },
    { stop_id: 's008', stop_name: 'Merlin Park Hospital', stop_lat: 53.2780, stop_lon: -9.0190 },
    { stop_id: 's009', stop_name: 'Renmore', stop_lat: 53.2820, stop_lon: -9.0200 },
    { stop_id: 's010', stop_name: 'Mervue', stop_lat: 53.2870, stop_lon: -9.0300 },
    { stop_id: 's011', stop_name: 'Ballybane', stop_lat: 53.2910, stop_lon: -9.0140 },
    { stop_id: 's012', stop_name: 'Dangan', stop_lat: 53.2900, stop_lon: -9.0680 },
    { stop_id: 's013', stop_name: 'Newcastle Road', stop_lat: 53.2800, stop_lon: -9.0720 },
    { stop_id: 's014', stop_name: 'Barna Village', stop_lat: 53.2580, stop_lon: -9.1320 },
    { stop_id: 's015', stop_name: 'Rahoon', stop_lat: 53.2680, stop_lon: -9.0770 },
    { stop_id: 's016', stop_name: 'Headford Road', stop_lat: 53.2830, stop_lon: -9.0560 },
    { stop_id: 's017', stop_name: 'Tuam Road', stop_lat: 53.2900, stop_lon: -9.0490 },
    { stop_id: 's018', stop_name: 'Wellpark', stop_lat: 53.2870, stop_lon: -9.0410 },
    { stop_id: 's019', stop_name: 'Lough Atalia Road', stop_lat: 53.2760, stop_lon: -9.0430 },
    { stop_id: 's020', stop_name: 'Galway Bus Station', stop_lat: 53.2755, stop_lon: -9.0496 },
  ];

  // Generate trips for each route (2 directions, every 15 mins all day)
  const trips = [];
  const stopTimes = [];

  // Generate slots every 15 minutes from 06:00 to 23:45
  const timeSlots = [];
  for (let h = 6; h <= 23; h++) {
    for (let m = 0; m < 60; m += 15) {
      timeSlots.push({ h, m });
    }
  }

  for (const route of routes) {
    for (let dir = 0; dir < 2; dir++) {
      const headsign = dir === 0 ? route.route_long_name.split(' - ')[1] : 'City Centre';
      for (const { h, m } of timeSlots) {
        const slotStr = `${h.toString().padStart(2,'0')}${m.toString().padStart(2,'0')}`;
        const tripId = `${route.route_id}_d${dir}_${slotStr}`;
        trips.push({
          trip_id: tripId,
          route_id: route.route_id,
          direction_id: dir,
          trip_headsign: headsign,
          service_id: 'weekday',
          shape_id: '',
        });

        // Assign 6 stops to this trip, each 3-4 minutes apart
        const routeStops = stops.slice(0, 6);
        let minuteOffset = 0;
        for (let seq = 0; seq < routeStops.length; seq++) {
          const totalMinutes = h * 60 + m + minuteOffset;
          const hh = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
          const mm = (totalMinutes % 60).toString().padStart(2, '0');
          const timeStr = `${hh}:${mm}:00`;
          stopTimes.push({
            trip_id: tripId,
            arrival_time: timeStr,
            departure_time: timeStr,
            stop_id: routeStops[seq].stop_id,
            stop_sequence: seq + 1,
          });
          minuteOffset += 3;
        }
      }
    }
  }

  writeFileSync(join(OUTPUT_DIR, 'galway_routes.json'), JSON.stringify(routes, null, 2));
  writeFileSync(join(OUTPUT_DIR, 'galway_stops.json'), JSON.stringify(stops, null, 2));
  writeFileSync(join(OUTPUT_DIR, 'galway_stop_times.json'), JSON.stringify(stopTimes, null, 2));
  writeFileSync(join(OUTPUT_DIR, 'galway_trips.json'), JSON.stringify(trips, null, 2));

  console.log('Sample data written to public/gtfs-static/');
  console.log('  galway_routes.json:', routes.length, 'routes');
  console.log('  galway_stops.json:', stops.length, 'stops');
  console.log('  galway_trips.json:', trips.length, 'trips');
  console.log('  galway_stop_times.json:', stopTimes.length, 'stop times');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
