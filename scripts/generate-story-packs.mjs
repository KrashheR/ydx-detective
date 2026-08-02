/**
 * Regenerates the premium story-pack case JSON under `src/data/cases/packs/`
 * and their folder covers under `public/covers/packs/`.
 *
 *   node scripts/generate-story-packs.mjs
 *
 * Content lives in `scripts/story-packs/<pack>.mjs`; the generated JSON is the
 * shipped source of truth and is committed.
 */
import { buildPack } from './story-packs/lib.mjs';
import { dachaRomashkaPack } from './story-packs/dacha-romashka.mjs';
import { nightTrainPack } from './story-packs/night-train.mjs';
import { sanatoriumPriboyPack } from './story-packs/sanatorium-priboy.mjs';

for (const pack of [dachaRomashkaPack, nightTrainPack, sanatoriumPriboyPack]) {
  const ids = buildPack(pack);
  console.log(`${pack.id}: ${ids.length} cases → src/data/cases/packs/${pack.id}/`);
}
