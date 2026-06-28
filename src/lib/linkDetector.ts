// Converts a raw URL string into a typed result that tells the UI how to render it.
// YouTube and Spotify links become embeds; anything else becomes a plain link.

export type LinkResult =
	| { type: 'youtube'; embedUrl: string }
	| { type: 'spotify'; embedUrl: string }
	| { type: 'link'; url: string }
	| { type: 'none' };

export function detectLink(raw: string | null | undefined): LinkResult {
	if (!raw?.trim()) return { type: 'none' };
	const url = raw.trim();

	// YouTube: youtube.com/watch?v=ID  or  youtu.be/ID
	const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/);
	if (ytMatch) {
		return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}` };
	}

	// Spotify track: open.spotify.com/track/ID
	const spMatch = url.match(/open\.spotify\.com\/track\/([A-Za-z0-9]+)/);
	if (spMatch) {
		return { type: 'spotify', embedUrl: `https://open.spotify.com/embed/track/${spMatch[1]}` };
	}

	// Any other URL
	if (url.startsWith('http://') || url.startsWith('https://')) {
		return { type: 'link', url };
	}

	return { type: 'none' };
}
