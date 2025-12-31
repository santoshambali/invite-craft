import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    let filename = searchParams.get('filename') || 'invitation';

    if (!imageUrl) {
        return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    try {
        console.log(`Proxy downloading: ${imageUrl}`);
        const response = await fetch(imageUrl);

        if (!response.ok) {
            console.error(`Fetch failed: ${response.status} ${response.statusText}`);
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type') || 'image/png';
        const arrayBuffer = await response.arrayBuffer();

        // Ensure filename has an extension
        const hasExtension = /\.[a-z0-9]+$/i.test(filename);
        if (!hasExtension) {
            if (contentType.includes('png')) filename += '.png';
            else if (contentType.includes('jpeg') || contentType.includes('jpg')) filename += '.jpg';
            else if (contentType.includes('webp')) filename += '.webp';
            else filename += '.png';
        }

        const headers = new Headers();
        // Use a very explicit Content-Disposition
        headers.set('Content-Disposition', `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
        headers.set('Content-Type', contentType);
        headers.set('Cache-Control', 'no-cache');

        return new NextResponse(arrayBuffer, {
            status: 200,
            headers,
        });
    } catch (error) {
        console.error('Proxy download error:', error);
        return NextResponse.json({ error: 'Download failed', details: error.message }, { status: 500 });
    }
}
