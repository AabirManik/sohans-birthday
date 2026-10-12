# Composes "Web-Slinger Theme" — an ORIGINAL surf/spy-rock homage (no copyrighted melody)
# Renders public/audio/web-slinger-theme.wav (22050 Hz, 16-bit stereo, ~29 s)

$ErrorActionPreference = "Stop"
$SR = 22050
$BPM = 140
$beat = 60.0 / $BPM            # 0.42857 s
$bar = 4 * $beat               # 1.7143 s
$bars = 16
$tail = 1.9
$N = [int](($bars * $bar + $tail) * $SR)

$script:mix = New-Object 'double[]' $N    # drums + bass + brass
$script:lead = New-Object 'double[]' $N   # organ bus (gets echo)

function Freq([double]$m) { 440.0 * [math]::Pow(2.0, ($m - 69.0) / 12.0) }

# ---------- waveforms ----------
function W([string]$w, [double]$ph) {
  switch ($w) {
    "sin" { return [math]::Sin(6.283185307 * $ph) }
    "saw" { $f = $ph - [math]::Floor($ph); return 2.0 * $f - 1.0 }
    "sqr" { if ([math]::Sin(6.283185307 * $ph) -ge 0) { return 1.0 } else { return -1.0 } }
    "tri" { $f = $ph - [math]::Floor($ph); return 4.0 * [math]::Abs($f - 0.5) - 1.0 }
  }
  return 0.0
}

function Add-Note([string]$bus, [double]$t0, [double]$dur, [double]$freq, [string]$wave, [double]$gain, [double]$atk, [double]$dec, [double]$vib) {
  if ($bus -eq "lead") { $buf = $script:lead } else { $buf = $script:mix }
  $i0 = [int]($t0 * $SR); $len = [int]($dur * $SR)
  $ph = 0.0
  for ($i = 0; $i -lt $len; $i++) {
    $idx = $i0 + $i; if ($idx -ge $N) { break }
    $t = $i / $SR
    $f = $freq
    if ($vib -gt 0 -and $t -gt 0.09) { $f = $freq * (1.0 + 0.006 * [math]::Sin(6.283185307 * 5.5 * $t)) }
    $ph += $f / $SR
    $env = 1.0
    if ($t -lt $atk) { $env = $t / $atk }
    elseif ($t -gt ($dur - $dec)) { $env = [math]::Max(0.0, ($dur - $t) / $dec) }
    $buf[$idx] += (W $wave $ph) * $gain * $env
  }
}

function Add-Chord([string]$bus, [double]$t0, [double]$dur, [int[]]$midis, [string]$wave, [double]$gain, [double]$atk, [double]$dec) {
  foreach ($m in $midis) { Add-Note $bus $t0 $dur (Freq $m) $wave $gain $atk $dec 0 }
}

