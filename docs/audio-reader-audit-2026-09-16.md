# Audio and word reader audit — 2026-09-16

Checked the live catalog of 44 voices (38 Arabic, six spoken translations), 132 chapter metadata responses, and 264 first/last recording URLs across Al-Fatihah, Ar-Rum, and An-Nas. Metadata returned sequential verse numbers. These are availability/mapping checks, not a listening certification of every recording.

EveryAyah directory inventories were compared against all 6,236 Hafs verse filenames. Twenty-six sets contained all expected filenames. QuranCDN sets do not expose a directory inventory and received the chapter sample checks only.

## Findings and changes

- Mustafa Ismail: 4,220 expected filenames missing; its partial collection cannot provide reliable whole-Quran playback.
- Abdul Basit Warsh: the source has different verse boundaries (Ar-Rum ends at file 030059, while this reader expects 60 verses). It cannot safely share the reader's Hafs verse mapping.
- Five per-ayah translation voices: all sampled self-hosted URLs returned 404. Verified their original EveryAyah sources and changed frontend playback to those HTTPS sources.
- Pashto: all sampled self-hosted ruku files returned 404. Requires the existing `scripts/fetch-pashto-audio.mjs` mirror to be deployed. Disabled in the selector until recordings are restored.
- Incomplete/mismatched sets are labeled unavailable; saved choices fail visibly instead of being replaced by another reciter.
- Bismillah added as a separate opening; omitted for chapters 1 and 9 and for starts after ayah 1. Single-ayah repeat keeps its verse-only scope when changing voices.
- Superseded playlist, play, timing, and cache requests no longer overwrite newer requests. Pausing during reciter loading stays paused.
- Live Ar-Rum responses with `words=true` contained empty word lists. A frontend word-data route supplies missing words from Quran.com's public API, with validation, caching and shared page requests. Existing imported words take precedence. End-of-verse markers are excluded. Arabic text remains visible if the source is unavailable.
- The word-data route uses `/reader-data/words`, because production Nginx sends `/api/` to the separate backend.

## Validation

Audio regression tests cover all 114 chapter sequences, Bismillah exceptions, translation order, verse-only repeat, rapid selection changes, closing during loading, unavailable sources, fallback reciter identity, stale play promises, and cancelled cache requests. Word-data tests cover meanings, end markers, shared requests, validation, and upstream failure. Browser checks confirmed clicking Ar-Rum 30:2 reveals its Urdu meaning and transliteration, automatic ayah advancement, pause, next, previous, and resume. English translation playback was verified from its repaired EveryAyah source.

Mobile Safari and the identity/content of every individual recording were not exhaustively verified. Changes are local until pushed/deployed.

Production build completed successfully (772 pages), including TypeScript. Several live-data requests needed automatic retries. SEO regression checks also passed.

## Live source samples before changes

| Voice | Successful source checks |
| --- | --- |
| abdul-basit-murattal | 6/6 |
| alafasy | 6/6 |
| abdul-basit-mujawwad | 6/6 |
| minshawi-murattal | 6/6 |
| minshawi-mujawwad | 6/6 |
| husary | 6/6 |
| husary-mujawwad | 6/6 |
| husary-muallim | 6/6 |
| sudais | 6/6 |
| shuraim | 6/6 |
| rifai | 6/6 |
| shaatree | 6/6 |
| jibreel | 6/6 |
| tunaiji | 6/6 |
| ghamdi | 6/6 |
| ajamy | 6/6 |
| muaiqly | 6/6 |
| hudhaify | 6/6 |
| ayyoub | 6/6 |
| basfar | 6/6 |
| dussary | 6/6 |
| alqatami | 6/6 |
| juhaynee | 6/6 |
| ali-jaber | 6/6 |
| fares-abbad | 6/6 |
| budair | 6/6 |
| muhsin-qasim | 6/6 |
| tablawi | 6/6 |
| mustafa-ismail | 4/6 |
| matroud | 6/6 |
| neana | 6/6 |
| akhdar | 6/6 |
| parhizgar | 6/6 |
| ayman-sowaid | 6/6 |
| sahl-yassin | 6/6 |
| warsh-abdul-basit | 5/6 |
| warsh-aldosary | 6/6 |
| warsh-yassin | 6/6 |
| en-ibrahim-walk | 0/6 |
| ur-shamshad-ali-khan | 0/6 |
| ur-farhat-hashmi | 0/6 |
| fa-makarem | 0/6 |
| fa-fooladvand | 0/6 |
| ps-shafeeq-ur-rahman | 0/6 |
