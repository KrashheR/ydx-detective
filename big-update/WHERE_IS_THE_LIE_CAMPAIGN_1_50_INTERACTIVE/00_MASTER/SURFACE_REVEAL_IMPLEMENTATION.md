# SurfaceRevealEvidence — implementation blueprint

## Цель

`surface_reveal` даёт игроку короткое тактильное действие: очистить покрытие и самостоятельно найти физический след. Целевое время 5–15 секунд, максимум 20. Требовать 100% очистки запрещено.

## MVP

- Режим `erase`.
- Одна мягкая кисть, Pointer Events, mouse/touch.
- Покрытия `dirt`, `soot`, `frost`; архитектура сразу допускает dust/condensation/powder.
- 1–2 reveal masks.
- Порог каждого trace 45–65%.
- Reset, три уровня hint, короткий conclusion, повторный просмотр.
- Необязательный короткий haptic feedback после обнаружения.

## Component

```tsx
<SurfaceRevealEvidence evidence={evidence} progress={progress} onProgress={saveProgress} />
```

Слои: base image → hidden trace/UI text → shared cover texture → interaction mask → feedback. В erase кисть уменьшает alpha interaction mask. В apply, когда режим будет добавлен, кисть увеличивает alpha проявляющего слоя.

## Производительность

- Рендерить визуальную маску в разрешении компонента, но анализировать копию 128×128.
- Проверять пересечение после pointerup или throttled 5–10 раз/сек.
- После обнаружения trace прекратить повторные вычисления для него.
- На закрытии освобождать Canvas buffers и listeners.
- На жесте ставить `touch-action: none`, обрабатывать pointercancel.

## Сохранение

```ts
type SurfaceRevealProgress = {
  evidenceId: string;
  opened: boolean;
  analysisCompleted: boolean;
  discoveredTraceIds: string[];
  revealPercentByTrace: Record<string, number>;
  selectedContradiction: boolean;
};
```

Canvas snapshot не обязателен. Завершённая улика повторно открывается с заранее подготовленной success mask.

## Ассеты

- Base image генерируется без грязи, копоти, инея или другого cover.
- Trace mask создаётся после утверждения base image и совпадает с ним пиксель-в-пиксель.
- Критические серийные номера и подписи остаются HTML/SVG UI-слоем.
- Shared cover textures создаются один раз по `SHARED_SURFACE_ASSETS.md`.
- Базовая поверхность должна занимать большую часть кадра и не иметь сильной перспективы.

## UX и доступность

- Минимальная эффективная зона кисти 36–52 px на мобильном.
- Успех обозначается не только цветом: обводка trace, подпись и текстовый вывод.
- Reset не находится рядом со штампом.
- Подсказки: принцип → область объекта → краткая подсветка без автоочистки.
- RTL меняет layout панелей, но не координаты Canvas.

## Аналитика

События и параметры перечислены в `ANALYTICS.md`. Ключевые метрики: completion, median time, strokeCount, hint/reset rate, abandon rate и точность штампа после обнаружения.

## Acceptance

Компонент не содержит caseId-условий; JSON проходит Zod/superRefine; след не виден до очистки; физическая логика однозначна; mouse/touch работают; нет scroll во время жеста; прогресс восстанавливается; ассеты оптимизированы; desktop/mobile/RTL QA пройден.
