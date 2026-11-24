class BioSoundCaptureProcessor extends AudioWorkletProcessor {
  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];
    if (input && input[0]) {
      const copy = new Float32Array(input[0]);
      this.port.postMessage(copy, [copy.buffer]);
    }
    // Keep the node alive without monitoring microphone audio through speakers.
    if (output && output[0]) output[0].fill(0);
    return true;
  }
}
registerProcessor("biosound-capture", BioSoundCaptureProcessor);
