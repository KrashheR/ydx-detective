# Leonardo — промпты для фото-улик

Список промптов для генерации **фотографий-улик** в Leonardo. Проект — «Где ложь? Симулятор
детектива» для Yandex Games.

## Текущее состояние (важно для контекста)

- В самих уликах сейчас **нет ни одной настоящей фотографии**: они рисуются синтетически из текста.
  Портреты заявителей уже лежат в `public/people/*.webp`, а `coverImage`
  (`public/covers/*.svg`) остаются отдельными SVG-обложками дел.
  - улики типа `photo` рендерит `PhotoBody` в `src/components/StampModal.tsx` — это «полароид»
    с серой штриховкой и эмодзи 📷 вместо снимка; игрок читает только текст `content`.
  - `meta.filename` (напр. `IMG_20260314_091402.jpg`) — декоративный фейковый EXIF, файла нет.
- То есть «отсутствие фоток» **уже обработано** (плейсхолдер не ломается). Эти промпты — чтобы
  заменить плейсхолдер реальными снимками. Чтобы их показать, в `PhotoBody` нужно добавить
  поддержку картинки (см. «Как подключить» внизу) — пока этого нет.

## Глобальный стиль (добавляй к каждому промпту)

> **STYLE:** photorealistic insurance-claim evidence photograph, documentary look, shot on a
> phone or compact camera by a non-professional, natural available light, slightly utilitarian
> and unstaged, neutral muted colors, realistic textures, high detail. No text, no captions, no
> watermark, no logos, no readable signage, no visible faces. Photo, not illustration.
>
> **Negative:** illustration, cartoon, 3d render, cgi, neon, glamour, lens flare, text,
> watermark, logo, people faces, oversaturated.

- **Соотношение сторон:** `4:3` (горизонталь) для всех сцен; область снимка на карточке ≈ 5:4.
- **Аэро/дрон-кадры** (`*aerial*`, `DJI_*`) — `4:3` сверху вниз.
- **Рентген** — отдельный блок ниже, своя стилистика (не documentary photo).
- **Тон:** аудитория 30–60, серьёзный «архив следователя». Никакого глянца и мультяшности.

## Имена файлов

Сохраняй каждый файл как `public/evidence/<case>-<evId>.jpg` (указано рядом с каждым промптом) —
тогда подключение будет однострочным (`meta.image: "evidence/case-001-ev-photo.jpg"`).

---

## Стандартная кампания

**1. case-001 / ev-photo** · «Затопленная квартира» · ⚠️ улика-противоречие
`evidence/case-001-ev-photo.jpg`
> Interior of a residential living room, a small puddle of water on the laminate floor; on a
> wooden shelf directly above the puddle a flat-screen TV switched ON showing a working picture,
> plus other electronics with glowing standby indicator lights — everything on the shelf bone-dry
> and undamaged. Clear mismatch between the wet floor and the dry, powered devices. + STYLE

**2. case-004 / ev-photo** · «Корова на крыше»
`evidence/case-004-ev-photo.jpg`
> A glass greenhouse full of tomato plants, with a large cow-shaped hole punched through the
> roof, daylight streaming in; a confused brown-and-white cow standing among the tomato beds
> inside the greenhouse, broken glass scattered around. + STYLE

**3. case-005 / ev-photo** · «Полтергейст в прямом эфире»
`evidence/case-005-ev-photo.jpg`
> A cracked laptop lying on the floor of a gamer's room, screen spider-cracked; next to it a
> spilled can of energy drink with liquid pooling, and a video-game controller on the floor
> nearby; messy desk setup in the background. + STYLE

**4. case-007 / ev-listing** · «Пропавший чемодан» · ⚠️ улика-противоречие
`evidence/case-007-ev-listing.jpg`
> A clean product-style resale photo: a luxury wristwatch and a laptop displayed together "new,
> in box" on a plain neutral background, like a marketplace classified-ad shot. + STYLE
> *(Это «скриншот объявления» — допустимо product-shot без интерфейса; текст не нужен.)*

**5. case-008 / ev-marathon** · «Травма спины» · ⚠️ улика-противоречие
`evidence/case-008-ev-marathon.jpg`
> A runner crossing a city-marathon finish line, arms raised in triumph, wearing a race bib and a
> finisher's medal; finish-line banner and a timing clock behind; blurred crowd; daytime candid
> sports photo. Healthy, athletic posture (contradicts a back-injury claim). + STYLE

