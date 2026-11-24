export function drawSpectrum(analyser, context, canvas, frequencyNode, rmsNode) {
  if (!analyser) return;
  const data = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(data);
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#64e0bd";
  const step = Math.max(1, Math.floor(data.length / 110));
  const barWidth = canvas.width / Math.ceil(data.length / step);
  let peak = 0;
  for (let i = 0; i < data.length; i += step) {
    if (data[i] > data[peak]) peak = i;
    const height = (data[i] / 255) * canvas.height;
    ctx.fillRect((i / step) * barWidth, canvas.height - height, Math.max(1, barWidth - 2), height);
  }
  frequencyNode.textContent = `${(peak * context.sampleRate / 2 / data.length).toFixed(1)} Hz`;
  const samples = new Float32Array(analyser.fftSize);
  analyser.getFloatTimeDomainData(samples);
  const rms = Math.sqrt(samples.reduce((sum, value) => sum + value * value, 0) / samples.length);
  rmsNode.textContent = rms.toFixed(4);
}
