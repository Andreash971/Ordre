# Build assets

Icon and installer assets consumed by Electron Forge during `package` / `make` / `publish`.

The Forge config (`forge.config.cjs`) skips icon flags gracefully when the files
below are absent, so an unsigned build still succeeds — but published builds
should ship with the full set.

## Required files

| File                    | Purpose                                          | Format                                            |
| ----------------------- | ------------------------------------------------ | ------------------------------------------------- |
| `icon.png`              | 1024×1024 master source (kept for regenerating)  | PNG with alpha                                    |
| `icon.icns`             | macOS app bundle icon                            | `.icns` containing 16/32/64/128/256/512/1024 px   |
| `icon.ico`              | Windows app + Squirrel installer icon            | `.ico` containing 16/24/32/48/64/128/256 px       |
| `entitlements.mac.plist`| Hardened-runtime entitlements (committed)        | Apple plist                                       |

## Optional files

| File                       | Purpose                                  |
| -------------------------- | ---------------------------------------- |
| `installer-loading.gif`    | Animation shown during Squirrel install  |
| `dmg-background.png`       | 540×380 DMG background (if DMG maker added) |

## Generating from a single PNG

Install once:

```bash
npm i -g electron-icon-maker
```

Then from the repo root:

```bash
electron-icon-maker --input=assets/icon.png --output=assets
# move generated files to the expected names
mv assets/icons/mac/icon.icns assets/icon.icns
mv assets/icons/win/icon.ico  assets/icon.ico
rm -rf assets/icons
```

Alternatively, export the icons by hand from Figma / Sketch / Affinity Designer.
