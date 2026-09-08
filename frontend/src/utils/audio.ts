// Synthesizes pleasant railway announcement chimes using Web Audio API
export function playRailwayChime() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // Classic 4-note melodic chime: G4 -> C5 -> E5 -> G5
    const notes = [392.00, 523.25, 659.25, 783.99];
    const startTime = ctx.currentTime + 0.05;

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime + index * 0.18);

      gain.gain.setValueAtTime(0, startTime + index * 0.18);
      gain.gain.linearRampToValueAtTime(0.2, startTime + index * 0.18 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + index * 0.18 + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime + index * 0.18);
      osc.stop(startTime + index * 0.18 + 0.55);
    });
  } catch {
    // Audio context may be restricted by autoplay policy until user interaction
  }
}
