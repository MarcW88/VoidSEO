# VOID Loop — PRD (Problem / Requirements / Data / Metrics)

> Purpose: Define inputs, outputs, constraints, and success metrics *before* coding.

## 0) Meta
- **Project/Module:** 
- **Owner:** 
- **Version:** v0.1
- **Link to Vision:** 

## 1) Problem
Short description + why now.

## 2) Requirements
### 2.1 Inputs (contract)
- **Schema:** (fields, types, units)
- **Format:** CSV/JSON/parquet/API
- **Freshness & size:** 
- **Validation rules:** (nulls, ranges, enums)

### 2.2 Outputs (contract)
- **Schema:** 
- **Granularity:** (per keyword/url/cluster)
- **Delivery:** file/API/DB/sheet
- **Consumers:** who/where

### 2.3 Functional specs
Bullet the expected behaviours. Keep v0.1 small.

### 2.4 Non‑functional
Latency, cost caps, privacy, quotas, reliability, observability.

## 3) Data
- Sources, credentials owner, access method, rate limits.

## 4) Metrics & Evaluation
- **Primary metrics:** precision/recall, coverage %, latency, cost per run
- **Acceptance criteria:** “Ship v0.1 if …”
- **Test dataset:** link/sample

## 5) Risks & Guardrails
- Limits, failure modes, rollback plan.

## 6) Timeline
- v0.1 → v0.2 milestones.

## 7) Handover
Docs to write, owners, checklists.

---
**Pitfalls:** Vague outputs. Measuring vanity, not value.