**6. case-009 / ev-scenephotos** · «Пожар в доме»
`evidence/case-009-ev-scenephotos.jpg`
> Fire-damage kitchen interior: a charred blackened wall behind an electrical wall socket, a
> melted warped extractor hood above the stove, soot staining on the ceiling near a doorway,
> smoke residue, dim light. + STYLE

**7. case-013 / ev-moisture** · «Утопленный смартфон» · ⚠️ улика-противоречие
`evidence/case-013-ev-moisture.jpg`
> Macro repair-shop close-up of an opened smartphone with the back housing removed, internal
> components visible; a small moisture-indicator sticker that is completely WHITE (not triggered
> pink/red); tweezers and a repair mat in frame, bright workbench light. + STYLE

**8. case-014 / ev-aerial** · «Град на пшеничном поле» · (дрон, 4:3)
`evidence/case-014-ev-aerial.jpg`
> Aerial drone photo looking straight down on a large wheat field, the wheat flattened and beaten
> down in the characteristic patchy pattern of hail damage spread across the entire field,
> overcast sky, farmland. + STYLE

**9. case-016 / ev-photos** · «Затопленный магазин»
`evidence/case-016-ev-photos.jpg`
> Interior of a small retail shop with the floor covered in standing water; ruined waterlogged
> stock and boxes on the lower shelves; products on the upper shelves still dry; fluorescent
> ceiling light. + STYLE

**10. case-017 / ev-photo** · «Микроволновка-поджигатель»
`evidence/case-017-ev-photo.jpg`
> Close-up of a melted, fire-damaged microwave oven on a kitchen counter, door flung open, sooty
> blackened glass; inside the cavity a single charred leather shoe; small animal paw-print smudges
> streaking the casing. + STYLE

**11. case-019 / ev-photo** · «Газонокосилка без водителя»
`evidence/case-019-ev-photo.jpg`
> A ride-on lawnmower wedged underneath the front bumper of a parked car in a garden; the mower's
> steering wheel and seat covered in muddy little paw prints; a few fallen plums on the ground
> nearby; daytime. + STYLE

**12. case-021 / ev-debris** · «Канализационный апокалипсис» · ⚠️ улика-противоречие
`evidence/case-021-ev-debris.jpg`
> A flooded basement with soaked tatami mats; a giant motorized wheel painted bright PURPLE lying
> among the debris; beside it a rolled-out blueprint stamped with purple ink; dim wet basement, no
> municipal pipe visible in frame (the wall was breached from inside). + STYLE

**13. case-022 / ev-photo** · «Кодекс бусидо»
`evidence/case-022-ev-photo.jpg`
> Interior of a traditional Japanese dojo after a break-in: slashed tatami mats, an empty katana
> display mount on the wall, and on the wooden floor a dropped plastic club keycard; dim
> atmospheric lighting. + STYLE

**14. case-023 / ev-atm** · «Карту украли за границей»
`evidence/case-023-ev-atm.jpg`
> A grainy night security-camera still of a person seen from behind using an outdoor street ATM,
> hand at the cash-dispense slot, face not visible; urban street setting; low-resolution CCTV
> look, slight noise and timestamp-free. + STYLE

**15. case-024 / ev-photo** · «Мелкое ДТП на перекрёстке»
`evidence/case-024-ev-photo.jpg`
> Daytime photo of the rear of a car: a dent in the rear bumper and a cracked left rear tail
> light; minor rear-end collision damage; parking-lot setting. + STYLE

**16. case-025 / ev-photo** · «Пожар в кафе»
`evidence/case-025-ev-photo.jpg`
> Interior of a small café after a fire: a charred blackened wall behind the bar counter, a melted
> coffee machine, a soot-blackened ceiling; water and foam residue on the floor from firefighting.
> + STYLE

**17. case-026 / ev-photo** · «Украденные часы»
`evidence/case-026-ev-photo.jpg`
> A tidy bedroom interior: a neatly made bed, a wooden nightstand with an accessory/jewelry box on
> it; everything orderly and undisturbed, no signs of a break-in or mess; soft daylight. + STYLE

**18. case-027 / ev-photo** · «Затопленный склад»
`evidence/case-027-ev-photo.jpg`
> Interior aisle of a warehouse with ankle-deep standing water on the concrete floor; soaked
> cardboard boxes on the lowest shelves; a dark waterline mark on the wall; upper shelving dry;
> industrial lighting. + STYLE

**19. case-028 / ev-photo** · «Поджог склада»
`evidence/case-028-ev-photo.jpg`
> Interior of a completely gutted, burned-out warehouse: charred black walls and ceiling,
> burned-through metal shelving collapsed, heavy soot everywhere; total fire destruction; dim
> light through lingering smoke. + STYLE

