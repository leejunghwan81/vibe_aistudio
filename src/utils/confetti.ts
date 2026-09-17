import confetti from 'canvas-confetti';

export function fireConfetti() {
  try {
    // School celebration style dual burst
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7, x: 0.3 },
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
    });
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7, x: 0.7 },
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
    });
  } catch {
    // fail gracefully
  }
}

export function fireBigConfetti() {
  try {
    const end = Date.now() + 1.2 * 1000;
    const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  } catch {
    // fail gracefully
  }
}
