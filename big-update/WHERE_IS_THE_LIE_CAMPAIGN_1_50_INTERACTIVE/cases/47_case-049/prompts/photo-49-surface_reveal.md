# Промпты: дело 47 / photo-49

Механика: surface_reveal.
Действие игрока: Счистите иней с полки и области у вентиляционной решётки.

## 1. assets/interactive/photo-49-scene.webp

- Назначение: Базовая поверхность со скрытым физическим следом, без процедурного покрытия
- Размер: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Постобработка: Проверить плоский читаемый ракурс; удалить случайный текст; откалибровать каждую reveal mask по финальной сцене.

```text
Почти фронтальный вид внутренней металлической полки лабораторного морозильного сейфа и задней вентиляционной решётки; свежие параллельные полосы волочения направлены к переднему краю, краска и металл вокруг вентиляции целы без царапин; без слоя инея, который будет процедурным. The dust, dirt, soot, frost, condensation or powder cover will be added programmatically, so do not bake the cover layer into the image. Keep the important surface large, readable and minimally distorted. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.
```

## 2. assets/interactive/photo-49-front_drag_marks-trace-mask.svg

- Назначение: Маска скрытого следа: Полосы к передней дверце
- Размер: 1600×1000 aligned to base image
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Постобработка: Совместить с base image; порог обнаружения 52%; белая область маски — значимая зона.

```text
Не генерировать нейросетью. Создать программно по JSON-конфигурации.
```

## 3. assets/interactive/photo-49-undisturbed_vent-trace-mask.svg

- Назначение: Маска скрытого следа: Неповреждённый металл у вентиляции
- Размер: 1600×1000 aligned to base image
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Постобработка: Совместить с base image; порог обнаружения 48%; белая область маски — значимая зона.

```text
Не генерировать нейросетью. Создать программно по JSON-конфигурации.
```

## Общий negative prompt

```text
No readable critical text, no captions, no watermark, no logos, no real brands, no famous people, no copyrighted characters, no franchise-specific symbols, no cinematic poster, no neon HUD, no distorted perspective, no conflicting shadows unless explicitly requested.
```
