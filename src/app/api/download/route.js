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

  if (!imageUrl) return new Response('Missing URL', { status: 400 });

  try {
    // 1. Fetch image with fake Browser Headers
    const response = await axios({ 
        url: imageUrl, 
        responseType: 'arraybuffer',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'image/*'
        }
    });
    
    // 2. Write the buffer to Vercel's physical /tmp disk
    // This completely bypasses the memory 'instanceof' bug
    const tempFilePath = path.join(os.tmpdir(), `kodo_temp_${Date.now()}.jpg`);
    await writeFile(tempFilePath, Buffer.from(response.data));

    // 3. Vectorize by pointing potrace to the file path instead of memory
    const svg = await trace(tempFilePath, {
      color: '#000000',
      threshold: 120, 
      optTolerance: 0.4
    });

    // 4. Clean up (delete the temp file so we don't clog the server)
    await unlink(tempFilePath).catch(() => {});

    // 5. Send back the Kodo Vector
    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': 'attachment; filename="kodo_vector.svg"',
      },
    });
  } catch (e) {
    console.error("VECTOR ERROR:", e);
    return new Response(`Vectorization Error: ${e.message}`, { status: 500 });
  }
}