# Все промпты ассетов кампании 1–50

Сводный файл включает сюжетные замены и новые интерактивные ассеты. Файлы с generatedBy=frontend не отправлять в генератор изображений.

## Shared surface assets

# Shared-ассеты surface_reveal

Эти файлы создаются один раз и переиспользуются всеми делами. Для текущих пяти дел обязательны `dirt.webp`, `soot.webp`, `frost.webp` и `cloth-cursor.svg`; остальные подготовлены для масштабирования механики.

| Файл | Назначение | Размер | Формат | Способ создания |
|---|---|---|---|---|
| shared/surface/dust.webp | Универсальная мягкая пыль | 1024×1024 seamless | WebP | frontend |
| shared/surface/dust-heavy.webp | Плотная старая пыль | 1024×1024 seamless | WebP | frontend |
| shared/surface/condensation.webp | Конденсат на стекле | 1024×1024 seamless | WebP | frontend |
| shared/surface/soot.webp | Копоть | 1024×1024 seamless | WebP | frontend |
| shared/surface/dirt.webp | Засохшая грязь | 1024×1024 seamless | WebP | frontend |
| shared/surface/frost.webp | Иней | 1024×1024 seamless | WebP | frontend |
| shared/surface/sand.webp | Мелкий песок | 1024×1024 seamless | WebP | frontend |
| shared/surface/powder-dark.webp | Тёмный проявляющий порошок | 1024×1024 seamless | WebP | frontend |
| shared/surface/powder-light.webp | Светлый проявляющий порошок | 1024×1024 seamless | WebP | frontend |
| shared/surface/brush-cursor.svg | Кисть для пыли и песка | 64×64 viewBox | SVG | frontend |
| shared/surface/cloth-cursor.svg | Салфетка для грязи, копоти, инея и конденсата | 64×64 viewBox | SVG | frontend |
| shared/surface/flashlight-cursor.svg | Источник бокового света для будущего light_reveal | 64×64 viewBox | SVG | frontend |

## Требования

- Текстуры бесшовные, с alpha-каналом и без смысловых следов.
- Следы, царапины, номера и отпечатки принадлежат reveal masks конкретного дела, а не shared texture.
- Текстуры предпочтительно создавать воспроизводимым Canvas-скриптом с seed и экспортировать в WebP.
- На low-end мобильном устройстве разрешается procedural Canvas без предварительного растра, если это быстрее по памяти.

## shared/surface/dust.webp

Многомасштабный Canvas noise тёплого серо-бежевого цвета, мягкие неоднородные alpha-пятна, бесшовный tile.

## shared/surface/dust-heavy.webp

Контрастный вариант dust с редкими крупными частицами, без заметного повторяющегося паттерна.

## shared/surface/condensation.webp

Полупрозрачный молочный слой с низкочастотным noise и редкими мягкими каплями, без готовых следов пальцев.

## shared/surface/soot.webp

Чёрно-серый alpha noise с мягкими краями и локальными неоднородностями, не перекрывающий сцену полностью.

## shared/surface/dirt.webp

Серо-коричневые полупрозрачные разводы и мелкая зернистость на alpha-канале, без направленных следов.

## shared/surface/frost.webp

Белый полупрозрачный fractal noise с мелкими кристаллическими краями, без запечённых царапин.

## shared/surface/sand.webp

Тёплая зернистая tile-текстура с мягкими вариациями плотности, без крупных камней.

## shared/surface/powder-dark.webp

Нейтральный тёмный мелкодисперсный noise для режима apply, прозрачный фон.

## shared/surface/powder-light.webp

Нейтральный светлый мелкодисперсный noise для тёмных поверхностей, прозрачный фон.

## shared/surface/brush-cursor.svg

Простой служебный курсор в бумажно-архивной стилистике, крупный читаемый силуэт, currentColor, без брендов и декоративной перегрузки.

## shared/surface/cloth-cursor.svg

Простой служебный курсор в бумажно-архивной стилистике, крупный читаемый силуэт, currentColor, без брендов и декоративной перегрузки.

## shared/surface/flashlight-cursor.svg

Простой служебный курсор в бумажно-архивной стилистике, крупный читаемый силуэт, currentColor, без брендов и декоративной перегрузки.


## Дело 1. Телевизор, переживший потоп

# Ассеты для дела 1. Телевизор, переживший потоп

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. assets/interactive/ev-scene-scene.webp

- Назначение: Обычная фотография места для процедурной тепловой карты
- Разрешение: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: Проверить, что ключевые объекты не перекрыты и совпадают с координатами heatZones.

### Prompt

Телевизор в слегка подтопленной гостиной, сухой корпус, задняя панель хорошо читается, без видимого изображения на экране. The thermal anomaly will be added programmatically. Do not add thermal colors, hot spots, infrared HUD or temperature labels. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.

## 2. assets/interactive/ev-scene-heat-zones.json

- Назначение: Процедурные маски, температуры и подписи
- Разрешение: normalized percent coordinates
- Формат: JSON
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: Откалибровать зоны после утверждения изображения.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.


## Дело 2. Пожар без виновного

# Ассеты для дела 2. Пожар без виновного

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## Новые файлы

Новые растровые ассеты не обязательны. Существующие изображения сохранить только после сверки с новым сюжетом и IP-чеклистом.


## Дело 3. Телефон со дна озера

# Ассеты для дела 3. Телефон со дна озера

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. assets/interactive/ev-service-act-base.webp

- Назначение: Базовая версия документа в normal-режиме
- Разрешение: 1600×1100
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: Удалить случайный читаемый текст; выровнять документ; оставить поля для UI-слоёв.

### Prompt

Create a realistic fictional administrative document for an insurance detective game. Фиктивный акт ремонта смартфона с крупным полем IMEI, датой и зоной подписи; весь важный текст накладывается UI. Full document visible from above, utilitarian layout, paper texture, large blank structured fields. No real organization, logo, brand, personal data or watermark. Do not render critical readable text; dates, names, codes and signatures will be added in HTML/SVG. The hidden anomaly must not be obvious in the normal version.

## 2. assets/interactive/ev-service-act-scan-overlay.svg

- Назначение: Совмещённый слой УФ/просвета/бокового света
- Разрешение: viewBox 0 0 100 100
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: После финального base.webp откалибровать hotspot и режим проявления.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.


## Дело 4. Часы в желудке

# Ассеты для дела 4. Часы в желудке

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. evidence/case-003-xray-baron.webp

- Назначение: Рентген Барона с часами
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Veterinary X-ray of a French bulldog torso, clearly showing a wristwatch-shaped metallic object inside the stomach, with a small ball and a fragment of fabric also visible, medically plausible anatomy, monochrome diagnostic radiograph, documentary veterinary evidence, no text, no patient name, no logos, no watermark.


## Дело 5. Кольцо на высоте

# Ассеты для дела 5. Кольцо на высоте

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. evidence/case-018-drone-ring-raccoon.webp

- Назначение: Кадр дрона с кольцом и Жориком
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Night security camera frame near an apartment balcony: a small civilian quadcopter climbing away from the railing, a plain gold ring visibly caught on one landing strut, a raccoon hanging from the lower frame with both paws, realistic scale and physics, slightly compressed CCTV image, timestamp area left blank, no text, no brands, no costumes, no cartoon styling.


## Дело 6. Сорок пропавших пицц

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


## Дело 7. Корова над помидорами

# Ассеты для дела 7. Корова над помидорами

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. evidence/case-004-damaged-greenhouse.webp

- Назначение: Повреждённая теплица после падения коровы
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Realistic insurance evidence photograph of a damaged farm greenhouse after a large cow fell through the lightweight roof, roof panels bent downward, broken irrigation pipes and crushed tomato plants, the cow already safely removed, hoof marks and scattered hay nearby, plausible structural damage, natural morning light, no comically cow-shaped hole, no text or watermark.

