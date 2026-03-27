import axios from 'axios';
import potrace from 'potrace';
import Jimp from 'jimp';
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
    const response = await axios({ 
        url: imageUrl, 
        responseType: 'arraybuffer',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'image/*'
        }
    });

    // --- 1. ORIGINAL COLOR (Bypass) ---
    if (type === 'color') {
      return new Response(response.data, {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': 'attachment; filename="kodo_original.png"',
        },
      });
    }

    // --- 2. ALGORITHMIC ENHANCEMENT (Your Custom Engine) ---
    if (type === 'enhance') {
      console.log("Starting Image Enhancement Algorithm...");
      const image = await Jimp.read(Buffer.from(response.data));
      
      // Algorithm Step 1: Double the size using Bicubic math
      image.scale(2, Jimp.RESIZE_BICUBIC);
      
      // Algorithm Step 2: Boost contrast by 10% for print punchiness
      image.contrast(0.1);
      
      // Algorithm Step 3: Apply a Sharpening Convolution Matrix to crisp edges
      const sharpenMatrix = [
        [  0, -1,  0 ],
        [ -1,  5, -1 ],
        [  0, -1,  0 ]
      ];
      image.convolute(sharpenMatrix);

      const enhancedBuffer = await image.getBufferAsync(Jimp.MIME_PNG);
      
      return new Response(enhancedBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': 'attachment; filename="kodo_enhanced_2x.png"',
        },
      });
    }

    // --- 3. B&W VECTOR (Potrace) ---
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