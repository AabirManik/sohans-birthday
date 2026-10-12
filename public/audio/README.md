# Scene 4 audio

- `web-slinger-theme.wav` — an **original** 29-second surf/spy-rock homage written for
  this site (E minor, 140 BPM: kick/snare/hats, staccato bass, an organ theme with
  thirds, brass stabs, a web-shoot swoosh, and a final ringing hit). It is deliberately
  NOT the copyrighted Marvel/Sony Spider-Man film score — no melody, recording or sample
  from any film, game or commercial track is used anywhere in this file.
- It was generated sample-by-sample by `compose-theme.ps1` in the project root, which
  synthesizes every voice from scratch (oscillators + envelopes) and writes the WAV.
  Re-running that script reproduces the track exactly (seeded noise).
- Format: 22 050 Hz, 16-bit stereo PCM, ~2.5 MB. The page creates the `<audio>` element
  lazily on the first tap (`preload="none"`), loops it while you stay on the comic, and
  pauses it the moment you leave the scene — it never autoplays.
- To use a track you own the rights to: drop it in here and update the filename in
  `js/app.js` (`wireTheme()`).
