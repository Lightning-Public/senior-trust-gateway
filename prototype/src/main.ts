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
const ONBOARDING_KEY = 'senior-life-manager-onboarding-seen-v1'

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

function brandMark(size: 'small' | 'large' = 'small'): string {
  return `<span class="companion-mark companion-mark-${size}" aria-hidden="true"><i></i><b></b></span>`
}

const app = document.querySelector<HTMLElement>('#app')
if (!app) throw new Error('App root not found')

app.innerHTML = `
  <section id="onboarding" class="onboarding" hidden aria-modal="true" role="dialog" aria-labelledby="onboarding-title">
    <div class="onboarding-card">
      <div class="onboarding-brand">
        ${brandMark('large')}
        <div>
          <p class="onboarding-kicker">시니어 AI 생활매니저</p>
          <strong>처음 오셨군요</strong>
        </div>
      </div>

      <div class="onboarding-step" data-onboarding-step="0">
        <p class="onboarding-count">1 / 2</p>
        <h2 id="onboarding-title">어려운 디지털 생활을<br>옆에서 같이 봐드려요</h2>
        <p>문자 뜻을 이해하는 일, 병원 접수처럼 낯선 화면을 사용하는 일을 쉽게 설명하고 <strong>지금 할 행동</strong>을 알려드립니다.</p>
        <div class="onboarding-visual" aria-hidden="true">
          <span>문자·카톡</span><b>→</b><span>병원 접수</span><b>→</b><span>생활 도움</span>
        </div>
        <button type="button" class="primary onboarding-next">다음</button>
      </div>

      <div class="onboarding-step" data-onboarding-step="1" hidden>
        <p class="onboarding-count">2 / 2</p>
        <h2>위험한 순간에는<br>먼저 멈추겠습니다</h2>
        <p>AI가 대신 결정하지 않습니다. 돈·인증번호·민감정보처럼 중요한 순간에는 진행을 멈추고 <strong>가족·직원·공식 기관 확인</strong>을 안내합니다.</p>
        <div class="onboarding-safety">
          <strong>쉽게 이해</strong><span>→</span><strong>위험 확인</strong><span>→</span><strong>다음 행동</strong><span>→</span><strong>사람 확인</strong>
        </div>
        <button type="button" class="primary onboarding-finish">생활매니저 시작하기</button>
      </div>

      <button type="button" class="onboarding-skip">안내 건너뛰기</button>
    </div>
  </section>

  <main class="shell">
    <header class="app-header">
      <div class="brand-lockup">
        ${brandMark()}
        <div>
          <strong>시니어 AI 생활매니저</strong>
          <span>안심부터 시작하는 디지털 동행</span>
        </div>
      </div>
      <button type="button" id="replay-onboarding" class="quiet-button">처음 안내</button>
    </header>

    <section class="hero">
      <p class="eyebrow">오늘도 옆에서 같이 볼게요</p>
      <h1>어려운 디지털 생활,<br>혼자 하지 마세요.</h1>
      <p class="intro">문자를 이해하는 일부터 병원 접수처럼 낯선 화면을 쓰는 일까지, <strong>상황을 쉽게 설명하고 지금 할 일을 알려드리는 생활 동행</strong>입니다.</p>
    </section>

    <section class="urgent-strip" aria-labelledby="urgent-title">
      <div class="urgent-icon" aria-hidden="true">!</div>
      <div class="urgent-copy">
        <p class="urgent-label">급하거나 불안한 일이 있나요?</p>
        <h2 id="urgent-title">링크·송금·인증번호는 잠깐 멈추세요</h2>
        <p>먼저 내용을 확인하고, 위험하면 혼자 진행하지 않도록 안내합니다.</p>
      </div>
      <a class="urgent-action" href="#trust-check">문자 확인하기</a>
    </section>

    <section class="quick-help" aria-labelledby="quick-help-title">
      <div class="section-title-row">
        <div>
          <p class="scene-kicker">빠른 도움</p>
          <h2 id="quick-help-title">지금 바로 할 수 있어요</h2>
        </div>
        <span class="scope-label">현재 MVP</span>
      </div>

      <div class="priority-grid">
        <a class="priority-card priority-card-primary" href="#trust-check">
          <span class="priority-icon" aria-hidden="true">💬</span>
          <span class="status-chip status-live">가장 많이 쓰는 도움</span>
          <strong>문자·카톡 같이 보기</strong>
          <small>뜻 · 위험 · 지금 할 행동 확인</small>
          <b>바로 확인하기 →</b>
        </a>

        <a class="priority-card" href="#hospital-help">
          <span class="priority-icon" aria-hidden="true">🏥</span>
          <span class="status-chip status-live">현재 시연 가능</span>
          <strong>병원 접수 도움</strong>
          <small>화면 위치 안내 · 민감정보 안전중단</small>
          <b>접수 연습하기 →</b>
        </a>
      </div>
    </section>

    <section class="help-overview" aria-labelledby="help-overview-title">
      <div class="section-title-row">
        <div>
          <p class="scene-kicker">생활매니저가 함께할 일</p>
          <h2 id="help-overview-title">생활 속 도움은 계속 넓어집니다</h2>
        </div>
      </div>

      <div class="help-grid">
        <article class="help-card help-card-live">
          <div class="help-icon" aria-hidden="true">💬</div>
          <div><span class="status-chip status-live">지금 사용</span><h3>문자·카톡 이해</h3><p>어려운 내용을 쉽게 풀고 안전한 다음 행동을 알려드려요.</p></div>
        </article>
        <article class="help-card help-card-live">
          <div class="help-icon" aria-hidden="true">🏥</div>
          <div><span class="status-chip status-live">지금 시연</span><h3>병원 접수 도움</h3><p>어디를 눌러야 하는지 안내하고 위험한 단계에서는 멈춰요.</p></div>
        </article>
        <article class="help-card">
          <div class="help-icon" aria-hidden="true">📅</div>
          <div><span class="status-chip status-next">확장 방향</span><h3>예약·일정 챙기기</h3><p>병원 예약이나 중요한 생활 일정을 놓치지 않도록 돕는 방향입니다.</p></div>
        </article>
        <article class="help-card">
          <div class="help-icon" aria-hidden="true">🏛️</div>
          <div><span class="status-chip status-next">확장 방향</span><h3>행정·생활 지원</h3><p>복잡한 공공·생활 절차도 다음 행동을 쉽게 안내하는 방향입니다.</p></div>
        </article>
        <article class="help-card help-card-wide">
          <div class="help-icon" aria-hidden="true">👨‍👩‍👧</div>
          <div><span class="status-chip status-policy">공통 원칙</span><h3>필요하면 가족·사람에게 연결</h3><p>혼자 결정하기 어려운 순간에는 AI가 대신 결정하지 않고 사람 확인으로 넘깁니다.</p></div>
        </article>
      </div>
    </section>

    <div class="manager-flow" aria-label="생활매니저가 돕는 순서">
      <span><b>1</b> 쉽게 이해</span><span><b>2</b> 위험 확인</span><span><b>3</b> 다음 행동</span><span><b>4</b> 필요하면 사람 확인</span>
    </div>

    <section id="trust-check" class="scene-heading primary-scene-heading">
      <p class="scene-kicker">빠른 도움 · 문자</p>
      <h2>받은 문자나 카톡부터 같이 볼까요?</h2>
      <p>링크를 누르거나 답장하기 전에 내용을 붙여 넣어 주세요. 생활매니저가 뜻과 위험, 다음 행동을 순서대로 알려드립니다.</p>
    </section>

    <form id="check-form" class="check-card">
      <label for="message">받은 내용을 그대로 붙여 넣어 주세요</label>
      <p class="field-help">개인정보나 인증번호는 직접 입력하지 않아도 됩니다.</p>
      <textarea id="message" rows="7" placeholder="예: 은행 직원입니다. 본인 확인을 위해 인증번호를 알려주세요."></textarea>
      <button class="primary" type="submit">생활매니저에게 물어보기</button>
    </form>

    <details class="samples">
      <summary>직접 넣을 문자가 없으면 예시로 해보기</summary>
      <div class="sample-list">${samples.map((sample, index) => `<button type="button" class="sample" data-sample="${index}">${sample.label}</button>`).join('')}</div>
    </details>

    <section id="result" class="result" hidden aria-live="polite"></section>

    <section id="hospital-help" class="life-scene">
      <div class="scene-heading scene-heading-compact">
        <p class="scene-kicker">빠른 도움 · 병원</p>
        <h2>병원 접수도 생활매니저가 옆에서 알려드려요</h2>
        <p>같은 생활매니저가 병원 키오스크에서도 화면을 이해시키고 다음 행동을 안내하며, 위험한 단계에서는 사람에게 넘깁니다.</p>
      </div>

      <div class="kiosk-demo">
        <div class="kiosk-context"><span class="status-chip status-live">실제 MVP 시연</span><strong>병원 접수 → 예약 진료 → 민감정보 단계 → 안전 중단 → 직원 도움</strong></div>
        <div class="kiosk-screen" aria-label="병원 키오스크 구조화 화면 데모">
          <div class="kiosk-screen-topline"><span>병원 접수 화면</span><span id="kiosk-risk" class="kiosk-risk">LOW</span></div>
          <h2 id="kiosk-screen-title"></h2>
          <p id="kiosk-screen-description"></p>
          <div class="kiosk-target" aria-live="polite"><span class="kiosk-pointer" aria-hidden="true">👉</span><strong id="kiosk-target-label"></strong></div>
        </div>
        <div class="kiosk-guide"><p class="kiosk-guide-label">생활매니저가 알려드려요</p><h3 id="kiosk-guide-title"></h3><p id="kiosk-guide-text"></p></div>
        <button id="kiosk-action" type="button" class="secondary kiosk-action"></button>
        <p id="kiosk-safety-note" class="kiosk-safety-note"></p>
        <p class="scene-note">공모전 MVP는 병원 접수 한 장면만 실제 시연합니다. 카메라·OCR·실제 개인정보 입력 기능은 구현 완료로 주장하지 않습니다.</p>
      </div>
    </section>

    <section class="future-note" aria-label="생활매니저 확장 방향">
      <div class="future-brand">${brandMark()}<span>시니어 AI 생활매니저</span></div>
      <p class="scene-kicker">다음 생활 장면으로</p>
      <h2>안심에서 시작해, 생활 도움으로 넓어집니다</h2>
      <p>현재 MVP는 문자 도움과 병원 접수로 같은 원칙을 검증합니다. 이후 예약·일정, 행정·생활지원까지 연결해 <strong>디지털 생활에서 막히는 순간을 계속 줄이는 것</strong>이 제품 방향입니다.</p>
    </section>

    <footer><strong>생활매니저의 안전 원칙</strong><p>AI가 사용자를 대신 승인하거나 판단하지 않습니다. 위험 신호와 공식 확인 수준을 따로 보고, 공식 목록에서 찾지 못했다는 이유만으로 안전하다고 판단하지 않습니다.</p></footer>
  </main>
`

