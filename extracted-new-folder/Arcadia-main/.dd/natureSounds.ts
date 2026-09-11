/**
 * Procedural nature soundscapes generated with the Web Audio API.
 * Everything is synthesised in the browser, so playback is instant,
 * gapless and works offline - important for a calm, uninterrupted
 * experience.
 */

export type TuneId =
  | "rain"
  | "waterfall"
  | "leaves"
  | "fireflies"
  | "ocean"
  | "campfire"
  | "birds"
  | "stream"
  | "thunder";

type Voice = {
  stop: (when?: number) => void;
};

let ctx: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;

function getContext(): AudioContext {
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function getNoise(audio: AudioContext): AudioBuffer {
  if (noiseBuffer) return noiseBuffer;
  const length = audio.sampleRate * 6;
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const data = buffer.getChannelData(0);
  // Pink-ish noise (Voss/Paul Kellet approximation) - much warmer than white.
  let b0 = 0,
    b1 = 0,
    b2 = 0,
    b3 = 0,
    b4 = 0,
    b5 = 0,
    b6 = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.969 * b2 + white * 0.153852;
    b3 = 0.8665 * b3 + white * 0.3104856;
    b4 = 0.55 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.016898;
    data[i] =
      (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    b6 = white * 0.115926;
  }
  noiseBuffer = buffer;
  return buffer;
}

function noiseSource(audio: AudioContext) {
  const src = audio.createBufferSource();
  src.buffer = getNoise(audio);
  src.loop = true;
  return src;
}

function lfo(
  audio: AudioContext,
  rate: number,
  depth: number,
  target: AudioParam,
) {
  const osc = audio.createOscillator();
  osc.type = "sine";
  osc.frequency.value = rate;
  const gain = audio.createGain();
  gain.gain.value = depth;
  osc.connect(gain).connect(target);
  osc.start();
  return osc;
}

function buildRain(audio: AudioContext, out: GainNode): Voice {
  const src = noiseSource(audio);
  const hp = audio.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 450;
  const lp = audio.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 6500;
  const body = audio.createGain();
  body.gain.value = 0.85;
  src.connect(hp).connect(lp).connect(body).connect(out);

  // Distant, softer layer for depth.
  const src2 = noiseSource(audio);
  src2.playbackRate.value = 0.8;
  const lp2 = audio.createBiquadFilter();
  lp2.type = "lowpass";
  lp2.frequency.value = 900;
  const g2 = audio.createGain();
  g2.gain.value = 0.5;
  src2.connect(lp2).connect(g2).connect(out);

  const swell = lfo(audio, 0.08, 0.12, body.gain);
  src.start();
  src2.start();

  // Occasional soft droplets.
  let stopped = false;
  const drop = () => {
    if (stopped) return;
    const t = audio.currentTime;
    const osc = audio.createOscillator();
    osc.type = "sine";
    const f = 900 + Math.random() * 1400;
    osc.frequency.setValueAtTime(f, t);
    osc.frequency.exponentialRampToValueAtTime(f * 0.45, t + 0.14);
    const g = audio.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    osc.connect(g).connect(out);
    osc.start(t);
    osc.stop(t + 0.25);
    timer = window.setTimeout(drop, 400 + Math.random() * 900);
  };
  let timer = window.setTimeout(drop, 500);

  return {
    stop: (when = 0) => {
      stopped = true;
      window.clearTimeout(timer);
      src.stop(when);
      src2.stop(when);
      swell.stop(when);
    },
  };
}

function buildWaterfall(audio: AudioContext, out: GainNode): Voice {
  const src = noiseSource(audio);
  const lp = audio.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 2600;
  const g = audio.createGain();
  g.gain.value = 0.9;
  src.connect(lp).connect(g).connect(out);

  const rumble = noiseSource(audio);
  rumble.playbackRate.value = 0.6;
  const lp2 = audio.createBiquadFilter();
  lp2.type = "lowpass";
  lp2.frequency.value = 260;
  const g2 = audio.createGain();
  g2.gain.value = 1.4;
  rumble.connect(lp2).connect(g2).connect(out);

  const spray = noiseSource(audio);
  const bp = audio.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 5200;
  bp.Q.value = 0.6;
  const g3 = audio.createGain();
  g3.gain.value = 0.35;
  spray.connect(bp).connect(g3).connect(out);

  const churn = lfo(audio, 0.25, 380, lp.frequency);
  src.start();
  rumble.start();
  spray.start();

  return {
    stop: (when = 0) => {
      src.stop(when);
      rumble.stop(when);
      spray.stop(when);
      churn.stop(when);
    },
  };
}

function buildLeaves(audio: AudioContext, out: GainNode): Voice {
  const src = noiseSource(audio);
  const bp = audio.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1400;
  bp.Q.value = 0.5;
  const hp = audio.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 700;
  const g = audio.createGain();
  g.gain.value = 0.55;
  src.connect(bp).connect(hp).connect(g).connect(out);

  const gust = lfo(audio, 0.13, 0.4, g.gain);
  const sweep = lfo(audio, 0.09, 700, bp.frequency);

  const breeze = noiseSource(audio);
  breeze.playbackRate.value = 0.7;
  const lp = audio.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 420;
  const g2 = audio.createGain();
  g2.gain.value = 0.5;
  breeze.connect(lp).connect(g2).connect(out);
  const breath = lfo(audio, 0.07, 0.35, g2.gain);

  src.start();
  breeze.start();

  return {
    stop: (when = 0) => {
      src.stop(when);
      breeze.stop(when);
      gust.stop(when);
      sweep.stop(when);
      breath.stop(when);
    },
  };
}

function buildFireflies(audio: AudioContext, out: GainNode): Voice {
  // Warm summer night: soft air plus gentle cricket chirps.
  const air = noiseSource(audio);
  const lp = audio.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 320;
  const ag = audio.createGain();
  ag.gain.value = 0.5;
  air.connect(lp).connect(ag).connect(out);
  air.start();

  let stopped = false;
  const chirp = (base: number, at: number) => {
    for (let i = 0; i < 4; i++) {
      const t = at + i * 0.075;
      const osc = audio.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = base + (Math.random() * 120 - 60);
      const bp = audio.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = base;
      bp.Q.value = 8;
      const g = audio.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.07, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.055);
      osc.connect(bp).connect(g).connect(out);
      osc.start(t);
      osc.stop(t + 0.08);
    }
  };
  const loop = () => {
    if (stopped) return;
    const now = audio.currentTime;
    chirp(3600 + Math.random() * 800, now + 0.02);
    if (Math.random() > 0.45) chirp(2700 + Math.random() * 500, now + 0.3);
    timer = window.setTimeout(loop, 650 + Math.random() * 600);
  };
  let timer = window.setTimeout(loop, 150);

  return {
    stop: (when = 0) => {
      stopped = true;
      window.clearTimeout(timer);
      air.stop(when);
    },
  };
}

