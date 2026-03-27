import axios from 'axios';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) return new Response('Missing URL', { status: 400 });

  try {
    const response = await axios({ 
        url: imageUrl, 
        method: 'GET', 
        responseType: 'arraybuffer' 
    });

    return new Response(response.data, {
      headers: {
        'Content-Type': 'image/jpeg',
        // This makes the browser download the file
        'Content-Disposition': 'attachment; filename="kodo_design.jpg"',
      },
    });
  } catch (e) {
    console.error(e);
    return new Response('Proxy Error', { status: 500 });
  }
}