const onboarding = document.querySelector<HTMLElement>('#onboarding')!
const onboardingSteps = Array.from(document.querySelectorAll<HTMLElement>('[data-onboarding-step]'))
const replayOnboarding = document.querySelector<HTMLButtonElement>('#replay-onboarding')!
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
let onboardingStep = 0

function showOnboarding(step = 0) {
  onboardingStep = step
  onboarding.hidden = false
  document.body.classList.add('modal-open')
  onboardingSteps.forEach((item, index) => { item.hidden = index !== onboardingStep })
  onboarding.querySelector<HTMLButtonElement>('button:not([hidden])')?.focus()
}

function closeOnboarding() {
  onboarding.hidden = true
  document.body.classList.remove('modal-open')
  try { localStorage.setItem(ONBOARDING_KEY, '1') } catch { /* storage may be unavailable */ }
  replayOnboarding.focus()
}

function hasSeenOnboarding(): boolean {
  try { return localStorage.getItem(ONBOARDING_KEY) === '1' } catch { return false }
}

document.querySelector<HTMLButtonElement>('.onboarding-next')?.addEventListener('click', () => showOnboarding(1))
document.querySelector<HTMLButtonElement>('.onboarding-finish')?.addEventListener('click', closeOnboarding)
document.querySelector<HTMLButtonElement>('.onboarding-skip')?.addEventListener('click', closeOnboarding)
replayOnboarding.addEventListener('click', () => showOnboarding(0))

