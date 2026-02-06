const pressers = new Map<string, number>();

const STALENESS_MS = 2000;

export function setPressed(userId: string): void {
  pressers.set(userId, Date.now());
}

export function removePressed(userId: string): void {
  pressers.delete(userId);
}

export function getActiveCount(): number {
  const now = Date.now();
  let count = 0;
  for (const [userId, timestamp] of pressers) {
    if (now - timestamp > STALENESS_MS) {
      pressers.delete(userId);
    } else {
      count++;
    }
  }
  return count;
}

export function isThresholdMet(): boolean {
  const threshold = parseInt(process.env.PRESS_THRESHOLD || "2", 10);
  return getActiveCount() >= threshold;
}