## 2. assets/interactive/ev-tracks-scene.webp

- Назначение: Фотография с одной геометрически читаемой тенью
- Разрешение: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: Отбраковать конфликтующие тени; вручную сверить origin и фактический диапазон.

### Prompt

Фермерский двор, непрерывные следы копыт, рассыпанные тюки, один вертикальный заборный столб и чёткая утренняя тень. One dominant vertical reference object with its base fully visible, one clear physically connected shadow on a level surface, single sunlight direction, minimal other shadows and reflections, free overlay space. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.

## 3. assets/interactive/ev-tracks-shadow-reference.svg

- Назначение: Эталонная тень, управляемая ползунком времени
- Разрешение: viewBox 0 0 100 100
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: Откалибровать angle/length по принятому изображению.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.


## Дело 8. Ночной водитель

# Ассеты для дела 8. Ночной водитель

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. evidence/case-019-mower-remote.webp

- Назначение: Пульт газонокосилки на дереве
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Close documentary evidence photo of a rugged remote control lodged in the fork of a plum tree, small muddy raccoon paw prints on the unlock button and joystick, leaves and fruit around it, realistic wear, natural early-morning light, no readable branding, no text overlay, no watermark.


## Дело 9. Прорыв под «Маяком»

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


## Дело 10. Полтергейст вышел в эфир

# Ассеты для дела 10. Полтергейст вышел в эфир

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. assets/interactive/ev-17k-scan-base.webp

- Назначение: Базовая версия документа в normal-режиме
- Разрешение: 1600×1100
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: Удалить случайный читаемый текст; выровнять документ; оставить поля для UI-слоёв.

### Prompt

Create a realistic fictional administrative document for an insurance detective game. Служебный страховой формуляр без читаемого текста, с крупным нижним колонтитулом и участком бумажной корректировки. Full document visible from above, utilitarian layout, paper texture, large blank structured fields. No real organization, logo, brand, personal data or watermark. Do not render critical readable text; dates, names, codes and signatures will be added in HTML/SVG. The hidden anomaly must not be obvious in the normal version.

## 2. assets/interactive/ev-17k-scan-scan-overlay.svg

- Назначение: Совмещённый слой УФ/просвета/бокового света
- Разрешение: viewBox 0 0 100 100
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: После финального base.webp откалибровать hotspot и режим проявления.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.


## Дело 11. Погреб, который не нагрелся

# Ассеты для дела 11. Погреб, который не нагрелся

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## Новые файлы

Новые растровые ассеты не обязательны. Существующие изображения сохранить только после сверки с новым сюжетом и IP-чеклистом.


## Дело 12. Три месяца в постели

# Ассеты для дела 12. Три месяца в постели

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. assets/interactive/ev-sickleave-base.webp

- Назначение: Базовая версия документа в normal-режиме
- Разрешение: 1600×1100
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: Удалить случайный читаемый текст; выровнять документ; оставить поля для UI-слоёв.

### Prompt

Create a realistic fictional administrative document for an insurance detective game. Фиктивный медицинский бланк без реальных учреждений, крупная строка режима труда, важный текст только UI. Full document visible from above, utilitarian layout, paper texture, large blank structured fields. No real organization, logo, brand, personal data or watermark. Do not render critical readable text; dates, names, codes and signatures will be added in HTML/SVG. The hidden anomaly must not be obvious in the normal version.

## 2. assets/interactive/ev-sickleave-scan-overlay.svg

- Назначение: Совмещённый слой УФ/просвета/бокового света
- Разрешение: viewBox 0 0 100 100
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: После финального base.webp откалибровать hotspot и режим проявления.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.


## Дело 13. Двадцать две секунды на красном

# Ассеты для дела 13. Двадцать две секунды на красном

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## Новые файлы

Новые растровые ассеты не обязательны. Существующие изображения сохранить только после сверки с новым сюжетом и IP-чеклистом.


## Дело 14. Дом без взломщика

# Ассеты для дела 14. Дом без взломщика

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## Новые файлы

Новые растровые ассеты не обязательны. Существующие изображения сохранить только после сверки с новым сюжетом и IP-чеклистом.


## Дело 15. Право на время

# Ассеты для дела 15. Право на время

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## Новые файлы

Новые растровые ассеты не обязательны. Существующие изображения сохранить только после сверки с новым сюжетом и IP-чеклистом.


## Дело 16. Белая полоса над полем

# Ассеты для дела 16. Белая полоса над полем

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. evidence/case-014-ev-satellite.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Documentary agricultural satellite or high-altitude survey image of a large wheat field after a narrow hailstorm, a distinct pale damaged strip crossing otherwise healthy green-gold crops, realistic field boundaries and tractor lines, neutral evidence style, no labels, no text, no watermark.

## 2. assets/interactive/ev-satellite-scene.webp

- Назначение: Фотография с одной геометрически читаемой тенью
- Разрешение: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: Отбраковать конфликтующие тени; вручную сверить origin и фактический диапазон.

### Prompt

Пшеничное поле с узкой полосой свежего градового повреждения, один межевой столб с чёткой тенью, ровный горизонт. One dominant vertical reference object with its base fully visible, one clear physically connected shadow on a level surface, single sunlight direction, minimal other shadows and reflections, free overlay space. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.

## 3. assets/interactive/ev-satellite-shadow-reference.svg

- Назначение: Эталонная тень, управляемая ползунком времени
- Разрешение: viewBox 0 0 100 100
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: Откалибровать angle/length по принятому изображению.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.


## Дело 17. Не та яхта

# Ассеты для дела 17. Не та яхта

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. evidence/case-015-ev-hull.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Marine insurance evidence photo of a recovered broken fiberglass hull fragment from a small recreational motorboat on a wet dock, a clean rectangular manufacturer serial plate area visible but without readable text, storm residue and rescue ropes, realistic documentary photography, no logos, no watermark.

## 2. evidence/case-015-ev-transport.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Night industrial gate security camera frame showing an intact mid-size motor yacht secured on a road trailer entering a warehouse complex, towing vehicle and gate barrier visible, utilitarian lighting, no readable signs or license plates, realistic CCTV compression, no logos, no watermark.

## 3. assets/interactive/ev-hull-master-a.webp

- Назначение: Цельный мастер пломбы или контрольного фрагмента A
- Разрешение: 1400×500
- Формат: WebP
- Прозрачность: да
- Создаёт: image_model
- Ручная постобработка: Убрать случайный текст; сохранить альфа-канал; разрезать процедурно по sourceSeed.

### Prompt

Create a realistic intact security seal or evidence control label for a fictional insurance investigation. Два образца защитной композитной полосы морского корпуса с вымышленным микропаттерном, следы воды и соли. Front view, full object, transparent background, detailed fibers, adhesive or polymer texture, abstract protection pattern, no real logo or brand, no watermark, no critical readable text, restrained utilitarian evidence style. Keep edges suitable for procedural tearing.

## 4. assets/interactive/ev-hull-master-b.webp

- Назначение: Второй цельный мастер для заведомо несовпадающего фрагмента B
- Разрешение: 1400×500
- Формат: WebP
- Прозрачность: да
- Создаёт: image_model
- Ручная постобработка: Убрать случайный текст; сохранить альфа-канал; разрезать процедурно по sourceSeed.

### Prompt

Create a realistic intact security seal or evidence control label for a fictional insurance investigation. Два образца защитной композитной полосы морского корпуса с вымышленным микропаттерном, следы воды и соли. Front view, full object, transparent background, detailed fibers, adhesive or polymer texture, abstract protection pattern, no real logo or brand, no watermark, no critical readable text, restrained utilitarian evidence style. Keep edges suitable for procedural tearing. Create a clearly different microscopic protection pattern and fiber layout while keeping the same general material family.

