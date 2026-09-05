import { buildContestAiInput, CONTEST_AI_SYSTEM_PROMPT } from './contestAiPrompt'
import type {
  AiContext,
  AiInterpretation,
  AiMessageInterpreter,
  RiskAnalysis,
  RiskAnalyzer,
} from './types'

export type AiRawInvoker = (request: {
  systemPrompt: string
  input: ReturnType<typeof buildContestAiInput>
}) => Promise<unknown>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function requiredText(value: unknown, field: keyof AiInterpretation): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`AI response field ${field} must be a non-empty string`)
  }
  return value.trim()
}

export function parseAiInterpretation(raw: unknown): AiInterpretation {
  let parsed = raw

  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw)
    } catch {
      throw new Error('AI response is not valid JSON')
    }
  }

  if (!isRecord(parsed)) {
    throw new Error('AI response must be a JSON object')
  }

  return {
    summary: requiredText(parsed.summary, 'summary'),
    risk_context: requiredText(parsed.risk_context, 'risk_context'),
    safe_next_action: requiredText(parsed.safe_next_action, 'safe_next_action'),
    uncertainty: requiredText(parsed.uncertainty, 'uncertainty'),
  }
}

export class JsonAiMessageInterpreter implements AiMessageInterpreter {
  constructor(private readonly invoke: AiRawInvoker) {}

  async interpret(
    message: string,
    guardrail: Pick<RiskAnalysis, 'level' | 'signals'>,
  ): Promise<AiInterpretation> {
    const raw = await this.invoke({
      systemPrompt: CONTEST_AI_SYSTEM_PROMPT,
      input: buildContestAiInput(message, guardrail),
    })

    return parseAiInterpretation(raw)
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = globalThis.setTimeout(() => {
      reject(new Error(`AI response timeout after ${timeoutMs}ms`))
    }, timeoutMs)

    promise.then(
      (value) => {
        globalThis.clearTimeout(timer)
        resolve(value)
      },
      (error: unknown) => {
        globalThis.clearTimeout(timer)
        reject(error)
      },
    )
  })
}

function fallbackContext(base: RiskAnalysis, error: unknown): AiContext {
  const detail = error instanceof Error ? error.message : 'AI interpretation unavailable'

  return {
    status: 'FALLBACK',
    summary: base.summary,
    risk_context: 'AI 맥락 분석을 사용할 수 없어 규칙엔진 결과만 사용했습니다.',
    safe_next_action: base.recommendation,
    uncertainty: 'AI 응답을 확인하지 못했으므로 추가 해석은 제공하지 않습니다.',
    detail,
  }
}

/**
 * AI interprets ambiguous context, but it has no authority to lower or authorize
 * deterministic guardrail outcomes. Rule-based level/recommendation remain the
 * source of truth for action safety. AI failure always falls back to the base result.
 */
export class SafeAiAssistedRiskAnalyzer implements RiskAnalyzer {
  constructor(
    private readonly baseAnalyzer: RiskAnalyzer,
    private readonly aiInterpreter: AiMessageInterpreter,
    private readonly timeoutMs = 5000,
  ) {}

  async analyze(message: string): Promise<RiskAnalysis> {
    const base = await this.baseAnalyzer.analyze(message)

    try {
      const interpreted = await withTimeout(
        this.aiInterpreter.interpret(message, {
          level: base.level,
          signals: base.signals,
        }),
        this.timeoutMs,
      )

      const aiContext: AiContext = {
        status: 'AVAILABLE',
        ...interpreted,
        detail: 'AI는 맥락 설명만 제공하며 위험도와 행동 권한을 변경하지 않습니다.',
      }

      return {
        ...base,
        // AI may improve the plain-language explanation for LOW/MEDIUM messages.
        // HIGH keeps the deterministic stop message unchanged.
        summary: base.level === 'HIGH' ? base.summary : interpreted.summary,
        reasons: [...base.reasons, `AI 맥락 분석: ${interpreted.risk_context}`],
        // Recommendation intentionally remains deterministic for every risk level.
        recommendation: base.recommendation,
        aiContext,
      }
    } catch (error: unknown) {
      return {
        ...base,
        aiContext: fallbackContext(base, error),
      }
    }
  }
}
