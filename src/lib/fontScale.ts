// src/lib/fontScale.ts
const KEY = 'bp:fontScale'
export const MIN = 0.85
export const MAX = 1.25
export const STEP = 0.05
const clamp = (v: number) => Math.min(MAX, Math.max(MIN, v))

function apply(v: number) {
  document.documentElement.style.setProperty('--bp-font-scale', String(v))
}

export function loadFontScale() {
  let v = Number(localStorage.getItem(KEY))
  if (!v || Number.isNaN(v)) v = 1
  v = clamp(v)
  apply(v)
  return v
}

export function setFontScale(v: number) {
  const c = clamp(v)
  localStorage.setItem(KEY, String(c))
  apply(c)
  return c
}

export function incFontScale(current?: number) {
  const base = current ?? loadFontScale()
  return setFontScale(base + STEP)
}

export function decFontScale(current?: number) {
  const base = current ?? loadFontScale()
  return setFontScale(base - STEP)
}

export function resetFontScale() {
  return setFontScale(1)
}