function buildOcean(audio: AudioContext, out: GainNode): Voice {
  const src = noiseSource(audio);
  const lp = audio.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 900;
  const g = audio.createGain();
  g.gain.value = 0.35;
  src.connect(lp).connect(g).connect(out);
  src.start();

  const deep = noiseSource(audio);
  deep.playbackRate.value = 0.5;
  const lp2 = audio.createBiquadFilter();
  lp2.type = "lowpass";
  lp2.frequency.value = 200;
  const g2 = audio.createGain();
  g2.gain.value = 0.9;
  deep.connect(lp2).connect(g2).connect(out);
  deep.start();

  // Slow breaking waves, roughly one every nine seconds.
  let stopped = false;
  const wave = () => {
    if (stopped) return;
    const t = audio.currentTime;
    g.gain.cancelScheduledValues(t);
    g.gain.setValueAtTime(g.gain.value, t);
    g.gain.linearRampToValueAtTime(1.15, t + 2.6);
    g.gain.linearRampToValueAtTime(0.3, t + 7.5);
    lp.frequency.cancelScheduledValues(t);
    lp.frequency.setValueAtTime(lp.frequency.value, t);
    lp.frequency.linearRampToValueAtTime(3800, t + 2.6);
    lp.frequency.linearRampToValueAtTime(800, t + 7.5);
    timer = window.setTimeout(wave, 8600);
  };
  let timer = window.setTimeout(wave, 60);

  return {
    stop: (when = 0) => {
      stopped = true;
      window.clearTimeout(timer);
      src.stop(when);
      deep.stop(when);
    },
  };
}

