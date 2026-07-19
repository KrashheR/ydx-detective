import { describe, expect, it } from 'vitest';

const contentSources = import.meta.glob(
  [
    './cases/**/*.json',
    './CASE_AUTHORING_GUIDE.json',
    '../../public/covers/*.svg',
    '../../docs/prompts/DESIGN_PROMPT_PORTRAITS.md',
  ],
  { eager: true, query: '?raw', import: 'default' },
) as Record<string, string>;

const forbiddenMarkers = [
  'ninja turtles',
  'черепашек-ниндзя',
  'foot clan',
  'shredderov',
  'splintovich',
  'ecto-1',
  'back to the payout',
  'flux-capacitor',
  'hill valley',
  't-800',
  "i'll be back",
  'snapev',
  'hoglab',
  '9¾',
  'skywalkerov',
  'r2-d2',
  'astromech',
  'tatooine',
  'walter hart',
  'there is no spoon',
  'methamphetamine',
  'who among us is the impostor',
  'james bondarenko',
  'mi-7',
  'aston fantini',
  'vauxhall',
  'royal-7',
  'grand theft auto',
  'gta-777',
  'lada priora',
  'glonass',
  'steve blokov',
  'creeper andrei',
  'instagram.com',
  'telegram channel',
  'bosch flexidome',
  'hikvision',
  'blackvue',
  'ring video doorbell',
  'tp-link tapo',
  'garmin dash cam',
  'axis p3265',
] as const;

describe('case content IP safety', () => {
  it.each(Object.entries(contentSources))('%s contains no known franchise or brand markers', (_path, source) => {
    const normalized = source.toLocaleLowerCase('en');
    for (const marker of forbiddenMarkers) expect(normalized).not.toContain(marker);
  });
});
