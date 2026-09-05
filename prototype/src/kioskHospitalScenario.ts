import type { RiskLevel } from './types'

export type HospitalKioskStepId = 'welcome' | 'visit-type' | 'identity-check' | 'human-help'

export type HospitalKioskStep = {
  id: HospitalKioskStepId
  screenTitle: string
  screenDescription: string
  targetLabel: string
  riskLevel: RiskLevel
  guideTitle: string
  guideText: string
  actionLabel: string
  nextStep: HospitalKioskStepId
  requiresHuman: boolean
}

export const KIOSK_REFERENCE = 'Lightning-Public/kiosk_ar_assistant@3a7da8f'

const steps: Record<HospitalKioskStepId, HospitalKioskStep> = {
  welcome: {
    id: 'welcome',
    screenTitle: '병원 진료 접수',
    screenDescription: '진료를 접수하려면 화면의 접수 시작 버튼을 선택합니다.',
    targetLabel: '접수 시작',
    riskLevel: 'LOW',
    guideTitle: '지금은 접수를 시작하는 화면이에요',
    guideText: '노란 안내가 가리키는 접수 시작을 누르세요. 아직 개인정보를 입력하는 단계는 아니에요.',
    actionLabel: '접수 시작 누르기',
    nextStep: 'visit-type',
    requiresHuman: false,
  },
  'visit-type': {
    id: 'visit-type',
    screenTitle: '접수 방법 선택',
    screenDescription: '예약한 진료가 있는지 선택하는 화면입니다.',
    targetLabel: '예약 진료',
    riskLevel: 'LOW',
    guideTitle: '예약한 진료가 있다면 이 버튼이에요',
    guideText: '예약 진료를 선택하면 다음 단계로 넘어갑니다. 잘 모르겠다면 진행하지 않고 직원에게 물어봐도 됩니다.',
    actionLabel: '예약 진료 선택',
    nextStep: 'identity-check',
    requiresHuman: false,
  },
  'identity-check': {
    id: 'identity-check',
    screenTitle: '본인 확인 정보 입력',
    screenDescription: '예시 화면에 주민등록번호 전체 입력 요청이 표시되었습니다.',
    targetLabel: '주민등록번호 입력란',
    riskLevel: 'HIGH',
    guideTitle: '개인정보를 입력하는 단계라서 먼저 확인이 필요해요',
    guideText: '주민등록번호 전체 입력은 민감한 행동입니다. 생활매니저는 대신 입력하거나 저장하지 않고, 병원 직원에게 이 절차가 맞는지 먼저 확인하도록 안내합니다.',
    actionLabel: '직원 도움 요청',
    nextStep: 'human-help',
    requiresHuman: true,
  },
  'human-help': {
    id: 'human-help',
    screenTitle: '안전 확인 대기',
    screenDescription: '직원 확인 전에는 민감정보 입력을 계속하지 않습니다.',
    targetLabel: '직원 호출',
    riskLevel: 'HIGH',
    guideTitle: '여기서 안전하게 멈췄어요',
    guideText: '병원 직원이 절차를 확인해 준 뒤 계속하세요. 이 데모는 실제 호출이나 개인정보 입력을 수행하지 않습니다.',
    actionLabel: '처음부터 다시 보기',
    nextStep: 'welcome',
    requiresHuman: true,
  },
}

export function getHospitalKioskStep(stepId: HospitalKioskStepId): HospitalKioskStep {
  return steps[stepId]
}