function buildCampfire(audio: AudioContext, out: GainNode): Voice {
  const src = noiseSource(audio);
  const lp = audio.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 480;
  const g = audio.createGain();
  g.gain.value = 1.1;
  src.connect(lp).connect(g).connect(out);
  src.start();
  const flicker = lfo(audio, 0.6, 0.35, g.gain);

  let stopped = false;
  const crackle = () => {
    if (stopped) return;
    const t = audio.currentTime;
    const pops = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < pops; i++) {
      const at = t + i * (0.03 + Math.random() * 0.09);
      const s = audio.createBufferSource();
      s.buffer = getNoise(audio);
      s.playbackRate.value = 1.6 + Math.random();
      const bp = audio.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 1200 + Math.random() * 2600;
      bp.Q.value = 3;
      const cg = audio.createGain();
      cg.gain.setValueAtTime(0.0001, at);
      cg.gain.exponentialRampToValueAtTime(0.5 + Math.random() * 0.5, at + 0.005);
      cg.gain.exponentialRampToValueAtTime(0.0001, at + 0.07);
      s.connect(bp).connect(cg).connect(out);
      s.start(at, Math.random() * 4);
      s.stop(at + 0.1);
    }
    timer = window.setTimeout(crackle, 180 + Math.random() * 700);
  };
  let timer = window.setTimeout(crackle, 120);

  return {
    stop: (when = 0) => {
      stopped = true;
      window.clearTimeout(timer);
      src.stop(when);
      flicker.stop(when);
    },
  };
}

function buildBirds(audio: AudioContext, out: GainNode): Voice {
  // Soft morning air.
  const air = noiseSource(audio);
  const lp = audio.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 380;
  const ag = audio.createGain();
  ag.gain.value = 0.3;
  air.connect(lp).connect(ag).connect(out);
  air.start();

  // Cheerful little birdsong phrases: quick pitch slides between notes.
  let stopped = false;
  const phrase = () => {
    if (stopped) return;
    const now = audio.currentTime + 0.05;
    const base = 2200 + Math.random() * 1200;
    const notes = 3 + Math.floor(Math.random() * 4);
    let t = now;
    for (let i = 0; i < notes; i++) {
      const osc = audio.createOscillator();
      osc.type = "sine";
      const f1 = base * (0.9 + Math.random() * 0.5);
      const f2 = base * (0.8 + Math.random() * 0.6);
      const dur = 0.08 + Math.random() * 0.09;
      osc.frequency.setValueAtTime(f1, t);
      osc.frequency.exponentialRampToValueAtTime(f2, t + dur);
      const g = audio.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.09, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g).connect(out);
      osc.start(t);
      osc.stop(t + dur + 0.02);
      t += dur + 0.05 + Math.random() * 0.1;
    }
    timer = window.setTimeout(phrase, 900 + Math.random() * 1800);
  };
  let timer = window.setTimeout(phrase, 200);

  return {
    stop: (when = 0) => {
      stopped = true;
      window.clearTimeout(timer);
      air.stop(when);
    },
  };
}

function buildStream(audio: AudioContext, out: GainNode): Voice {
  // Babbling brook: bright moving water with soft burbles.
  const src = noiseSource(audio);
  const bp = audio.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 2400;
  bp.Q.value = 0.4;
  const g = audio.createGain();
  g.gain.value = 0.65;
  src.connect(bp).connect(g).connect(out);
  src.start();

  const ripple = lfo(audio, 0.35, 900, bp.frequency);
  const shimmer = lfo(audio, 0.22, 0.2, g.gain);

  // Low water bed for warmth.
  const bed = noiseSource(audio);
  bed.playbackRate.value = 0.8;
  const lp = audio.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 700;
  const bg = audio.createGain();
  bg.gain.value = 0.45;
  bed.connect(lp).connect(bg).connect(out);
  bed.start();

  // Little burbling blips.
  let stopped = false;
  const blip = () => {
    if (stopped) return;
    const t = audio.currentTime;
    const osc = audio.createOscillator();
    osc.type = "sine";
    const f = 500 + Math.random() * 900;
    osc.frequency.setValueAtTime(f, t);
    osc.frequency.exponentialRampToValueAtTime(f * 1.6, t + 0.06);
    const gg = audio.createGain();
    gg.gain.setValueAtTime(0.0001, t);
    gg.gain.exponentialRampToValueAtTime(0.05, t + 0.015);
    gg.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
    osc.connect(gg).connect(out);
    osc.start(t);
    osc.stop(t + 0.18);
    timer = window.setTimeout(blip, 120 + Math.random() * 380);
  };
  let timer = window.setTimeout(blip, 300);

  return {
    stop: (when = 0) => {
      stopped = true;
      window.clearTimeout(timer);
      src.stop(when);
      bed.stop(when);
      ripple.stop(when);
      shimmer.stop(when);
    },
  };
}

