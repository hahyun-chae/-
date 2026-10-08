# 원가핏

음식점 사장님이 식재료 시세 변동을 확인하고, 우리 가게 메뉴 기준으로 구매·대체 판단을 내릴 수 있도록 돕는 서비스 (MVP).
요구사항은 [`../PRD.md`](../PRD.md)를 따른다.

## 실행

```bash
npm install
cp .env.example .env.local   # KAMIS 키가 없으면 비워 둬도 데모 시세로 동작
npm run dev                  # http://localhost:3000
```

KAMIS 품목 카탈로그(부류 › 품목 › 품종)는 `src/lib/kamis-catalog.json`에 저장되어 있다. KAMIS가 품목을 추가하거나 바꾸면 다시 받는다.

```bash
npm run sync:kamis           # 최근 1년을 훑어 계절 품종까지 모은다 (.env.local의 KAMIS 키 필요, 1~2분)
```

처음 접속하면 온보딩(상호명 → 관심 재료 → 대표 메뉴)으로 이동하고, 이후 앱의 첫 화면은 재료 시세 탭(`/ingredients`)이다.

## 폴더 구조

```
src/
├── app/                        # 라우트 (App Router)
│   ├── layout.tsx              # 공통 레이아웃, 서버에서 기본 시세 로드
│   ├── page.tsx                # 첫 화면 → /ingredients 로 이동
│   ├── today/                  # 대시보드: 오늘의 판단
│   ├── onboarding/             # 3단계 온보딩
│   ├── ingredients/            # 재료 시세(첫 화면): 전체 재료 + 카테고리 탭, ★ 관심 재료 상단 고정 / [id] 상세
│   ├── shopping/               # 장보기 목록: 판단 반영, 수량 메모, 체크, 산 것 지우기
│   ├── menus/                  # 메뉴 목록, new 등록, [id] 편집
│   ├── settings/               # 가게 정보, 시세 기준, 판단 기준값
│   └── api/prices/route.ts     # 시세 조회 API (도매/지역 변경 시 사용)
├── components/
│   ├── layout/AppShell.tsx     # 사이드바(데스크톱) / 하단 탭(모바일)
│   ├── dashboard/              # 판단 요약, 판단 카드
│   ├── shopping/               # 장보기 목록, 판단 카드의 담기 버튼
│   ├── ingredients/            # 재료 검색, 시세 행, 차트, 상세
│   ├── menus/                  # 메뉴 목록, 메뉴 편집기
│   ├── onboarding/ settings/
│   └── ui/                     # 배지, 공통 블록, 색상 토큰(tone.ts)
├── lib/
│   ├── types.ts                # 도메인 타입
│   ├── catalog.ts              # 재료 마스터: 대표 재료 + KAMIS 전체 품종
│   ├── kamis-catalog.json      # KAMIS 부류·품목·품종 코드표 (npm run sync:kamis로 생성)
│   ├── templates.ts            # 메뉴 템플릿, 지역 코드
│   ├── status.ts               # 가격 상태 분류 (급등/상승/보합/하락/급락)
│   ├── recommend.ts            # 추천 행동 규칙 + 대체 재료 추천 + 추천 이유 문장
│   ├── shopping.ts             # 장보기 목록 도우미
│   ├── hangul.ts               # 초성 검색, 조사 처리
│   └── prices/                 # 시세 소스: KAMIS 클라이언트, 데모 데이터
└── store/
    ├── app-store.ts            # 가게 데이터 저장소 (localStorage)
    ├── prices-context.tsx      # 시세 컨텍스트
    └── use-decisions.ts        # 판단 결과 계산 훅
```

## 핵심 규칙

- **가격 상태**: 1주 전 대비 ±5% 상승/하락, ±15% 급등/급락 (설정에서 변경 가능)
- **추천 행동**: 대체 그룹 재료가 오르면 대체 검토, 조정 가능 재료가 급등하면 양 조절, 핵심 재료가 오르면 필요량만 구매, 내리면 구매 기회
- **대체 추천**: 사용자가 대체 그룹에 등록한 재료 중, 원래 재료보다 가격 상태가 나은 것만 등락률 낮은 순으로 최대 3개
- 추천 이유 문장은 계산된 수치로 만든 템플릿 문장이다. LLM으로 바꿀 때도 `buildReason`의 입력(후보·수치)만 넘기고, 후보 밖 재료명이 나오면 템플릿 문장으로 대체한다.

## MVP 한계와 다음 단계

- 가게 데이터는 브라우저 localStorage에 저장된다. 로그인·DB를 붙일 때 `store/app-store.ts`의 저장 부분만 바꾸면 된다.
- 시세는 KAMIS item_code / kind_code로 맞춘다. 계절 품종(배추 봄·가을·월동, 사과 후지 등)은 철이 아닐 때 "시세 없음"으로 표시된다.
- 취나물·비름나물·두부 등 KAMIS 미조사 품목은 "시세 없음"으로 표시된다. 데모 시세에서는 값이 있다.
- 지역 코드는 실제 키로 연동하면서 확인이 필요하다 (`lib/templates.ts`).
