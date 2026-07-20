# Промпты: дело 23 / ev-fire

Механика: surface_reveal.
Действие игрока: Сотрите копоть с панели блока питания и найдите место первичного пробоя.

## 1. assets/interactive/ev-fire-scene.webp

- Назначение: Базовая поверхность со скрытым физическим следом, без процедурного покрытия
- Размер: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Постобработка: Проверить плоский читаемый ракурс; удалить случайный текст; откалибровать каждую reveal mask по финальной сцене.

```text
Крупный документальный снимок металлического блока питания кофемашины после небольшого пожара; локальный кратер электрической дуги и оплавление изнутри наружу, без процедурного слоя копоти. The dust, dirt, soot, frost, condensation or powder cover will be added programmatically, so do not bake the cover layer into the image. Keep the important surface large, readable and minimally distorted. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.
```

## 2. assets/interactive/ev-fire-internal_arc-trace-mask.svg

- Назначение: Маска скрытого следа: Локальный след электрической дуги
- Размер: 1600×1000 aligned to base image
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Постобработка: Совместить с base image; порог обнаружения 58%; белая область маски — значимая зона.

```text
Не генерировать нейросетью. Создать программно по JSON-конфигурации.
```

## Общий negative prompt

```text
No readable critical text, no captions, no watermark, no logos, no real brands, no famous people, no copyrighted characters, no franchise-specific symbols, no cinematic poster, no neon HUD, no distorted perspective, no conflicting shadows unless explicitly requested.
```
