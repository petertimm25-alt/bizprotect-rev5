// src/components/ComplianceCard.tsx
import React from 'react'
import Card from './Card'

type Props = { className?: string }

export default function ComplianceCard({ className }: Props) {
  return (
    <Card title="ข้อกำกับ/Compliance" className={className}>
      <div className="space-y-2 text-sm leading-relaxed">
        <p>
          ระบบนี้ใช้อัตราภาษีตามกฎหมายที่บังคับใช้จริง ได้แก่
          <span className="font-medium"> ภาษีเงินได้นิติบุคคล 20%</span> และ
          <span className="font-medium"> ภาษีเงินได้บุคคลธรรมดาแบบอัตราก้าวหน้า</span>
          โดยตัวเลขมีการปัดเศษเพื่อความสะดวกในการนำเสนอ
        </p>

        <p>
          การบันทึกค่าใช้จ่าย เช่น เบี้ยประกันชีวิตของกรรมการ และการออกภาษีแทน (gross-up)
          ต้องมีเอกสารประกอบครบถ้วนตามหลักเกณฑ์ของกรมสรรพากรเพื่อรองรับการตรวจสอบ
        </p>

        <p className="text-[color:var(--ink-dim)]">
          <span className="font-medium text-[color:var(--ink)]">ข้อจำกัดความรับผิด:</span>{' '}
          ผลการคำนวณเป็นการประมาณการเบื้องต้น ไม่ใช่คำแนะนำทางกฎหมาย/ภาษี
          ผู้ใช้งานควรปรึกษาผู้เชี่ยวชาญด้านบัญชี/ภาษีก่อนตัดสินใจ
        </p>
      </div>
    </Card>
  )
}