**20. case-029 / ev-photo** · «Удар молнии в дом»
`evidence/case-029-ev-photo.jpg`
> Close-up of a charred wall electrical outlet with black scorch marks; next to it a TV with a
> cracked screen panel and a melted power connector; a scorch trace running along the wiring;
> interior wall. + STYLE

**21. case-030 / ev-photo** · «Подстроенное столкновение»
`evidence/case-030-ev-photo.jpg`
> Photo of the front of a car: crumpled grille, broken left headlight, a smear of paint transfer
> from another vehicle on the bumper; moderate low-speed collision damage; street setting. + STYLE

**22. case-031 / ev-photo** · «Град уничтожил теплицу» · (дрон, 4:3)
`evidence/case-031-ev-photo.jpg`
> Top-down drone photo of a greenhouse roof peppered with hundreds of punctures, polycarbonate
> sheets cracked and sagging inward; battered, snapped plants in the beds below; a layer of white
> unmelted hailstones on the ground; overcast. + STYLE

**23. case-032 / ev-photo** · «Исчезнувший внедорожник»
`evidence/case-032-ev-photo.jpg`
> Photo of an empty outdoor parking spot beside a residential garage in the morning; only dark oil
> stains on the asphalt and a closed roller garage gate visible; no vehicle; soft morning light.
> + STYLE

**24. case-033 / ev-photo** · «Рука в прессе»
`evidence/case-033-ev-photo.jpg`
> Industrial shop-floor photo of a metal stamping press; the work area shows dark bloodstains and
> a bent safety guard; the red emergency-stop button pressed in; factory setting, harsh overhead
> lighting. Restrained, not graphic. + STYLE

## Ежедневные дела

**25. case-104-daily / ev-photos** · «Молния ударила в сарай»
`evidence/case-104-daily-ev-photos.jpg`
> Close-up of a large wooden roof beam in a barn with a striking tree-like Lichtenberg burn
> pattern radiating across the wood from a central impact point — a scorched fern-like fractal
> lightning scar; dim barn interior. + STYLE

**26. case-105-daily / ev-photo** · «Сбежавший батут»
`evidence/case-105-daily-ev-photo.jpg`
> A round garden trampoline crashed through and lodged in the smashed glass roof of a conservatory
> /sunroom, surrounded by shattered glass shards, the trampoline's frame rail bent; daytime garden
> in the background. + STYLE

## Особые архивы

**27. case-040 / photo-hangar** · «Сгоревший груз на лунной ферме»
`evidence/case-040-photo-hangar.jpg`
> Interior of a utilitarian cargo hangar after a fire: the deepest charring and collapse centered
> around an internal metal workbench with scattered crates, while the large outer gate in the
> background is visibly less burned. Dry soot, scorched floor, harsh industrial lighting, no
> people, grounded retro-futurist farm infrastructure. + STYLE

**28. case-041 / crash-photo** · «Потерянный перехватчик в ледяном каньоне»
`evidence/case-041-crash-photo.jpg`
> A crash-landed small interceptor craft resting in an icy canyon; hull sides mostly intact, but
> the underside and landing area show heavy impact damage from a hard belly landing. No blast
> holes, no projectile marks, cold overcast light, snow and blue ice around the wreck. + STYLE

**29. case-042 / display-photo** · «Пропавший церемониальный клинок»
`evidence/case-042-display-photo.jpg`
> Museum-style display case with intact glass and an undamaged lock, photographed straight-on; on
> the dark velvet inside, a clean blade-shaped indentation and fastening marks show where a
> ceremonial sword was carefully removed. Quiet archive lighting, no readable signage. + STYLE

**30. case-043 / cache-photo** · «Исчезнувший ученик навигатора»
`evidence/case-043-cache-photo.jpg`
> A hidden cache behind a plain station bench: a ration pack, a folded spare jacket, and a neat
> stack of cash credits tucked out of sight, clearly prepared in advance rather than dropped in a
> panic. Dusty transit-outpost setting, candid evidence-shot framing. + STYLE

**31. case-044 / photo-44** · «Пожар в теплице редких мандрагор» · ⚠️ улика-противоречие
`evidence/case-044-photo-44.jpg`
> Inside a greenhouse after a fire: the burn origin is concentrated around a ceramic mixing bowl on
> a worktable with spilled growth-accelerant residue, while the nearby root bed of rare plants is
> visibly less damaged. Soot, cracked glass, scorched potting surfaces, natural daylight through
> the greenhouse frame. + STYLE