# ---------- drums ----------
$rnd = New-Object System.Random 7
function Add-Kick([double]$t0, [double]$g) {
  $i0 = [int]($t0 * $SR); $len = [int](0.22 * $SR); $ph = 0.0
  for ($i = 0; $i -lt $len; $i++) {
    $idx = $i0 + $i; if ($idx -ge $N) { break }
    $t = $i / $SR
    $f = 45.0 + 78.0 * [math]::Exp(-$t / 0.032)
    $ph += $f / $SR
    $env = [math]::Exp(-$t / 0.12)
    $click = if ($t -lt 0.004) { (2.0 * $rnd.NextDouble() - 1.0) * (1.0 - $t / 0.004) * 0.35 } else { 0.0 }
    $script:mix[$idx] += ([math]::Sin(6.283185307 * $ph) + $click) * $g * $env
  }
}
function Add-Snare([double]$t0, [double]$g) {
  $i0 = [int]($t0 * $SR); $len = [int](0.2 * $SR); $lp = 0.0; $ph = 0.0
  for ($i = 0; $i -lt $len; $i++) {
    $idx = $i0 + $i; if ($idx -ge $N) { break }
    $t = $i / $SR
    $x = 2.0 * $rnd.NextDouble() - 1.0
    $lp += 0.5 * ($x - $lp)
    $ph += 196.0 / $SR
    $env = [math]::Exp(-$t / 0.1)
    $script:mix[$idx] += ($lp * 0.55 + [math]::Sin(6.283185307 * $ph) * 0.3) * $g * $env
  }
}
function Add-Hat([double]$t0, [double]$g) {
  $i0 = [int]($t0 * $SR); $len = [int](0.06 * $SR); $prev = 0.0
  for ($i = 0; $i -lt $len; $i++) {
    $idx = $i0 + $i; if ($idx -ge $N) { break }
    $t = $i / $SR
    $x = 2.0 * $rnd.NextDouble() - 1.0
    $hp = $x - $prev; $prev = $x
    $script:mix[$idx] += $hp * $g * [math]::Exp(-$t / 0.028)
  }
}
function Add-Crash([double]$t0, [double]$g) {
  $i0 = [int]($t0 * $SR); $len = [int](1.8 * $SR); $prev = 0.0
  for ($i = 0; $i -lt $len; $i++) {
    $idx = $i0 + $i; if ($idx -ge $N) { break }
    $t = $i / $SR
    $x = 2.0 * $rnd.NextDouble() - 1.0
    $hp = $x - $prev; $prev = $x
    $script:mix[$idx] += $hp * $g * [math]::Exp(-$t / 0.75)
  }
}
function Add-Thwip([double]$t0) {                      # web-shoot swoosh
  $i0 = [int]($t0 * $SR); $len = [int](0.6 * $SR); $ph = 0.0; $prev = 0.0
  for ($i = 0; $i -lt $len; $i++) {
    $idx = $i0 + $i; if ($idx -ge $N) { break }
    $t = $i / $SR; $u = $t / 0.6
    $f = 700.0 + 3200.0 * [math]::Exp(-$t / 0.13)
    $ph += $f / $SR
    $x = 2.0 * $rnd.NextDouble() - 1.0
    $hp = $x - $prev; $prev = $x
    $env = [math]::Pow([math]::Sin(3.14159265 * $u), 1.3)
    $script:lead[$idx] += ([math]::Sin(6.283185307 * $ph) * 0.6 + $hp * 0.4) * 0.2 * $env
  }
}

# ---------- song data ----------
# chord roots per bar (1..16): Em Em C D Em Em G D Em Em C D G D Em Em
$prog = @("Em","Em","C","D","Em","Em","G","D","Em","Em","C","D","G","D","Em","Em")
$root = @{ Em = 40; C = 36; D = 38; G = 43 }
$walk = @{ Em = @(43,45); C = @(35,33); D = @(40,42); G = @(45,47) }
$chord = @{ Em = @(52,55,59); C = @(48,52,55); D = @(50,54,57); G = @(43,47,50) }

