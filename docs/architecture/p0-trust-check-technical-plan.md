# P0 Trust Check — Technical Plan

## Objective

Validate the trust experience before building a full life-manager agent.

Core flow:

`message → explain → risk → reasons → next action → trusted-person escalation`

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
 ├─ OfficialDataAdapter    ← later: KISA/public sources
 └─ AIRiskAnalyzer         ← later: model escalation
```

An AI model may improve explanation or ambiguous-case analysis later, but it must not increase action authority by itself.

## Risk policy

### LOW
No explicit high-consequence signal found. Explain limitations and allow the user to continue cautiously.

### MEDIUM
Links, urgency, benefits or ambiguous external requests. Recommend checking through an official route rather than using the message-provided route.

### HIGH
Money transfer, credentials, remote-control/app installation, or strong authority-pressure patterns. Stop the action and surface trusted-person/human escalation.

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

## P0 limitations

The rule engine is a UX and policy prototype, not a certified phishing classifier. A LOW result means only that the current rules did not detect a defined risk signal; it is never a guarantee that a message is safe.

## Next technical increments

1. run CI and fix build/test issues
2. usability QA at mobile width
3. add official-source verification adapter
4. design real trusted-person request channel
5. test whether AI escalation materially improves ambiguous cases before adding inference cost
