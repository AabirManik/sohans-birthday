# A Little Universe for Sohan

A private, phone-friendly birthday story. Pure static HTML, CSS and JavaScript —
**no build step, no dependencies, no network requests, no backend.**

---

## Run it

**Easiest:** double-click `index.html`. It opens straight from the file system.

**Or serve it locally** (nicer for testing on your phone from the same Wi-Fi):

```bash
python -m http.server 8123
# then open http://127.0.0.1:8123/index.html
```

Any static host works too (Netlify drop, GitHub Pages, Cloudflare Pages, a plain folder on a server).
The photos are only ever loaded from the site itself — nothing is uploaded anywhere.

---

## The seven scenes

| # | Scene | What happens |
|---|---|---|
| 1 | The sealed surprise | Line-drawn envelope with a red wax seal, **“Unlock your birthday surprise”** (one tap, no password) |
| 2 | Birthday spotlight | **“Happy Birthday, Sohan!”**, portrait plate with a hand-set caption, *Start our story* |
| 3 | Our precious memories | Six photo plates in a magazine grid with editable captions; tap to enlarge, arrows, Escape closes |
| 4 | Our little superhero comic | Three-panel vintage comic page: web-swing → moonlit rooftop → upside-down kiss, using original SVG panels drawn to match the supplied references — plus a **Play the theme** button with an original web-slinger track |
| 5 | Sohan's Hot Wheels garage | A graffiti-walled garage box — spotlights, a big outlined “SOHAN” street-art piece, six painted parking bays on a glossy reflective floor — with his six cars parked side by side at the same size; tap a car for a close-up. On phones it becomes a swipeable shelf |
| 6 | A letter from your favourite person | Envelope opens into a paper letter with the full message |
| 7 | Make a wish, Sohan | Candle flames flicker; **“Make a wish”** blows them out, a quiet confetti scatter, then *I love you. Always.* The cake has no car or track. |

Navigation: a numbered scene index down the side (a row at the bottom on phones), ‹ › buttons,
`←` / `→` arrow keys, and a smooth Lenis-style scroll written from scratch in `js/smooth-scroll.js`.

---

## The look

Editorial / cinematic dark overall: a near-black base, one berry accent, warm off-white ink, hairline
rules, small-caps mono labels, and a large display serif for headlines. The superhero scene is an
intentional printed-comic exception: black ink, red and blue, cream stock, halftone, and thick borders.
Motion is limited to a few deliberate moments: the entrance reveal, a subtle comic-panel reveal,
the flame flicker, and the wish.

Each scene has exactly one focal point: the seal, the portrait, the photos, the comic,
the garage, the letter, the cake. The garage cars are cropped to their true edges and
parked side by side in painted bays, so every wheel sits on the same floor line with a
glossy reflection under it.

---

## Where to edit the words

**Everything personal lives in `js/content.js`.** You never need to touch layout or animation code.

```js
name: "Sohan",
birthdayDate: null,          // leave null — no date, age or countdown is ever shown
signOff: "Forever yours,\nYour favourite person 💗",
happyBirthdayHeading: "Happy Birthday, Sohan!",
finaleLede: "Here's to every laugh, ...",
letter: [ "...paragraph 1...", "...paragraph 2...", ... ],
memories: [ { group: "Moments we kept" }, { src, caption, alt, size, focal }, ... ],
cars: [ { name, src, alt, bay: { x, y, w } }, ... ]   // the garage collection
```

- **Captions / alt text** — edit the `caption` and `alt` fields in `memories`.
- **Photo order or a new photo** — reorder the array, or add an entry pointing at a file in
  `public/images/`. `{ group: "..." }` inserts a section heading.
- **Row widths** — `size: "wide"` is 7 columns, `"narrow"` is 5, omit it for the default half
  row. Rows are written to total 12: `wide + narrow`, `narrow + wide`, default + default.
