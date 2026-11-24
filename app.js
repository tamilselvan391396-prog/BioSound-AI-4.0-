import { BioSoundClassifier } from "./audio-classifier.js";
import { categoryFor } from "./sound-taxonomy.js";
import { EventTimeline } from "./event-timeline.js";
import { drawSpectrum } from "./frequency.js";

const $ = id => document.getElementById(id);

const classifier = new BioSoundClassifier();
const timeline = new EventTimeline($("timeline"));

let stream = null;
let context = null;
let source = null;
let worklet = null;
let analyser = null;

let active = false;
let pending = [];
let frameSamples = 0;
let inferenceBusy = false;
let animationId = 0;

function setStatus(message, live = false) {
  $("statusText").textContent = message;
  $("statusDot").classList.toggle("live", live);
}

function showError(message) {
  $("errorText").textContent = message;
}

function showResults(resultList) {
  const result = resultList?.[0];
  const categories = result?.classifications?.[0]?.categories ?? [];

  if (!categories.length) return;

  const best = categories[0];
  const label = best.displayName || best.categoryName || "Unknown";
  const category = categoryFor(label);

  $("currentSound").textContent =
    best.score < 0.12 ? "Uncertain — keep listening" : label;

  $("currentScore").textContent =
    `Model score: ${(best.score * 100).toFixed(1)}% · ${category} (not calibrated probability)`;

  $("scoreMeter").style.width =
    `${Math.max(0, Math.min(100, best.score * 100))}%`;

  const alternatives = $("alternatives");
  alternatives.replaceChildren();

  for (const item of categories.slice(1, 5)) {
    const li = document.createElement("li");
    li.textContent =
      `${item.displayName || item.categoryName} · ${(item.score * 100).toFixed(1)}%`;
    alternatives.append(li);
  }

  if (categories.length < 2) {
    const li = document.createElement("li");
    li.className = "muted";
    li.textContent = "No other strong matches.";
    alternatives.append(li);
  }

  timeline.add(label, category, best.score);
}

function appendSamples(chunk) {
  for (const value of chunk) {
    pending.push(value);
  }

  if (pending.length < frameSamples || inferenceBusy) return;

  const frame = new Float32Array(
    pending.splice(0, frameSamples)
  );

  inferenceBusy = true;

  try {
    showResults(classifier.classify(frame, context.sampleRate));
  } catch (error) {
    showError(`Classification error: ${error.message}`);
  } finally {
    inferenceBusy = false;
  }
}

function animate() {
  if (!active) return;

  drawSpectrum(
    analyser,
    context,
    $("spectrum"),
    $("frequencyValue"),
    $("rmsValue")
  );

  animationId = requestAnimationFrame(animate);
}

async function start() {
  $("startButton").disabled = true;
  showError("");

  try {
    if (
      !window.isSecureContext ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      throw new Error(
        "Microphone access requires HTTPS (or localhost)."
      );
    }

    setStatus("Requesting microphone permission…");

    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      }
    });

    setStatus("Loading MediaPipe and YAMNet…");

    await classifier.load();

    context = new AudioContext();
    await context.resume();

    await context.audioWorklet.addModule("./audio-worklet.js");

    source = context.createMediaStreamSource(stream);

    analyser = context.createAnalyser();
    analyser.fftSize = 2048;

    source.connect(analyser);

    worklet = new AudioWorkletNode(
      context,
      "biosound-capture",
      {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        outputChannelCount: [1]
      }
    );

    worklet.port.onmessage = event => {
      appendSamples(event.data);
    };

    source.connect(worklet);
    worklet.connect(context.destination);

    frameSamples = Math.round(context.sampleRate * 0.975);
    pending = [];

    active = true;

    $("stopButton").disabled = false;

    setStatus("Listening — make a sound near your device", true);

    animate();

  } catch (error) {
    showError(
      `Could not start: ${error.message}\nCheck internet, HTTPS and microphone permission.`
    );

    await stop(false);

    $("startButton").disabled = false;
    setStatus("Microphone or model setup failed");
  }
}

async function stop(resetStatus = true) {
  active = false;

  cancelAnimationFrame(animationId);

  if (worklet) {
    worklet.port.onmessage = null;
    worklet.disconnect();
    worklet = null;
  }

  if (source) {
    source.disconnect();
    source = null;
  }

  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }

  if (context) {
    await context.close().catch(() => {});
    context = null;
  }

  analyser = null;
  pending = [];
  inferenceBusy = false;

  $("startButton").disabled = false;
  $("stopButton").disabled = true;

  if (resetStatus) {
    setStatus("Stopped");
  }
}

$("startButton").addEventListener("click", start);

$("stopButton").addEventListener("click", () => stop());

$("clearHistory").addEventListener("click", () => {
  timeline.clear();
});

if (
  "serviceWorker" in navigator &&
  location.protocol === "https:"
) {
  navigator.serviceWorker.register("./sw.js")
    .catch(error => console.warn(
      "Service worker registration failed",
      error
    ));
}
