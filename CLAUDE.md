# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

**가구 전도 프리체크 시뮬레이터** — 가구 형상을 3D로 보면서 다양한 조건(외력, 가동부 작동, 상부 하중)에서 전도 위험을 설계 초기에 검토하는 웹 도구.

인증/시험 대체 도구가 아닌 **설계 검토용 시뮬레이터**.

## 빌드 및 실행

> Windows에서 Node.js가 bash PATH에 없으면 `export PATH="/c/Program Files/nodejs:$PATH"` 선행 필요.

```bash
cd furniture-sim
npm install
npm run dev        # http://localhost:5173
npm run build      # 프로덕션 빌드
npx tsc -b --noEmit  # 타입 체크만
```

## 아키텍처

### 4-레이어 구조

```
입력층  → Zustand 스토어 (geometryStore, scenarioStore)
계산층  → src/solver/  (순수 TS 함수, 정적 평형 모멘트 계산)
시각화층 → src/components/viewer/  (React Three Fiber Canvas)
제어층  → App.tsx + RightPanel (시나리오 선택 → 결과 표시)
```

### 데이터 흐름

```
FurnitureGeometry (JSON) → useSolver 훅 → runSolver() → SolverResult → Viewer3D + ResultsPanel
```

`useSolver` 훅이 geometry + scenario 스토어를 감시하고 150ms 디바운스 후 solver를 실행해 results 스토어에 기록.

### Solver 핵심 로직 (`src/solver/`)

| 파일 | 역할 |
|------|------|
| `comCalculator.ts` | 형상 기반 추정 질량(volume×density×factor), 가동부 위치 반영 무게중심 |
| `supportPolygon.ts` | Ray casting 내외부 판정, 최근접 변 거리(안정 여유), 전도 방향 |
| `forceAnalyzer.ts` | 수평력 → 유효 COM 이동 등가 변환 |
| `tipAnalyzer.ts` | 임계 가압력, 60회 이진탐색으로 임계 작동 거리/각도 |
| `index.ts` | 시나리오 파라미터 적용 + 6가지 시나리오 분기 + 진단 문구 생성 |

**안전/주의/위험 기준:** `margin < 0` → 위험, `margin < safety_margin×2` → 주의

### 6가지 시나리오

`front_force`, `side_force`, `single_movable`, `multi_movable`, `top_load`, `external_force_only`

### 3D Viewer (`src/components/viewer/`)

- `Viewer3D.tsx` — R3F Canvas 루트, OrbitControls, Grid, 조명
- `FurnitureMesh.tsx` — Part별 BoxGeometry (가동부 위치 실시간 반영)
- `SupportPolygonMesh.tsx` — 바닥 지지영역 (상태에 따라 녹/노/빨)
- `COMMarker.tsx` — 실제 COM(노란 구), 유효 COM(주황 구), 바닥 투영
- `TippingEdgeLine.tsx` — 전도 방향 축 (위험 시 펄스 애니메이션)
- `TippingAnimation.tsx` — 전도 미리보기 회전 애니메이션

### 상태 관리 (`src/store/`)

세 개의 독립된 Zustand + immer 스토어:
- `geometryStore` — 가구 JSON ↔ 파싱 객체 동기화
- `scenarioStore` — 활성 시나리오 타입 + 파라미터
- `resultsStore` — solver 결과, 로딩/에러 상태, 전도 미리보기 플래그

### 미완료 기능

- STP 파일 업로드 버튼은 UI에 있으나 파서 미연결
- rotation 모션의 힌지 위치는 bbox.x 기준 단순화 (실제 힌지 위치 설정 UI 없음)
