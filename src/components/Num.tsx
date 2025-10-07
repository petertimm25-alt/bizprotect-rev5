import React from 'react'

export function fmt0(n?: number) {
  return n === undefined || Number.isNaN(n)
    ? '-'
    : n.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}
export function fmt2(n?: number) {
  return n === undefined || Number.isNaN(n)
    ? '-'
    : n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
export const emptyIfZero = (n?: number) => (n === 0 ? undefined : n)

export default function Num({ v, forceNeg }: { v?: number; forceNeg?: boolean }) {
  if (v === undefined || Number.isNaN(v)) return <span className="block text-right">-</span>
  const neg = forceNeg === true || (v as number) < 0
  const absVal = Math.abs(v as number)
  const txt = absVal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return (
    <span className={['block text-right tabular-nums', neg ? 'text-[#FF7B7B]' : ''].join(' ')}>
      {neg ? '-' : ''}{txt}
    </span>
  )
}
