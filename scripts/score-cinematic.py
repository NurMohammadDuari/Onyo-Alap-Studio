"""Procedural score + SFX for the 10s Onyo Alap cinematic cut."""
import numpy as np, wave, sys

SR = 44100
DUR = 10.0
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)

def env(a, d, s, r, length, sus=0.7):
    """ADSR envelope over `length` seconds."""
    n = int(length * SR)
    e = np.zeros(n)
    ai, di, ri = int(a * SR), int(d * SR), int(r * SR)
    si = max(0, n - ai - di - ri)
    if ai: e[:ai] = np.linspace(0, 1, ai)
    if di: e[ai:ai + di] = np.linspace(1, sus, di)
    if si: e[ai + di:ai + di + si] = sus
    if ri: e[n - ri:] = np.linspace(sus, 0, ri)
    return e

def place(buf, sig, at):
    i = int(at * SR)
    j = min(len(buf), i + len(sig))
    if i < len(buf):
        buf[i:j] += sig[:j - i]

def note(freq, dur, amp=0.2, timbre='marimba', detune=0.0):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    if timbre == 'marimba':
        s = (np.sin(2*np.pi*freq*tt) * np.exp(-tt*4.5)
             + 0.35*np.sin(2*np.pi*freq*4*tt) * np.exp(-tt*11)
             + 0.12*np.sin(2*np.pi*freq*9*tt) * np.exp(-tt*18))
    elif timbre == 'pad':
        s = np.zeros(n)
        for h, g in [(1, 1.0), (2, 0.32), (3, 0.14), (4, 0.06), (5, 0.03)]:
            s += g*np.sin(2*np.pi*(freq*h + detune)*tt + rng.uniform(0, 6))
        s *= 0.55
    elif timbre == 'pluck':
        s = (np.sin(2*np.pi*freq*tt) * np.exp(-tt*7)
             + 0.5*np.sin(2*np.pi*freq*2.01*tt) * np.exp(-tt*12))
    else:
        s = np.sin(2*np.pi*freq*tt)
    return s * amp

def lowpass(x, a=0.15):
    y = np.zeros_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += a * (x[i] - acc)
        y[i] = acc
    return y

def noise_burst(dur, amp=0.2, hp=0.4, decay=18):
    n = int(dur * SR)
    x = rng.normal(0, 1, n)
    x = x - lowpass(x, 0.05)   # crude high-pass
    return x * np.exp(-np.arange(n)/SR*decay) * amp

# ---------------- music bed ----------------
music = np.zeros(N)
# chord pads: Cmaj7 -> Am7 -> Fmaj7 -> G
chords = [
    (0.0, 3.6, [130.81, 164.81, 196.00, 246.94]),
    (3.6, 3.3, [110.00, 130.81, 164.81, 196.00]),
    (6.9, 2.1, [87.31, 130.81, 174.61, 220.00]),
    (9.0, 1.0, [130.81, 196.00, 261.63, 329.63]),
]
for at, dur, notes in chords:
    for k, fq in enumerate(notes):
        sig = note(fq, dur + 0.35, amp=0.052 - k*0.004, timbre='pad', detune=rng.uniform(-0.6, 0.6))
        sig *= env(0.35, 0.2, 0.8, 0.45, len(sig)/SR, 0.8)
        place(music, sig, at)

# marimba motif (A minor pentatonic over the chords)
motif = [
    (0.9, 523.25, 0.22), (1.25, 659.25, 0.20), (1.75, 783.99, 0.17), (2.3, 659.25, 0.15),
    (2.85, 587.33, 0.13), (3.9, 440.00, 0.18), (4.35, 523.25, 0.16), (4.85, 659.25, 0.14),
    (5.5, 587.33, 0.13), (6.05, 523.25, 0.12), (7.15, 349.23, 0.16), (7.55, 440.00, 0.15),
    (8.0, 523.25, 0.14), (8.45, 587.33, 0.12), (9.05, 659.25, 0.16), (9.35, 783.99, 0.13),
]
for at, fq, a in motif:
    place(music, note(fq, 1.4, a, 'marimba'), at)

