# Character models (optional)

The Hexacare story (`components/story/`) draws procedural, primitive-built characters by default,
so nothing in this folder is required. To use real rigged characters:

1. Put `patient.glb`, `family.glb`, `doctor.glb`, `expert.glb` and `delivery.glb` in this folder
   (paths and the on/off switch live in `components/story/story.config.ts` → `models`).
2. Set `models.enabled: true`. A missing or broken file still falls back to the procedural character.

## Where to get models
- **Mixamo** (mixamo.com, free with an Adobe ID): pick a character, download the rig with the
  animations you need ("Idle", "Sick Idle"/"Tired", "Cough", "Walking", "Waving", "Talking",
  "Pointing", "Writing", "Nodding", "Drinking", "Stretching", "Happy Idle"/"Jump", "Victory"), export as FBX, then convert to glb.
- **Ready Player Me**, **Sketchfab** (filter: downloadable, CC-BY/CC0) or a commissioned artist.
- Dress the expert in a brand-blue coat with a hexagon badge and the delivery partner in a brand jacket.

## Requirements
- Rigged, facing +Z, feet at y = 0 (size is auto-normalised to 1.7 m).
- Clip names are matched case-insensitively by substring using `clipMap` in `story.config.ts`
  (e.g. an action `cough` finds a clip whose name contains "cough"). Unmatched actions use the idle clip.
- Compress to stay well under ~10 MB total: `npx gltfpack -i in.glb -o patient.glb -cc -tc`
  (meshopt, decoded natively by drei) or `npx gltf-pipeline -i in.glb -o out.glb -d` (Draco).
