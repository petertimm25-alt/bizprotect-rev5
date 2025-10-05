// src/lib/toast.ts
export function toast(message: string, timeout = 2600) {
  const hostId = '__bp_toast_host__'
  let host = document.getElementById(hostId)
  if (!host) {
    host = document.createElement('div')
    host.id = hostId
    Object.assign(host.style, {
      position: 'fixed',
      top: '16px',
      right: '16px',
      zIndex: '9999',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      pointerEvents: 'none',
    } as CSSStyleDeclaration)
    document.body.appendChild(host)
  }

  const el = document.createElement('div')
  el.textContent = message
  Object.assign(el.style, {
    pointerEvents: 'auto',
    background: 'rgba(12,12,16,0.9)',
    color: '#ffd666',
    border: '1px solid rgba(212,175,55,0.4)',
    borderRadius: '10px',
    padding: '10px 12px',
    fontSize: '12px',
    boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
    transform: 'translateY(-8px)',
    opacity: '0',
    transition: 'all 220ms ease',
    maxWidth: '320px',
  } as CSSStyleDeclaration)

  host.appendChild(el)
  requestAnimationFrame(() => {
    el.style.transform = 'translateY(0)'
    el.style.opacity = '1'
  })

  const h = window.setTimeout(() => {
    el.style.transform = 'translateY(-8px)'
    el.style.opacity = '0'
    window.setTimeout(() => el.remove(), 220)
  }, timeout)

  // ปิดเมื่อคลิก
  el.addEventListener('click', () => {
    window.clearTimeout(h)
    el.style.transform = 'translateY(-8px)'
    el.style.opacity = '0'
    window.setTimeout(() => el.remove(), 180)
  })
}
