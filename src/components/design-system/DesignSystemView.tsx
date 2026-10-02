"use client";

import {
  ArrowRightIcon,
  CheckIcon,
  CircleAlertIcon,
  ExternalLinkIcon,
  Loader2Icon,
  MailIcon,
  PlusIcon,
  SearchIcon,
  StarIcon,
  Trash2Icon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const BUTTON_VARIANTS = ["default", "secondary", "outline", "ghost", "destructive", "link"] as const;
const BUTTON_SIZES = ["xs", "sm", "default", "lg"] as const;
const ICON_SIZES = ["icon-xs", "icon-sm", "icon", "icon-lg"] as const;
const BADGE_VARIANTS = ["default", "secondary", "destructive", "outline", "ghost", "link"] as const;

const SECTIONS = [
  { id: "button", label: "Button" },
  { id: "input", label: "Input" },
  { id: "card", label: "Card" },
  { id: "badge", label: "Badge" },
  { id: "dialog", label: "Dialog" },
];

function Section({ id, title, description, children }: { id: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-5">
        <h2 className="text-[28px] leading-tight font-semibold tracking-[-0.015em]">{title}</h2>
        <p className="mt-1 text-[15px] text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

/** 한 가지 기준(variant, 상태 등)으로 묶은 예시 줄 */
function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="card p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-baseline gap-x-2">
        <h3 className="text-[15px] font-semibold">{label}</h3>
        {hint && <code className="text-xs text-muted-foreground">{hint}</code>}
      </div>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

/** 그리드 셀: 위에 컴포넌트, 아래에 이름 */
function Cell({ name, children, className = "" }: { name: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col items-start gap-2 ${className}`}>
      {children}
      <code className="text-[11px] text-muted-foreground">{name}</code>
    </div>
  );
}

function Field({ id, label, help, error, children }: { id: string; label: string; help?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="grid w-full gap-1.5 sm:w-72">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <CircleAlertIcon className="size-3.5" aria-hidden />
          {error}
        </p>
      ) : (
        help && <p className="text-xs text-muted-foreground">{help}</p>
      )}
    </div>
  );
}

export function DesignSystemView() {
  const [loading, setLoading] = useState(false);
  const [menuName, setMenuName] = useState("비빔밥");
  const [savedName, setSavedName] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div>
      <header className="mb-10">
        <p className="text-sm font-semibold text-brand-700">원가핏 · shadcn/ui (base-nova)</p>
        <h1 className="mt-1 text-[40px] leading-none font-semibold tracking-[-0.015em]">디자인 시스템</h1>
        <p className="mt-3 max-w-2xl text-[17px] text-muted-foreground">
          프로젝트에 추가한 shadcn/ui 컴포넌트를 variant와 상태별로 모았어요. 색·모서리는 <code className="text-sm">globals.css</code>의 원가핏 토큰을 따라요.
        </p>
        <nav aria-label="컴포넌트 바로가기" className="mt-6 flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              {s.label}
            </a>
          ))}
        </nav>
      </header>

      <div className="space-y-16">
        {/* ───────── Button ───────── */}
        <Section id="button" title="Button" description="variant 6종 × size 4종, 아이콘·상태·링크 렌더링">
          <div className="card overflow-x-auto p-5 sm:p-6">
            <table className="w-full min-w-[640px] border-separate border-spacing-y-3 text-left">
              <thead>
                <tr className="text-xs text-muted-foreground">
                  <th className="pr-4 font-medium">variant \ size</th>
                  {BUTTON_SIZES.map((s) => (
                    <th key={s} className="pr-4 font-medium">
                      <code>{s}</code>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BUTTON_VARIANTS.map((v) => (
                  <tr key={v}>
                    <th scope="row" className="pr-4 align-middle text-xs font-medium text-muted-foreground">
                      <code>{v}</code>
                    </th>
                    {BUTTON_SIZES.map((s) => (
                      <td key={s} className="pr-4 align-middle">
                        <Button variant={v} size={s}>
                          버튼
                        </Button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Row label="아이콘과 함께" hint='data-icon="inline-start" | "inline-end"'>
            <Button>
              <PlusIcon data-icon="inline-start" />
              관심 재료 담기
            </Button>
            <Button variant="outline">
              다음
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
            <Button variant="secondary">
              <MailIcon data-icon="inline-start" />
              문의하기
            </Button>
            <Button variant="destructive">
              <Trash2Icon data-icon="inline-start" />
              메뉴 삭제
            </Button>
          </Row>

          <Row label="아이콘 전용" hint="size: icon-xs · icon-sm · icon · icon-lg">
            {ICON_SIZES.map((s) => (
              <Cell key={s} name={s}>
                <Button size={s} variant="outline" aria-label="관심 재료로 담기">
                  <StarIcon />
                </Button>
              </Cell>
            ))}
            {ICON_SIZES.map((s) => (
              <Cell key={`d-${s}`} name={`${s} · default`}>
                <Button size={s} aria-label="추가">
                  <PlusIcon />
                </Button>
              </Cell>
            ))}
          </Row>

          <Row label="상태" hint="disabled · loading · aria-invalid · focus-visible(Tab 키로 확인)">
            <Cell name="enabled">
              <Button>저장</Button>
            </Cell>
            <Cell name="disabled">
              <Button disabled>저장</Button>
            </Cell>
            <Cell name="outline · disabled">
              <Button variant="outline" disabled>
                취소
              </Button>
            </Cell>
            <Cell name="loading (클릭)">
              <Button
                disabled={loading}
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => setLoading(false), 1500);
                }}
              >
                {loading && <Loader2Icon data-icon="inline-start" className="animate-spin" />}
                {loading ? "저장 중…" : "저장"}
              </Button>
            </Cell>
            <Cell name="aria-invalid">
              <Button variant="outline" aria-invalid>
                확인 필요
              </Button>
            </Cell>
          </Row>

          <Row label="링크를 버튼 모양으로" hint="<a className={buttonVariants(...)}> — render={<a />}는 role=button이 붙어 쓰지 않음">
            <a href="#dialog" className={buttonVariants()}>
              Dialog 섹션으로 이동
            </a>
            <a href="https://ui.shadcn.com/docs/components/base/button" target="_blank" rel="noreferrer" className={buttonVariants({ variant: "link" })}>
              shadcn 문서
              <ExternalLinkIcon data-icon="inline-end" />
            </a>
          </Row>
        </Section>

        {/* ───────── Input ───────── */}
        <Section id="input" title="Input" description="기본 · 값 있음 · 비활성 · 오류 · 읽기 전용, 타입별 입력">
          <Row label="상태">
            <Field id="ds-input-default" label="기본 (placeholder)" help="재료 이름이나 초성으로 검색해요.">
              <Input id="ds-input-default" placeholder="예: 시금치, ㅅㄱㅊ" />
            </Field>
            <Field id="ds-input-filled" label="값 있음">
              <Input id="ds-input-filled" defaultValue="행복한 비빔밥" />
            </Field>
            <Field id="ds-input-disabled" label="비활성 (disabled)">
              <Input id="ds-input-disabled" defaultValue="수정할 수 없어요" disabled />
            </Field>
            <Field id="ds-input-invalid" label="오류 (aria-invalid)" error="메뉴 이름을 입력해 주세요.">
              <Input id="ds-input-invalid" aria-invalid placeholder="메뉴 이름" />
            </Field>
            <Field id="ds-input-readonly" label="읽기 전용 (readOnly)">
              <Input id="ds-input-readonly" defaultValue="KAMIS 공식 시세" readOnly />
            </Field>
            <Field id="ds-input-focus" label="포커스 (클릭해서 확인)">
              <Input id="ds-input-focus" placeholder="클릭하면 파란 링이 보여요" />
            </Field>
          </Row>

          <Row label="타입">
            <Field id="ds-input-search" label="search">
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input id="ds-input-search" type="search" placeholder="재료 검색" className="pl-8" />
              </div>
            </Field>
            <Field id="ds-input-number" label="number">
              <Input id="ds-input-number" type="number" defaultValue={15} min={1} max={100} />
            </Field>
            <Field id="ds-input-email" label="email">
              <Input id="ds-input-email" type="email" placeholder="owner@example.com" />
            </Field>
            <Field id="ds-input-password" label="password">
              <Input id="ds-input-password" type="password" defaultValue="secret" />
            </Field>
            <Field id="ds-input-file" label="file">
              <Input id="ds-input-file" type="file" />
            </Field>
          </Row>
        </Section>

        {/* ───────── Card ───────── */}
        <Section id="card" title="Card" description="size default · sm, 헤더 액션 · 푸터 조합">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Cell name='size="default"' className="[&>*:first-child]:w-full">
              <Card>
                <CardHeader>
                  <CardTitle>시금치</CardTitle>
                  <CardDescription>100g · 기준일 10/3 · KAMIS</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="tabular text-2xl font-semibold">1,560원</p>
                  <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-red-600">
                    <TrendingUpIcon className="size-4" aria-hidden />
                    +32.2% <span className="font-normal text-muted-foreground">1주 전 대비</span>
                  </p>
                </CardContent>
              </Card>
            </Cell>

            <Cell name='size="sm"' className="[&>*:first-child]:w-full">
              <Card size="sm">
                <CardHeader>
                  <CardTitle>근대</CardTitle>
                  <CardDescription>100g</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="tabular text-xl font-semibold">879원</p>
                  <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-blue-600">
                    <TrendingDownIcon className="size-4" aria-hidden />
                    -8.0%
                  </p>
                </CardContent>
              </Card>
            </Cell>

            <Cell name="CardAction + CardFooter" className="[&>*:first-child]:w-full">
              <Card>
                <CardHeader>
                  <CardTitle>비빔밥</CardTitle>
                  <CardDescription>핵심 2 · 조정 가능 3 · 대체 그룹 1</CardDescription>
                  <CardAction>
                    <Badge variant="destructive">▲ 오른 재료 1</Badge>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">나물류: 시금치 ↔ 취나물, 비름나물, 근대</p>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button variant="outline" size="sm">
                    편집
                  </Button>
                  <Button size="sm">대체 추천 보기</Button>
                </CardFooter>
              </Card>
            </Cell>

            <Cell name="CardHeader만 (빈 상태)" className="[&>*:first-child]:w-full">
              <Card>
                <CardHeader>
                  <CardTitle>등록된 메뉴가 없어요</CardTitle>
                  <CardDescription>템플릿을 고르면 1분 안에 등록할 수 있어요.</CardDescription>
                </CardHeader>
              </Card>
            </Cell>
          </div>
        </Section>

        {/* ───────── Badge ───────── */}
        <Section id="badge" title="Badge" description="variant 6종, 아이콘 · 링크 렌더링">
          <Row label="variant">
            {BADGE_VARIANTS.map((v) => (
              <Cell key={v} name={v}>
                <Badge variant={v}>배지</Badge>
              </Cell>
            ))}
          </Row>
          <Row label="아이콘과 함께" hint='data-icon="inline-start" | "inline-end"'>
            <Badge>
              <CheckIcon data-icon="inline-start" />
              적용됨
            </Badge>
            <Badge variant="secondary">
              <StarIcon data-icon="inline-start" />
              관심 재료
            </Badge>
            <Badge variant="destructive">
              <CircleAlertIcon data-icon="inline-start" />
              급등
            </Badge>
            <Badge variant="outline">
              시세 미연동
              <ExternalLinkIcon data-icon="inline-end" />
            </Badge>
          </Row>
          <Row label="링크로 렌더링" hint="render={<a />} — hover 스타일 적용">
            <Badge render={<a href="#card" />}>Card 섹션</Badge>
            <Badge variant="secondary" render={<a href="#input" />}>
              Input 섹션
            </Badge>
            <Badge variant="outline" render={<a href="#button" />}>
              Button 섹션
            </Badge>
          </Row>
        </Section>

        {/* ───────── Dialog ───────── */}
        <Section id="dialog" title="Dialog" description="버튼을 눌러 열어 보세요. Esc 또는 바깥 클릭으로 닫혀요.">
          <Row label="종류">
            <Cell name="기본">
              <Dialog>
                <DialogTrigger render={<Button variant="outline" />}>기본 Dialog</DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>대체 재료 추천</DialogTitle>
                    <DialogDescription>시금치가 1주 새 32% 올랐어요. 등록하신 나물류 중에서는 근대(-8%), 취나물(-4%)이 더 저렴해요.</DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </Cell>

            <Cell name="폼 + 푸터 (controlled)">
              <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogTrigger render={<Button />}>메뉴 이름 바꾸기</DialogTrigger>
                <DialogContent>
                  <form
                    className="grid gap-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!menuName.trim()) return;
                      setSavedName(menuName.trim());
                      setFormOpen(false);
                    }}
                  >
                    <DialogHeader>
                      <DialogTitle>메뉴 이름 바꾸기</DialogTitle>
                      <DialogDescription>새 이름을 입력하고 저장을 누르세요.</DialogDescription>
                    </DialogHeader>
                    <Field id="ds-dialog-name" label="메뉴 이름" error={menuName.trim() ? undefined : "메뉴 이름을 입력해 주세요."}>
                      <Input id="ds-dialog-name" value={menuName} onChange={(e) => setMenuName(e.target.value)} aria-invalid={!menuName.trim()} autoFocus />
                    </Field>
                    <DialogFooter>
                      <DialogClose render={<Button variant="outline" type="button" />}>취소</DialogClose>
                      <Button type="submit" disabled={!menuName.trim()}>
                        저장
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              {savedName && <span className="text-xs text-muted-foreground">저장됨: {savedName}</span>}
            </Cell>

            <Cell name="삭제 확인 (destructive)">
              <Dialog>
                <DialogTrigger render={<Button variant="destructive" />}>
                  <Trash2Icon data-icon="inline-start" />
                  메뉴 삭제
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>메뉴를 삭제할까요?</DialogTitle>
                    <DialogDescription>비빔밥 메뉴와 등록한 대체 그룹이 함께 지워져요. 되돌릴 수 없어요.</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose render={<Button variant="outline" />}>취소</DialogClose>
                    <DialogClose render={<Button variant="destructive" />}>삭제</DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </Cell>

            <Cell name="showCloseButton={false} + 푸터 닫기">
              <Dialog>
                <DialogTrigger render={<Button variant="secondary" />}>닫기 버튼 없음</DialogTrigger>
                <DialogContent showCloseButton={false}>
                  <DialogHeader>
                    <DialogTitle>오늘의 판단 안내</DialogTitle>
                    <DialogDescription>추천은 판단을 돕기 위한 참고 정보예요. 최종 결정은 사장님이 해 주세요.</DialogDescription>
                  </DialogHeader>
                  <DialogFooter showCloseButton />
                </DialogContent>
              </Dialog>
            </Cell>

            <Cell name="긴 내용 (스크롤)">
              <Dialog>
                <DialogTrigger render={<Button variant="ghost" />}>긴 내용 Dialog</DialogTrigger>
                <DialogContent className="max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>가격 상태 분류 기준</DialogTitle>
                    <DialogDescription>1주 전 대비 등락률로 분류해요.</DialogDescription>
                  </DialogHeader>
                  <ul className="space-y-2 text-sm">
                    {Array.from({ length: 16 }, (_, i) => (
                      <li key={i} className="rounded-lg bg-muted px-3 py-2">
                        {["급등 · +15% 이상", "상승 · +5% ~ +15%", "보합 · -5% ~ +5%", "하락 · -15% ~ -5%", "급락 · -15% 이하"][i % 5]}
                      </li>
                    ))}
                  </ul>
                </DialogContent>
              </Dialog>
            </Cell>
          </Row>
        </Section>
      </div>
    </div>
  );
}
