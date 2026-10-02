# QuranPilot — Permanent Technical SEO and Search Quality Instructions

Applies to all SEO work on https://quranpilot.com/ (audits, Quran/surah/ayah/translation/recitation pages, Tajweed, Salah, learning plans, articles, multilingual SEO, crawling/indexing/sitemaps, media, structured data, Search Console, performance, future SEO development).

## 1. Verify current guidance first
Before any material SEO recommendation or change: check the current date; review current official Google Search documentation and the Search documentation updates/changelog; confirm the feature/markup/sitemap field/directive is still supported and not deprecated, removed or changed. Never rely on memory, old articles, previous audits or existing code alone.

## 2. Source authority
1. Google Search Central (Search Essentials, spam policies, crawling, Search Console, structured data, updates, blog)
2. Schema.org (vocabulary only — separately confirm Google support)
3. Framework / hosting / CDN / browser docs
4. Other SEO resources — supplementary only

If Google's current guidance conflicts with this file or local docs, follow Google and report the conflict.

## 3. Product context
QuranPilot: Quran reading, translations, recitation, Tajweed, learning plans, search, multilingual navigation; explored features include Salah instruction, voice search, word-by-word Pashto audio, ayah-by-ayah reading. Verify what is actually live, public, localized and indexable before each audit. Never describe planned features as available.

## 4. Religious-content integrity (non-negotiable)
Never rewrite, paraphrase, normalize, "correct", truncate or keyword-optimize: Quranic Arabic, verse/surah numbering, translations, transliteration, recitation audio/reciter attribution/timing data, Tajweed markings/rules, hadith/supplications/attributed text, user notes/bookmarks/progress. Preserve stable IDs and source mappings. Report suspected inaccuracies with evidence and the authoritative source needed — never silently edit. Metadata may summarize but must not misrepresent. Do not generate rulings, quotations, hadith, transliterations or claims of consensus; flag interpretive content for qualified human review.

## 5. Inspect before auditing
Read repo instructions, SEO pipeline, routing, rendering, metadata, sitemap, localization, content and structured-data code; inspect live rendered HTML and HTTP behavior; use Search Console when available. Do not assume other projects' (e.g. PromptLabHub) data models. If access is missing, say so.

## 6. Page types and indexation
Assess each page type independently (home, surah, ayah, translation/language hubs, recitation, Tajweed, Salah, plans, articles, search, private app states, parameter URLs). Ask: distinct need? accessible without login/interaction? useful standalone? substantially different? stable public resource? Never index/noindex/delete based only on page count or similarity score.

## 7. Updates and deprecation
Check current docs for crawling/rendering, canonicals/redirects, sitemaps, snippets/title links, media, structured data, international, spam/AI content, Search Console, Core Web Vitals. Classify techniques as SUPPORTED / RECOMMENDED / OPTIONAL / DEPRECATED / UNSUPPORTED. Never introduce deprecated markup (e.g. verify FAQ rich-result status before proposing FAQ markup).

## 8. Metadata and content
Titles: distinctive, accurate, concise, natural; no stuffing or repeated brand; no arbitrary length "requirement". Descriptions: page-specific, accurate, no generic reuse. Headings describe real content; main content present in rendered HTML. URLs: stable; any approved change uses permanent redirects and updates links, canonicals, hreflang, sitemaps.

## 9. Programmatic SEO
Scale user value, not URL count. Evaluate intent, accuracy/attribution, original value, translation completeness, repetition, real templated value, internal links, completeness. No near-identical pages for query variants. Similarity detection is a review signal only.

## 10. Multilingual
Per advertised language verify genuine primary content, clear distinction of Quran text/translation/transliteration/audio/UI language, localized titles/descriptions/headings, stable canonicals, reciprocal hreflang to equivalent pages. One supported hreflang method, consistently. A language switcher is not proof of a localized page.

## 11. Technical audit
HTTP/HTTPS, www/non-www, canonical host, status codes, redirect chains/loops; canonical consistency across links, sitemaps, hreflang, structured data; robots.txt vs meta robots vs X-Robots-Tag (disallow ≠ noindex); private routes protected and never exposed; crawlable links, pagination, CSR, infinite scroll, orphans.

