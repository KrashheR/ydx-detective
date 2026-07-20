# Ассеты для дела 6. Сорок пропавших пицц

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. evidence/case-020-staged-takeaway-cctv.webp

- Назначение: Инсценировка у закусочной
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Night CCTV evidence outside a modest neighborhood takeaway restaurant: a hooded adult in a plain gray community workshop jacket carrying stacked pizza boxes toward a black service van, face not visible, damaged side entrance in the background, realistic municipal street lighting, no masks, no martial arts imagery, no logos, no readable license plate, grounded documentary style.

## 2. people/orest-chernov.webp

- Назначение: Оригинальный портрет Ореста Чернова
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Illustrated archival claimant ID portrait matching the existing game's character-card style: Russian male small-business owner, 48 years old, neat dark jacket over a casual shirt, self-assured tense expression, ordinary short hair, neutral office-photo background, realistic proportions, original face, no armor, no masks, no spikes, no martial arts or franchise imagery, no text, no logo.

## 3. assets/interactive/ev-delivery-receipt-master-a.webp

- Назначение: Цельный мастер пломбы или контрольного фрагмента A
- Разрешение: 1400×500
- Формат: WebP
- Прозрачность: да
- Создаёт: image_model
- Ручная постобработка: Убрать случайный текст; сохранить альфа-канал; разрезать процедурно по sourceSeed.

### Prompt

Create a realistic intact security seal or evidence control label for a fictional insurance investigation. Нейтральная бумажная контрольная лента для коробок с абстрактным серийным узором, без названия пиццерии. Front view, full object, transparent background, detailed fibers, adhesive or polymer texture, abstract protection pattern, no real logo or brand, no watermark, no critical readable text, restrained utilitarian evidence style. Keep edges suitable for procedural tearing.

## 4. assets/interactive/ev-delivery-receipt-fragments.json

- Назначение: Seed разрыва, трансформации и допуски
- Разрешение: normalized component space
- Формат: JSON
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: Сгенерировать fragment-a.webp и fragment-b.webp из master-файлов; проверить drag/rotate/snap.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.