## 5. assets/interactive/ev-hull-fragments.json

- Назначение: Seed разрыва, трансформации и допуски
- Разрешение: normalized component space
- Формат: JSON
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: Сгенерировать fragment-a.webp и fragment-b.webp из master-файлов; проверить drag/rotate/snap.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.


## Дело 18. Четыре дня без магазина

# Ассеты для дела 18. Четыре дня без магазина

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. assets/interactive/ev-photos-scene.webp

- Назначение: Базовая поверхность со скрытым физическим следом, без процедурного покрытия
- Разрешение: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: Проверить плоский читаемый ракурс; удалить случайный текст; откалибровать каждую reveal mask по финальной сцене.

### Prompt

Нижняя торцевая панель магазинного стеллажа и часть пола после откачки воды; чёткая физическая граница высоты затопления и мокрый низ, но без процедурной грязи и разводов поверх изображения. The dust, dirt, soot, frost, condensation or powder cover will be added programmatically, so do not bake the cover layer into the image. Keep the important surface large, readable and minimally distorted. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.

## 2. assets/interactive/ev-photos-waterline-trace-mask.svg

- Назначение: Маска скрытого следа: Граница высоты воды
- Разрешение: 1600×1000 aligned to base image
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: Совместить с base image; порог обнаружения 52%; белая область маски — значимая зона.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.


## Дело 19. Ботинок на 800 ватт

# Ассеты для дела 19. Ботинок на 800 ватт

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. evidence/case-017-ev-yardcam.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Night home security camera frame through a kitchen window: a raccoon dragging a single leather boot onto a counter beside an open microwave, realistic domestic kitchen, slightly grainy low-light CCTV, no fire yet, no logos, no text, no watermark, natural animal proportions.

## 2. assets/interactive/ev-photo-scene.webp

- Назначение: Обычная фотография места для процедурной тепловой карты
- Разрешение: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: Проверить, что ключевые объекты не перекрыты и совпадают с координатами heatZones.

### Prompt

Небольшая бытовая кухня после локального задымления, компактный прибор на столешнице, окно и следы лап без лиц. The thermal anomaly will be added programmatically. Do not add thermal colors, hot spots, infrared HUD or temperature labels. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.

## 3. assets/interactive/ev-photo-heat-zones.json

- Назначение: Процедурные маски, температуры и подписи
- Разрешение: normalized percent coordinates
- Формат: JSON
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: Откалибровать зоны после утверждения изображения.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.


## Дело 20. Погром в «Компасе»

# Ассеты для дела 20. Погром в «Компасе»

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. people/mikhail-ternov.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Illustrated archival claimant ID portrait matching an established insurance detective game: Russian male restoration craftsman, 69 years old, thoughtful lined face, gray hair, simple dark cardigan and light work shirt, calm dignity, neutral document-photo background, original appearance, no martial arts clothing, no franchise imagery, no text or logo.

## 2. evidence/case-022-ev-workshop.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Documentary insurance evidence photograph inside a small navigation-instrument restoration workshop after a real burglary: broken glass display cases, overturned wooden cabinet, empty padded stand for a brass marine chronometer, scattered archival papers and precision tools, realistic restrained damage, no dojo, no weapons, no logos, no readable text, no watermark.

## 3. evidence/case-022-ev-cctv.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Night pharmacy exterior CCTV frame looking toward a service courtyard: two adult burglars in plain dark work clothes carrying a flat archive box and a small hard case toward an unmarked gray van, faces indistinct, realistic municipal lighting and CCTV compression, no masks with colors, no logos, no text, no watermark.

## 4. assets/interactive/ev-fragment-base.webp

- Назначение: Базовая версия документа в normal-режиме
- Разрешение: 1600×1100
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: Удалить случайный читаемый текст; выровнять документ; оставить поля для UI-слоёв.

### Prompt

Create a realistic fictional administrative document for an insurance detective game. Старый лист страхового реестра с потёртой бумагой, пустой зоной резолюции и следами ластика; текст программный. Full document visible from above, utilitarian layout, paper texture, large blank structured fields. No real organization, logo, brand, personal data or watermark. Do not render critical readable text; dates, names, codes and signatures will be added in HTML/SVG. The hidden anomaly must not be obvious in the normal version.

## 5. assets/interactive/ev-fragment-scan-overlay.svg

- Назначение: Совмещённый слой УФ/просвета/бокового света
- Разрешение: viewBox 0 0 100 100
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: После финального base.webp откалибровать hotspot и режим проявления.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.


## Дело 21. Карта, оставшаяся дома

# Ассеты для дела 21. Карта, оставшаяся дома

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. people/rustam-nazarov.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Illustrated archival claimant ID portrait matching the existing insurance detective game: Bashkir or Tatar male, 38 years old, short dark hair, travel-casual jacket, controlled but slightly evasive expression, neutral document-photo background, original face distinct from all other claimants, no logos, no text, no watermark.

## 2. evidence/case-023-ev-doorcam.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Evening smart doorbell security frame outside an apartment entrance: one adult man discreetly handing a small plain envelope to another adult man, both dressed normally, faces not clearly readable, realistic residential lighting, documentary CCTV compression, no text, no logos, no watermark.


## Дело 22. Звонок в 17:41

# Ассеты для дела 22. Звонок в 17:41

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## Новые файлы

Новые растровые ассеты не обязательны. Существующие изображения сохранить только после сверки с новым сюжетом и IP-чеклистом.


## Дело 23. Последний кофе перед пожаром

# Ассеты для дела 23. Последний кофе перед пожаром

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. assets/interactive/ev-fire-scene.webp

- Назначение: Базовая поверхность со скрытым физическим следом, без процедурного покрытия
- Разрешение: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: Проверить плоский читаемый ракурс; удалить случайный текст; откалибровать каждую reveal mask по финальной сцене.

### Prompt

Крупный документальный снимок металлического блока питания кофемашины после небольшого пожара; локальный кратер электрической дуги и оплавление изнутри наружу, без процедурного слоя копоти. The dust, dirt, soot, frost, condensation or powder cover will be added programmatically, so do not bake the cover layer into the image. Keep the important surface large, readable and minimally distorted. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.

## 2. assets/interactive/ev-fire-internal_arc-trace-mask.svg

- Назначение: Маска скрытого следа: Локальный след электрической дуги
- Разрешение: 1600×1000 aligned to base image
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: Совместить с base image; порог обнаружения 58%; белая область маски — значимая зона.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.


## Дело 24. Часы после кражи

# Ассеты для дела 24. Часы после кражи

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. people/eduard-kravets.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Illustrated archival claimant ID portrait matching the existing insurance detective game: European male watch collector, 50 years old, carefully groomed hair, understated expensive jacket, composed self-assured expression, neutral document-photo background, original face distinct from Eduard Vinogradov, no real brands, no text, no watermark.

## 2. evidence/case-026-ev-photo.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Candid documentary event photograph of a middle-aged man at a private reception, only torso and wrist emphasized, wearing a distinctive unbranded mechanical wristwatch with a small diagonal scratch on the case, neutral upscale interior, no readable faces required, no logos, no watermark.

## 3. assets/interactive/ev-auction-base.webp

- Назначение: Базовая версия документа в normal-режиме
- Разрешение: 1600×1100
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: Удалить случайный читаемый текст; выровнять документ; оставить поля для UI-слоёв.

### Prompt

Create a realistic fictional administrative document for an insurance detective game. Нейтральный акт приёма коллекционных часов, крупное поле даты и серийного номера, без логотипа аукциона. Full document visible from above, utilitarian layout, paper texture, large blank structured fields. No real organization, logo, brand, personal data or watermark. Do not render critical readable text; dates, names, codes and signatures will be added in HTML/SVG. The hidden anomaly must not be obvious in the normal version.

## 4. assets/interactive/ev-auction-scan-overlay.svg

