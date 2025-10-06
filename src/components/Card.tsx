import React from 'react'

type Props = React.PropsWithChildren<{
  title?: string
  className?: string
}>

/**
 * การ์ดพื้นผิว gradient ทะลุ (navy) + เส้น/โกลว์ทอง
 * - พื้นหลัง: bg-gradient-to-b จากน้ำเงินเข้มไปเข้ม
 * - วงแหวนทอง: ring + outer glow
 * - Inlay ทองด้านใน: before:shadow inset
 */
export default function Card({ title, className, children }: Props) {
  return (
    <div
      className={[
        'relative overflow-hidden rounded-2xl p-6 backdrop-blur',
        // พื้นหลัง gradient เข้มแบบหน้า Login
        'bg-gradient-to-b from-[#142440]/80 to-[#0B1529]/80',
        // เส้นทอง + เงาโกลว์รอบนอก
        'ring-1 ring-[#D4AF37]/70',
        'shadow-[0_10px_28px_rgba(0,0,0,0.22),_0_0_70px_rgba(235,220,166,0.16)]',
        // เส้นทองด้านใน (inlay)
        'before:content-[""] before:absolute before:inset-0 before:rounded-2xl',
        'before:pointer-events-none before:shadow-[inset_0_0_0_1px_rgba(235,220,166,0.22)]',
        // ไฮไลต์ฟุ้งด้านบนเล็กน้อย (optional สวยขึ้น)
        'after:content-[""] after:absolute after:inset-0 after:rounded-2xl after:pointer-events-none',
        'after:bg-[radial-gradient(80%_60%_at_50%_-20%,rgba(235,220,166,0.10),transparent)]',
        className
      ].filter(Boolean).join(' ')}
    >
      {title ? (
        <h3 className="text-base md:text-lg font-semibold text-[#EBDCA6]">
          {title}
        </h3>
      ) : null}

      <div className={title ? 'mt-3' : ''}>{children}</div>
    </div>
  )
}