# soft plucks doubling
for at, fq, a in motif[::2]:
    place(music, note(fq/2, 1.2, a*0.35, 'pluck'), at + 0.02)

# low pulse at 96 bpm from 6.9s
for beat in np.arange(6.9, 9.2, 60/96):
    n = int(0.35*SR)
    tt = np.arange(n)/SR
    f0 = 68
    kick = np.sin(2*np.pi*(f0*np.exp(-tt*8))*tt) * np.exp(-tt*9) * 0.16
    place(music, kick, beat)

# ---------------- SFX ----------------
sfx = np.zeros(N)
# paper rustle at the two cuts
for at, amp in [(3.6, 0.10), (6.9, 0.11), (9.0, 0.07)]:
    place(sfx, noise_burst(0.45, amp, decay=16), at)

# birds at the opening
for at, f0 in [(0.55, 2600), (1.15, 3100), (2.6, 2400), (3.1, 2900)]:
    d = 0.16
    n = int(d*SR); tt = np.arange(n)/SR
    f = f0 + 600*np.sin(np.pi*tt/d)
    chirp = np.sin(2*np.pi*f*tt) * np.sin(np.pi*tt/d) * 0.035
    place(sfx, chirp, at)

# tea cup clink
n = int(0.5*SR); tt = np.arange(n)/SR
clink = (np.sin(2*np.pi*2100*tt) + 0.6*np.sin(2*np.pi*3150*tt)) * np.exp(-tt*14) * 0.05
place(sfx, clink, 4.6)

# jeep engine (7.0 - 8.7), pitch falls as it brakes
n = int(1.9*SR); tt = np.arange(n)/SR
f_eng = 58 + 26*np.exp(-tt*2.2) + 3*np.sin(2*np.pi*7*tt)
eng = np.sin(2*np.pi*f_eng*tt) + 0.45*np.sin(2*np.pi*f_eng*2*tt) + 0.2*np.sin(2*np.pi*f_eng*3*tt)
eng += 0.12*lowpass(rng.normal(0, 1, n), 0.25)
eng *= np.minimum(1, tt/0.35) * np.exp(-np.maximum(0, tt-1.55)*6) * 0.11
place(sfx, eng, 6.95)

# tyre/dust whoosh
place(sfx, noise_burst(0.9, 0.06, decay=4), 7.9)

# ---------------- mix ----------------
# simple stereo: slight widening by delaying one channel a few samples
mixL = music + sfx
mixR = music + sfx
d = 11
mixR = np.concatenate([np.zeros(d), mixR[:-d]]) * 0.985
mixL = np.concatenate([mixL[d:], np.zeros(d)]) * 0.985

# reverb (convolution with exponential noise IR)
ir_len = int(1.6*SR)
ir = rng.normal(0, 1, ir_len) * np.exp(-np.arange(ir_len)/SR*3.2)
ir[:int(0.02*SR)] = 0
ir /= np.sqrt(np.sum(ir**2))
def conv(x):
    n = len(x) + len(ir) - 1
    nf = 1 << (n-1).bit_length()
    y = np.fft.irfft(np.fft.rfft(x, nf) * np.fft.rfft(ir, nf), nf)[:len(x)]
    return y
mixL = mixL*0.82 + conv(mixL)*0.30
mixR = mixR*0.82 + conv(mixR)*0.30

# master fades + soft clip
fade_in = np.minimum(1, t/0.5)
fade_out = np.clip((DUR - t)/0.9, 0, 1)
master = fade_in * fade_out
mixL *= master; mixR *= master
mixL = np.tanh(mixL*1.25); mixR = np.tanh(mixR*1.25)
peak = max(np.max(np.abs(mixL)), np.max(np.abs(mixR)), 1e-6)
gain = 0.92/peak
mixL *= gain; mixR *= gain

stereo = np.stack([mixL, mixR], axis=1)
pcm = (np.clip(stereo, -1, 1) * 32767).astype('<i2')

out = sys.argv[1] if len(sys.argv) > 1 else 'score.wav'
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('wrote', out, 'peak', float(np.max(np.abs(stereo))))
