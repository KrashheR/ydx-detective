# Ассеты для дела 47. Контейнер M-7

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. people/herman-kross-grounded.webp

- Назначение: generate_if_needed
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Illustrated archival claimant ID portrait matching the existing insurance detective game: male laboratory director, 46 years old, clean practical lab jacket over a shirt, precise controlled expression, neutral document-photo background, original face, no comic-villain styling, no mutation imagery, no logos, no text, no watermark.

## 2. evidence/case-049-photo-49.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Forensic laboratory evidence photo of a removed service ventilation grille viewed from inside a modern cold-storage lab, screws neatly placed on an interior shelf and untouched dust visible in the outer duct, realistic clean industrial setting, no biohazard spectacle, no logos, no readable text, no watermark.

## 3. assets/interactive/photo-49-scene.webp

- Назначение: Базовая поверхность со скрытым физическим следом, без процедурного покрытия
- Разрешение: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: Проверить плоский читаемый ракурс; удалить случайный текст; откалибровать каждую reveal mask по финальной сцене.

### Prompt

Почти фронтальный вид внутренней металлической полки лабораторного морозильного сейфа и задней вентиляционной решётки; свежие параллельные полосы волочения направлены к переднему краю, краска и металл вокруг вентиляции целы без царапин; без слоя инея, который будет процедурным. The dust, dirt, soot, frost, condensation or powder cover will be added programmatically, so do not bake the cover layer into the image. Keep the important surface large, readable and minimally distorted. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.

## 4. assets/interactive/photo-49-front_drag_marks-trace-mask.svg

- Назначение: Маска скрытого следа: Полосы к передней дверце
- Разрешение: 1600×1000 aligned to base image
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: Совместить с base image; порог обнаружения 52%; белая область маски — значимая зона.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.

## 5. assets/interactive/photo-49-undisturbed_vent-trace-mask.svg

- Назначение: Маска скрытого следа: Неповреждённый металл у вентиляции
- Разрешение: 1600×1000 aligned to base image
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: Совместить с base image; порог обнаружения 48%; белая область маски — значимая зона.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.
