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
    // Upgraded to native fetch to bypass WAF fingerprinting
    const response = await fetch(imageUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Referer': 'https://www.pinterest.com/',
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
        }
    });

    if (!response.ok) {
        throw new Error(`Pinterest Firewall Blocked Request (Status: ${response.status})`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // --- 1. ORIGINAL COLOR DOWNLOAD ---
    if (type === 'color') {
      return new Response(buffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': 'attachment; filename="kodo_master_color.png"',
        },
      });
    }

    // --- 2. B&W VECTOR DOWNLOAD ---
    const tempFilePath = path.join(os.tmpdir(), `kodo_temp_${Date.now()}.jpg`);
    await writeFile(tempFilePath, buffer);

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