- Назначение: Совмещённый слой УФ/просвета/бокового света
- Разрешение: viewBox 0 0 100 100
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: После финального base.webp откалибровать hotspot и режим проявления.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.


## Дело 25. Семена после ливня

# Ассеты для дела 25. Семена после ливня

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. evidence/case-027-ev-photo.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Realistic insurance evidence photo inside a flooded agricultural storage unit: lower seed sacks visibly wet up to a consistent 30 centimeter waterline, upper shelves and bags dry, muddy floor and drainage water, restrained natural lighting, no readable brands, no text, no watermark.

## 2. assets/interactive/ev-photo-scene.webp

- Назначение: Фотография с одной геометрически читаемой тенью
- Разрешение: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: Отбраковать конфликтующие тени; вручную сверить origin и фактический диапазон.

### Prompt

Склад семян после подтопления, мокрые нижние стеллажи, открытые ворота, одна вертикальная стойка и чёткая тень. One dominant vertical reference object with its base fully visible, one clear physically connected shadow on a level surface, single sunlight direction, minimal other shadows and reflections, free overlay space. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.

## 3. assets/interactive/ev-photo-shadow-reference.svg

- Назначение: Эталонная тень, управляемая ползунком времени
- Разрешение: viewBox 0 0 100 100
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: Откалибровать angle/length по принятому изображению.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.


## Дело 26. Склад без товара

# Ассеты для дела 26. Склад без товара

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. evidence/case-028-ev-cam.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Night warehouse loading-dock CCTV frame: sealed pallets being loaded into three ordinary cargo trucks while a middle-aged owner signs a clipboard nearby, warehouse still intact, realistic industrial lighting, no readable company names or plates, no logos, no watermark.

## 2. assets/interactive/ev-cam-master-a.webp

- Назначение: Цельный мастер пломбы или контрольного фрагмента A
- Разрешение: 1400×500
- Формат: WebP
- Прозрачность: да
- Создаёт: image_model
- Ручная постобработка: Убрать случайный текст; сохранить альфа-канал; разрезать процедурно по sourceSeed.

### Prompt

Create a realistic intact security seal or evidence control label for a fictional insurance investigation. Промышленная бумажно-полимерная пломба палеты с абстрактной сеткой и вымышленной нумерацией. Front view, full object, transparent background, detailed fibers, adhesive or polymer texture, abstract protection pattern, no real logo or brand, no watermark, no critical readable text, restrained utilitarian evidence style. Keep edges suitable for procedural tearing.

## 3. assets/interactive/ev-cam-fragments.json

- Назначение: Seed разрыва, трансформации и допуски
- Разрешение: normalized component space
- Формат: JSON
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: Сгенерировать fragment-a.webp и fragment-b.webp из master-файлов; проверить drag/rotate/snap.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.


## Дело 27. Разряд через весь дом

# Ассеты для дела 27. Разряд через весь дом

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. evidence/case-029-ev-panel.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Close documentary insurance photo of a residential electrical panel after a lightning surge, a surge protector visibly arc-scorched and slightly melted from the incoming line direction, realistic wiring and restrained damage, no readable labels, no logos, no watermark.

## 2. assets/interactive/ev-photo-scene.webp

- Назначение: Обычная фотография места для процедурной тепловой карты
- Разрешение: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: Проверить, что ключевые объекты не перекрыты и совпадают с координатами heatZones.

### Prompt

Открытый бытовой электрощит после аварии, целые автоматы и один визуально нейтральный вводный кабель, без цветной подсветки. The thermal anomaly will be added programmatically. Do not add thermal colors, hot spots, infrared HUD or temperature labels. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.

## 3. assets/interactive/ev-photo-heat-zones.json

- Назначение: Процедурные маски, температуры и подписи
- Разрешение: normalized percent coordinates
- Формат: JSON
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: Откалибровать зоны после утверждения изображения.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.


## Дело 28. Столкновение ради пломбы

# Ассеты для дела 28. Столкновение ради пломбы

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. people/dejan-markovich.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Illustrated archival claimant ID portrait matching the existing insurance detective game: Balkan male driver, 44 years old, sturdy build, short dark hair with early gray, guarded practical expression, plain street jacket, neutral document-photo background, original face distinct from Dejan Kovac, no logos, no text, no watermark.

## 2. evidence/case-030-ev-sealcam.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Roadside shop security camera frame during a minor traffic accident: while two drivers stand near the front vehicles, a third adult discreetly replaces a cargo seal on the rear door of a delivery van and carries a small hard container toward a car trunk, realistic distance and CCTV compression, no readable plates, no logos, no watermark.

## 3. assets/interactive/ev-sealcam-master-a.webp

- Назначение: Цельный мастер пломбы или контрольного фрагмента A
- Разрешение: 1400×500
- Формат: WebP
- Прозрачность: да
- Создаёт: image_model
- Ручная постобработка: Убрать случайный текст; сохранить альфа-канал; разрезать процедурно по sourceSeed.

### Prompt

Create a realistic intact security seal or evidence control label for a fictional insurance investigation. Две промышленно-защитные наклейки грузовой двери с абстрактной графикой, прозрачный фон, без бренда. Front view, full object, transparent background, detailed fibers, adhesive or polymer texture, abstract protection pattern, no real logo or brand, no watermark, no critical readable text, restrained utilitarian evidence style. Keep edges suitable for procedural tearing.

## 4. assets/interactive/ev-sealcam-master-b.webp

- Назначение: Второй цельный мастер для заведомо несовпадающего фрагмента B
- Разрешение: 1400×500
- Формат: WebP
- Прозрачность: да
- Создаёт: image_model
- Ручная постобработка: Убрать случайный текст; сохранить альфа-канал; разрезать процедурно по sourceSeed.

### Prompt

Create a realistic intact security seal or evidence control label for a fictional insurance investigation. Две промышленно-защитные наклейки грузовой двери с абстрактной графикой, прозрачный фон, без бренда. Front view, full object, transparent background, detailed fibers, adhesive or polymer texture, abstract protection pattern, no real logo or brand, no watermark, no critical readable text, restrained utilitarian evidence style. Keep edges suitable for procedural tearing. Create a clearly different microscopic protection pattern and fiber layout while keeping the same general material family.

## 5. assets/interactive/ev-sealcam-fragments.json

- Назначение: Seed разрыва, трансформации и допуски
- Разрешение: normalized component space
- Формат: JSON
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: Сгенерировать fragment-a.webp и fragment-b.webp из master-файлов; проверить drag/rotate/snap.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.


## Дело 29. Двадцать минут льда

# Ассеты для дела 29. Двадцать минут льда

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. evidence/case-031-ev-antenna.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Close documentary evidence photo of a greenhouse exterior sensor antenna knocked sideways by a large hail impact, fresh dent and severed cable visible, hailstones scattered on the ground, realistic storm aftermath, no readable labels, no logos, no watermark.


## Дело 30. Внедорожник за воротами

# Ассеты для дела 30. Внедорожник за воротами

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. evidence/case-032-ev-yardphoto.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Long-lens investigative evidence photograph inside a restricted industrial warehouse yard: gray unbranded cargo containers arranged near a dismantling bay, parts from a dark SUV and sealed pallets visible, a small blank stencil area reserved for UI-applied code GC-17, realistic surveillance perspective, muted colors, no readable text, no logos, no watermark.

## 2. evidence/case-032-ev-cam.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Night gate CCTV frame showing a middle-aged man calmly driving a dark SUV into a restricted warehouse sector and presenting a pass to a guard, no struggle, realistic security lighting, faces not detailed, no readable signs or plates, no logos, no watermark.

## 3. assets/interactive/ev-police-base.webp

- Назначение: Базовая версия документа в normal-режиме
- Разрешение: 1600×1100
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: Удалить случайный читаемый текст; выровнять документ; оставить поля для UI-слоёв.

