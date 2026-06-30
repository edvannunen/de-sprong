// One-time import script — populates the Songs category with all 24 pieces and their sources.
// Run with: npx tsx scripts/import-songs.ts
// Safe to run multiple times: skips any piece that already exists by name.

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
	key?: string;
	info?: string;
	sources: SourceData[];
}

const PIECES: PieceData[] = [
	{
		name: 'Golden Brown',
		sources: [
			{ name: 'Performance', link: 'https://www.youtube.com/watch?v=cqkHTT33QpE' },
			{ name: 'Sheet (Flat.io)', link: 'https://flat.io/score/683a4479673a3ce5ace648a5-golden-brown?srsltid=AfmBOopmlhdC_r7ehxWmGsH3ITPojZfHmwaiBUUrnC98ZsZIbSBus4dl' },
			{ name: 'Sheet (MuseScore)', link: 'https://musescore.com/user/34400169/scores/7209879' },
			{ name: 'Sheet (MuseScore, version 2)', link: 'https://musescore.com/user/112145732/scores/29692580' }
		]
	},
	{
		name: 'All of Me',
		sources: [
			{ name: 'Sheet (MuseScore)', link: 'https://musescore.com/user/6541526/scores/5509586' },
			{ name: 'Performance', link: 'https://www.youtube.com/watch?v=Dbu0tgJbhXk&t=65s' },
			{ name: 'Guitar and piano', link: 'https://youtu.be/jwbVn-fR0Xw?si=ASjAB9HFSIcz4BlD' },
			{ name: 'Advanced version', link: 'https://www.youtube.com/watch?v=iKbtCnZzk9s' },
			{ name: 'Jazz trio', link: 'https://youtu.be/vHV94Alsjok?si=rgpz-Fe2mKiTkv1T' },
			{ name: 'Scott Henderson solo (video)', link: 'https://www.youtube.com/watch?v=uRZHnhebKBQ' },
			{ name: 'Scott Henderson solo sheet (Drive)', link: 'https://drive.google.com/file/d/11xf_B65zUeDKGGUxINjx5-4JyFlRxQYn/view' }
		]
	},
	{
		name: 'Alice in Wonderland',
		info: 'Bill Evans',
		sources: [
			{ name: 'Performance', link: 'https://www.youtube.com/watch?v=LkO1GqH8YiI' },
			{ name: 'Full sheet (Scribd)', link: 'https://www.scribd.com/document/519025683/Alice-complete-transcription-for-gumroad' },
			{ name: 'Intro (MuseScore)', link: 'https://musescore.com/official_scores/scores/6928460' },
			{ name: 'Exercises', link: 'https://youtu.be/KcXtkjtZkMk?si=8EF3ESD8bgyiAZCl' }
		]
	},
	{
		name: 'All the Things You Are',
		sources: [
			{ name: 'Stijn Wauters', link: 'https://www.youtube.com/watch?v=n4bWTiWqSxc&t=184s' },
			{ name: 'Solo', link: 'https://www.youtube.com/watch?v=GW_jL4UdVYk' },
			{ name: 'Sheet (MuseScore)', link: 'https://musescore.com/user/34876540/scores/9104750' },
			{ name: 'Sheet, simpler (MuseScore)', link: 'https://musescore.com/user/21706406/scores/4204791' },
			{ name: 'Tony Winston', link: 'https://www.youtube.com/watch?v=s5yKGTOmuig' }
		]
	},
	{
		name: 'Autumn Leaves',
		sources: [
			{ name: 'Performance', link: 'https://www.youtube.com/watch?v=sSRLR7DQ6Dg' }
		]
	},
	{
		name: 'Believe Beleft Below',
		info: 'Esbjörn Svensson Trio',
		sources: [
			{ name: 'Transcription + PDF (site)', link: 'https://glenwoodpianostudio.com/2021/12/16/esbjorn-svensson-trio-believe-beleft-below/' },
			{ name: 'Lead sheet (Scribd)', link: 'https://www.scribd.com/document/491285636/Believe-Beleft-Bellow-by-E-S-T-Lead-Sheet' },
			{ name: 'Sheet (MuseScore)', link: 'https://musescore.com/user/37618064/scores/21528907' }
		]
	},
	{
		name: 'Blue Bossa',
		sources: [
			{ name: 'Sheet (MuseScore)', link: 'https://musescore.com/user/175333/scores/523301' },
			{ name: 'Performance with solo', link: 'https://youtu.be/yzhU08HSbD0?si=gWEYi2gFhNjNdZ_N' },
			{ name: 'Advanced', link: 'https://youtu.be/lTpl_6Moo24?si=2mfGFSWUbgrqRtMP' },
			{ name: 'From 7:40', link: 'https://youtu.be/FF41ZMo1kB8?si=3zhOh1CQvrMLgLRT' }
		]
	},
	{
		name: 'Blue Monk',
		sources: [
			{ name: 'Sheet (MuseScore)', link: 'https://musescore.com/user/6407251/scores/6642717' },
			{ name: 'Sheet (MuseScore, version 2)', link: 'https://musescore.com/user/10747721/scores/5733936' },
			{ name: 'Performance', link: 'https://youtu.be/aPEcFdyo6IA?si=dyDQ6pQlb2ngLkT1' },
			{ name: 'Slow piano with solo', link: 'https://youtu.be/GRtIdGrhSfs?si=qVlVik_wNvjDlmO0' },
			{ name: 'With solo', link: 'https://youtu.be/Slqw-92QL3I?si=Av8HByIiR5IhSqMT' }
		]
	},
	{
		name: 'Caravan',
		sources: [
			{ name: 'Tony Winston (video)', link: 'https://youtu.be/Gzi8SDOCuAE?si=v8S88qP0KbC6GEkb&t=710' },
			{ name: 'Tony Winston sheet (Drive)', link: 'https://drive.google.com/file/d/1K8cTdnWGZNALqWFkKpFVQ_BuYB-lbawy/view' },
			{ name: 'Latin bass and improv lesson', link: 'https://www.youtube.com/watch?v=gP9V-P2hz-w' },
			{ name: 'Sheet (PDF)', link: 'http://partitionsgratuites.go.yo.fr/Partitions/Caravan%20Piano%20Solo%20Tutti.pdf' },
			{ name: 'Money Jungle intro', link: 'https://youtu.be/mHPKkrSdd-E?si=mI2wYJp8xXI5YWUx' },
			{ name: 'Written-out version', link: 'https://youtu.be/4JFSs-gfFi4?si=rUAmQbFsYjyN8bX6' }
		]
	},
	{
		name: 'Conga',
		info: 'Miami Sound Machine',
		sources: [
			{ name: 'Piano montuno + solo (MuseScore)', link: 'https://musescore.com/user/79422433/scores/14206900' },
			{ name: 'Orchestra (MuseScore)', link: 'https://musescore.com/manuel_pizarro_amaya/conga' },
			{ name: 'Sheet with intro (MusicNotes)', link: 'https://www.musicnotes.com/sheetmusic/mtd.asp?ppn=MN0109803' },
			{ name: 'Lesson', link: 'https://www.youtube.com/watch?v=jM9zMoidbdw' },
			{ name: 'Performance', link: 'https://youtu.be/F_hgjTjCmOM?si=_aXl2Ekp3j4Lpk9_' },
			{ name: 'Performance (version 2)', link: 'https://youtu.be/3UYUNeJdcDc?si=T-Vge3iTW5yQpa9h' }
		]
	},
	{
		name: 'Goodbye Pork Pie Hat',
		key: 'F',
		info: 'Original key: Eb, copy in F',
		sources: [
			{ name: 'Performance with sheet', link: 'https://youtu.be/HCtoztmvBRw?si=ANKIBke9WSKvtVPE' },
			{ name: 'Clear filming', link: 'https://youtu.be/wA4XtwW6c5w?si=DZ3w3Ej7jNa6MJEg' },
			{ name: 'Solo', link: 'https://www.youtube.com/watch?v=n4xOJ0sdrMU' },
			{ name: 'Performance', link: 'https://youtu.be/yt8CV28Ytfs?si=FNxWq-Heocrd3-sS' },
			{ name: 'With viola', link: 'https://youtu.be/_BdcveAmOJU?si=TV8JvyhzdKrMeqq7' }
		]
	},
	{
		name: 'Seascape',
		info: 'Kenny Barron (Art of Conversation)',
		sources: [
			{ name: 'Performance', link: 'https://youtu.be/EEIZqL8U7ZA?si=_pg9tFO07JBeocUk' },
			{ name: 'Sheet (Scribd)', link: 'https://www.scribd.com/document/559581599/seascape-K-BARRON' },
			{ name: 'iReal chart (Scribd)', link: 'https://www.scribd.com/document/479482950/Seascape-Kenny-barron-pdf' }
		]
	},
	{
		name: 'Rain',
		info: 'Kenny Barron (Art of Conversation)',
		sources: [
			{ name: 'Sheet (MuseScore)', link: 'https://musescore.com/user/14781671/scores/7243956' },
			{ name: 'Performance', link: 'https://www.youtube.com/watch?v=mp6oaN8eJ9E' }
		]
	},
	{
		name: 'Midnight Blue',
		sources: [
			{ name: 'Quartet with piano', link: 'https://youtu.be/0blbWIYK1bk?si=nWWgmqbYoyS4D3li' },
			{ name: 'Sheet (video)', link: 'https://youtu.be/q8-Y1cHzugI?si=MSvoV0NKcG7D7N5d' },
			{ name: 'Hammond version', link: 'https://youtu.be/KDUV80bLKuc?si=GBlQN2y759fyzZwk' },
			{ name: 'Sheet (MuseScore)', link: 'https://musescore.com/user/29054638/scores/6250826' }
		]
	},
	{
		name: "Moanin'",
		info: 'Video Christian (les 32)',
		sources: [
			{ name: 'Performance', link: 'https://youtu.be/ORl8F2w6pno?si=NmYXtRgV-YvDY2tG' },
			{ name: 'Piano/guitar', link: 'https://youtu.be/wpZrgx85BOU?si=4QKYCUgY9Pvlmgv7' },
			{ name: 'More blue notes', link: 'https://youtu.be/b_s17F6SrHM?si=BpU2vhCsWYTKTnoh' },
			{ name: 'With licks', link: 'https://youtu.be/Khha_tujOUw?si=R2bEqjG4fwV5Ftf-' }
		]
	},
	{
		name: 'Mount Harissa',
		info: 'Duke Ellington',
		sources: [
			{ name: 'Sheet (MuseScore)', link: 'https://musescore.com/user/97106398/scores/19293181' },
			{ name: 'Sheet (Scribd)', link: 'https://www.scribd.com/document/445350678/MountHarissa-acc' },
			{ name: 'EHBO masterclass', link: 'https://www.youtube.com/live/4V2pF_QeJ50?si=cYb1V3rB1mrODp4i&t=4827' }
		]
	},
	{
		name: 'Perdido',
		info: 'Les 38. Intro in Quartet app piano.',
		sources: [
			{ name: 'Sheet (MuseScore)', link: 'https://musescore.com/ericfontainejazz/perdido' },
			{ name: 'Ellington himself', link: 'https://youtu.be/eT1vrVdPuA4?si=NU-WLyKlW67q6QoY' },
			{ name: 'With intro', link: 'https://youtu.be/-s3GvF41Ibk?si=y7jAepHPB_CurQyk' },
			{ name: 'Fast version', link: 'https://youtu.be/ogiBqIzYQJY?si=DwL-Cc2NsQuvAa3J' },
			{ name: 'Piano and guitar', link: 'https://youtu.be/tqhW5G2cqRc?si=7DU0ibVPuF_k4RnD' }
		]
	},
	{
		name: 'Polka Dots and Moonbeams',
		sources: [
			{ name: 'Performance', link: 'https://www.youtube.com/watch?v=EzFC8xPTFdI&t=105s' }
		]
	},
	{
		name: 'Splanky',
		key: 'F',
		info: 'PDF in files. MusicNotes purchased.',
		sources: [
			{ name: 'Sheet (MusicNotes)', link: 'https://www.musicnotes.com/app/MN0261626' },
			{ name: 'Sheet in F (MuseScore, my version)', link: 'https://musescore.com/user/40469865/scores/31964315/s/K47mO_' },
			{ name: 'Performance v1', link: 'https://www.youtube.com/watch?v=KyXoMyKOrqA' },
			{ name: 'Performance v2', link: 'https://www.youtube.com/watch?v=D7_XeH79eKk' },
			{ name: 'Tutorial', link: 'https://www.youtube.com/watch?v=s5yl1CCrszY' }
		]
	},
	{
		name: 'De Sprong',
		info: 'O, Romantiek Der Hazen. Boek.',
		sources: [
			{ name: 'Performance', link: 'https://youtu.be/SehA7ep43zI' },
			{ name: 'Performance (version 2)', link: 'https://youtu.be/wLRQeB-NSBM' },
			{ name: 'Reinier Baas (guitar)', link: 'https://www.youtube.com/watch?v=14f-F-IjiQ0' }
		]
	},
	{
		name: 'On the Sunny Side of the Street',
		info: 'Sheet in files.',
		sources: [
			{ name: 'Ballroom performance + sheet', link: 'https://youtu.be/a_7NmuUd-ew?si=NBEHs_ono0S6ysqR' },
			{ name: 'Stijn Wauters (with comping)', link: 'https://youtu.be/12ZC4HhyezM?si=hrT1zBLS9qLhEd8B' },
			{ name: 'Written out with bass', link: 'https://youtu.be/vXTMQdmFeQE?si=VG6x4p48D-zQL-FB' },
			{ name: 'Solo', link: 'https://youtube.com/watch?v=HpqId7lBlWs&si=yLteypAUAl41tAaz' },
			{ name: 'Kenny Barron solo transcription (site)', link: 'https://jazzpianopracticesessions.com/beginner-intermediate-transcriptions/' },
			{ name: 'Lesson (part 1)', link: 'https://youtu.be/4wDyesdRGBY?si=G5PJfwCwttejRp5P' },
			{ name: 'Lesson (part 2)', link: 'https://youtu.be/WvLRbpM2R0A?si=QTTjwOhr6Tty_YZI' }
		]
	},
	{
		name: 'Straight, No Chaser',
		key: 'F',
		info: 'Check 2nd voice at 2:36 in performance video.',
		sources: [
			{ name: 'Performance with solo', link: 'https://www.youtube.com/watch?v=wJ7hMpa_uI4' },
			{ name: 'Tutorial (Piano Groove)', link: 'https://www.pianogroove.com/blues-piano-lessons/straight-no-chaser-tutorial/' },
			{ name: 'Guitar', link: 'https://www.youtube.com/watch?v=H8ljpF1GMLk' },
			{ name: 'Sheet (MuseScore)', link: 'https://musescore.com/user/21654781/scores/4890472' }
		]
	},
	{
		name: 'Tenor Madness',
		sources: [
			{ name: 'Sheet (MuseScore)', link: 'https://musescore.com/user/3578461/scores/6579534/s/5OrXrW' },
			{ name: 'Performance', link: 'https://youtu.be/K-ZFHviXjbw' },
			{ name: 'With solo (same as Stijn Wauters Blues in Bb)', link: 'https://www.youtube.com/watch?v=6lnks1Ctr1A' },
			{ name: 'Sheet (PDF, memorial.ca)', link: 'https://www.mun.ca/music/media/production/memorial/academic/school-of-music/media-library/current/courseinfo/Tenor_Madness_C.pdf' }
		]
	},
	{
		name: 'There Is No Greater Love',
		sources: [
			{ name: 'Sheet (MuseScore)', link: 'https://musescore.com/ericfontainejazz/there-is-no-greater-love' },
			{ name: 'Ben van Lier (Spotify)', link: 'https://open.spotify.com/track/6HYP9n6yJK1WEGVl4MTfIz?si=3f5996af92d44040' },
			{ name: 'Kenny Barron transcription (video)', link: 'https://youtu.be/cjw5h-730UI?si=KDfxoNah3ZkZo-yb' }
		]
	}
];

// ── Insert ────────────────────────────────────────────────────────────────────

const songsCategory = db
	.select()
	.from(schema.category)
	.where(eq(schema.category.name, 'Songs'))
	.get();

if (!songsCategory) {
	console.error('Songs category not found. Run npm run db:seed first.');
	process.exit(1);
}

const categoryId = songsCategory.id;
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
			key: p.key ?? null,
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

	console.log(`Created: ${p.name} (${p.sources.length} sources)`);
	created++;
}

console.log(`\nImport complete. Created: ${created}, skipped: ${skipped}.`);
sqlite.close();
