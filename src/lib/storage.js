const KEY = 'bp:data/v1';
export function load(fb) { try {
    const t = localStorage.getItem(KEY);
    if (!t)
        return fb;
    return JSON.parse(t);
}
catch {
    return fb;
} }
export function save(d) { try {
    localStorage.setItem(KEY, JSON.stringify(d));
}
catch { } }