### Prompt

Create a realistic fictional administrative document for an insurance detective game. Фиктивный полицейский бланк без гербов и реальных ведомств, крупный список ключей, фактура стёртой карандашной строки. Full document visible from above, utilitarian layout, paper texture, large blank structured fields. No real organization, logo, brand, personal data or watermark. Do not render critical readable text; dates, names, codes and signatures will be added in HTML/SVG. The hidden anomaly must not be obvious in the normal version.

## 4. assets/interactive/ev-police-scan-overlay.svg

- Назначение: Совмещённый слой УФ/просвета/бокового света
- Разрешение: viewBox 0 0 100 100
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: После финального base.webp откалибровать hotspot и режим проявления.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.


## Дело 31. Рука в прессе

# Ассеты для дела 31. Рука в прессе

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. people/gennady-orlov.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Illustrated archival claimant ID portrait matching the existing insurance detective game: Russian male factory press operator, 49 years old, practical work jacket over a plain shirt, tired but direct expression, short brown-gray hair, neutral document-photo background, original face distinct from Gennady Bublikov, no injury gore, no logos, no text, no watermark.

## 2. evidence/case-033-ev-relay.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Forensic industrial evidence photo of a removed safety relay from a stamping press beside a certified reference relay, externally similar but the failed unit has heat-darkened stuck contacts and rough internal construction, neutral lab table, blank label areas for UI text, no brands, no watermark.

## 3. assets/interactive/ev-relay-master-a.webp

- Назначение: Цельный мастер пломбы или контрольного фрагмента A
- Разрешение: 1400×500
- Формат: WebP
- Прозрачность: да
- Создаёт: image_model
- Ручная постобработка: Убрать случайный текст; сохранить альфа-канал; разрезать процедурно по sourceSeed.

### Prompt

Create a realistic intact security seal or evidence control label for a fictional insurance investigation. Миниатюрные гарантийные наклейки промышленного реле с абстрактной микроперфорацией, без реальных сертификационных знаков. Front view, full object, transparent background, detailed fibers, adhesive or polymer texture, abstract protection pattern, no real logo or brand, no watermark, no critical readable text, restrained utilitarian evidence style. Keep edges suitable for procedural tearing.

## 4. assets/interactive/ev-relay-master-b.webp

- Назначение: Второй цельный мастер для заведомо несовпадающего фрагмента B
- Разрешение: 1400×500
- Формат: WebP
- Прозрачность: да
- Создаёт: image_model
- Ручная постобработка: Убрать случайный текст; сохранить альфа-канал; разрезать процедурно по sourceSeed.

### Prompt

Create a realistic intact security seal or evidence control label for a fictional insurance investigation. Миниатюрные гарантийные наклейки промышленного реле с абстрактной микроперфорацией, без реальных сертификационных знаков. Front view, full object, transparent background, detailed fibers, adhesive or polymer texture, abstract protection pattern, no real logo or brand, no watermark, no critical readable text, restrained utilitarian evidence style. Keep edges suitable for procedural tearing. Create a clearly different microscopic protection pattern and fiber layout while keeping the same general material family.

## 5. assets/interactive/ev-relay-fragments.json

- Назначение: Seed разрыва, трансформации и допуски
- Разрешение: normalized component space
- Формат: JSON
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: Сгенерировать fragment-a.webp и fragment-b.webp из master-файлов; проверить drag/rotate/snap.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.


## Дело 32. Серийные номера в пепле

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


## Дело 33. Следы шин в «Янтаре»

# Ассеты для дела 33. Следы шин в «Янтаре»

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. people/arkady-egorov.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Illustrated archival claimant ID portrait matching the existing insurance detective game: Russian male industrial cleaning company owner, 52 years old, broad face, practical dark work blazer, slightly overconfident expression, neutral document-photo background, original appearance, no uniforms from films or franchises, no logos, no text, no watermark.

## 2. evidence/case-035-ev-tyres.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Documentary hotel insurance evidence photo of dark tire tracks crossing a polished banquet hall parquet floor and passing through a broken lightweight decorative divider, restrained realistic damage, no people, no logos, no text, no supernatural elements, no watermark.


## Дело 34. Невозможная скорость

# Ассеты для дела 34. Невозможная скорость

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. people/maxim-yartsev.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Illustrated archival claimant ID portrait matching the existing insurance detective game: Russian male experimental vehicle engineer, 41 years old, understated technical jacket, attentive analytical expression, short hair, neutral document-photo background, original face, no famous likeness, no futuristic costume, no logos, no text, no watermark.

## 2. evidence/case-036-ev-camera.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Night security camera frame at an outdoor electric vehicle charging bay during a lightning-related grid surge: an experimental but believable electric coupe remains parked, bright electrical arc at the charging connector and first smoke visible, wet pavement, no motion blur, no brands, no text, no watermark.

## 3. assets/interactive/ev-melt-scene.webp

- Назначение: Обычная фотография места для процедурной тепловой карты
- Разрешение: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: Проверить, что ключевые объекты не перекрыты и совпадают с координатами heatZones.

### Prompt

Экспериментальный электромобиль на утилитарной зарядной площадке после грозы, зарядный кабель и порт полностью видны. The thermal anomaly will be added programmatically. Do not add thermal colors, hot spots, infrared HUD or temperature labels. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.

## 4. assets/interactive/ev-melt-heat-zones.json

- Назначение: Процедурные маски, температуры и подписи
- Разрешение: normalized percent coordinates
- Формат: JSON
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: Откалибровать зоны после утверждения изображения.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.


## Дело 35. Три силуэта в контейнере

# Ассеты для дела 35. Три силуэта в контейнере

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. people/denis-korin.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Illustrated archival claimant ID portrait matching the existing insurance detective game: Russian male motorcycle workshop owner and collector, 55 years old, clean casual work shirt, silver-streaked hair, polished self-confident expression, neutral document-photo background, original face, no robot or action-film styling, no logos, no text, no watermark.

## 2. evidence/case-037-ev-xray.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Cargo customs X-ray image of a sealed truck container showing three hollow chrome display mannequins standing upright and one motorcycle secured beside them, unmistakably objects rather than people, realistic monochrome security scan, no text, no logos, no watermark.

## 3. assets/interactive/ev-backup-scene.webp

- Назначение: Фотография с одной геометрически читаемой тенью
- Разрешение: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: Отбраковать конфликтующие тени; вручную сверить origin и фактический диапазон.

### Prompt

Контейнерная площадка: взрослый владелец со спины грузит мотоцикл и три нейтральных демонстрационных манекена, рядом один калибровочный столб с чёткой вечерней тенью; лицо не видно. One dominant vertical reference object with its base fully visible, one clear physically connected shadow on a level surface, single sunlight direction, minimal other shadows and reflections, free overlay space. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.

## 4. assets/interactive/ev-backup-shadow-reference.svg

- Назначение: Эталонная тень, управляемая ползунком времени
- Разрешение: viewBox 0 0 100 100
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: Откалибровать angle/length по принятому изображению.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.


## Дело 36. Лаборатория №394

# Ассеты для дела 36. Лаборатория №394

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. people/anton-lanskoy.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Illustrated archival claimant ID portrait matching the existing insurance detective game: Russian male chemistry teacher, 46 years old, calm intelligent face, simple shirt and practical lab jacket with no badges, neutral document-photo background, original appearance, no magic-school robes, no famous likeness, no logos, no text, no watermark.

## 2. evidence/case-038-ev-camera.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Fixed classroom laboratory security camera frame moments before a contained chemical vessel failure: a middle-aged teacher in safety goggles measures material from a sealed plain container while students stand at safe stations, realistic modern school lab, no magical elements, no visible brands, no readable text, no watermark.

