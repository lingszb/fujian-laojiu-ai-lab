# 福小酿点赞计数按钮 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将点赞控件改为左侧空心/实心 SVG 图标与右侧全站总数，并在成功后显示五秒 Toast。

**Architecture:** 保留现有 D1 点赞接口、本地防重复记录和 Plausible 事件。`LabApp` 内联渲染一个 SVG 图标，通过 `.is-liked` 切换填充；通用 `flash` 增加可选时长和单一定时器管理，点赞成功时传入 `5000`。

**Tech Stack:** Next.js 16、React 19、TypeScript、CSS、Node.js test runner。

## Global Constraints

- 按钮只显示左侧点赞图标和右侧全站总点赞数。
- 未点赞图标为空心，点赞成功后图标为实心。
- 成功 Toast 文案固定为 `感谢！福小酿收到你的点赞啦。`，显示 `5000` 毫秒。
- 总数未加载时显示 `—`，不得伪造数据。
- `/api/likes`、Cloudflare D1、浏览器防重复记录与 Plausible `Like Fuxiaoniang` 逻辑保持不变。
- 删除 `👍` 冒泡节点、常驻感谢文字和对应动画。

---

### Task 1: 锁定紧凑点赞控件与五秒 Toast 契约

**Files:**
- Modify: `tests/rendered-html.test.mjs`
- Modify: `app/lab-app.tsx`

**Interfaces:**
- Consumes: `likeFuxiaoniang(): Promise<void>`、`likeCount: number | null`、`liked: boolean`、`liking: boolean`。
- Produces: `flash(message: string, duration?: number): void`、`toastTimer: MutableRefObject<number | null>`、`.like-icon-svg` SVG 与 `.like-count` 总数。

- [ ] **Step 1: 写入失败的源码契约测试**

将点赞测试中的旧 `👍` 冒泡断言替换为：

```js
assert.match(app, /className="like-icon-svg"/);
assert.match(app, /viewBox="0 0 24 24"/);
assert.match(app, /aria-label=\{`\$\{liked \? "已点赞" : "为福小酿点赞"\}，总点赞数 \$\{likeCount \?\? "加载中"\}`\}/);
assert.match(app, /\{likeCount \?\? "—"\}/);
assert.match(app, /flash\("感谢！福小酿收到你的点赞啦。", 5000\)/);
assert.match(app, /function flash\(message: string, duration = 2200\)/);
assert.match(app, /toastTimer/);
assert.doesNotMatch(app, /likeCelebrating|like-burst|like-thanks/);
```

- [ ] **Step 2: 运行测试并确认因旧按钮结构仍存在而失败**

Run: `node --test tests/rendered-html.test.mjs`

Expected: FAIL，指出找不到 `className="like-icon-svg"`。

- [ ] **Step 3: 让 Toast 支持单独的五秒成功时长**

在 refs 区域增加：

```tsx
const toastTimer = useRef<number | null>(null);
```

在卸载清理 effect 中加入：

```tsx
if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
```

将 `flash` 改为：

```tsx
function flash(message: string, duration = 2200) {
  if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
  setToast(message);
  toastTimer.current = window.setTimeout(() => {
    setToast("");
    toastTimer.current = null;
  }, duration);
}
```

删除 `likeCelebrating` 状态与 `likeCelebrationTimer` ref。点赞 POST 成功后调用：

```tsx
flash("感谢！福小酿收到你的点赞啦。", 5000);
```

- [ ] **Step 4: 替换为左图标右计数的内联 SVG 按钮**

将现有点赞按钮内容替换为：

```tsx
<button
  type="button"
  className={`like-button${liked ? " is-liked" : ""}`}
  onClick={likeFuxiaoniang}
  disabled={liked || liking}
  aria-pressed={liked}
  aria-label={`${liked ? "已点赞" : "为福小酿点赞"}，总点赞数 ${likeCount ?? "加载中"}`}
>
  <svg className="like-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M2 20h4V9H2v11zm20-10c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L13.17 1 6.59 7.59C6.22 7.95 6 8.45 6 9v9c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1z" />
  </svg>
  <strong className="like-count">{likeCount ?? "—"}</strong>
</button>
```

