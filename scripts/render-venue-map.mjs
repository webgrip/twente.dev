#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';

const { values: args } = parseArgs({
  options: {
    slug: { type: 'string' },
    lat: { type: 'string' },
    lon: { type: 'string' },
    label: { type: 'string' },
    width: { type: 'string', default: '1500' },
    height: { type: 'string', default: '1100' },
    anchor: { type: 'string', default: '0.72' },
  },
});

for (const required of ['slug', 'lat', 'lon', 'label']) {
  if (!args[required]) {
    console.error(
      'usage: render-venue-map --slug <a-z0-9-> --lat <deg> --lon <deg> --label <venue name> [--width m] [--height m] [--anchor 0..1]',
    );
    process.exit(2);
  }
}

const slug = args.slug;
const lat0 = Number(args.lat);
const lon0 = Number(args.lon);
const label = args.label;
const widthMetres = Number(args.width);
const heightMetres = Number(args.height);
const anchor = Number(args.anchor);

const METRES_PER_PX = 2;
const M_PER_DEG_LAT = 110574;
const mPerDegLon = 111320 * Math.cos((lat0 * Math.PI) / 180);
const W = widthMetres / METRES_PER_PX;
const H = heightMetres / METRES_PER_PX;

const project = (lat, lon) => ({
  x: W / 2 + ((lon - lon0) * mPerDegLon) / METRES_PER_PX,
  y: H * anchor - ((lat - lat0) * M_PER_DEG_LAT) / METRES_PER_PX,
});

const margin = 1.15;
const north = lat0 + (anchor * heightMetres * margin) / M_PER_DEG_LAT;
const south = lat0 - ((1 - anchor) * heightMetres * margin) / M_PER_DEG_LAT;
const west = lon0 - (widthMetres * margin) / 2 / mPerDegLon;
const east = lon0 + (widthMetres * margin) / 2 / mPerDegLon;
const bbox = `${south},${west},${north},${east}`;

const ROAD_CLASS = {
  motorway: 'major',
  trunk: 'major',
  primary: 'major',
  motorway_link: 'major',
  trunk_link: 'major',
  primary_link: 'major',
  secondary: 'medium',
  secondary_link: 'medium',
  tertiary: 'medium',
  tertiary_link: 'medium',
  unclassified: 'medium',
  residential: 'medium',
  living_street: 'medium',
  pedestrian: 'medium',
  busway: 'medium',
  service: 'minor',
};

const query = `[out:json][timeout:60];
(
  way["highway"~"^(${Object.keys(ROAD_CLASS).join('|')})$"](${bbox});
  way["railway"~"^(rail|light_rail|tram)$"](${bbox});
  way["waterway"~"^(river|canal|stream)$"](${bbox});
  way["natural"="water"](${bbox});
  way["building"](around:40,${lat0},${lon0});
  node["railway"="station"](${bbox});
);
out geom;`;

const response = await fetch('https://overpass-api.de/api/interpreter', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'twente.dev venue map (hello@twente.dev)',
  },
  body: `data=${encodeURIComponent(query)}`,
});
if (!response.ok) {
  console.error(`overpass: ${response.status} ${response.statusText}`);
  process.exit(1);
}
const { elements } = await response.json();

const perpendicularDistance = (p, a, b) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSquared));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
};

const simplify = (points, tolerance) => {
  if (points.length <= 2) return points;
  let maxDistance = 0;
  let index = 0;
  const first = points[0];
  const last = points[points.length - 1];
  for (let i = 1; i < points.length - 1; i += 1) {
    const distance = perpendicularDistance(points[i], first, last);
    if (distance > maxDistance) {
      maxDistance = distance;
      index = i;
    }
  }
  if (maxDistance <= tolerance) return [first, last];
  return [
    ...simplify(points.slice(0, index + 1), tolerance).slice(0, -1),
    ...simplify(points.slice(index), tolerance),
  ];
};

const insideFrame = (points) =>
  points.some((p) => p.x >= 0 && p.x <= W && p.y >= 0 && p.y <= H) ||
  (Math.min(...points.map((p) => p.x)) < W &&
    Math.max(...points.map((p) => p.x)) > 0 &&
    Math.min(...points.map((p) => p.y)) < H &&
    Math.max(...points.map((p) => p.y)) > 0);

