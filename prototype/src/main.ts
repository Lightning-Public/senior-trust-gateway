import './styles.css'
import { RuleBasedRiskAnalyzer } from './ruleBasedAnalyzer'
import type { RiskAnalysis, RiskLevel } from './types'

const analyzer = new RuleBasedRiskAnalyzer()

const samples = [
  '건강검진 예약일은 9월 3일 오전 10시입니다.',
  '택배 주소가 잘못되었습니다. 아래 링크에서 주소 확인 바랍니다. https://example.com',
  '검찰입니다. 계좌가 범죄에 연루됐습니다. 지금 안전계좌로 이체하세요.',
  '은행 직원입니다. 본인 확인을 위해 인증번호를 알려주세요.',
  '정부 지원금 대상자입니다. 오늘까지 링크에서 신청하세요. https://example.com',
]

const levelCopy: Record<RiskLevel, { badge: string; heading: string }> = {
  LOW: { badge: '괜찮아 보여요', heading: '현재는 큰 위험 신호가 없어요' },
  MEDIUM: { badge: '확인이 필요해요', heading: '바로 누르거나 진행하지 마세요' },
  HIGH: { badge: '하지 마세요', heading: '지금은 멈추는 것이 안전해요' },
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
      <button class="primary" type="submit">안전한지 확인하기</button>
    </form>

    <details class="samples">
      <summary>예시 문장으로 해보기</summary>
      <div class="sample-list">
        ${samples.map((sample, index) => `<button type="button" class="sample" data-sample="${index}">${index + 1}번 예시</button>`).join('')}
      </div>
    </details>

    <section id="result" class="result" hidden aria-live="polite"></section>

    <footer>
      <p>이 프로토타입은 실제 금융·수사기관 여부를 확인하지 않습니다. 중요한 금전·계정 행동은 공식 대표번호나 믿을 수 있는 사람에게 다시 확인하세요.</p>
    </footer>
  </section>
`

const form = document.querySelector<HTMLFormElement>('#check-form')!
const textarea = document.querySelector<HTMLTextAreaElement>('#message')!
const result = document.querySelector<HTMLElement>('#result')!

document.querySelectorAll<HTMLButtonElement>('[data-sample]').forEach((button) => {
  button.addEventListener('click', () => {
    const index = Number(button.dataset.sample)
    textarea.value = samples[index] ?? ''
    textarea.focus()
  })
})

function renderResult(analysis: RiskAnalysis) {
  const copy = levelCopy[analysis.level]
  result.className = `result level-${analysis.level.toLowerCase()}`
  result.hidden = false
  result.innerHTML = `
    <div class="result-topline">
      <span class="badge">${copy.badge}</span>
      <span class="risk-code">${analysis.level}</span>
    </div>
    <h2>${copy.heading}</h2>
    <p class="summary">${analysis.summary}</p>

    <div class="reason-box">
      <h3>왜 이렇게 말씀드리나요?</h3>
      <ul>${analysis.reasons.map((reason) => `<li>${reason}</li>`).join('')}</ul>
    </div>

    <div class="next-action">
      <h3>지금 이렇게 하세요</h3>
      <p>${analysis.recommendation}</p>
    </div>

    ${analysis.shouldEscalate ? `
      <button type="button" id="ask-family" class="secondary">가족에게 확인 부탁하기</button>
      <p id="family-status" class="family-status" hidden>가족 확인 요청 예시가 생성됐어요. 실제 전송 기능은 다음 단계에서 연결합니다.</p>
    ` : ''}
  `

  const familyButton = document.querySelector<HTMLButtonElement>('#ask-family')
  familyButton?.addEventListener('click', () => {
    const status = document.querySelector<HTMLElement>('#family-status')
    if (status) status.hidden = false
  })

  result.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

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
