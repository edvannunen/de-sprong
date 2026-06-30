// One-time import script — creates the "Pop" category and populates it with pieces + sources.
// Run with: npx tsx scripts/import-pop.ts
// Safe to run multiple times: skips pieces that already exist by name.

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import * as schema from '../src/lib/server/schema';

const sqlite = new Database('data/de-sprong.db');
sqlite.pragma('foreign_keys = ON');
const db = drizzle(sqlite, { schema });

// ── Piece data ────────────────────────────────────────────────────────────────

interface SourceData {
	name: string;
	info?: string;
	link?: string;
}

interface PieceData {
	name: string;
	info?: string;
	sources: SourceData[];
}

const PIECES: PieceData[] = [
	{
		name: 'Lonely at the Top',
		info: 'Randy Newman',
		sources: []
	},
	{
		name: "I Don't Like Mondays",
		info: 'Boomtown Rats',
		sources: [
			{ name: 'Gedrukte versie' }
		]
	},
	{
		// "Satellite of Love" and "Satellite Love - Lou Reed" in raw data are the same song
		name: 'Satellite of Love',
		info: 'Lou Reed',
		sources: [
			{ name: 'YouTube', link: 'https://youtu.be/atof-akAazs?si=uBmbuSFulN_RVQY5' }
		]
	},
	{
		name: 'Twee Motten',
		info: 'Dorus',
		sources: [
			{ name: 'Chords (Ultimate Guitar)', link: 'https://tabs.ultimate-guitar.com/tab/dorus/twee-motten-chords-52965' }
		]
	},
	{
		name: 'Axel F',
		sources: [
			{ name: 'Sheet (MuseScore)', link: 'https://musescore.com/user/993251/scores/470396' },
			{ name: 'Sheet (MusicNotes)', link: 'https://www.musicnotes.com/sheetmusic/mtd.asp?ppn=MN0040075' }
		]
	},
	{
		name: 'I Want You Back',
		info: 'Jackson 5',
		sources: [
			{ name: 'Lesson (YouTube)', link: 'https://www.youtube.com/watch?v=erq7zYDX_5Y' },
			{ name: 'Sheet (MuseScore)', link: 'https://musescore.com/user/8738461/scores/4343156' },
			{ name: 'Sheet with chords (MuseScore)', link: 'https://musescore.com/user/32824302/scores/6117314' },
			{ name: 'Intro (YouTube)', link: 'https://www.youtube.com/watch?v=HhhMrfQAJwo' }
		]
	},
	{
		name: 'Mercy Mercy Mercy',
		sources: [
			{ name: 'Sheet (MuseScore)', link: 'https://musescore.com/user/200046/scores/203356' },
			{ name: 'YouTube', link: 'https://youtu.be/dnPbcs127kM' }
		]
	},
	{
		name: 'Long and Winding Road',
		info: 'Beatles',
		sources: []
	},
	{
		name: 'Martha My Dear',
		info: 'Beatles',
		sources: [
			{ name: 'PDF (uitgeprint)' }
		]
	},
	{
		name: 'She Came In Through the Bathroom Window',
		info: 'Beatles',
		sources: []
	},
	{
		name: 'Your Mother Should Know',
		info: 'Beatles',
		sources: [
			{ name: 'Beatles Songbook' },
			{ name: 'Brad Mehldau (YouTube)', link: 'https://youtu.be/q9plgjX6PoQ?si=9kNyYh8mwRVh2ub_' },
			{ name: 'Sheet (PDF, Drive)', link: 'https://drive.google.com/file/d/16jSP-vm80bUs_CHzSpmbrP8qbYSaWHoo/view?pli=1' }
		]
	},
	{
		name: 'Penny Lane',
		info: 'Beatles',
		sources: [
			{ name: 'Beatles Songbook' }
		]
	},
	{
		name: 'Live and Let Die',
		info: 'Wings',
		sources: [
			{ name: 'YouTube', link: 'https://youtu.be/e7t_GhmI_5E?si=rtvrceFuRVo6pn4H' },
			{ name: 'Sheet (PDF, 007museum)', link: 'https://www.007museum.com/James_Bond_live_and_let_die.pdf' },
			{ name: 'Sheet (PDF, easysheetmusic — verkeerde toonsoort D)', link: 'https://easysheetmusic.altervista.org/live-and-let-die-theme-song-piano-sheet-music/' },
			{ name: 'Sheet (Sheet Music Direct)', link: 'https://www.sheetmusicdirect.com/se/ID_No/185313/Product.aspx' }
		]
	},
	{
		name: 'All the Young Dudes',
		info: 'David Bowie',
		sources: [
			{ name: 'Sheet (Noteflight)', link: 'https://www.noteflight.com/music/titles/0fb12c7a-cbf7-4038-a5b1-c11cfd00a5b3/all-the-young-dudes' },
			{ name: 'David Bowie Songs Piano Songbook (p.14)' }
		]
	},
	{
		name: 'Changes',
		info: 'David Bowie',
		sources: [
			{ name: 'Bowie Songbook' }
		]
	},
	{
		name: 'Life on Mars',
		info: 'David Bowie',
		sources: [
			{ name: 'Bowie Songbook' }
		]
	},
	{
		name: 'Sound & Vision',
		info: 'David Bowie',
		sources: [
			{ name: 'Bowie Songbook' }
		]
	},
	{
		name: 'Jealous Guy',
		info: 'John Lennon',
		sources: [
			{ name: 'Sheet (PDF)', link: 'https://cdn.preterhuman.net/texts/lyrics_and_music_related/Piano/John%20Lennon%20-%20Jealous%20Guy%20ver.2.pdf' },
			{ name: 'YouTube', link: 'https://youtu.be/y8NMKYOQmJI?si=vouZEQCzzCSVP8Uf' }
		]
	},
	{
		name: 'Bridge Over Troubled Water',
		info: 'Simon & Garfunkel',
		sources: []
	},
	{
		name: 'Ich bin wie du',
		sources: []
	},
	{
		name: 'Hilversum III',
		info: 'Herman van Veen',
		sources: []
	},
	{
		name: 'Opzij, opzij, opzij',
		info: 'Herman van Veen',
		sources: []
	},
	{
		name: 'No Surprises',
		info: 'Radiohead',
		sources: []
	},
	{
		name: 'Karma Police',
		info: 'Radiohead',
		sources: []
	},
	{
		name: 'Apologia',
		info: 'Gavin Friday',
		sources: []
	},
	{
		name: 'Everybody Got To Learn Sometime',
		info: 'Korgis / Beck',
		sources: [
			{ name: 'Sheet (PDF, uitgeprint)', link: 'https://www.devbase.at/download/sheetmusic/Everybodys%20gotta%20learn%20sometime.pdf' }
		]
	},
	{
		name: 'The Crystal Ship',
		info: 'The Doors',
		sources: [
			{ name: 'Sheet (Sheet Music Direct)', link: 'https://www.sheetmusicdirect.com/se/ID_No/472403/Product.aspx' }
		]
	},
	{
		name: 'Real Man',
		info: 'Joe Jackson',
		sources: [
			{ name: 'Sheet (PDF)', link: 'https://pdfcoffee.com/download/joe-jackson-real-men-pdf-free.html' }
		]
	},
	{
		name: 'Martha',
		info: 'Tom Waits',
		sources: []
	},
	{
		name: 'Such a Shame',
		info: 'Talk Talk',
		sources: [
			{ name: 'YouTube', link: 'https://youtu.be/rfY1NM44C3I' },
			{ name: 'PDF (uitgeprint)' }
		]
	},
	{
		name: 'Enjoy the Silence',
		info: 'Depeche Mode',
		sources: [
			{ name: 'Akkoorden (uitgeprint)' }
		]
	},
	{
		name: 'Where Is My Mind',
		info: 'Maxence Cyrin / Pixies',
		sources: [
			{ name: 'Sheet (MuseScore)', link: 'https://musescore.com/user/16006641/scores/4886663' }
		]
	},
	{
		name: "I'm Still Standing",
		info: 'Elton John',
		sources: [
			{ name: 'Sheet (MuseScore)', link: 'https://musescore.com/user/36070839/scores/6442367' },
			{ name: 'Chords (Ultimate Guitar)', link: 'https://tabs.ultimate-guitar.com/tab/elton-john/im-still-standing-chords-623241' },
			{ name: 'YouTube (betere versie)', link: 'https://youtu.be/pDOmVmZT6N4' }
		]
	},
	{
		name: "Don't Stop Me Now",
		info: 'Queen',
		sources: [
			{ name: 'Sheet (PDF)', link: 'https://sheetmusic-free.com/download/7912/' }
		]
	},
	{
		name: 'It Must Be Love',
		info: 'Madness',
		sources: [
			{ name: 'YouTube', link: 'https://youtu.be/PKq8d51KQkw' },
			{ name: 'Sheet (Sheet Music Direct)', link: 'https://www.sheetmusicdirect.com/se/ID_No/23795/Product.aspx' }
		]
	},
	{
		name: 'Money Money Money',
		info: 'ABBA',
		sources: [
			{ name: 'MuseScore (lokaal bestand)' },
			{ name: 'YouTube (moeilijkere versie)', link: 'https://youtu.be/tCP3labS9wQ' }
		]
	}
];

