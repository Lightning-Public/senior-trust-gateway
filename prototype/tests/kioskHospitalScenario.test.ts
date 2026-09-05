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
    expect(step.actionLabel).toBe('직원에게 확인하는 방법 보기')
    expect(step.guideText).toContain('대신 입력하거나 저장하지 않고')
  })

  it('shows guidance without implying that an employee was actually called', () => {
    const identityStep = getHospitalKioskStep('identity-check')
    const helpStep = getHospitalKioskStep(identityStep.nextStep)
    const resetStep = getHospitalKioskStep(helpStep.nextStep)

    expect(helpStep.id).toBe('human-help')
    expect(helpStep.screenTitle).toBe('직원에게 확인해 주세요')
    expect(helpStep.guideText).toContain('자동으로 호출하지는 않습니다')
    expect(helpStep.screenTitle).not.toContain('대기')
    expect(helpStep.targetLabel).not.toContain('호출')
    expect(resetStep.id).toBe('welcome')
  })

  it('keeps the kiosk source provenance explicit', () => {
    expect(KIOSK_REFERENCE).toBe('Lightning-Public/kiosk_ar_assistant@3a7da8f')
  })
})
