# Ассеты для дела 32. Серийные номера в пепле

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. evidence/case-034-ev-serials.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Forensic warehouse fire evidence photograph of several heat-damaged metal electronics chassis recovered from ash, intact blank serial plate areas visible for UI overlay, surrounding melted packaging and soot, realistic restrained fire scene, no brands, no readable text, no watermark.

## 2. assets/interactive/ev-serials-scene.webp

- Назначение: Базовая поверхность со скрытым физическим следом, без процедурного покрытия
- Разрешение: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: Проверить плоский читаемый ракурс; удалить случайный текст; откалибровать каждую reveal mask по финальной сцене.

### Prompt

Крупный план обгоревшего металлического шасси бытовой электроники с пустой заводской табличкой и старым износом; серийный номер будет UI-слоем, сажа будет процедурной. The dust, dirt, soot, frost, condensation or powder cover will be added programmatically, so do not bake the cover layer into the image. Keep the important surface large, readable and minimally distorted. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.

## 3. assets/interactive/ev-serials-discarded_serial-trace-mask.svg

- Назначение: Маска скрытого следа: Номер списанного корпуса
- Разрешение: 1600×1000 aligned to base image
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: Совместить с base image; порог обнаружения 50%; белая область маски — значимая зона.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.