- **Face cropping** — `focal: "50% 30%"` is `object-position`; nudge the Y value until faces stay in frame.
- **The letter** — the `letter` array is one entry per paragraph, verbatim.
- **The garage** — add or remove entries in `cars` and the bays, names and the
  “06 cars in the collection” count all follow. `bay` is only used on desktop
  (`x`/`y` = centre point in %, `w` = width in % of the diorama photo); on phones
  the cars become a swipeable shelf, so `bay` can be left off.
- **Birthday date** — only add it if you actually want it displayed.

## Photos

All six are already in `public/images/`:

```
sohan-hero.jpg  sohan-traditional.jpg  her-garden.jpg
together-close.jpg  together-cafe.jpg  together-hallway.jpg
```

Missing files just show an empty frame — drop the file in with the same name and it appears.

---

## Music

Scene 4 has a **Play the theme** button. The track is an *original* surf-spy-rock
homage in the spirit of a web-slinger theme — it is **not** the Marvel/Sony film score
(which is copyrighted and would get a public repo taken down). It was synthesized
note-by-note by `compose-theme.ps1` at the project root (drums, bass, organ, brass
stabs, a web-shoot swoosh, 29 seconds) and lives at:

```
public/audio/web-slinger-theme.wav
```

Behaviour: never autoplays, loops while you are on the comic, pauses from the button,
and stops itself when you scroll to another scene. To swap in any licensed track of
your own, replace the `.wav` file and (optionally) update the filename in `js/app.js`
inside `wireTheme()` — nothing else needs to change.

---

## Going live

The site is published at **https://aabirmanik.github.io/sohans-birthday/** (GitHub Pages).

To publish any change: edit the files here, then **double-click `publish.cmd`**.
It copies the site (html, css, js and all of `public/` — photos, comic panels, garage)
into `dist\`, commits, pushes, and Pages rebuilds in about a minute. Anyone with the
link can see the photos and the letter — that is the deal with a public URL.

---

## Files

```
index.html            current scene structure + the comic artwork
css/base.css          tokens, type, buttons, scene index, reduced-motion
css/scenes.css        one composition per scene + responsive rules + garage + artwork motion
css/gallery.css       photo plates + lightbox
js/content.js         ← EDIT HERE: name, captions, letter, sign-off, photos, cars
js/smooth-scroll.js   the buttery scroll (no library)
js/gallery.js         grid + accessible lightbox
js/app.js             scene navigation, garage, letter, wish, confetti
public/images/        the six photos
public/images/hotwheels/  garage backdrop and six transparent car cutouts in `cars/`
public/images/spider-comic/ three authored SVG comic panels used in scene 4
publish.cmd           double-click to publish to GitHub Pages
qa-responsive.html    dev tool: opens the site at 360 / 414 / 768 / 1280 side by side
PHASE_5_GARAGE_AND_SUPERHERO_REDESIGN.md  the brief the garage was built from
```

## Behaviour notes

- **Accessibility:** labelled controls, visible focus, full keyboard operation
  (`←` `→` scenes, `Esc` closes the photo), focus trapped in the lightbox and returned on close.
  Every control is at least 44px in both axes at every width.
- **Responsive:** verified at 360×740, 414×896, 768×1024 and 1280×800 — no horizontal
  page overflow, scenes fit the viewport on tablet and desktop, and the comic panels scroll-snap
  horizontally on phones. Open `qa-responsive.html` to see all four.
- **Reduced motion:** `prefers-reduced-motion` disables the smooth-scroll easing, the flicker,
  and the confetti, and shortens every transition.
- **Without JavaScript:** the page still reads — content is only hidden when JS is running to
  animate it in.
- **Offline:** no fonts, scripts, analytics, images or audio are fetched from the internet.
- **No video, no password, no countdown, no invented date or age.** The only sound is
  scene 4's original theme — on an explicit tap, never autoplay, pausable any time, and
  it stops itself when you leave the scene.
