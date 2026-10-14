(() => {
  // Procedural Web Audio Engine for Build Your Town
  // 100% Synthesized in real-time - 0 External Audio Assets

  let audioCtx = null;
  let sfxGain = null;
  let bgmGain = null;
  let bgmFilter = null;
  let noiseBuffer = null;
  let isMuted = false;
  let isPlayingBgm = false;
  let bgmTimer = null;
  const melodyVoices = new Set();
  let lastAlert = -Infinity;
  let lastMilestone = -Infinity;
  let activeBgmVoices = [];

  const STORAGE_KEY = "citybuilder.sound";

  // Check persisted sound preference
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "0") isMuted = true;
  } catch {}

  // Initialize AudioContext on first user interaction
  const getAudioContext = () => {
    if (!audioCtx) {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      audioCtx = new AudioContextClass();

      // Master SFX Bus
      sfxGain = audioCtx.createGain();
      sfxGain.gain.setValueAtTime(isMuted ? 0 : 0.22, audioCtx.currentTime);
      sfxGain.connect(audioCtx.destination);

      // Master BGM Bus with Lowpass Filter for warm ambient sound
      bgmFilter = audioCtx.createBiquadFilter();
      bgmFilter.type = "lowpass";
      bgmFilter.frequency.setValueAtTime(1800, audioCtx.currentTime);
      bgmFilter.Q.setValueAtTime(0.5, audioCtx.currentTime);

      bgmGain = audioCtx.createGain();
      bgmGain.gain.setValueAtTime(isMuted ? 0 : 0.2, audioCtx.currentTime);
      bgmFilter.connect(bgmGain);
      bgmGain.connect(audioCtx.destination);

      // Pre-generate 1 second of noise buffer for demolition / textures
      const bufferSize = audioCtx.sampleRate;
      noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }

    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  };

  const startBgmIfNeeded = () => {
    if (isPlayingBgm || isMuted || document.hidden) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    isPlayingBgm = true;
    startAmbientEngine();
  };

  // SFX: Building / Structure Placement (Satisfying physical thud)
  const playPlace = () => {
    const ctx = getAudioContext();
    if (!ctx || isMuted) return;
    const t = ctx.currentTime;

    // Triangle drop
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.12);
    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(t);
    osc.stop(t + 0.15);

    // Punch sub-bass
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = "sine";
    sub.frequency.setValueAtTime(150, t);
    sub.frequency.exponentialRampToValueAtTime(45, t + 0.1);
    subGain.gain.setValueAtTime(0.8, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    sub.connect(subGain);
    subGain.connect(sfxGain);
    sub.start(t);
    sub.stop(t + 0.13);
  };

  // SFX: Bulldozer / Demolition (Filtered noise crunch + rubble drop)
  const playDemolish = () => {
    const ctx = getAudioContext();
    if (!ctx || isMuted || !noiseBuffer) return;
    const t = ctx.currentTime;

    // Filtered noise burst
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(700, t);
    filter.frequency.exponentialRampToValueAtTime(150, t + 0.28);
    filter.Q.setValueAtTime(2.0, t);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.7, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(sfxGain);
    noise.start(t);
    noise.stop(t + 0.32);

    // Low rumble thump
    const rumble = ctx.createOscillator();
    const rumbleGain = ctx.createGain();
    rumble.type = "triangle";
    rumble.frequency.setValueAtTime(130, t);
    rumble.frequency.exponentialRampToValueAtTime(35, t + 0.22);
    rumbleGain.gain.setValueAtTime(0.6, t);
    rumbleGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    rumble.connect(rumbleGain);
    rumbleGain.connect(sfxGain);
    rumble.start(t);
    rumble.stop(t + 0.26);
  };

  // SFX: Road / Wire / Rail (Crisp wooden block / tile snap)
  const playPave = () => {
    const ctx = getAudioContext();
    if (!ctx || isMuted) return;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(560, t);
    osc.frequency.exponentialRampToValueAtTime(240, t + 0.05);
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(t);
    osc.stop(t + 0.07);
  };

  // SFX: Zoning Res / Com / Ind (Rising harmonic chime)
  const playZone = () => {
    const ctx = getAudioContext();
    if (!ctx || isMuted) return;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(380, t);
    osc.frequency.exponentialRampToValueAtTime(620, t + 0.08);
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(t);
    osc.stop(t + 0.1);
  };

  // SFX: Terraform Raise / Lower
  const playTerraform = (raise = true) => {
    const ctx = getAudioContext();
    if (!ctx || isMuted) return;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    const startF = raise ? 90 : 220;
    const endF = raise ? 220 : 90;
    osc.frequency.setValueAtTime(startF, t);
    osc.frequency.exponentialRampToValueAtTime(endF, t + 0.16);
    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(t);
    osc.stop(t + 0.2);
  };

  // SFX: Milestone / Reward Unlock (Ascending major triad)
  const playMilestone = () => {
    const ctx = getAudioContext();
    if (!ctx || isMuted) return;
    const t = ctx.currentTime;
    if (ctx.currentTime - lastMilestone < 4) return;
    lastMilestone = ctx.currentTime;
    const notes = [392, 493.88, 587.33];

    notes.forEach((freq, idx) => {
      const start = t + idx * 0.09;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.16, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
      osc.connect(gain);
      gain.connect(sfxGain);
      osc.start(start);
      osc.stop(start + 0.55);
    });
  };

  // A quiet two-note cue, with a cooldown for recurring warnings.
  const playAlert = () => {
    const ctx = getAudioContext();
    if (!ctx || isMuted || document.hidden || ctx.currentTime - lastAlert < 20) return;
    lastAlert = ctx.currentTime;
    [392, 329.63].forEach((frequency, index) => {
      const start = ctx.currentTime + index * 0.22;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.14, start + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.55);
      osc.connect(gain);
      gain.connect(sfxGain);
      osc.start(start);
      osc.stop(start + 0.6);
    });
  };

  // SFX: Subtle UI Button Click
  const playClick = () => {
    const ctx = getAudioContext();
    if (!ctx || isMuted) return;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(280, t + 0.03);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(t);
    osc.stop(t + 0.04);
  };

  // ----------------------------------------------------
  // PROCEDURAL AMBIENT MUSIC ENGINE (BGM)
  // Slow melody, warm chords, and soft plucked accompaniment
  // ----------------------------------------------------

  const playAmbientPad = (frequencies, durationSec) => {
    const ctx = getAudioContext();
    if (!ctx || isMuted) return;
    const now = ctx.currentTime;

    // Fade out previous voices
    activeBgmVoices.forEach(({ osc, gain }) => {
      try {
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0.0001, now + 2.5);
        osc.stop(now + 2.6);
      } catch {}
    });
    activeBgmVoices = [];

    // Fade in new chord frequencies
    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Soft mix of sine and detuned triangle for warmth
      osc.type = idx % 2 === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, now);

      // Slight detune for analog warmth
      osc.detune.setValueAtTime((Math.random() - 0.5) * 6, now);

      const voiceMax = 0.06 / frequencies.length;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(voiceMax, now + 2.8);
      gain.gain.setValueAtTime(voiceMax, now + durationSec - 2.8);
      gain.gain.linearRampToValueAtTime(0.0001, now + durationSec);

      osc.connect(gain);
      gain.connect(bgmFilter);
      osc.onended = () => { osc.disconnect(); gain.disconnect(); };
      osc.start(now);
      osc.stop(now + durationSec + 0.2);

      activeBgmVoices.push({ osc, gain });
    });
  };

  const playMusicNote = (frequency, start, length, level, plucked = false) => {
    const ctx = audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = plucked ? "triangle" : "sine";
    osc.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(level, start + (plucked ? 0.018 : 0.08));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
    osc.connect(gain);
    gain.connect(bgmFilter);
    const voice = { osc, gain };
    melodyVoices.add(voice);
    osc.onended = () => {
      melodyVoices.delete(voice);
      osc.disconnect();
      gain.disconnect();
    };
    osc.start(start);
    osc.stop(start + length + 0.05);
  };

  let musicMode = null;
  let trackIndex = -1;
  let phraseIndex = 0;
  const pitch = midi => 440 * 2 ** ((midi - 69) / 12);

  const startAmbientEngine = () => {
    clearTimeout(bgmTimer);
    const mode = document.body.classList.contains("town-home") ? "menu" : "city";
    const tracks = window.__townMusic[mode];
    if (musicMode !== mode) {
      musicMode = mode;
      trackIndex = Math.floor(Math.random() * tracks.length);
      phraseIndex = 0;
    }
    const stepPhrase = () => {
      if (isMuted || document.hidden) return;
      const track = tracks[trackIndex];
      const beatLength = 60 / track.tempo;
      const section = phraseIndex % track.phrases.length;
      const answering = phraseIndex >= track.phrases.length;
      const chord = track.chords[section];
      const now = audioCtx.currentTime + 0.05;
      playAmbientPad(chord.map(pitch), beatLength * 8 + 1);
      const melody = answering ? track.answers[section] : track.phrases[section];
      for (const [beat, note] of melody) {
        playMusicNote(pitch(note), now + beat * beatLength,
          beatLength * (mode === "menu" ? 2 : 1.6), mode === "menu" ? 0.065 : 0.085);
      }
      const accompaniment = mode === "menu" ? [0, 4] : [0, 2, 4, 6];
      for (const [index, beat] of accompaniment.entries()) {
        const note = chord[index % chord.length];
        playMusicNote(pitch(note), now + beat * beatLength, beatLength * 1.4, 0.035, true);
      }
      if (mode === "city") {
        playMusicNote(pitch(chord[0] - 12), now, beatLength * 3, 0.045);
      }
      phraseIndex++;
      if (phraseIndex === track.phrases.length * 2) {
        phraseIndex = 0;
        trackIndex = (trackIndex + 1) % tracks.length;
      }
      bgmTimer = setTimeout(stepPhrase, beatLength * 8 * 1000);
    };
    stepPhrase();
  };

  const stopAmbientEngine = () => {
    if (bgmTimer) clearTimeout(bgmTimer);
    bgmTimer = null;
    isPlayingBgm = false;

    if (audioCtx) {
      const now = audioCtx.currentTime;
      [...activeBgmVoices, ...melodyVoices].forEach(({ osc, gain }) => {
        try {
          gain.gain.cancelScheduledValues(now);
          gain.gain.setValueAtTime(gain.gain.value, now);
          gain.gain.linearRampToValueAtTime(0.0001, now + 0.8);
          osc.stop(now + 0.9);
        } catch {}
      });
      activeBgmVoices = [];
      melodyVoices.clear();
    }
  };

  // ----------------------------------------------------
  // SOUND TOGGLE & MUTING CONTROLS
  // ----------------------------------------------------

  const setMuted = (muted) => {
    isMuted = muted;
    try {
      localStorage.setItem(STORAGE_KEY, isMuted ? "0" : "1");
    } catch {}

    const ctx = getAudioContext();
    if (ctx) {
      const now = ctx.currentTime;
      if (sfxGain) {
        sfxGain.gain.cancelScheduledValues(now);
        sfxGain.gain.setValueAtTime(isMuted ? 0 : 0.22, now);
      }
      if (bgmGain) {
        bgmGain.gain.cancelScheduledValues(now);
        bgmGain.gain.setValueAtTime(isMuted ? 0 : 0.2, now);
      }
    }

    if (isMuted) {
      stopAmbientEngine();
    } else {
      startBgmIfNeeded();
    }

    updateSoundButton();
  };

  const updateSoundButton = () => {
    const btn = document.getElementById("btn-sound");
    if (!btn) return;
    btn.textContent = isMuted ? "🔇" : "🔊";
    btn.title = isMuted
      ? "Sound: Muted / Son: Muet"
      : "Sound: ON / Son: Activé";
    btn.setAttribute("aria-label", btn.title);
  };

  // ----------------------------------------------------
  // GAME HOOKS & DOM MUTATION OBSERVERS
  // ----------------------------------------------------

  const initGameListeners = () => {
    // 1. Hook user interactions to unlock Web Audio context
    const unlock = () => {
      getAudioContext();
      startBgmIfNeeded();
    };
    window.addEventListener("pointerdown", unlock, { capture: true });
    window.addEventListener("keydown", unlock, { capture: true });

    const changeMusicScene = () => {
      if (!isPlayingBgm) return;
      stopAmbientEngine();
      startBgmIfNeeded();
    };
    window.addEventListener("town-city-entered", changeMusicScene);
    window.addEventListener("town-returned-home", changeMusicScene);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopAmbientEngine();
      else if (audioCtx) startBgmIfNeeded();
    });

    // 2. Sound Button in Topbar
    const soundBtn = document.getElementById("btn-sound");
    if (soundBtn) {
      soundBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        unlock();
        setMuted(!isMuted);
        if (!isMuted) playClick();
      });
      updateSoundButton();
    }

    // 3. UI clicks on toolbar and panels
    document.addEventListener("click", (e) => {
      const target = e.target;
      if (!target) return;
      if (
        target.closest("#toolbar button") ||
        target.closest("#flyout button") ||
        target.closest("#speed button") ||
        target.closest(".panel button") ||
        target.closest("#minimap button") ||
        target.closest("#btn-cities") ||
        target.closest("#btn-missions") ||
        target.closest(".era-tab") ||
        target.closest("#btn-lang") ||
        target.closest("#btn-help")
      ) {
        playClick();
      }
    });

    window.addEventListener("citybuilder-milestone", () => {
      playMilestone();
    });

    // 4. Map interaction and placement sound detection
    let lastMapAction = -Infinity;
    document.getElementById("map")?.addEventListener("pointerdown", () => {
      lastMapAction = performance.now();
    });
    document.getElementById("map")?.addEventListener("pointerup", () => {
      lastMapAction = performance.now();
    });
    const moneyEl = document.getElementById("money");
    const dateEl = document.getElementById("date");
    const toastEl = document.getElementById("toast");

    let lastMoney = null;
    let lastDate = dateEl?.textContent?.trim() || "";

    const parseMoney = (text) => {
      if (!text) return null;
      const clean = text.replace(/[^0-9-]/g, "");
      const val = parseInt(clean, 10);
      return isNaN(val) ? null : val;
    };

    if (moneyEl) {
      lastMoney = parseMoney(moneyEl.textContent);
    }

    // Determine currently active tool
    const getActiveTool = () => {
      const activeBtn = document.querySelector(
        "#toolbar button.tool.active, #flyout button.item.active"
      );
      if (activeBtn) {
        if (activeBtn.dataset.tool) return activeBtn.dataset.tool;
        if (activeBtn.dataset.current) return activeBtn.dataset.current;
      }
      const pill = document.getElementById("tool-pill");
      if (pill && !pill.hidden) {
        const txt = pill.textContent.toLowerCase();
        if (txt.includes("bulldoz") || txt.includes("démol")) return "bulldoze";
        if (txt.includes("rout") || txt.includes("road")) return "road";
        if (txt.includes("zone")) return "zone";
      }
      return null;
    };

    // Observe money & date changes
    if (moneyEl) {
      const moneyObserver = new MutationObserver(() => {
        const currentMoney = parseMoney(moneyEl.textContent);
        const currentDate = dateEl?.textContent?.trim() || "";

        if (lastMoney !== null && currentMoney !== null) {
          const delta = currentMoney - lastMoney;
          const monthPassed = currentDate !== lastDate;

          if (monthPassed) {
            // Month turned over
            lastDate = currentDate;
          } else if (delta < 0 && performance.now() - lastMapAction < 600 && !document.body.classList.contains("town-home")) {
            // Money spent on player action (placement, bulldoze, etc.)
            const tool = getActiveTool();
            if (tool === "bulldoze") {
              playDemolish();
            } else if (
              tool === "road" ||
              tool === "highway" ||
              tool === "rail" ||
              tool === "wire"
            ) {
              playPave();
            } else if (
              tool === "res" ||
              tool === "com" ||
              tool === "ind"
            ) {
              playZone();
            } else if (
              tool === "raise" ||
              tool === "lower" ||
              tool === "level"
            ) {
              playTerraform(tool === "raise");
            } else {
              // Any building / power / water structure
              playPlace();
            }
          }
        }
        lastMoney = currentMoney;
      });

      moneyObserver.observe(moneyEl, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    }

    // Observe date changes if not already covered
    if (dateEl) {
      const dateObserver = new MutationObserver(() => {
        lastDate = dateEl.textContent?.trim() || "";
      });
      dateObserver.observe(dateEl, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    }

    // Observe toasts for alerts & milestones
    if (toastEl) {
      let lastToastText = "";
      const toastObserver = new MutationObserver(() => {
        const text = toastEl.textContent?.trim() || "";
        if (!text || text === lastToastText || toastEl.hidden) return;
        lastToastText = text;

        if (toastEl.classList.contains("alert")) {
          playAlert();
        } else if (toastEl.classList.contains("good")) {
          playMilestone();
        }
      });

      toastObserver.observe(toastEl, {
        attributes: true,
        childList: true,
        characterData: true,
        subtree: true,
      });
    }

    // Adjust BGM filter when game is paused or resumed
    const speedEl = document.getElementById("speed");
    if (speedEl) {
      speedEl.addEventListener("click", () => {
        setTimeout(() => {
          const pauseBtn = speedEl.querySelector("button.pause.active");
          const ctx = getAudioContext();
          if (ctx && bgmFilter) {
            const now = ctx.currentTime;
            bgmFilter.frequency.cancelScheduledValues(now);
            bgmFilter.frequency.linearRampToValueAtTime(
              pauseBtn ? 1100 : 1800,
              now + 0.3
            );
          }
        }, 50);
      });
    }
  };

  // Run once DOM is loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGameListeners);
  } else {
    initGameListeners();
  }
})();
