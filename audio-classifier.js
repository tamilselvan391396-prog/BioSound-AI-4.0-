import { AudioClassifier, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-audio@0.10.14";

const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/audio_classifier/yamnet/float32/latest/yamnet.tflite";
const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-audio@0.10.14/wasm";

export class BioSoundClassifier {
  constructor() { this.classifier = null; }
  async load() {
    if (this.classifier) return;
    const fileset = await FilesetResolver.forAudioTasks(WASM_URL);
    this.classifier = await AudioClassifier.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: MODEL_URL },
      maxResults: 5,
      scoreThreshold: 0.05
    });
  }
  classify(samples, sampleRate) {
    if (!this.classifier) throw new Error("The sound model has not loaded.");
    return this.classifier.classify(samples, sampleRate);
  }
  close() {
    this.classifier?.close();
    this.classifier = null;
  }
}
