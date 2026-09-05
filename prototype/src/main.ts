import './styles.css'
import { GroundedRiskAnalyzer } from './groundedRiskAnalyzer'
import { BundledKisaSnapshotVerifier } from './kisaSnapshotLoader'
import { getHospitalKioskStep, type HospitalKioskStepId } from './kioskHospitalScenario'
import { RuleBasedRiskAnalyzer } from './ruleBasedAnalyzer'
import type { OfficialCheckResult, RiskAnalysis, RiskLevel } from './types'

const analyzer = new GroundedRiskAnalyzer(
  new RuleBasedRiskAnalyzer(),
  new BundledKisaSnapshotVerifier(),
)

const KISA_SMISHING_GUIDE = 'https://www.boho.or.kr/kr/subPage.do?menuNo=205116'

const samples = [
  { label: '일정 안내', message: '건강검진 예약일은 9월 3일 오전 10시입니다.' },
  { label: '택배 링크', message: '택배 주소가 잘못되었습니다. 아래 링크에서 주소 확인 바랍니다. https://example.com' },
  { label: '수사기관 사칭', message: '검찰입니다. 계좌가 범죄에 연루됐습니다. 지금 안전계좌로 이체하세요.' },
  { label: '인증번호 요구', message: '은행 직원입니다. 본인 확인을 위해 인증번호를 알려주세요.' },
  { label: '지원금 링크', message: '정부 지원금 대상자입니다. 오늘까지 링크에서 신청하세요. https://example.com' },
  { label: '가족 새 번호', message: '엄마 나 휴대폰이 고장나서 새 번호야. 이 번호로 답장해.' },
]

const levelCopy: Record<RiskLevel, { badge: string; heading: string }> = {
  LOW: { badge: '위험 신호 적음', heading: '아직 안전하다고 확인된 것은 아니에요' },
  MEDIUM: { badge: '확인 필요', heading: '바로 누르거나 진행하지 마세요' },
  HIGH: { badge: '멈추세요', heading: '지금은 행동하지 않는 것이 안전해요' },
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  })[character] ?? character)
}

const app = document.querySelector<HTMLElement>('#app')
if (!app) throw new Error('App root not found')

app.innerHTML = `
  <section class="shell">
    <header class="hero">
      <p class="eyebrow">AI 안심매니저</p>
      <h1>이 문자, 믿어도 될까요?</h1>
      <p class="intro">받은 문자나 카톡 내용을 그대로 붙여 넣으세요. 어려운 말 대신 <strong>지금 무엇을 해야 하는지</strong> 먼저 알려드릴게요.</p>
    </header>

    <form id="check-form" class="check-card">
      <label for="message">받은 내용을 붙여 넣어 주세요</label>
      <textarea id="message" rows="7" placeholder="예: 은행 직원입니다. 인증번호를 알려주세요."></textarea>
      <button class="primary" type="submit">지금 해도 되는지 확인하기</button>
    </form>

    <details class="samples">
      <summary>예시 문장으로 먼저 해보기</summary>
      <div class="sample-list">
        ${samples.map((sample, index) => `<button type="button" class="sample" data-sample="${index}">${sample.label}</button>`).join('')}
      </div>
    </details>

    <section id="result" class="result" hidden aria-live="polite"></section>

    <details class="kiosk-scene">
      <summary>생활 장면 2 · 병원 키오스크 접수</summary>
      <div class="kiosk-demo">
        <p class="scene-note"><strong>Kiosk Safe Guidance</strong> · 카메라/CV/OCR 없이 사전 정의된 화면 구조로 신뢰정책 확장을 보여주는 공모전 데모입니다.</p>
        <div class="kiosk-screen" aria-label="병원 키오스크 구조화 화면 데모">
          <div class="kiosk-screen-topline">
            <span>병원 키오스크</span>
            <span id="kiosk-risk" class="kiosk-risk">LOW</span>
          </div>
          <h2 id="kiosk-screen-title"></h2>
          <p id="kiosk-screen-description"></p>
          <div class="kiosk-target" aria-live="polite">
            <span class="kiosk-pointer">👉</span>
            <strong id="kiosk-target-label"></strong>
          </div>
        </div>
        <div class="kiosk-guide">
          <p class="kiosk-guide-label">생활매니저 안내</p>
          <h3 id="kiosk-guide-title"></h3>
          <p id="kiosk-guide-text"></p>
        </div>
        <button id="kiosk-action" type="button" class="secondary"></button>
        <p id="kiosk-safety-note" class="kiosk-safety-note"></p>
      </div>
    </details>

    <footer>
      <p>위험 신호와 공식 확인 수준을 따로 표시합니다. 공식 공개 목록에서 찾지 못했다는 사실만으로 안전하다고 판단하지 않습니다.</p>
    </footer>
  </section>
`

