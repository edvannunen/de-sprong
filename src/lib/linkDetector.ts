// Converts a raw URL string into a typed result that tells the UI how to render it.
// YouTube and Spotify links become embeds; anything else becomes a plain link.
// A bare video filename (no http://) is treated as a reference to a file that
// already lives on the iPad — see the "video" case below.

// Name of the iOS Shortcut the user must create once on their iPad. It should
// accept "text" input (the filename), look the file up in a bookmarked folder,
// and hand it to VLC via "Open In". Safari can't do this directly: VLC's own
// URL scheme only accepts network URLs, not files from another app's sandbox
// (confirmed on the VideoLAN forums, July 2026).
export const VLC_SHORTCUT_NAME = 'Open in VLC';

const VIDEO_EXTENSIONS = /\.(mp4|mov|m4v|avi|mkv)$/i;

export type LinkResult =
	| { type: 'youtube'; embedUrl: string }
	| { type: 'spotify'; embedUrl: string }
	| { type: 'video'; filename: string; shortcutUrl: string }
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

	// Local video filename (not a URL): hand off to the "Open in VLC" Shortcut.
	if (!url.startsWith('http://') && !url.startsWith('https://') && VIDEO_EXTENSIONS.test(url)) {
		const shortcutUrl = `shortcuts://run-shortcut?name=${encodeURIComponent(VLC_SHORTCUT_NAME)}&input=text&text=${encodeURIComponent(url)}`;
		return { type: 'video', filename: url, shortcutUrl };
	}

	// Any other URL
	if (url.startsWith('http://') || url.startsWith('https://')) {
		return { type: 'link', url };
	}

	return { type: 'none' };
}