删除 `like-burst` 和 `like-thanks` 节点。

- [ ] **Step 5: 运行源码契约测试并确认通过**

Run: `node --test tests/rendered-html.test.mjs`

Expected: PASS，全部四项测试通过。

### Task 2: 简化点赞按钮样式并删除旧动效

**Files:**
- Modify: `tests/rendered-html.test.mjs`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: Task 1 产出的 `.like-button`、`.is-liked`、`.like-icon-svg` 和 `.like-count`。
- Produces: 居中的紧凑双列按钮、空心/实心 SVG 状态和请求禁用状态。

- [ ] **Step 1: 写入失败的 CSS 契约测试**

加入：

```js
assert.match(css, /\.like-button[\s\S]*grid-template-columns:\s*28px auto/);
assert.match(css, /\.like-icon-svg[\s\S]*fill:\s*transparent[\s\S]*stroke:\s*currentColor/);
assert.match(css, /\.like-button\.is-liked \.like-icon-svg[\s\S]*fill:\s*currentColor/);
assert.doesNotMatch(css, /like-pop|like-float|like-count-tick|like-thanks-in|\.like-burst|\.like-thanks/);
```

- [ ] **Step 2: 运行测试并确认因旧动效 CSS 仍存在而失败**

Run: `node --test tests/rendered-html.test.mjs`

Expected: FAIL，指出 `.like-icon-svg` 空心样式不存在。

- [ ] **Step 3: 实现紧凑按钮和 SVG 状态样式**

使用以下核心样式替换现有点赞样式：

```css
.like-button {
  display: grid;
  width: fit-content;
  min-width: 88px;
  min-height: 48px;
  grid-template-columns: 28px auto;
  align-items: center;
  justify-self: center;
  gap: 10px;
  padding: 8px 16px;
}

.like-icon-svg {
  width: 26px;
  height: 26px;
  fill: transparent;
  stroke: currentColor;
  stroke-width: 1.25;
  transition: fill 160ms ease, transform 160ms ease;
}

.like-button.is-liked .like-icon-svg {
  fill: currentColor;
}
```

保留现有 hover、active、禁用和已点赞配色，删除 `.like-burst`、`.like-thanks` 与四组点赞动画 keyframes，以及 reduced-motion 中对这些旧类的规则。

- [ ] **Step 4: 运行源码契约测试并确认通过**

Run: `node --test tests/rendered-html.test.mjs`

Expected: PASS。

### Task 3: 完整验证、提交并推送

**Files:**
- Verify: `app/lab-app.tsx`
- Verify: `app/globals.css`
- Verify: `tests/rendered-html.test.mjs`
- Verify: `docs/superpowers/specs/2026-07-22-like-counter-button-design.md`
- Verify: `docs/superpowers/plans/2026-07-22-like-counter-button.md`

**Interfaces:**
- Consumes: Task 1 与 Task 2 的最终实现。
- Produces: 通过验证并同步至 `origin/main` 的提交。

- [ ] **Step 1: 运行完整验证**

Run: `npm test`

Expected: production build 成功，四项页面测试通过。

Run: `npm run lint`

Expected: ESLint 退出码 0。

Run: `node --test tests/plausible.test.mjs tests/likes-route.test.mjs tests/lab-engine.test.mjs`

Expected: 全部 17 项单元测试通过。

- [ ] **Step 2: 检查差异**

Run: `git diff --check && git status --short`

Expected: 无空白错误，状态只包含本功能相关文件。

- [ ] **Step 3: 提交实现**

```bash
git add app/lab-app.tsx app/globals.css tests/rendered-html.test.mjs docs/superpowers/plans/2026-07-22-like-counter-button.md
git commit -m "Simplify 福小酿 like counter"
```

- [ ] **Step 4: 推送主分支**

Run: `git push origin main`

Expected: `main -> main`。
