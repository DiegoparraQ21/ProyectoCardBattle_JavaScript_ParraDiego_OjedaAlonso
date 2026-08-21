async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    let detail = '';
    try {
      detail = await response.text();
    } catch {
      detail = '';
    }
    throw new Error(`HTTP ${response.status}: ${detail || response.statusText}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

export { request };