## 3. assets/interactive/ev-analysis-base.webp

- Назначение: Базовая версия документа в normal-режиме
- Разрешение: 1600×1100
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: Удалить случайный читаемый текст; выровнять документ; оставить поля для UI-слоёв.

### Prompt

Create a realistic fictional administrative document for an insurance detective game. Нейтральная этикетка химической тары с крупными пустыми полями кода и партии; без знаков реальных производителей. Full document visible from above, utilitarian layout, paper texture, large blank structured fields. No real organization, logo, brand, personal data or watermark. Do not render critical readable text; dates, names, codes and signatures will be added in HTML/SVG. The hidden anomaly must not be obvious in the normal version.

## 4. assets/interactive/ev-analysis-scan-overlay.svg

- Назначение: Совмещённый слой УФ/просвета/бокового света
- Разрешение: viewBox 0 0 100 100
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: После финального base.webp откалибровать hotspot и режим проявления.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.


## Дело 37. Робот, разобравший солнце

# Ассеты для дела 37. Робот, разобравший солнце

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. people/nikita-voronov.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Illustrated archival claimant ID portrait matching the existing insurance detective game: Russian male renewable-energy entrepreneur, 38 years old, neat field jacket, ambitious tense expression, short dark hair, neutral document-photo background, original face, no superhero or science-fiction costume, no logos, no text, no watermark.

## 2. evidence/case-039-ev-panels.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Dawn forensic evidence photo at a solar farm where rows of panels have been professionally removed: intact connectors, neatly cut mounting points and organized cable ends, no smashed glass, a compact industrial service robot track visible in dust, realistic high-tech agriculture, no logos, no text, no watermark.


## Дело 38. Пожар на «Лунном склоне»

# Ассеты для дела 38. Пожар на «Лунном склоне»

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. people/miron-veil-grounded.webp

- Назначение: generate_if_needed
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Illustrated archival claimant ID portrait matching the existing insurance detective game: male remote mountain farm owner, 52 years old, weathered face, practical insulated work jacket, calm resilient expression, neutral document-photo background, original appearance, no space suit, no futuristic armor, no logos, no text, no watermark.

## 2. evidence/case-040-ev-farm.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Remote high-altitude agricultural complex at night after an arson attack: a modest cargo hangar burning near the service door, terraced fields and irrigation structures under moonlight, realistic mountain environment, no lunar surface, no spacecraft, no sci-fi uniforms, documentary insurance evidence style, no logos, no text, no watermark.

## 3. evidence/case-040-ev-camera.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Grainy mountain road security camera frame at night showing an unmarked gray cargo truck leaving a remote farm, several compact irrigation modules visible in the open rear container, realistic road and scale, no readable plate, no logos, no text, no watermark.

## 4. assets/interactive/ev-photo-master-a.webp

- Назначение: Цельный мастер пломбы или контрольного фрагмента A
- Разрешение: 1400×500
- Формат: WebP
- Прозрачность: да
- Создаёт: image_model
- Ручная постобработка: Убрать случайный текст; сохранить альфа-канал; разрезать процедурно по sourceSeed.

### Prompt

Create a realistic intact security seal or evidence control label for a fictional insurance investigation. Два фрагмента серой промышленной фитильной ленты, один частично обгоревший, абстрактная сетка без маркировки. Front view, full object, transparent background, detailed fibers, adhesive or polymer texture, abstract protection pattern, no real logo or brand, no watermark, no critical readable text, restrained utilitarian evidence style. Keep edges suitable for procedural tearing.

## 5. assets/interactive/ev-photo-fragments.json

- Назначение: Seed разрыва, трансформации и допуски
- Разрешение: normalized component space
- Формат: JSON
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: Сгенерировать fragment-a.webp и fragment-b.webp из master-файлов; проверить drag/rotate/snap.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.


## Дело 39. Перехватчик в ледяном каньоне

# Ассеты для дела 39. Перехватчик в ледяном каньоне

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. people/elian-kord-grounded.webp

- Назначение: generate_if_needed
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Illustrated archival claimant ID portrait matching the existing insurance detective game: male experimental rescue pilot, 27 years old, athletic but tired, practical civilian flight jacket, minor healed facial scrape, guarded expression, neutral document-photo background, no space uniform, no military insignia, no famous likeness, no logos, no text, no watermark.

## 2. evidence/case-041-ev-crash.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Documentary rescue evidence photograph of a crashed experimental high-speed rescue aircraft in an icy mountain canyon, broken composite fuselage and snow debris, several suspicious small holes added over existing fracture lines, realistic aviation scale, no spacecraft, no military insignia, no logos, no text, no watermark.

## 3. assets/interactive/ev-manifest-base.webp

- Назначение: Базовая версия документа в normal-режиме
- Разрешение: 1600×1100
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: Удалить случайный читаемый текст; выровнять документ; оставить поля для UI-слоёв.

### Prompt

Create a realistic fictional administrative document for an insurance detective game. Фиктивная грузовая ведомость экспериментального самолёта, крупные поля массы и маршрута, лёгкие следы копоти. Full document visible from above, utilitarian layout, paper texture, large blank structured fields. No real organization, logo, brand, personal data or watermark. Do not render critical readable text; dates, names, codes and signatures will be added in HTML/SVG. The hidden anomaly must not be obvious in the normal version.

## 4. assets/interactive/ev-manifest-scan-overlay.svg

- Назначение: Совмещённый слой УФ/просвета/бокового света
- Разрешение: viewBox 0 0 100 100
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: После финального base.webp откалибровать hotspot и режим проявления.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.


## Дело 40. Клинок, проданный до кражи

# Ассеты для дела 40. Клинок, проданный до кражи

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. people/selena-orvik-grounded.webp

- Назначение: generate_if_needed
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Illustrated archival claimant ID portrait matching the existing insurance detective game: European female family archive owner, 34 years old, restrained formal jacket, composed aristocratic bearing without costume, cool controlled expression, neutral document-photo background, original face, no fantasy or space-opera styling, no logos, no text, no watermark.

## 2. evidence/case-042-ev-display.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Forensic archive evidence photo of an empty museum display case for a historical seventeenth-century ceremonial sword, intact glass, properly unlocked mechanical lock and undisturbed dust on hinges, restrained private archive interior, no fantasy glow, no sci-fi elements, no logos, no text, no watermark.

## 3. assets/interactive/ev-courier-master-a.webp

- Назначение: Цельный мастер пломбы или контрольного фрагмента A
- Разрешение: 1400×500
- Формат: WebP
- Прозрачность: да
- Создаёт: image_model
- Ручная постобработка: Убрать случайный текст; сохранить альфа-канал; разрезать процедурно по sourceSeed.

### Prompt

Create a realistic intact security seal or evidence control label for a fictional insurance investigation. Бумажный музейный контрольный ярлык с абстрактной рамкой и волокнистым рваным краем, без гербов и логотипов. Front view, full object, transparent background, detailed fibers, adhesive or polymer texture, abstract protection pattern, no real logo or brand, no watermark, no critical readable text, restrained utilitarian evidence style. Keep edges suitable for procedural tearing.

## 4. assets/interactive/ev-courier-fragments.json

- Назначение: Seed разрыва, трансформации и допуски
- Разрешение: normalized component space
- Формат: JSON
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: Сгенерировать fragment-a.webp и fragment-b.webp из master-файлов; проверить drag/rotate/snap.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.


## Дело 41. Стажёр, который ушёл сам

# Ассеты для дела 41. Стажёр, который ушёл сам

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. people/ilar-roun-grounded.webp

- Назначение: generate_if_needed
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Illustrated archival claimant ID portrait matching the existing insurance detective game: male navigation academy mentor, 61 years old, austere intelligent face, gray hair, plain modern academic jacket, controlled authoritative expression, neutral document-photo background, no robes, no mystical symbols, no space-opera costume, no logos, no text, no watermark.

