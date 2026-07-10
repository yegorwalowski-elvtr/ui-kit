# Licensed brand fonts — drop-in folder

The ELVTR brand fonts are commercially licensed and are **not** downloaded or
committed by this repo (`.gitignore` excludes font binaries here by default).
Get the files from the Design Team / license portals and drop them into this
folder with **exactly** these names:

Required (referenced by `src/styles/fonts.css` today):

| File | Typeface | Weight | Foundry |
| --- | --- | --- | --- |
| `ABCArizonaFlare-Medium.woff2` | ABC Arizona Flare | 500 Medium | Dinamo (abcdinamo.com) |
| `NeueMontreal-Medium.woff2` | Neue Montreal | 500 Medium | Pangram Pangram (pangrampangram.com) |

Optional (declarations exist but are commented out in `src/styles/fonts.css` —
uncomment them after adding the files):

| File | Typeface | Weight |
| --- | --- | --- |
| `ABCArizonaFlare-Regular.woff2` | ABC Arizona Flare | 400 Regular |
| `ABCArizonaFlare-Bold.woff2` | ABC Arizona Flare | 700 Bold |
| `NeueMontreal-Regular.woff2` | Neue Montreal | 400 Regular |
| `NeueMontreal-Bold.woff2` | Neue Montreal | 700 Bold |

Until the files are present the kit falls back to Georgia / 'Times New Roman'
(display) and Inter / 'Helvetica Neue' / Arial (UI), so demos stay legible —
just not brand-accurate.

If you only have `.otf`/`.ttf` masters, convert to `.woff2` (e.g. with
`woff2_compress`) rather than shipping raw desktop fonts. Check the license
terms before committing binaries even to a private repo.