**32. case-045 / photo-45** · «Пропавший экзаменационный кубок» · ⚠️ улика-противоречие
`evidence/case-045-photo-45.jpg`
> Close-up evidence photo of a brass display-case hinge: a fresh crescent-shaped cutter mark on the
> OUTSIDE edge of the hinge, while the inner lock area remains intact and undisturbed. Museum case
> materials, shallow depth of field, forensic close framing. + STYLE

**33. case-046 / photo-46** · «Падение с учебной башни» · ⚠️ улика-противоречие
`evidence/case-046-photo-46.jpg`
> Close-up of a climbing safety ring with a tamper seal: the seal edge is clean and even, like it
> was sliced with a thin blade, not jagged or torn by a sudden load. Training-tower metal hardware,
> rope fibers nearby, neutral daylight, documentary detail. + STYLE

**34. case-047 / photo-47** · «Ночной побег из общежития» · ⚠️ улика-противоречие
`evidence/case-047-photo-47.jpg`
> Open dormitory window seen from inside: the OUTSIDE frame has a fresh dent and tool impact mark,
> while the inner latch is bent inward toward the room. Night-escape aftermath, plain institutional
> interior, restrained evidence framing. + STYLE

**35. case-048 / photo-48** · «Разгром пиццерии после ночной драки» · ⚠️ улика-противоречие
`evidence/case-048-photo-48.jpg`
> Commercial pizza oven and adjacent cabinet after a fire: beneath fresh soot there is old baked-on
> grease and long-term wear, and the so-called "new" unit clearly lacks factory protective film.
> Kitchen backroom lighting, stainless steel surfaces, realistic grime and scorch detail. + STYLE

**36. case-049 / photo-49** · «Кража лабораторного мутагена» · ⚠️ улика-противоречие
`evidence/case-049-photo-49.jpg`
> Interior lab wall vent in close-up: the grate screws are lying on the INSIDE floor beneath the
> opening, and scratch marks on the frame run from inside outward. Sterile laboratory textures,
> muted lighting, no fantasy glow, strict forensic composition. + STYLE

**37. case-050 / photo-50** · «Пожар в антикварном додзё» · ⚠️ улика-противоречие
`evidence/case-050-photo-50.jpg`
> Burn trail near a service door of an old dojo: a charred fuse-like line clearly runs from the
> outside yard across the threshold inward, showing the fire started at the door rather than deep in
> the storage room. Worn wood, tatami-adjacent corridor, restrained fire damage. + STYLE

**38. case-051 / photo-51** · «Угон фургона с уличной электроникой» · ⚠️ улика-противоречие
`evidence/case-051-photo-51.jpg`
> Rear cargo bay of a delivery van: cargo straps are neatly folded on the floor, mounts are intact,
> and there are no signs of violent struggle, blood, or emergency braking displacement. Boxes and
> fixtures look orderly, suggesting a staged disappearance. + STYLE

---

## Рентгены (отдельная стилистика — НЕ documentary photo)

> **STYLE (X-ray):** grayscale medical radiograph, clinical X-ray film look, black background,
> bright bones, soft soft-tissue shadows, slight film grain. No text, no labels, no watermark.

**X1. case-003 / ev-xray** · «Гурман-пёс» · ⚠️ улика-противоречие · (тип `photo`, но это рентген)
`evidence/case-003-ev-xray.jpg`
> Veterinary X-ray radiograph of a dog's abdomen; clearly visible silhouette of a tennis ball and
> a single bunched-up sock inside the stomach; ribcage and spine visible; NO watch and no metal
> jewelry anywhere. + STYLE (X-ray)

**X2. case-033 / ev-xray** · «Рука в прессе» · (тип `xray`)
`evidence/case-033-ev-xray.jpg`
> Medical X-ray radiograph of a human right hand; clear fracture lines through the 2nd and 3rd
> metacarpal bones with slight displacement; a fresh crush injury, no old healed fractures. +
> STYLE (X-ray)

---

## Как подключить сгенерированное (когда фото будут готовы)

Сейчас `PhotoBody`/`XRayBody` не умеют показывать настоящий снимок. Чтобы подключить:

1. Положить файлы в `public/evidence/` по именам выше.
2. Добавить в схему опциональное поле `Evidence.meta.image` (`src/types/index.ts` +
   `src/data/caseSchema.ts`), прописать путь в нужных уликах в `src/data/cases/*.json`.
3. В `PhotoBody` (и `XRayBody`) при наличии `meta.image` показывать `<img src={asset(meta.image)}>`
   вместо штриховки/эмодзи, с фолбэком на текущий плейсхолдер.

Это отдельная задача — скажи, и я её сделаю.
