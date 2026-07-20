# Asset Bindings — Integration Guide

## Fixed issue

Earlier case JSON used plan-relative paths such as `assets/interactive/...`, while the generated WebP files were stored under `generated-assets/src/...`. The archive now contains explicit, machine-readable bindings for every generated image.

## One-step installation

Copy the contents of `generated-assets/src/` into the game project's `src/` directory, preserving the directory tree.

## Where mappings are stored

- Full campaign index: `00_MASTER/ASSET_BINDINGS_1_50.json`.
- Claimant portrait in every case: `claimant.portrait`.
- Exact current-project portrait action: `claimant.portraitBinding`.
- Evidence images in every evidence object: `evidence[].imageAssets`.
- Convenience primary image: `evidence[].primaryImage`.
- Complete per-case mapping: `assetBindings`.

Each mapping exposes:

- `src`: runtime/destination path relative to the game project root;
- `archiveSrc`: physical location inside this archive;
- `caseRelativeSrc`: path relative to the case content folder;
- `installTo`: exact destination in the current project;
- `legacyRuntimeUrl`: value for the current `personImage` / `data.imageUrl` schema;
- dimensions, SHA-256, asset ID, and semantic role.

## Coverage

- Generated WebP files bound: **110/110**.
- Claimant portraits bound: **24**.
- Existing project portraits explicitly retained: **25**.
- Cases intentionally displayed without a portrait: **1**.
- Evidence and interactive images bound: **84**.
- Case-scene images bound: **2**.
- Unbound generated WebP files: **0**.

For generated claimant portraits, Codex should copy `copyFrom` to `copyTo` and assign `runtimeValue` to the case's `personImage`. Cases without a newly generated portrait use `mode: "retain_existing"`; Codex must preserve the existing project value. A deliberate `mode: "no_portrait"` prevents a random photograph from being assigned.
