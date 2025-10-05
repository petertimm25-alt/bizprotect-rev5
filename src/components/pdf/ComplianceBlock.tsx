// src/components/pdf/ComplianceBlock.tsx
import React from 'react'
import { View, Text, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'solid',
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
  },
  h2: { fontSize: 10, fontWeight: 600, marginBottom: 4 },
  p: { fontSize: 9, lineHeight: 1.35, marginBottom: 3, color: '#0B1020' },
  dim: { color: '#64748B' },
  bold: { fontWeight: 600, color: '#0B1020' },
})

export default function ComplianceBlock() {
  return (
    <View style={styles.card}>
      <Text style={styles.h2}>ข้อกำกับ/Compliance</Text>

      <Text style={styles.p}>
        ระบบนี้ใช้อัตราภาษีตามกฎหมายที่บังคับใช้จริง ได้แก่
        <Text style={styles.bold}> ภาษีเงินได้นิติบุคคล 20%</Text> และ
        <Text style={styles.bold}> ภาษีเงินได้บุคคลธรรมดาแบบอัตราก้าวหน้า</Text>
        โดยตัวเลขมีการปัดเศษเพื่อความสะดวกในการนำเสนอ
      </Text>

      <Text style={styles.p}>
        การบันทึกค่าใช้จ่าย เช่น เบี้ยประกันชีวิตของกรรมการ และการออกภาษีแทน (gross-up)
        ต้องมีเอกสารประกอบครบถ้วนตามหลักเกณฑ์ของกรมสรรพากรเพื่อรองรับการตรวจสอบ
      </Text>

      <Text style={[styles.p, styles.dim]}>
        <Text style={styles.bold}>ข้อจำกัดความรับผิด:</Text>{' '}
        ผลการคำนวณเป็นการประมาณการเบื้องต้น ไม่ใช่คำแนะนำทางกฎหมาย/ภาษี
        ผู้ใช้งานควรปรึกษาผู้เชี่ยวชาญด้านบัญชี/ภาษีก่อนตัดสินใจ
      </Text>
    </View>
  )
}
