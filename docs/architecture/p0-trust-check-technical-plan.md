# P0 Trust Check — Technical Plan

## Objective

Validate the trust experience before building a full life-manager agent.

Core flow:

`message → explain → risk → verification scope → reasons → next action → trusted-person escalation`

## Stack

- static web prototype
- Vite + TypeScript
- deterministic `RuleBasedRiskAnalyzer` as the default analyzer
- no backend and no model API key required for the base demo
- Vitest fixtures for repeatable risk policy checks

## Architecture boundary

The UI depends on the `RiskAnalyzer` interface, not on a model vendor.

```text
UI
 ↓
RiskAnalyzer
 ├─ RuleBasedRiskAnalyzer  ← P0 default
 ├─ OfficialDataAdapter    ← next: KISA/public sources
 └─ AIRiskAnalyzer         ← later: ambiguous-case escalation
```

An AI model may improve explanation or ambiguous-case analysis later, but it must not increase action authority by itself.

## Trust principle: risk is not verification

The product must never turn “no rule matched” into “this is safe”.

Two concepts are kept separate:

1. **Risk level** — LOW / MEDIUM / HIGH based on detected signals.
2. **Verification level** — how far the system actually verified the sender or claim.

P0 verification level is always `RULES_ONLY`. It means only that the message text was checked against defined risk signals. It does **not** mean the sender, institution, URL, phone number, or claim was authenticated.

Future verification levels may include:

- `OFFICIAL_SOURCE`: checked against an official/public source
- `HUMAN_CONFIRMED`: confirmed by a registered trusted person or human operator

This separation is a core product invariant, not temporary UI copy.

## Risk policy

### LOW
No explicit high-consequence signal found. The UI must still state that safety has not been verified.

### MEDIUM
Links, urgency, benefits, family/identity ambiguity or other external requests. Recommend checking through an official route rather than using the message-provided route. Offer trusted-person checking as an optional path.

### HIGH
Money transfer, credentials, remote-control/app installation, or strong authority-pressure patterns. Stop the action and surface trusted-person/human escalation.

A simple institution name alone must not automatically become HIGH; stronger pressure/context is required unless another HIGH signal is present.

## Cost policy

P0 spends no inference tokens for routine checks.

Future escalation order:

1. deterministic rules
2. local/session context
3. official-source lookup
4. low-cost model
5. advanced model/agent
6. trusted person or human operator

## Privacy baseline

- do not persist message contents in P0
- do not require account creation
- do not collect financial credentials
- do not execute links, transfers, installs or calls

## Senior mobile UX baseline

- one primary task per screen: paste the message and check what to do
- minimum 48px touch targets for secondary sample controls
- large body copy and explicit keyboard focus states
- Korean action language instead of exposing technical LOW/MEDIUM/HIGH codes as the main message
- result order: action signal → plain-language summary → verification scope → reasons → next action
- MEDIUM/HIGH results can surface a trusted-person path

## Run locally

```bash
cd prototype
npm install
npm run dev
```

Tests and production build:

```bash
npm run test
npm run build
```

## CI status

Initial GitHub Actions `Prototype CI` completed successfully on the first P0 slice. Every follow-up change must continue to pass both policy tests and production build.

## P0 limitations

The rule engine is a UX and policy prototype, not a certified phishing classifier. A LOW result means only that the current rules did not detect a defined risk signal; it is never a guarantee that a message is safe.

## Next technical increments

1. keep CI green after trust-copy changes
2. perform device/browser usability QA when a preview URL is available
3. add the first official-source verification adapter
4. design a real trusted-person request channel
5. test whether AI escalation materially improves ambiguous cases before adding inference cost