## 12. Sitemaps
Valid XML within current limits; canonical indexable 200 URLs only; correct host/protocol; no redirects/duplicates; truthful lastmod; verified-supported extensions only; scalable.

## 13. Images, audio, video
Images: crawlable, dimensioned, responsive, no CLS, purposeful alt text. Audio: visible context, accurate attribution, usable player, stable URL; don't claim Search features without verification. Video: verify every feature/property against current docs.

## 14. Structured data
Must match visible content, be Google-supported, meet policies, and be truthful (no invented authors, ratings, dates, orgs, FAQs). Never imply religious authority or endorsement. Test with current Google tools.

## 15. Internal linking
Natural, descriptive anchors between home, Quran navigation, surahs, learning content, language hubs, Tajweed, Salah, plans, articles. No content reachable only via search forms/JS/hidden UI. No keyword link blocks.

## 16. Parameters and app states
Decide per route: indexable / canonicalized / noindex / crawlable-not-indexed / blocked (justified). Avoid infinite URL spaces from search, filters, sort, player state, bookmarks, progress. Respect auth/privacy.

## 17. Performance and mobile
LCP, INP, CLS, TTFB, Quran text/audio loading, images/fonts, JS/hydration, caching, mobile layout/tap targets/overflow, accessibility. Separate measured facts from likely effects; no architecture rewrites for theoretical SEO gains.

## 18. Search Console and measurement
Use indexing, sitemap, enhancement, performance reports and URL Inspection when available. Respect privacy/consent. Never automate Google queries against policy.

## 19. Evidence and priority
Each confirmed issue: Issue, Location, Evidence, Current behavior, Current Google guidance, Impact, Recommended fix. Categories: CONFIRMED ISSUE / NEEDS VERIFICATION / OPTIONAL IMPROVEMENT / PRODUCT/GROWTH OPPORTUNITY.
- P0 Critical: major accidental deindexing, widespread 5xx, catastrophic canonicalization, severe policy exposure
- P1 High: substantial indexing, duplication, localization, metadata, accuracy or architecture issue
- P2 Medium: meaningful improvement, limited immediate risk
- P3 Low/Optional
Never invent issues. P0/P1 require evidence.

## 20. Default mode: READ-ONLY AUDIT
Change nothing (code, DB, religious text, metadata, config, infra). Report: Confirmed Problems, Needs Verification, Already Correct, Deprecated Practices Found, Current Google Changes Relevant to QuranPilot, P0–P3 findings, Recommended Implementation Plan. Then stop.
Implementation only on the explicit instruction: **IMPLEMENT APPROVED FIXES**.

## 21. Implementation mode
Per approved fix: re-check evidence and guidance; smallest safe change; preserve functionality, URLs, IDs; preserve religious content byte-for-byte; no unrelated refactors; update conflicting local SEO docs, reporting any OUTDATED LOCAL SEO RULE (existing rule, current guidance, replacement).

## 22. Verification
Run type check, lint, tests, build. Verify status/redirects, title/description/headings, canonical/robots, hreflang, OG, structured data, sitemap entries, media metadata, privacy boundaries, religious text integrity. Give before/after examples for important fixes.

## 23. Google Guidance Verification report
Every substantial task: current date, docs checked, relevant recent changes, deprecated features encountered, outdated recommendations rejected, access limitations. Never claim currency without checking.

## 24. Final quality gate
Reachable public pages; correct indexability with private content protected; consistent canonical/redirect signals; accurate metadata and content; distinct value per indexed page; religious text and attribution preserved; complete, connected localization; discoverable via internal links; media understood; current truthful structured data; proportionate performance fixes; spam-policy compliance; no deprecated techniques; user data protected.

Optimize for: religious-content integrity + user value + discoverability + technical clarity + accurate localization + long-term search quality — not more keywords, URLs, words, schema or sitemap fields.