// ── Insert ────────────────────────────────────────────────────────────────────

// Find or create the "Pop" category (colorIndex 4 = rose)
let popCategory = db
	.select()
	.from(schema.category)
	.where(eq(schema.category.name, 'Pop'))
	.get();

if (!popCategory) {
	const existing = db.select().from(schema.category).all();
	const nextOrder = existing.length > 0
		? Math.max(...existing.map((c) => c.order)) + 1
		: 1;

	const inserted = db
		.insert(schema.category)
		.values({ name: 'Pop', colorIndex: 4, order: nextOrder })
		.returning()
		.get();

	popCategory = inserted;
	console.log('Created category: Pop');
} else {
	console.log('Category already exists: Pop');
}

const categoryId = popCategory.id;
let created = 0;
let skipped = 0;

for (const p of PIECES) {
	const existing = db
		.select()
		.from(schema.piece)
		.where(eq(schema.piece.name, p.name))
		.get();

	if (existing) {
		console.log(`Skipped (already exists): ${p.name}`);
		skipped++;
		continue;
	}

	const inserted = db
		.insert(schema.piece)
		.values({
			categoryId,
			name: p.name,
			info: p.info ?? null,
			key: null,
			topPriority: false
		})
		.returning({ id: schema.piece.id })
		.get();

	for (let i = 0; i < p.sources.length; i++) {
		const s = p.sources[i];
		db.insert(schema.source)
			.values({
				pieceId: inserted.id,
				name: s.name,
				info: s.info ?? null,
				link: s.link ?? null,
				order: i
			})
			.run();
	}

	console.log(`Created: ${p.name} (${p.sources.length} source${p.sources.length !== 1 ? 's' : ''})`);
	created++;
}

console.log(`\nImport complete. Created: ${created}, skipped: ${skipped}.`);
sqlite.close();
