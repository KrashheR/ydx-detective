# Build validation report

- Revision: retention-pass-3
- Cases: 50
- Evidence cards: 252
- Truth balance: {"fraud":28,"valid":22}
- Difficulty curve: {"easy":4,"hard":24,"medium":22}
- Evidence relations: {"contextualizes":36,"contradicts":81,"reveals_season_clue":29,"supports":106}
- Interactive evidence: 36 in 35 cases
- Interactive types: {"document_scan":11,"seal_match":10,"shadow_time_check":5,"surface_reveal":5,"thermal_scan":5}
- Image-model queue: 110
- Atomic statement shape: 50/50 pass.
- Valid cases with contradiction: 0.
- Fraud cases without contradiction: 0.
- Core paths exceeding investigationBudget: 0.
- Unknown statement links: 0.
- Relation/isContradiction mismatches: 0.
- First-three onboarding targets: 105 / 120 / 150 seconds.
- Thermal evidence with explicit timing and cooling reference: 5/5.
- Surface reveal thresholds in 45–65% range: 5/5 cases.
- Final synthesis has post-verdict free access to required arc evidence.
- Per-case JSON and aggregate JSON are generated from the same canonical objects.

## Generated asset validation

- Image-model queue: 110/110 completed.
- Output files: 110 WebP files; no PNG or JPEG intermediates included.
- Total generated asset payload: 5,867,924 bytes.
- Expected dimensions: 110/110 pass.
- SHA-256 checks: 110/110 pass.
- Required alpha channels: pass for all transparent procedural assets.
- Visual prompt review: complete for portraits, standard evidence, documents, seals, and interactive scenes.

## Manual gates that remain for the implementation repository

- Architecture P0 checklist must be implemented against the real codebase.
- Interactive overlay coordinates still require calibration in the running implementation repository.
- Mobile/touch/RTL/performance and platform SDK checks require a running build.
- Retention claims require production analytics or an A/B test; the content design alone cannot guarantee a 2× result.