if (!hasSeenOnboarding()) showOnboarding(0)

document.querySelectorAll<HTMLButtonElement>('[data-sample]').forEach((button) => {
  button.addEventListener('click', () => {
    const index = Number(button.dataset.sample)
    textarea.value = samples[index]?.message ?? ''
    textarea.focus()
  })
})

function renderOfficialCheck(check: OfficialCheckResult): string {
  if (check.outcome === 'NO_URL') return ''
  const heading = check.outcome === 'MATCH' && check.authoritative ? '공식 자료에서 일치했어요' : '공식 자료 대조 상태'
  const sourceDate = check.source.dataDate ? `<p>데이터 기준: ${escapeHtml(check.source.dataDate)}</p>` : ''
  return `<div class="official-check"><h4>${heading}</h4><p>${escapeHtml(check.detail)}</p>${sourceDate}<p><a href="${check.source.url}" target="_blank" rel="noopener noreferrer">공공데이터 출처 보기</a></p></div>`
}

function renderResult(analysis: RiskAnalysis) {
  const copy = levelCopy[analysis.level]
  const showFamilyCheck = analysis.level !== 'LOW'
  const familyButtonCopy = analysis.shouldEscalate ? '사람에게 먼저 확인하기' : '가족과 같이 확인하기'
  const officialChecks = (analysis.officialChecks ?? []).map(renderOfficialCheck).join('')
  const highStop = analysis.level === 'HIGH' ? `<div class="stop-card"><strong>지금 멈추세요</strong><span>링크를 누르거나, 돈을 보내거나, 인증번호·개인정보를 알려주지 마세요.</span></div>` : ''

  result.className = `result level-${analysis.level.toLowerCase()}`
  result.hidden = false
  result.innerHTML = `
    <div class="result-topline"><span class="badge">${copy.badge}</span></div>
    <h2>${copy.heading}</h2>${highStop}
    <div class="result-section"><p class="result-order">1</p><div><h3>무슨 뜻인가요?</h3><p class="summary">${escapeHtml(analysis.summary)}</p></div></div>
    <div class="result-section risk-section"><p class="result-order">2</p><div><h3>위험 확인</h3><ul>${analysis.reasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join('')}</ul></div></div>
    <div class="result-section next-action"><p class="result-order">3</p><div><h3>지금 이렇게 하세요</h3><p>${escapeHtml(analysis.recommendation)}</p></div></div>
    <div class="result-section uncertainty-section"><p class="result-order">4</p><div><h3>확실하지 않은 점</h3><strong>${escapeHtml(analysis.verification.label)}</strong><p>${escapeHtml(analysis.verification.detail)}</p>${officialChecks}</div></div>
    <div class="result-section human-section"><p class="result-order">5</p><div><h3>필요하면 사람에게 확인하세요</h3><p>${showFamilyCheck ? '조금이라도 불안하면 혼자 진행하지 말고 가족이나 공식 기관 대표번호로 확인하세요.' : '조금이라도 이상하거나 불안하면 혼자 결정하지 말고 가족이나 공식 기관에 다시 확인하세요.'}</p></div></div>
    ${showFamilyCheck ? `<button type="button" id="ask-family" class="${analysis.level === 'HIGH' ? 'danger-action' : 'secondary'}">${familyButtonCopy}</button><p id="family-status" class="family-status" hidden>확인 요청 문구를 준비할 수 있습니다. 현재 프로토타입은 실제 메시지를 전송하지 않습니다.</p>` : ''}
    <a class="text-action" href="${KISA_SMISHING_GUIDE}" target="_blank" rel="noopener noreferrer">보호나라 스미싱 확인방법 보기</a>
  `

  document.querySelector<HTMLButtonElement>('#ask-family')?.addEventListener('click', () => {
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
  kioskSafetyNote.textContent = step.requiresHuman ? '안전 중단: 생활매니저가 자동 진행하거나 민감정보를 대신 입력하지 않습니다. 직원 확인이 먼저입니다.' : '화면의 뜻과 다음 위치만 쉽게 안내합니다.'
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
