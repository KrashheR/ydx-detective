# Промпты: дело 16 / ev-satellite

Механика: shadow_time_check.
Действие игрока: Сопоставить тень межевого столба со временем прохождения грозы.

## 1. assets/interactive/ev-satellite-scene.webp

- Назначение: Фотография с одной геометрически читаемой тенью
- Размер: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Постобработка: Отбраковать конфликтующие тени; вручную сверить origin и фактический диапазон.

```text
Пшеничное поле с узкой полосой свежего градового повреждения, один межевой столб с чёткой тенью, ровный горизонт. One dominant vertical reference object with its base fully visible, one clear physically connected shadow on a level surface, single sunlight direction, minimal other shadows and reflections, free overlay space. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.
```

## 2. assets/interactive/ev-satellite-shadow-reference.svg

- Назначение: Эталонная тень, управляемая ползунком времени
- Размер: viewBox 0 0 100 100
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Постобработка: Откалибровать angle/length по принятому изображению.

```text
Не генерировать нейросетью. Создать программно по JSON-конфигурации.
```

## Общий negative prompt

```text
No readable critical text, no captions, no watermark, no logos, no real brands, no famous people, no copyrighted characters, no franchise-specific symbols, no cinematic poster, no neon HUD, no distorted perspective, no conflicting shadows unless explicitly requested.
```
