// Uploaded images are downscaled into data URLs: small enough to keep in
// localStorage and to send to an OBS overlay over the PeerJS relay.

export const IMAGE_SLOTS = {
  center: { max: 512, type: 'image/webp' },   // logo in the hub (keeps transparency)
  wheel: { max: 1024, type: 'image/webp' },   // image across the wheel face
  bg: { max: 1920, type: 'image/jpeg' },      // overlay background
};

export function loadImage(src) {
  return new Promise(resolve => {
    if (!src) return resolve(null);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export async function fileToDataURL(file, slot) {
  const { max, type } = IMAGE_SLOTS[slot];
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    if (!img || !img.width) throw new Error('unreadable image');
    const k = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement('canvas');
    c.width = Math.round(img.width * k);
    c.height = Math.round(img.height * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL(type, 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function loadAll(srcs = {}) {
  const [center, wheel, bg] = await Promise.all(['center', 'wheel', 'bg'].map(k => loadImage(srcs[k])));
  return { center, wheel, bg };
}
