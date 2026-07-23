// Fetches a display title for a YouTube or Spotify link, so the source form can
// autofill the "Name" field instead of asking the user to type one in by hand.
// Used both server-side (as a fallback when a source is saved with no name) and
// via the /api/link-title endpoint (for instant client-side autofill on paste).

import { detectLink } from '$lib/linkDetector';

// Undoes the small set of HTML entities that show up in oEmbed/meta-tag text
// (e.g. "Rock & Roll" is served as "Rock &amp; Roll").
function unescapeHtml(text: string): string {
	return text
		.replace(/&amp;/g, '&')
		.replace(/&quot;/g, '"')
		.replace(/&#x27;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>');
}

// YouTube: oEmbed already returns the video's title directly, and we only ever
// send `link` as a query-string value to youtube.com's own fixed endpoint, so
// there's no server-side-request-forgery risk regardless of what `link` contains.
async function fetchYoutubeTitle(link: string): Promise<string | null> {
	const res = await fetch(
		`https://www.youtube.com/oembed?url=${encodeURIComponent(link)}&format=json`
	);
	if (!res.ok) return null;
	const data = (await res.json()) as { title?: unknown };
	return typeof data.title === 'string' ? unescapeHtml(data.title) : null;
}

// Spotify: oEmbed only returns the track title (no artist), so we scrape the track
// page's Open Graph tags instead — og:title is the track, og:description starts
// with "<Artist> · <Album> · Song · <Year>". Unlike YouTube, this fetches `link`
// itself, so we re-validate it's actually an open.spotify.com/track/... URL first
// (detectLink's regex only checks for a substring match, which isn't safe to hand
// straight to fetch() — a link like "http://evil.example/?x=open.spotify.com/track/1"
// would otherwise pass detection and let this become an open fetch proxy).
async function fetchSpotifyTitle(link: string): Promise<string | null> {
	let parsed: URL;
	try {
		parsed = new URL(link);
	} catch {
		return null;
	}
	if (parsed.hostname !== 'open.spotify.com' || !parsed.pathname.startsWith('/track/')) {
		return null;
	}

	const res = await fetch(parsed.toString(), { headers: { 'User-Agent': 'Mozilla/5.0' } });
	if (!res.ok) return null;
	const html = await res.text();
	const title = html.match(/<meta property="og:title" content="([^"]*)"/)?.[1];
	const artist = html
		.match(/<meta property="og:description" content="([^"]*)"/)?.[1]
		?.split(' · ')[0];
	if (title && artist) return `${unescapeHtml(artist)} - ${unescapeHtml(title)}`;
	return title ? unescapeHtml(title) : null;
}

export async function fetchLinkTitle(link: string): Promise<string | null> {
	const detected = detectLink(link);
	try {
		if (detected.type === 'youtube') return await fetchYoutubeTitle(link);
		if (detected.type === 'spotify') return await fetchSpotifyTitle(link);
	} catch {
		// Network hiccup, oEmbed down, page layout changed, etc. — fall through to
		// requiring a manual name rather than failing the whole save.
		return null;
	}
	return null;
}
