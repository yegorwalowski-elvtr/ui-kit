# Licensed fonts

The two ELVTR typefaces are commercially licensed, so no binaries are committed
and none are fetched from the internet. `@font-face` rules come from the UI kit
(`src/styles/fonts.css`) and point at `/fonts/…`, so drop the files here:

| File | Typeface | Used for |
| --- | --- | --- |
| `ABCArizonaFlare-Medium.woff2` | ABC Arizona Flare (Dinamo) 500 | Screen titles, the Cola Orange CTA |
| `NeueMontreal-Medium.woff2` | Neue Montreal (Pangram Pangram) 500 | Everything else |

Until they are present the fallbacks (Georgia / Inter) keep the app legible but
the type will not match Figma.