function buildThunder(audio: AudioContext, out: GainNode): Voice {
  // Cozy distant storm: soft rain bed plus gentle rolling thunder.
  const rain = noiseSource(audio);
  const hp = audio.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 500;
  const rlp = audio.createBiquadFilter();
  rlp.type = "lowpass";
  rlp.frequency.value = 4200;
  const rg = audio.createGain();
  rg.gain.value = 0.5;
  rain.connect(hp).connect(rlp).connect(rg).connect(out);
  rain.start();

  // Continuous low rumble bed.
  const rumble = noiseSource(audio);
  rumble.playbackRate.value = 0.35;
  const blp = audio.createBiquadFilter();
  blp.type = "lowpass";
  blp.frequency.value = 110;
  const bg = audio.createGain();
  bg.gain.value = 0.9;
  rumble.connect(blp).connect(bg).connect(out);
  rumble.start();

  // Occasional soft distant thunder rolls (kept gentle, never startling).
  let stopped = false;
  const roll = () => {
    if (stopped) return;
    const t = audio.currentTime;
    bg.gain.cancelScheduledValues(t);
    bg.gain.setValueAtTime(bg.gain.value, t);
    bg.gain.linearRampToValueAtTime(2.0, t + 0.5);
    bg.gain.exponentialRampToValueAtTime(0.9, t + 3.2);
    blp.frequency.cancelScheduledValues(t);
    blp.frequency.setValueAtTime(110, t);
    blp.frequency.linearRampToValueAtTime(220, t + 0.4);
    blp.frequency.linearRampToValueAtTime(90, t + 3);
    timer = window.setTimeout(roll, 4500 + Math.random() * 4000);
  };
  let timer = window.setTimeout(roll, 1500);

  return {
    stop: (when = 0) => {
      stopped = true;
      window.clearTimeout(timer);
      rain.stop(when);
      rumble.stop(when);
    },
  };
}

const builders: Record<
  TuneId,
  (audio: AudioContext, out: GainNode) => Voice
> = {
  rain: buildRain,
  waterfall: buildWaterfall,
  leaves: buildLeaves,
  fireflies: buildFireflies,
  ocean: buildOcean,
  campfire: buildCampfire,
  birds: buildBirds,
  stream: buildStream,
  thunder: buildThunder,
};

let current: { voice: Voice; gain: GainNode } | null = null;

/** Stops whatever is playing with a gentle fade. */
export function stopTune(fade = 0.4) {
  if (!current) return;
  const audio = getContext();
  const { voice, gain } = current;
  current = null;
  const t = audio.currentTime;
  gain.gain.cancelScheduledValues(t);
  gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + fade);
  voice.stop(t + fade + 0.1);
  window.setTimeout(() => gain.disconnect(), (fade + 0.4) * 1000);
}

/** Plays a nature soundscape, fading out anything already playing. */
export function playTune(id: TuneId, volume = 0.55) {
  const audio = getContext();
  stopTune(0.25);
  const gain = audio.createGain();
  gain.gain.setValueAtTime(0.0001, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    volume,
    audio.currentTime + 0.8,
  );
  gain.connect(audio.destination);
  const voice = builders[id](audio, gain);
  current = { voice, gain };
}

/** Short, warm confirmation chime for a correct answer. */
export function playChime(happy = true) {
  const audio = getContext();
  const notes = happy ? [523.25, 659.25, 783.99] : [392, 349.23];
  notes.forEach((f, i) => {
    const t = audio.currentTime + i * 0.14;
    const osc = audio.createOscillator();
    osc.type = "sine";
    osc.frequency.value = f;
    const g = audio.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.18, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
    osc.connect(g).connect(audio.destination);
    osc.start(t);
    osc.stop(t + 0.75);
  });
}

/** Unlocks audio inside a user gesture (mobile autoplay policies). */
export function primeAudio() {
  const audio = getContext();
  if (audio.state === "suspended") void audio.resume();
}
