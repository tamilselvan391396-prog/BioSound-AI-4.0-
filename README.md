# BioSound AI 4.0 starter

This is the first implementation package: a modular web/PWA baseline plus a native Android project scaffold.

## Web app

1. Keep the existing GitHub Pages repository backed up.
2. Copy these files into the repository root, replacing the old `index.html`, `manifest.webmanifest`, and `sw.js`.
3. Keep the `web/` directory structure unchanged.
4. Serve through HTTPS (GitHub Pages is HTTPS). Microphone access does not work from an ordinary insecure HTTP page.
5. Open the site, grant microphone permission, and tap **Start listening**.

The browser classifier uses MediaPipe Tasks Audio and the YAMNet model. The JavaScript API accepts a `Float32Array` and the capture sample rate; MediaPipe performs model-specific audio preprocessing. The AudioWorklet sends mono microphone blocks to the page. This starter groups repeated predictions into a basic event timeline.

## Current limitations

- The browser model and WASM are loaded from external Google/MediaPipe hosting, so first load requires internet.
- The service worker caches the app shell only; it does not claim offline model availability.
- The current timeline is a basic prediction grouping feature, not a validated multi-event detector.
- Category grouping is a starter taxonomy and needs review against actual YAMNet labels.
- Audio is processed in the browser and is not sent to a server by this starter.
- This package has not been built or tested on your phone. Test it on a real Android device before replacing the live website.

## Android scaffold

Open the `android/` folder in Android Studio. The model file is intentionally not bundled.

Download the official YAMNet TFLite model from the MediaPipe audio classifier model resources and place it at:

`android/app/src/main/assets/yamnet.tflite`

Then implement the streaming `AudioRecord` pipeline using the MediaPipe Audio Classifier API. See:
- https://developers.google.com/edge/mediapipe/solutions/audio/audio_classifier
- https://developers.google.com/edge/api/mediapipe/java/com/google/mediapipe/tasks/audio/audioclassifier/AudioClassifier

## Free-budget policy

- GitHub Pages hosts the static website.
- MediaPipe and YAMNet run on-device/in-browser.
- No paid inference API is required for baseline classification.
- Optional cloud specialist inference is not implemented in this starter.

## Suggested validation

Test with labelled recordings across animals, human sounds, transport, machinery, nature, household sounds, music and alerts. Record precision, recall, macro-F1, confusion matrix, latency and false positives. Do not describe raw model scores as calibrated probabilities.