for ($b = 0; $b -lt 16; $b++) {
  $t = $b * $bar
  $c = $prog[$b]

  if ($b -eq 15) {                                   # final hit
    Add-Kick $t 0.85; Add-Crash $t 0.32
    Add-Chord "mix" $t 1.8 $chord["Em"] "saw" 0.12 0.012 1.4
    Add-Chord "lead" $t 1.8 @(52,55,59,64) "sqr" 0.09 0.01 1.3
    Add-Note "mix" $t 1.8 (Freq 40) "tri" 0.34 0.01 1.4 0
    continue
  }

  # bass: driving staccato 8ths
  for ($e = 0; $e -lt 8; $e++) {
    $m = $root[$c]
    if ($e -eq 6) { $m = $walk[$c][0] }
    if ($e -eq 7) { $m = $walk[$c][1] }
    Add-Note "mix" ($t + $e * 0.5 * $beat) (0.24 * $beat) (Freq $m) "tri" 0.3 0.004 0.05 0
    Add-Note "mix" ($t + $e * 0.5 * $beat) (0.24 * $beat) (Freq $m) "saw" 0.09 0.004 0.05 0
  }

  # drums from bar 2
  if ($b -ge 1) {
    Add-Kick $t 0.8; Add-Kick ($t + 2 * $beat) 0.8
    if ($b % 2 -eq 1) { Add-Kick ($t + 2.5 * $beat) 0.55 }
    Add-Snare ($t + 1 * $beat) 0.62; Add-Snare ($t + 3 * $beat) 0.62
    for ($h = 0; $h -lt 8; $h++) { Add-Hat ($t + $h * 0.5 * $beat) 0.16 }
    if ($b -eq 7 -or $b -eq 11) {                    # fills
      foreach ($f in @(3.0, 3.25, 3.5, 3.75)) { Add-Snare ($t + $f * $beat) 0.45 }
    }
    if ($b -eq 13) { for ($h = 0; $h -lt 16; $h++) { Add-Hat ($t + $h * 0.25 * $beat) (0.09 + 0.012 * $h) } }
    if ($b -eq 13) { foreach ($r in @(2.0, 2.5, 3.0, 3.25, 3.5, 3.75)) { Add-Snare ($t + $r * $beat) (0.3 + 0.05 * $r) } }
  }

  # brass stabs before section turns
  if ($b -eq 3) { Add-Chord "mix" ($t + 3.5 * $beat) 0.4 $chord["D"] "saw" 0.14 0.01 0.3 }
  if ($b -eq 7) { Add-Chord "mix" ($t + 3.5 * $beat) 0.4 $chord["D"] "saw" 0.14 0.01 0.3 }
  if ($b -eq 11) { Add-Chord "mix" ($t + 3.5 * $beat) 0.4 $chord["D"] "saw" 0.14 0.01 0.3 }

  # thwip pickups
  if ($b -eq 0) { Add-Thwip ($t + 2.2 * $beat) }
  if ($b -eq 7) { Add-Thwip ($t + 3.2 * $beat) }

  # sustained organ pads on the tension bars
  if ($b -eq 12) { Add-Chord "lead" $t ($bar * 0.98) $chord["G"] "sqr" 0.075 0.12 0.3 }
  if ($b -eq 13) { Add-Chord "lead" $t ($bar * 0.98) $chord["D"] "sqr" 0.08 0.08 0.3 }
}

# theme melody (organ) over bars 5-8, repeated with harmony over 9-12
$theme = @(
  @(5, 0.0, 0.5, 59), @(5, 0.5, 0.5, 59), @(5, 1.0, 1.0, 62), @(5, 2.0, 0.5, 59), @(5, 3.0, 1.0, 64),
  @(6, 0.0, 0.5, 67), @(6, 0.5, 0.5, 66), @(6, 1.0, 1.0, 64), @(6, 2.0, 1.5, 62),
  @(7, 0.0, 0.5, 62), @(7, 0.5, 0.5, 64), @(7, 1.0, 1.0, 67), @(7, 2.0, 0.5, 64), @(7, 2.5, 0.5, 62), @(7, 3.0, 1.0, 59),
  @(8, 0.0, 1.0, 57), @(8, 1.0, 1.0, 59), @(8, 2.0, 1.5, 66)
)
$third = @{ 59 = 62; 62 = 66; 64 = 67; 67 = 71; 66 = 69; 57 = 60 }

foreach ($pass in @(0, 1)) {
  $off = if ($pass -eq 0) { 0 } else { 4 }            # bars 5-8, then 9-12
  foreach ($e in $theme) {
    $b = $e[0] + $off; $t0 = ($b - 1) * $bar + $e[1] * $beat; $d = $e[2] * $beat; $m = $e[3]
    Add-Note "lead" $t0 $d (Freq $m) "sqr" 0.17 0.008 0.06 1
    Add-Note "lead" $t0 $d ((Freq $m) * 1.005) "sqr" 0.075 0.008 0.06 1
    if ($pass -eq 1 -and $third.ContainsKey($m)) { Add-Note "lead" $t0 $d (Freq $third[$m]) "sqr" 0.11 0.008 0.06 1 }
  }
}

# ascending run into the finale (bar 15)
foreach ($e in @(@(0.0, 64), @(0.5, 67), @(1.0, 71), @(2.0, 76))) {
  Add-Note "lead" (($e[0] * $beat) + 14 * $bar) (1.1 * $beat) (Freq $e[1]) "sqr" 0.18 0.008 0.3 1
}

