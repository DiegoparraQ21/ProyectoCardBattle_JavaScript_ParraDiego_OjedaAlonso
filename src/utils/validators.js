export function isValidNickname(value) {
  const nickname = value.trim();
  return nickname.length >= 3 && nickname.length <= 18 && /^[a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ]+$/.test(nickname);
}

export function isValidCard(card) {
  return Boolean(
    card?.id &&
    card?.nombre &&
    card?.tipo &&
    card?.imagen &&
    Number(card?.hp) === 250 &&
    Array.isArray(card?.ataques) &&
    card.ataques.length === 4 &&
    card?.defensa &&
    card?.especial
  );
}

export function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
