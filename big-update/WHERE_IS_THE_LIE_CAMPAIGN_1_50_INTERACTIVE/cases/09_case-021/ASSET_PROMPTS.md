# Ассеты для дела 9. Прорыв под «Маяком»

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. evidence/case-021-mayak-workshop.webp

- Назначение: Мастерская «Маяк» после аварии
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Flooded basement robotics workshop after an internal mechanical accident: a municipal utility pipe visibly dented and ruptured from the room side, a blue motorized wheel and a broken metal platform frame lying nearby, scattered hand tools and educational electronics, restrained water damage, realistic cause-and-effect, no gas explosion spectacle, no dojo, no martial arts, no masks, no franchise references, documentary insurance evidence photograph.

## 2. people/lev-sokolov.webp

- Назначение: Оригинальный портрет Льва Аркадьевича Соколова
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Illustrated archival claimant ID portrait matching the existing game's character-card style: Russian male robotics club teacher, 69 years old, kind but tired intelligent face, gray hair, simple cardigan over a checked shirt, neutral ID-photo background, original face, no Asian martial arts styling, no robe, no masks, no franchise imagery, no text, no logo.

## 3. assets/interactive/ev-pipe-photo-scene.webp

- Назначение: Базовая поверхность со скрытым физическим следом, без процедурного покрытия
- Разрешение: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: Проверить плоский читаемый ракурс; удалить случайный текст; откалибровать каждую reveal mask по финальной сцене.

### Prompt

Крупный план вдавленной металлической технической трубы в затопленной мастерской; на краю вмятины видны свежая дугообразная царапина и небольшой перенос синей краски, но без слоя грязи — покрытие будет процедурным. The dust, dirt, soot, frost, condensation or powder cover will be added programmatically, so do not bake the cover layer into the image. Keep the important surface large, readable and minimally distorted. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.

## 4. assets/interactive/ev-pipe-photo-blue_contact_arc-trace-mask.svg

- Назначение: Маска скрытого следа: Синяя краска и дугообразная царапина
- Разрешение: 1600×1000 aligned to base image
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: Совместить с base image; порог обнаружения 54%; белая область маски — значимая зона.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.
