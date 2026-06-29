// The 24 key values shown in every key dropdown across the app.
// Hardcoded here as a single source of truth — import from this file, nowhere else.
export const KEY_OPTIONS = [
	'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B',
	'Cm', 'Dbm', 'Dm', 'Ebm', 'Em', 'Fm', 'Gbm', 'Gm', 'Abm', 'Am', 'Bbm', 'Bm'
];

// Pastel color palette for category tabs and source cards.
// Each entry has a light background (for pill/card backgrounds) and a dark accent
// (for icons, badges, and borders). The colorIndex stored in the database is the
// index into this array — 0 = sky blue, 1 = violet, etc.
export const PALETTE = [
	{ bg: '#DBEAFE', dark: '#1D4ED8' },  // 0: sky blue
	{ bg: '#EDE9FE', dark: '#6D28D9' },  // 1: violet
	{ bg: '#D1FAE5', dark: '#065F46' },  // 2: emerald
	{ bg: '#FEF3C7', dark: '#92400E' },  // 3: amber
	{ bg: '#FFE4E6', dark: '#9F1239' },  // 4: rose
	{ bg: '#CCFBF1', dark: '#115E59' },  // 5: teal
];
