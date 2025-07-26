export const generateUUID = (): string => {
    if (typeof crypto?.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    // Fallback for older environments (shouldn't be needed in modern Node/Browser)
    const random = crypto.getRandomValues(new Uint8Array(16));
    // Set version 4 UUID bits
    random[6] = (random[6] & 0x0f) | 0x40;
    random[8] = (random[8] & 0x3f) | 0x80;

    const hex = Array.from(random)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};
