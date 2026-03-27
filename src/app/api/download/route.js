import axios from 'axios';
import potrace from 'potrace';
import { promisify } from 'util';
import fs from 'fs';
import os from 'os';
import path from 'path';

const trace = promisify(potrace.trace);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');
  const type = searchParams.get('type') || 'color'; // Default to color

  if (!imageUrl) return new Response('Missing URL', { status: 400 });

  try {
    // 1. Fetch the raw image data from Pinterest
    const response = await axios({ 
        url: imageUrl, 
        responseType: 'arraybuffer',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'image/*'
        }
    });

    // 2. LOGIC GATE: If user wants color, send the raw high-res PNG
    if (type === 'color') {
      return new Response(response.data, {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': 'attachment; filename="kodo_full_color.png"',
        },
      });
    }

    // 3. LOGIC GATE: If user wants vector, run the Potrace engine
    const tempFilePath = path.join(os.tmpdir(), `kodo_temp_${Date.now()}.jpg`);
    await writeFile(tempFilePath, Buffer.from(response.data));

    const svg = await trace(tempFilePath, {
      color: '#000000',
      threshold: 120, 
      optTolerance: 0.4
    });

    await unlink(tempFilePath).catch(() => {});

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': 'attachment; filename="kodo_logo_vector.svg"',
      },
    });

  } catch (e) {
    console.error("DOWNLOAD ERROR:", e);
    return new Response(`Processing Error: ${e.message}`, { status: 500 });
  }
}