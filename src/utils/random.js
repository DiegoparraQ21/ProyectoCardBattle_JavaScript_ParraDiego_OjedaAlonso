export function randomFloat(min = 0, max = 1) {
  return Math.random() * (max - min) + min;
}

export function randomInt(min, max) {
  return Math.floor(randomFloat(min, max + 1));
}

export function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function calculateDamage(baseDamage) {
  const factor = randomFloat(0.85, 1.15);
  return Math.round(baseDamage * factor);
}
