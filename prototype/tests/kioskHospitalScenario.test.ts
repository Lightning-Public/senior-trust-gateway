import { describe, expect, it } from 'vitest'

import { getHospitalKioskStep, KIOSK_REFERENCE } from '../src/kioskHospitalScenario'

describe('hospital kiosk safe guidance', () => {
  it('starts with a low-risk structured navigation step', () => {
    const step = getHospitalKioskStep('welcome')

    expect(step.riskLevel).toBe('LOW')
    expect(step.requiresHuman).toBe(false)
    expect(step.targetLabel).toBe('접수 시작')
  })

  it('stops and asks for human help at a sensitive identity step', () => {
    const step = getHospitalKioskStep('identity-check')

    expect(step.riskLevel).toBe('HIGH')
    expect(step.requiresHuman).toBe(true)
    expect(step.actionLabel).toBe('직원 도움 요청')
    expect(step.guideText).toContain('대신 입력하거나 저장하지 않고')
  })

  it('keeps the kiosk source provenance explicit', () => {
    expect(KIOSK_REFERENCE).toBe('Lightning-Public/kiosk_ar_assistant@3a7da8f')
  })
})