# ---------- echo on the lead bus into L/R ----------
$L = New-Object 'double[]' $N
$R = New-Object 'double[]' $N
for ($i = 0; $i -lt $N; $i++) { $L[$i] = $script:mix[$i] + $script:lead[$i]; $R[$i] = $script:mix[$i] + $script:lead[$i] }
$taps = @(@(0.11, 0.17, "R"), @(0.185, 0.11, "L"), @(0.26, 0.07, "R"))
foreach ($tp in $taps) {
  $d = [int]($tp[0] * $SR); $g = $tp[1]
  for ($i = 0; $i -lt ($N - $d); $i++) {
    $s = $script:lead[$i] * $g
    if ($tp[2] -eq "R") { $R[$i + $d] += $s } else { $L[$i + $d] += $s }
  }
}

# ---------- diagnostics + master: soft clip, normalise ----------
$nan = 0; $firstNan = -1; $nz = 0
for ($i = 0; $i -lt $N; $i++) {
  if ([double]::IsNaN($script:mix[$i]) -or [double]::IsNaN($script:lead[$i])) {
    $nan++; if ($firstNan -lt 0) { $firstNan = $i }
  }
  if ($script:mix[$i] -ne 0 -or $script:lead[$i] -ne 0) { $nz++ }
}
"Diagnostics: NaN samples in busses = $nan (first at index $firstNan, t = {0:N3}s); non-zero samples = {1:N0}" -f ($firstNan / [double]$SR), $nz

$peak = 0.0
for ($i = 0; $i -lt $N; $i++) {
  if ([double]::IsNaN($L[$i])) { $L[$i] = 0.0 }
  if ([double]::IsNaN($R[$i])) { $R[$i] = 0.0 }
  $L[$i] = [math]::Tanh($L[$i] * 1.25); $R[$i] = [math]::Tanh($R[$i] * 1.25)
  $a = [math]::Abs($L[$i]); if ($a -gt $peak) { $peak = $a }
  $a = [math]::Abs($R[$i]); if ($a -gt $peak) { $peak = $a }
}
$gain = if ($peak -gt 0.001 -and -not [double]::IsNaN($peak)) { 0.9 / $peak } else { 1.0 }

# ---------- write WAV ----------
$path = "C:\Users\manik\Desktop\birthday\public\audio\web-slinger-theme.wav"
New-Item -ItemType Directory -Force -Path (Split-Path $path) | Out-Null
$bytes = New-Object byte[] (44 + $N * 4)
[System.Text.Encoding]::ASCII.GetBytes("RIFF").CopyTo($bytes, 0)
[System.BitConverter]::GetBytes([int](36 + $N * 4)).CopyTo($bytes, 4)
[System.Text.Encoding]::ASCII.GetBytes("WAVEfmt ").CopyTo($bytes, 8)
[System.BitConverter]::GetBytes([int]16).CopyTo($bytes, 16)
[System.BitConverter]::GetBytes([int]1).CopyTo($bytes, 20)
[System.BitConverter]::GetBytes([int]2).CopyTo($bytes, 22)
[System.BitConverter]::GetBytes([int]$SR).CopyTo($bytes, 24)
[System.BitConverter]::GetBytes([int]($SR * 4)).CopyTo($bytes, 28)
[System.BitConverter]::GetBytes([int]4).CopyTo($bytes, 32)
[System.BitConverter]::GetBytes([int]16).CopyTo($bytes, 34)
[System.Text.Encoding]::ASCII.GetBytes("data").CopyTo($bytes, 36)
[System.BitConverter]::GetBytes([int]($N * 4)).CopyTo($bytes, 40)
for ($i = 0; $i -lt $N; $i++) {
  [System.BitConverter]::GetBytes([int16]([math]::Round([math]::Max(-1.0, [math]::Min(1.0, $L[$i] * $gain)) * 32767))).CopyTo($bytes, 44 + $i * 4)
  [System.BitConverter]::GetBytes([int16]([math]::Round([math]::Max(-1.0, [math]::Min(1.0, $R[$i] * $gain)) * 32767))).CopyTo($bytes, 44 + $i * 4 + 2)
}
[System.IO.File]::WriteAllBytes($path, $bytes)
$f = Get-Item $path
"done: {0}  duration {1:N1}s  peak {2:N2}" -f $f.Name, ($N / $SR), $peak
