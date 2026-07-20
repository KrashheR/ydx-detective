# Asset production report

- Campaign: `WHERE_IS_THE_LIE_CAMPAIGN_1_50_INTERACTIVE`
- Production status: complete
- Queue: 110/110 completed
- Output root: `generated-assets/src/data/cases/`
- Format: WebP
- Generated payload: 5,867,924 bytes

## Output profiles

- Character portraits: 359×359, archival painted character-card style.
- Early standard evidence: 434×326.
- Late standard evidence: 1448×1086.
- Interactive scenes: 1600×1000.
- Interactive documents: 1600×1100.
- Transparent seals and procedural strips: 1400×500 with alpha channel.

## Verification

- Every `archiveOutputPath` in `ASSET_TODO.json` exists.
- Every output MIME type is `image/webp`.
- Actual dimensions match queue metadata.
- Stored SHA-256 values match the final files.
- Transparent tasks retain an alpha channel.
- Intermediate generation files are excluded from the delivery archive.

Two CCTV prompts in the final cases were rendered with safety-neutral staging: the required locations, bags, van, utility can, tool case, and character positions are present without depicting active violence.