const form = document.querySelector<HTMLFormElement>('#check-form')!
const textarea = document.querySelector<HTMLTextAreaElement>('#message')!
const result = document.querySelector<HTMLElement>('#result')!
const kioskRisk = document.querySelector<HTMLElement>('#kiosk-risk')!
const kioskScreenTitle = document.querySelector<HTMLElement>('#kiosk-screen-title')!
const kioskScreenDescription = document.querySelector<HTMLElement>('#kiosk-screen-description')!
const kioskTargetLabel = document.querySelector<HTMLElement>('#kiosk-target-label')!
const kioskGuideTitle = document.querySelector<HTMLElement>('#kiosk-guide-title')!
const kioskGuideText = document.querySelector<HTMLElement>('#kiosk-guide-text')!
const kioskAction = document.querySelector<HTMLButtonElement>('#kiosk-action')!
const kioskSafetyNote = document.querySelector<HTMLElement>('#kiosk-safety-note')!

let kioskStepId: HospitalKioskStepId = 'welcome'

document.querySelectorAll<HTMLButtonElement>('[data-sample]').forEach((button) => {
  button.addEventListener('click', () => {
    const index = Number(button.dataset.sample)
    textarea.value = samples[index]?.message ?? ''
    textarea.focus()
  })
})

function renderOfficialCheck(check: OfficialCheckResult): string {
  if (check.outcome === 'NO_URL') return ''

  const heading = check.outcome === 'MATCH' && check.authoritative
    ? '공식 자료에서 일치했어요'
    : '공식 자료 대조 상태'

  const sourceDate = check.source.dataDate ? `<p>데이터 기준: ${escapeHtml(check.source.dataDate)}</p>` : ''

  return `
    <div class="reason-box">
      <h3>${heading}</h3>
      <p>${escapeHtml(check.detail)}</p>
      ${sourceDate}
      <p><a href="${check.source.url}" target="_blank" rel="noopener noreferrer">공공데이터 출처 보기</a></p>
    </div>
  `
}

function renderResult(analysis: RiskAnalysis) {
  const copy = levelCopy[analysis.level]
  const showFamilyCheck = analysis.level !== 'LOW'
  const familyButtonCopy = analysis.shouldEscalate ? '가족에게 먼저 확인 부탁하기' : '가족과 같이 확인하기'
  const officialChecks = (analysis.officialChecks ?? []).map(renderOfficialCheck).join('')

  result.className = `result level-${analysis.level.toLowerCase()}`
  result.hidden = false
  result.innerHTML = `
    <div class="result-topline">
      <span class="badge">${copy.badge}</span>
    </div>
    <h2>${copy.heading}</h2>
    <p class="summary">${escapeHtml(analysis.summary)}</p>

    <div class="verification-box">
      <h3>어디까지 확인했나요?</h3>
      <strong>${escapeHtml(analysis.verification.label)}</strong>
      <p>${escapeHtml(analysis.verification.detail)}</p>
    </div>

    ${officialChecks}

    <div class="reason-box">
      <h3>왜 이렇게 말씀드리나요?</h3>
      <ul>${analysis.reasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join('')}</ul>
    </div>

    <div class="next-action">
      <h3>지금 이렇게 하세요</h3>
      <p>${escapeHtml(analysis.recommendation)}</p>
    </div>

    <a class="secondary action-link" href="${KISA_SMISHING_GUIDE}" target="_blank" rel="noopener noreferrer">보호나라 스미싱 확인방법 보기</a>

    ${showFamilyCheck ? `
      <button type="button" id="ask-family" class="secondary">${familyButtonCopy}</button>
      <p id="family-status" class="family-status" hidden>가족에게 보낼 확인 요청 예시가 준비됐어요. 현재는 프로토타입이라 실제 전송은 하지 않습니다.</p>
    ` : ''}
  `

  const familyButton = document.querySelector<HTMLButtonElement>('#ask-family')
  familyButton?.addEventListener('click', () => {
    const status = document.querySelector<HTMLElement>('#family-status')
    if (status) status.hidden = false
  })

  result.scrollIntoView({ behavior: 'auto', block: 'nearest' })
}

function renderKioskStep() {
  const step = getHospitalKioskStep(kioskStepId)

  kioskRisk.textContent = step.riskLevel
  kioskRisk.className = `kiosk-risk risk-${step.riskLevel.toLowerCase()}`
  kioskScreenTitle.textContent = step.screenTitle
  kioskScreenDescription.textContent = step.screenDescription
  kioskTargetLabel.textContent = step.targetLabel
  kioskGuideTitle.textContent = step.guideTitle
  kioskGuideText.textContent = step.guideText
  kioskAction.textContent = step.actionLabel
  kioskSafetyNote.textContent = step.requiresHuman
    ? 'HIGH 단계: 생활매니저가 자동 진행하거나 민감정보를 대신 입력하지 않습니다.'
    : 'LOW 단계: 화면 의미와 다음 위치만 쉽게 안내합니다.'
}

kioskAction.addEventListener('click', () => {
  kioskStepId = getHospitalKioskStep(kioskStepId).nextStep
  renderKioskStep()
})

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  const message = textarea.value.trim()

  if (!message) {
    result.hidden = false
    result.className = 'result level-medium'
    result.innerHTML = '<h2>확인할 내용을 먼저 넣어주세요.</h2><p>받은 문자나 카톡을 그대로 붙여 넣으면 됩니다.</p>'
    textarea.focus()
    return
  }

  renderResult(await analyzer.analyze(message))
})

renderKioskStep()
