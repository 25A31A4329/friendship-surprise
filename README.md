# Our Story — setup notes

## Add your photos
Drop 8 images into `assets/images/` named exactly:
`photo1.jpg` through `photo8.jpg` (any real photo, jpg or png — just keep the same filenames, or update the `src` attributes in `index.html`).

## Add your music
Drop the real audio file into `assets/music/` as:
`nuvvunte-chaale.mp3`
If the file isn't there yet, the site still works — the player just won't produce sound until the file exists.

## Running it
No build step needed. Just open `index.html` in a browser, or serve the folder with any static server (recommended, since some browsers restrict local audio/canvas access over `file://`):

```
npx serve .
```

## Where things live
- `index.html` — structure & content (all copy from the brief lives here)
- `style.css` — design tokens, layout, animation keyframes (see table of contents at the top)
- `script.js` — loading/intro sequence, canvases, constellation thread, gallery, letter, finale, easter eggs (see table of contents at the top)