const fmt = (n) => {
  const rounded = Math.round(n * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
};

const pathOf = (points, close = false) =>
  `M${points.map((p) => `${fmt(p.x)} ${fmt(p.y)}`).join('L')}${close ? 'Z' : ''}`;

const containsPoint = (polygon, point) => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const a = polygon[i];
    const b = polygon[j];
    const crosses =
      a.y > point.y !== b.y > point.y &&
      point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x;
    if (crosses) inside = !inside;
  }
  return inside;
};

const centroid = (points) => ({
  x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
  y: points.reduce((sum, p) => sum + p.y, 0) / points.length,
});

const layers = { major: [], medium: [], minor: [], rail: [], waterLine: [], water: [] };
const buildings = [];
const stations = [];

for (const element of elements) {
  if (element.type === 'node') {
    if (element.tags?.railway === 'station') {
      stations.push({ ...project(element.lat, element.lon), name: element.tags.name ?? '' });
    }
    continue;
  }
  const points = element.geometry.map((g) => project(g.lat, g.lon));
  const tags = element.tags ?? {};
  if (tags.building) {
    buildings.push(points);
    continue;
  }
  if (!insideFrame(points)) continue;
  const simplified = simplify(points, 0.6);
  if (tags.highway) layers[ROAD_CLASS[tags.highway]].push(pathOf(simplified));
  else if (tags.railway) layers.rail.push(pathOf(simplified));
  else if (tags.waterway) layers.waterLine.push(pathOf(simplified));
  else if (tags.natural === 'water') layers.water.push(pathOf(simplified, true));
}

const venuePoint = project(lat0, lon0);
const venueBuilding =
  buildings.find((polygon) => containsPoint(polygon, venuePoint)) ??
  buildings
    .map((polygon) => ({
      polygon,
      d: Math.hypot(centroid(polygon).x - venuePoint.x, centroid(polygon).y - venuePoint.y),
    }))
    .sort((a, b) => a.d - b.d)[0]?.polygon;

const scaleBarPx = 200 / METRES_PER_PX;

const escapeXml = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

const stationMarkup = stations
  .filter((s) => s.x >= 0 && s.x <= W && s.y >= 0 && s.y <= H)
  .map(
    (s) =>
      `<g class="map-station" transform="translate(${fmt(s.x)} ${fmt(s.y)})"><rect x="-5" y="-5" width="10" height="10"/><text class="map-label" x="11" y="4">station ${escapeXml(s.name)}</text></g>`,
  )
  .join('\n  ');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" class="venue-map-svg">
  <rect class="map-ground" width="${W}" height="${H}"/>
  <path class="map-water" fill-rule="evenodd" d="${layers.water.join('')}"/>
  <path class="map-water-line" d="${layers.waterLine.join('')}"/>
  <path class="map-road map-road--minor" d="${layers.minor.join('')}"/>
  <path class="map-road map-road--medium" d="${layers.medium.join('')}"/>
  <path class="map-road map-road--major" d="${layers.major.join('')}"/>
  <path class="map-rail" d="${layers.rail.join('')}"/>
  <path class="map-rail-ties" d="${layers.rail.join('')}"/>
  ${venueBuilding ? `<path class="map-venue-building" d="${pathOf(venueBuilding, true)}"/>` : ''}
  ${stationMarkup}
  <g class="map-venue" transform="translate(${fmt(venuePoint.x)} ${fmt(venuePoint.y)})">
    <circle class="map-venue-ring" r="16"/>
    <circle class="map-venue-dot" r="6"/>
    <text class="map-label map-label--venue" x="14" y="-12">${escapeXml(label)}</text>
  </g>
  <g class="map-scale" transform="translate(16 ${fmt(H - 18)})">
    <path d="M0 0H${scaleBarPx}M0 -4V4M${scaleBarPx} -4V4"/>
    <text class="map-label" x="0" y="-9">200 m</text>
  </g>
</svg>
`;

await mkdir('src/assets/maps', { recursive: true });
const file = `src/assets/maps/${slug}.svg`;
await writeFile(file, svg);
const counts = Object.fromEntries(Object.entries(layers).map(([k, v]) => [k, v.length]));
console.log(`${file}: ${Buffer.byteLength(svg)} bytes`, counts, {
  buildings: buildings.length,
  venueBuilding: Boolean(venueBuilding),
  stations: stations.length,
});
