/**
 * Index Quran translations into quran_documents and generate embeddings.
 *
 * Usage:
 *   npm run ai:index
 *   npm run ai:index -- --slugs=en-sahih-international
 *   npm run ai:index -- --no-embed   # documents only, skip embeddings
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { QuranIndexerService } from '../src/ai-knowledge/quran-indexer.service';

function parseArgs() {
  const slugsArg = process.argv.find((a) => a.startsWith('--slugs='));
  const noEmbed = process.argv.includes('--no-embed');
  return {
    translatorSlugs: slugsArg ? slugsArg.replace('--slugs=', '').split(',').filter(Boolean) : undefined,
    embed: !noEmbed,
  };
}

async function main() {
  const args = parseArgs();
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log'] });
  const indexer = app.get(QuranIndexerService);

  console.log('Indexing Quran knowledge documents...');
  const stats = await indexer.indexTranslations({
    translatorSlugs: args.translatorSlugs,
    embed: args.embed,
  });

  const status = await indexer.getIndexStatus();
  console.log('Index stats:', stats);
  console.log('Index status:', status);

  await app.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
