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
  LOW: { badge: '위험 신호 적음', heading: '큰 위험 신호는 적지만, 안전이 확인된 것은 아니에요' },
  MEDIUM: { badge: '확인 필요', heading: '바로 누르거나 진행하지 말고 먼저 확인하세요' },
  HIGH: { badge: '위험 · 지금 멈추세요', heading: '지금은 아무 행동도 하지 않는 것이 가장 안전해요' },
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
  <main class="shell">
    <header class="hero">
      <p class="eyebrow">시니어 AI 생활매니저</p>
      <h1>위험한 행동 전에<br>먼저 멈춰드려요.</h1>
      <p class="intro">문자나 디지털 화면이 어렵거나 불안할 때, <strong>무슨 뜻인지 쉽게 설명하고 위험을 확인한 뒤 지금 할 행동</strong>을 알려드려요. 필요하면 사람에게 확인하도록 안내합니다.</p>
      <div class="manager-flow" aria-label="생활매니저가 돕는 순서">
        <span>① 쉽게 이해</span>
        <span>② 위험 확인</span>
        <span>③ 다음 행동</span>
        <span>④ 필요하면 사람 확인</span>
      </div>
    </header>

    <section class="scene-heading">
      <p class="scene-kicker">가장 먼저 하는 일</p>
      <h2>받은 문자, 안심하고 확인하세요</h2>
      <p>판단을 대신하지 않습니다. 위험한 행동을 하기 전에 한 번 더 확인하도록 돕습니다.</p>
    </section>

    <form id="check-form" class="check-card">
      <label for="message">받은 문자나 카톡을 그대로 붙여 넣어 주세요</label>
      <p class="field-help">링크를 누르거나 답장하기 전에 먼저 확인하세요.</p>
      <textarea id="message" rows="7" placeholder="예: 은행 직원입니다. 본인 확인을 위해 인증번호를 알려주세요."></textarea>
      <button class="primary" type="submit">이 내용 안심 확인하기</button>
    </form>

    <details class="samples">
      <summary>직접 넣을 문자가 없으면 예시로 해보기</summary>
      <div class="sample-list">
        ${samples.map((sample, index) => `<button type="button" class="sample" data-sample="${index}">${sample.label}</button>`).join('')}
      </div>
    </details>

    <section id="result" class="result" hidden aria-live="polite"></section>

    <section class="life-scene">
      <div class="scene-heading scene-heading-compact">
        <p class="scene-kicker">두 번째 생활 장면</p>
        <h2>병원 키오스크에서도 같은 방식으로 도와드려요</h2>
        <p>어디를 눌러야 하는지 알려주고, 민감정보 단계에서는 자동으로 진행하지 않고 멈춘 뒤 직원 확인을 안내합니다.</p>
      </div>

      <div class="kiosk-demo">
        <div class="kiosk-screen" aria-label="병원 키오스크 구조화 화면 데모">
          <div class="kiosk-screen-topline">
            <span>병원 접수 화면</span>
            <span id="kiosk-risk" class="kiosk-risk">LOW</span>
          </div>
          <h2 id="kiosk-screen-title"></h2>
          <p id="kiosk-screen-description"></p>
          <div class="kiosk-target" aria-live="polite">
            <span class="kiosk-pointer" aria-hidden="true">👉</span>
            <strong id="kiosk-target-label"></strong>
          </div>
        </div>
        <div class="kiosk-guide">
          <p class="kiosk-guide-label">생활매니저가 알려드려요</p>
          <h3 id="kiosk-guide-title"></h3>
          <p id="kiosk-guide-text"></p>
        </div>
        <button id="kiosk-action" type="button" class="secondary kiosk-action"></button>
        <p id="kiosk-safety-note" class="kiosk-safety-note"></p>
        <p class="scene-note">공모전 MVP는 병원 접수 한 장면만 다룹니다. 카메라·OCR·실제 개인정보 입력 기능은 사용하지 않습니다.</p>
      </div>
    </section>

    <footer>
      <strong>생활매니저의 원칙</strong>
      <p>AI가 사용자를 대신 승인하거나 판단하지 않습니다. 위험 신호와 공식 확인 수준을 따로 보고, 공식 목록에서 찾지 못했다는 이유만으로 안전하다고 판단하지 않습니다.</p>
    </footer>
  </main>
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
    <div class="official-check">
      <h4>${heading}</h4>
      <p>${escapeHtml(check.detail)}</p>
      ${sourceDate}
      <p><a href="${check.source.url}" target="_blank" rel="noopener noreferrer">공공데이터 출처 보기</a></p>
    </div>
  `
}

function renderResult(analysis: RiskAnalysis) {
  const copy = levelCopy[analysis.level]
  const showFamilyCheck = analysis.level !== 'LOW'
  const familyButtonCopy = analysis.shouldEscalate ? '사람에게 먼저 확인하기' : '가족과 같이 확인하기'
  const officialChecks = (analysis.officialChecks ?? []).map(renderOfficialCheck).join('')
  const highStop = analysis.level === 'HIGH'
    ? `<div class="stop-card"><strong>지금 멈추세요</strong><span>링크를 누르거나, 돈을 보내거나, 인증번호·개인정보를 알려주지 마세요.</span></div>`
    : ''

  result.className = `result level-${analysis.level.toLowerCase()}`
  result.hidden = false
  result.innerHTML = `
    <div class="result-topline">
      <span class="badge">${copy.badge}</span>
    </div>
    <h2>${copy.heading}</h2>
    ${highStop}

    <div class="result-section">
      <p class="result-order">1</p>
      <div>
        <h3>무슨 뜻인가요?</h3>
        <p class="summary">${escapeHtml(analysis.summary)}</p>
      </div>
    </div>

    <div class="result-section risk-section">
      <p class="result-order">2</p>
      <div>
        <h3>위험 확인</h3>
        <ul>${analysis.reasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join('')}</ul>
      </div>
    </div>

    <div class="result-section next-action">
      <p class="result-order">3</p>
      <div>
        <h3>지금 이렇게 하세요</h3>
        <p>${escapeHtml(analysis.recommendation)}</p>
      </div>
    </div>

    <div class="result-section uncertainty-section">
      <p class="result-order">4</p>
      <div>
        <h3>확실하지 않은 점</h3>
        <strong>${escapeHtml(analysis.verification.label)}</strong>
        <p>${escapeHtml(analysis.verification.detail)}</p>
        ${officialChecks}
      </div>
    </div>

    <div class="result-section human-section">
      <p class="result-order">5</p>
      <div>
        <h3>필요하면 사람에게 확인하세요</h3>
        <p>${showFamilyCheck ? '조금이라도 불안하면 혼자 진행하지 말고 가족이나 공식 기관 대표번호로 확인하세요.' : '조금이라도 이상하거나 불안하면 혼자 결정하지 말고 가족이나 공식 기관에 다시 확인하세요.'}</p>
      </div>
    </div>

    ${showFamilyCheck ? `
      <button type="button" id="ask-family" class="${analysis.level === 'HIGH' ? 'danger-action' : 'secondary'}">${familyButtonCopy}</button>
      <p id="family-status" class="family-status" hidden>확인 요청 문구를 준비할 수 있습니다. 현재 프로토타입은 실제 메시지를 전송하지 않습니다.</p>
    ` : ''}

    <a class="text-action" href="${KISA_SMISHING_GUIDE}" target="_blank" rel="noopener noreferrer">보호나라 스미싱 확인방법 보기</a>
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

  kioskRisk.textContent = step.riskLevel === 'HIGH' ? 'HIGH · 멈춤' : step.riskLevel
  kioskRisk.className = `kiosk-risk risk-${step.riskLevel.toLowerCase()}`
  kioskScreenTitle.textContent = step.screenTitle
  kioskScreenDescription.textContent = step.screenDescription
  kioskTargetLabel.textContent = step.targetLabel
  kioskGuideTitle.textContent = step.guideTitle
  kioskGuideText.textContent = step.guideText
  kioskAction.textContent = step.actionLabel
  kioskAction.className = step.riskLevel === 'HIGH' ? 'danger-action kiosk-action' : 'secondary kiosk-action'
  kioskSafetyNote.textContent = step.requiresHuman
    ? '안전 중단: 생활매니저가 자동 진행하거나 민감정보를 대신 입력하지 않습니다. 직원 확인이 먼저입니다.'
    : '화면의 뜻과 다음 위치만 쉽게 안내합니다.'
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