## 2. evidence/case-043-cache-photo.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Documentary evidence photo of a small prepared travel cache hidden behind a bench at a quiet railway platform: compact food pack, folded warm jacket, plain envelope of cash and a printed timetable with no readable text, realistic early-morning light, no sci-fi props, no logos, no watermark.

## 3. assets/interactive/protocol-base.webp

- Назначение: Базовая версия документа в normal-режиме
- Разрешение: 1600×1100
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: Удалить случайный читаемый текст; выровнять документ; оставить поля для UI-слоёв.

### Prompt

Create a realistic fictional administrative document for an insurance detective game. Фиктивный учебный протокол академии без логотипа, таблица оценок с крупной зоной исправлений, текст программный. Full document visible from above, utilitarian layout, paper texture, large blank structured fields. No real organization, logo, brand, personal data or watermark. Do not render critical readable text; dates, names, codes and signatures will be added in HTML/SVG. The hidden anomaly must not be obvious in the normal version.

## 4. assets/interactive/protocol-scan-overlay.svg

- Назначение: Совмещённый слой УФ/просвета/бокового света
- Разрешение: viewBox 0 0 100 100
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: После финального base.webp откалибровать hotspot и режим проявления.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.


## Дело 42. Слишком удобная серая лента

# Ассеты для дела 42. Слишком удобная серая лента

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. people/evelina-morn-grounded.webp

- Назначение: generate_if_needed
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Illustrated archival claimant ID portrait matching the existing insurance detective game: female medicinal greenhouse owner, 49 years old, practical horticultural jacket, carefully composed appearance, tense defensive expression, neutral document-photo background, original face, no magical plants or fantasy costume, no logos, no text, no watermark.

## 2. evidence/case-044-photo-44.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Forensic greenhouse fire evidence photograph: localized burn origin on a metal mixing table with a scorched bowl and heater, surrounding medicinal root beds only smoke-damaged, a short piece of plain gray tape visibly lying on top of settled ash, realistic restrained scene, no magical plants, no logos, no text, no watermark.

## 3. assets/interactive/photo-44-scene.webp

- Назначение: Обычная фотография места для процедурной тепловой карты
- Разрешение: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: Проверить, что ключевые объекты не перекрыты и совпадают с координатами heatZones.

### Prompt

Теплица после небольшого локального пожара, металлическая чаша на рабочем столе, грядки и климатический блок хорошо видны. The thermal anomaly will be added programmatically. Do not add thermal colors, hot spots, infrared HUD or temperature labels. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.

## 4. assets/interactive/photo-44-heat-zones.json

- Назначение: Процедурные маски, температуры и подписи
- Разрешение: normalized percent coordinates
- Формат: JSON
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: Откалибровать зоны после утверждения изображения.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.


## Дело 43. Кубок через верхний люк

# Ассеты для дела 43. Кубок через верхний люк

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. people/bruno-stern-grounded.webp

- Назначение: generate_if_needed
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Illustrated archival claimant ID portrait matching the existing insurance detective game: male museum collections custodian at a navigation academy, 57 years old, neat gray beard, modest vest and shirt, serious conscientious expression, neutral document-photo background, original face, no magical-school uniform, no fantasy symbols, no logos, no text, no watermark.

## 2. evidence/case-045-photo-45.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Close forensic evidence photograph of the upper hinge of a secure museum trophy display case, subtle tool lift mark from above and a small residue of gray industrial polymer on metal, intact lower lock, realistic academy archive setting, no fantasy decoration, no readable text, no watermark.

## 3. evidence/case-045-camera-45.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

High-angle academy gallery security camera frame showing a technician-shaped intruder descending on a safety line from a ceiling service hatch toward a trophy display and lifting a padded case upward, face obscured by angle, realistic modern institution, no magic, no logos, no text, no watermark.


## Дело 44. Падение, которого не было

# Ассеты для дела 44. Падение, которого не было

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. people/nika-rein-grounded.webp

- Назначение: generate_if_needed
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Illustrated archival claimant ID portrait matching the existing insurance detective game: female academy trainee, 18 years old, simple athletic training jacket, guarded ambitious expression, neutral document-photo background, original face, age-appropriate appearance, no fantasy uniform, no franchise color scheme, no logos, no text, no watermark.

## 2. evidence/case-046-photo-46.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Close forensic evidence photo of a cut safety-line inspection seal on a modern training tower lower platform, clean tool cut from the accessible side and a small patch of crude gray paint added afterward, realistic climbing safety equipment, no blood, no fall scene, no logos, no text, no watermark.

## 3. assets/interactive/photo-46-master-a.webp

- Назначение: Цельный мастер пломбы или контрольного фрагмента A
- Разрешение: 1400×500
- Формат: WebP
- Прозрачность: да
- Создаёт: image_model
- Ручная постобработка: Убрать случайный текст; сохранить альфа-канал; разрезать процедурно по sourceSeed.

### Prompt

Create a realistic intact security seal or evidence control label for a fictional insurance investigation. Две серые контрольные ленты: простая окрашенная бытовая и промышленная с внутренней сеткой, прозрачный фон. Front view, full object, transparent background, detailed fibers, adhesive or polymer texture, abstract protection pattern, no real logo or brand, no watermark, no critical readable text, restrained utilitarian evidence style. Keep edges suitable for procedural tearing.

## 4. assets/interactive/photo-46-master-b.webp

- Назначение: Второй цельный мастер для заведомо несовпадающего фрагмента B
- Разрешение: 1400×500
- Формат: WebP
- Прозрачность: да
- Создаёт: image_model
- Ручная постобработка: Убрать случайный текст; сохранить альфа-канал; разрезать процедурно по sourceSeed.

### Prompt

Create a realistic intact security seal or evidence control label for a fictional insurance investigation. Две серые контрольные ленты: простая окрашенная бытовая и промышленная с внутренней сеткой, прозрачный фон. Front view, full object, transparent background, detailed fibers, adhesive or polymer texture, abstract protection pattern, no real logo or brand, no watermark, no critical readable text, restrained utilitarian evidence style. Keep edges suitable for procedural tearing. Create a clearly different microscopic protection pattern and fiber layout while keeping the same general material family.

## 5. assets/interactive/photo-46-fragments.json

- Назначение: Seed разрыва, трансформации и допуски
- Разрешение: normalized component space
- Формат: JSON
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: Сгенерировать fragment-a.webp и fragment-b.webp из master-файлов; проверить drag/rotate/snap.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.


## Дело 45. Ночной свет в общежитии

# Ассеты для дела 45. Ночной свет в общежитии

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. people/adelia-varn.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Illustrated archival claimant ID portrait matching the existing insurance detective game: female navigation academy student, 16 years old, plain modern school jacket, intelligent cautious expression, neutral document-photo background, original age-appropriate face, no makeup glamour, no fantasy robe, no franchise symbols, no logos, no text, no watermark.

## 2. evidence/case-047-camera-47.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Night exterior security camera frame along a modern academy dormitory service ledge: two adult intruders in plain dark workwear near an opened window, one lowering a closed student bag while a disoriented teenage girl is guided carefully, non-graphic, no weapons visible, realistic CCTV, no logos, no text, no watermark.


## Дело 46. Разгром после закрытия

# Ассеты для дела 46. Разгром после закрытия

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. people/marko-lin-grounded.webp

- Назначение: generate_if_needed
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Illustrated archival claimant ID portrait matching the existing insurance detective game: male pizzeria owner, 44 years old, plain dark polo and work jacket, brisk businesslike expression, neutral document-photo background, original face, no masks, no martial arts styling, no franchise color coding, no logos, no text, no watermark.

