// The 24 key values shown in every key dropdown across the app.
// Hardcoded here as a single source of truth — import from this file, nowhere else.
export const KEY_OPTIONS = [
	'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B',
	'Cm', 'Dbm', 'Dm', 'Ebm', 'Em', 'Fm', 'Gbm', 'Gm', 'Abm', 'Am', 'Bbm', 'Bm'
];

// Warm, wooden color palette for category tabs and source cards — matches
// the piano banner and the amber-brown primary button rather than pastel candy colors.
// Each entry has a light background (for pill/card backgrounds) and a dark accent
// (for icons, badges, and borders). The colorIndex stored in the database is the
// index into this array — 0 = honey amber, 1 = walnut, etc.
export const PALETTE = [
	{ bg: '#FDECC8', dark: '#92400E' },  // 0: honey amber (matches btn-primary)
	{ bg: '#E8D9C3', dark: '#5C3A21' },  // 1: walnut
	{ bg: '#E2E1D0', dark: '#5B6350' },  // 2: sage (matches banner title text)
	{ bg: '#F1DDD0', dark: '#9A3412' },  // 3: rust
	{ bg: '#F3E6C7', dark: '#A16207' },  // 4: brass
	{ bg: '#E6DED5', dark: '#44403C' },  // 5: espresso
];
