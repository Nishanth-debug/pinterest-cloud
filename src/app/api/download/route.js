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
  const type = searchParams.get('type') || 'color';

  if (!imageUrl) return new Response('Missing URL', { status: 400 });

  try {
    // Enhanced stealth headers to bypass Pinterest's 403 Forbidden error
    const response = await axios({ 
        url: imageUrl, 
        responseType: 'arraybuffer',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.pinterest.com/' // This tells Pinterest we are coming from their own site
        }
    });

    const contentType = response.headers['content-type'] || 'image/jpeg';

    // --- 1. PREVIEW FOR UI (NO DOWNLOAD RULE) ---
    if (type === 'preview') {
      return new Response(response.data, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400'
        },
      });
    }

    // --- 2. ORIGINAL COLOR DOWNLOAD ---
    if (type === 'color') {
      return new Response(response.data, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': 'attachment; filename="kodo_master_color.png"',
        },
      });
    }

    // --- 3. B&W VECTOR DOWNLOAD ---
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
    console.error("DOWNLOAD ERROR:", e.message);
    return new Response(`Processing Error: ${e.message}`, { status: 500 });
  }
}