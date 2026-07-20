import { useMemo, useState } from 'react';
import type { Case, FinalSynthesis, FinalSynthesisProgress, Language } from '../types';
import { loc, t } from '../i18n/ui';
import { tapHaptic } from '../utils/haptics';

interface Props {
  config: FinalSynthesis;
  caseData: Case;
  progress?: FinalSynthesisProgress;
  lang: Language;
  onAttempt: (links: Array<readonly [string, string]>, correct: boolean) => void;
  onSkip: (links: Array<readonly [string, string]>) => void;
  onComplete: () => void;
}

const normalize = ([a, b]: readonly [string, string]) => [a, b].sort().join('::');

export function EvidenceLinkBoard({ config, caseData, progress, lang, onAttempt, onSkip, onComplete }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [links, setLinks] = useState<Array<readonly [string, string]>>(progress?.links ?? []);
  const [solved, setSolved] = useState(progress?.completed ?? false);
  const required = useMemo(() => new Set(config.requiredLinks.map(normalize)), [config.requiredLinks]);
  const attempts = progress?.attempts ?? 0;

  const choose = (id: string) => {
    if (!selected) { setSelected(id); return; }
    if (selected === id) { setSelected(null); return; }
    const nextLink = [selected, id] as const;
    const next = [...links.filter((link) => !link.includes(selected) || !link.includes(id)), nextLink];
    setLinks(next);
    setSelected(null);
  };

  const verify = () => {
    const actual = new Set(links.map(normalize));
    const correct = required.size === actual.size && [...required].every((link) => actual.has(link));
    onAttempt(links, correct);
    if (correct) { setSolved(true); tapHaptic(); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-modal-backdrop p-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <section role="dialog" aria-modal="true" className="max-h-full w-full max-w-[620px] overflow-auto rounded-lg bg-paper shadow-modal">
        <header className="bg-folder-edge px-5 py-4 text-white"><h2 className="m-0 font-serif text-xl">{loc(config.title, lang)}</h2><p className="mb-0 mt-2 text-sm text-white/80">{loc(config.instruction, lang)}</p></header>
        <div className="space-y-5 p-5">
          <div className="grid gap-2 sm:grid-cols-2">{config.evidenceUnlockIds.map((id) => {
            const evidence = caseData.evidences.find((item) => item.id === id);
            return evidence ? <article key={id} className="rounded-md border border-document-dash bg-white p-3"><strong className="block font-serif text-sm text-ink">{loc(evidence.title, lang)}</strong><p className="mb-0 mt-1 text-xs leading-relaxed text-text-light">{loc(evidence.content, lang)}</p></article> : null;
          })}</div>
          <div className="grid gap-3 sm:grid-cols-3">{config.nodes.map((node) => <button key={node.id} type="button" onClick={() => choose(node.id)} disabled={solved} className={`min-h-24 rounded-md border-2 p-3 text-center font-serif text-base font-bold ${selected === node.id ? 'border-accent bg-accent/10 text-accent' : 'border-document-dash bg-white text-ink'}`}><span className="block font-mono text-[10px] font-normal uppercase tracking-wide text-text-muted">{node.evidenceIds.join(' · ')}</span>{loc(node.label, lang)}</button>)}</div>
          <div className="min-h-16 rounded-md border border-dashed border-document-dash bg-surface px-4 py-3">{links.length === 0 ? <span className="text-sm text-text-muted">{loc(config.instruction, lang)}</span> : links.map((link) => <div key={normalize(link)} className="font-mono text-sm text-ink">{loc(config.nodes.find((node) => node.id === link[0])!.label, lang)} → {loc(config.nodes.find((node) => node.id === link[1])!.label, lang)}</div>)}</div>
          {solved && <div className="rounded-md border border-accent bg-accent/10 p-4 text-sm leading-relaxed text-ink"><strong className="mb-2 block font-mono text-accent">{t('interactiveComplete', lang)}</strong>{loc(config.successConclusion, lang)}</div>}
          <div className="flex flex-wrap gap-2">
            {!solved && <button type="button" onClick={verify} className="min-h-12 flex-1 rounded-md bg-folder-edge px-4 font-bold text-white">{t('interactiveCompare', lang)}</button>}
            {!solved && attempts >= config.skippableAfterAttempts && <button type="button" onClick={() => onSkip(links)} className="min-h-12 rounded-md border border-border px-4 font-semibold text-text-light">{t('finalSynthesisSkip', lang)}</button>}
            {solved && <button type="button" onClick={onComplete} className="min-h-12 flex-1 rounded-md bg-folder-edge px-4 font-bold text-white">{t('backToDesk', lang)}</button>}
          </div>
        </div>
      </section>
    </div>
  );
}
