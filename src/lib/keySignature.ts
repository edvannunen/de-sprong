// Maps each of the 24 KEY_OPTIONS values to its relative major key letter —
// used to pick which key-signature image to show, since a minor key's
// signature (sharps/flats) is always identical to its relative major's.
// Images live in static/img/key-signatures/<major>.jpg, one per major key,
// downloaded once from https://en.wikipedia.org/wiki/Key_signature#Table
// and self-hosted rather than hotlinked. See $lib/components/KeySignature.svelte.
const RELATIVE_MAJOR: Record<string, string> = {
	// Major keys map to themselves
	C: 'C',
	Db: 'Db',
	D: 'D',
	Eb: 'Eb',
	E: 'E',
	F: 'F',
	Gb: 'Gb',
	G: 'G',
	Ab: 'Ab',
	A: 'A',
	Bb: 'Bb',
	B: 'B',
	// Minor keys map to their relative major
	Cm: 'Eb',
	Dbm: 'E',
	Dm: 'F',
	Ebm: 'Gb',
	Em: 'G',
	Fm: 'Ab',
	Gbm: 'A',
	Gm: 'Bb',
	Abm: 'B',
	Am: 'C',
	Bbm: 'Db',
	Bm: 'D'
};

// Returns null when no key is selected. C and Am both resolve to "C", whose
// image is a bare staff + clef with no accidentals.
export function getRelativeMajor(key: string | null | undefined): string | null {
	if (!key) return null;
	return RELATIVE_MAJOR[key] ?? null;
}