## 2. evidence/case-048-photo-48.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Close documentary restaurant equipment evidence photo of a heavily dented old tunnel warming cabinet, fresh bent outer panel revealing years of corrosion and an older weld beneath, realistic commercial kitchen, no people, no readable brands, no logos, no text, no watermark.

## 3. assets/interactive/document-48-base.webp

- Назначение: Базовая версия документа в normal-режиме
- Разрешение: 1600×1100
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: Удалить случайный читаемый текст; выровнять документ; оставить поля для UI-слоёв.

### Prompt

Create a realistic fictional administrative document for an insurance detective game. Фиктивный счёт на промышленный тепловой шкаф, крупные поля покупателя и серийного номера, без брендов. Full document visible from above, utilitarian layout, paper texture, large blank structured fields. No real organization, logo, brand, personal data or watermark. Do not render critical readable text; dates, names, codes and signatures will be added in HTML/SVG. The hidden anomaly must not be obvious in the normal version.

## 4. assets/interactive/document-48-scan-overlay.svg

- Назначение: Совмещённый слой УФ/просвета/бокового света
- Разрешение: viewBox 0 0 100 100
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: После финального base.webp откалибровать hotspot и режим проявления.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.


## Дело 47. Контейнер M-7

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


## Дело 48. Огонь в «Компасе»

# Ассеты для дела 48. Огонь в «Компасе»

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. evidence/case-050-photo-50.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Documentary arson evidence photograph at the service door of a navigation-instrument restoration workshop: a charred fuse-like trail clearly runs from the outside yard across the threshold toward a burned archive cabinet, restrained fire damage, realistic old workshop materials, no dojo, no masks, no weapons, no logos, no text, no watermark.

## 2. evidence/case-050-camera-50.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Night alley security camera frame behind a small restoration workshop: two adult arsonists from an unmarked gray van entering a service yard with a plain fuel can and tool case while an elderly craftsman leads a younger apprentice out the front in the distance, non-graphic, realistic CCTV, no logos, no text, no watermark.

## 3. assets/interactive/photo-50-master-a.webp

- Назначение: Цельный мастер пломбы или контрольного фрагмента A
- Разрешение: 1400×500
- Формат: WebP
- Прозрачность: да
- Создаёт: image_model
- Ручная постобработка: Убрать случайный текст; сохранить альфа-канал; разрезать процедурно по sourceSeed.

### Prompt

Create a realistic intact security seal or evidence control label for a fictional insurance investigation. Обгоревший фрагмент промышленной фитильной ленты и чистый контрольный образец с абстрактной внутренней сеткой. Front view, full object, transparent background, detailed fibers, adhesive or polymer texture, abstract protection pattern, no real logo or brand, no watermark, no critical readable text, restrained utilitarian evidence style. Keep edges suitable for procedural tearing.

## 4. assets/interactive/photo-50-fragments.json

- Назначение: Seed разрыва, трансформации и допуски
- Разрешение: normalized component space
- Формат: JSON
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: Сгенерировать fragment-a.webp и fragment-b.webp из master-файлов; проверить drag/rotate/snap.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.


## Дело 49. Последний фургон

# Ассеты для дела 49. Последний фургон

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. people/roman-dray-grounded.webp

- Назначение: generate_if_needed
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Illustrated archival claimant ID portrait matching the existing insurance detective game: male small logistics operator, 33 years old, casual work jacket, alert opportunistic expression, neutral document-photo background, original face, no street-gang or comic styling, no masks, no logos, no text, no watermark.

## 2. evidence/case-051-photo-51.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Rear cargo bay of a delivery van after an alleged hijacking: cargo straps are neatly folded, mounts intact, no signs of struggle or emergency displacement, empty organized fixtures, realistic documentary insurance evidence photograph, no blood, no logos, no readable text, no watermark.

## 3. evidence/case-051-camera-51.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Airport cargo ramp security camera frame showing a young male van owner calmly handing documents to a guard while workers unload boxed street sensors, routine cooperative scene, no weapons or struggle, realistic industrial lighting, no readable badges or signs, no logos, no watermark.

## 4. assets/interactive/photo-staged-van-scene.webp

- Назначение: Фотография с одной геометрически читаемой тенью
- Разрешение: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: Отбраковать конфликтующие тени; вручную сверить origin и фактический диапазон.

### Prompt

Грузовой фургон у нейтральной тоннельной рампы, один сигнальный столб с чёткой дневной тенью, без людей и логотипов. One dominant vertical reference object with its base fully visible, one clear physically connected shadow on a level surface, single sunlight direction, minimal other shadows and reflections, free overlay space. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.

## 5. assets/interactive/photo-staged-van-shadow-reference.svg

- Назначение: Эталонная тень, управляемая ползунком времени
- Разрешение: viewBox 0 0 100 100
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: Откалибровать angle/length по принятому изображению.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.


## Дело 50. Последний чемодан

# Ассеты для дела 50. Последний чемодан

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. people/lucas-ferreira.webp

- Назначение: generate_if_needed
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Illustrated archival claimant ID portrait matching the game's existing character-card style: Portuguese male, 29 years old, family resemblance to an existing honest claimant Mateus Ferreira but clearly a different younger brother, tired guarded expression, casual travel jacket, neutral document-photo background, original face, no logos, no text, no watermark.

## 2. evidence/case-417-ev-garage.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Residential garage security camera frame in the evening: a young adult man opens a hard travel suitcase on a workbench and removes boxed electronics while an older brother watches with concern, a plain gray transport seal on the suitcase, realistic domestic lighting, no readable faces required, no logos, no text, no watermark.

## 3. evidence/case-417-ev-bottom.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Forensic evidence photograph of an opened hard travel suitcase with a carefully constructed false bottom lifted out, revealing an old paper route ledger, a plain former employee ID card with blank text areas, stamped claim templates and handwritten accounting pages, restrained realistic office evidence style, no readable personal data, no logos, no watermark.

## 4. assets/interactive/ev-bottom-base.webp

- Назначение: Базовая версия документа в normal-режиме
- Разрешение: 1600×1100
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: Удалить случайный читаемый текст; выровнять документ; оставить поля для UI-слоёв.

### Prompt

Create a realistic fictional administrative document for an insurance detective game. Старый служебный формуляр страховой проверки с несколькими слоями бумаги, крупной зоной резолюции и архивной фактурой. Full document visible from above, utilitarian layout, paper texture, large blank structured fields. No real organization, logo, brand, personal data or watermark. Do not render critical readable text; dates, names, codes and signatures will be added in HTML/SVG. The hidden anomaly must not be obvious in the normal version.

## 5. assets/interactive/ev-bottom-scan-overlay.svg

- Назначение: Совмещённый слой УФ/просвета/бокового света
- Разрешение: viewBox 0 0 100 100
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: После финального base.webp откалибровать hotspot и режим проявления.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.

## 6. assets/interactive/ev-suitcase-seal-master-a.webp

- Назначение: Цельный мастер пломбы или контрольного фрагмента A
- Разрешение: 1400×500
- Формат: WebP
- Прозрачность: да
- Создаёт: image_model
- Ручная постобработка: Убрать случайный текст; сохранить альфа-канал; разрезать процедурно по sourceSeed.

### Prompt

Create a realistic intact security seal or evidence control label for a fictional insurance investigation. Серая транспортная пломба багажа с оригинальной абстрактной сеткой, без символов авиакомпаний и реальных кодов. Front view, full object, transparent background, detailed fibers, adhesive or polymer texture, abstract protection pattern, no real logo or brand, no watermark, no critical readable text, restrained utilitarian evidence style. Keep edges suitable for procedural tearing.

## 7. assets/interactive/ev-suitcase-seal-fragments.json

- Назначение: Seed разрыва, трансформации и допуски
- Разрешение: normalized component space
- Формат: JSON
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: Сгенерировать fragment-a.webp и fragment-b.webp из master-файлов; проверить drag/rotate/snap.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.

