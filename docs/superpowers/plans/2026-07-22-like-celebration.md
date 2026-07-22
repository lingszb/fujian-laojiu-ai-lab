# 福小酿点赞感谢动效 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将点赞按钮统一为 `👍`，并在全站点赞成功后播放轻量感谢动效和显示明确回执。

**Architecture:** 保留现有 `/api/likes`、D1 累计数与 Plausible 事件逻辑，只在 `LabApp` 增加一次性动效状态和清理定时器。按钮内按需渲染四个浮起的 `👍`，样式和无动画偏好全部放在现有全局样式文件中。

**Tech Stack:** Next.js 16、React 19、TypeScript、CSS animations、Node.js test runner。

## Global Constraints

- 点赞按钮和浮起图标统一使用 `👍`，不使用 `♡` 或 `♥`。
- 成功回执必须为 `感谢！福小酿收到你的点赞啦。`。
- 接口失败仍提示 `福小酿暂时没接住这个赞`，不显示虚假计数。
- D1 点赞累计与 Plausible `Like Fuxiaoniang` 事件逻辑保持不变。
- 动画只使用 `transform` 和 `opacity`，并兼容 `prefers-reduced-motion: reduce`。

---

### Task 1: 锁定点赞交互文案与结构

**Files:**
- Modify: `tests/rendered-html.test.mjs`
- Modify: `app/lab-app.tsx`

**Interfaces:**
- Consumes: 现有 `likeFuxiaoniang(): Promise<void>` 与 `liked`、`liking`、`likeCount` 状态。
- Produces: `likeCelebrating: boolean`、`likeCelebrationTimer: MutableRefObject<number | null>`，以及 `.like-burst`、`.like-thanks` DOM 结构。

- [ ] **Step 1: 写入失败的源码契约测试**

在现有“places the global 福小酿 like action”测试中加入：

```js
assert.match(app, />👍<\/span>/);
assert.doesNotMatch(app, /liked \? "♥" : "♡"/);
assert.match(app, /感谢！福小酿收到你的点赞啦。/);
assert.match(app, /likeCelebrating/);
assert.match(app, /like-burst/);
assert.match(app, /like-thanks/);
assert.match(app, /setLikeCelebrating\(true\)/);
assert.match(app, /setLikeCelebrating\(false\)/);
```

- [ ] **Step 2: 运行测试并确认因新交互尚未实现而失败**

Run: `node --test tests/rendered-html.test.mjs`

Expected: FAIL，失败信息指出找不到 `👍` 或感谢动效结构。

- [ ] **Step 3: 在点赞成功路径中添加一次性动效状态**

在 `LabApp` 状态区增加：

```tsx
const [likeCelebrating, setLikeCelebrating] = useState(false);
const likeCelebrationTimer = useRef<number | null>(null);
```

扩展卸载清理逻辑：

```tsx
useEffect(() => () => {
  if (glassWobbleTimer.current !== null) window.clearTimeout(glassWobbleTimer.current);
  if (likeCelebrationTimer.current !== null) window.clearTimeout(likeCelebrationTimer.current);
}, []);
```

在 POST 成功、计数更新后触发并清理动效：

```tsx
setLikeCelebrating(true);
likeCelebrationTimer.current = window.setTimeout(() => {
  setLikeCelebrating(false);
  likeCelebrationTimer.current = null;
}, 1100);
```

删除成功路径中的 `flash("福小酿收到你的赞啦")`，失败路径保持原样。

- [ ] **Step 4: 将按钮改成 `👍` 并加入浮起图标与内联感谢**

将点赞按钮替换为以下结构：

```tsx
<button
  type="button"
  className={`like-button${liked ? " is-liked" : ""}${likeCelebrating ? " is-celebrating" : ""}`}
  onClick={likeFuxiaoniang}
  disabled={liked || liking}
  aria-pressed={liked}
>
  <span className="like-icon" aria-hidden="true">👍</span>
  <span>{liking ? "正在送出这个赞…" : liked ? "已为福小酿点赞" : "为福小酿点赞"}</span>
  {likeCount !== null && <strong key={likeCount} className="like-count">{likeCount}</strong>}
  {likeCelebrating && (
    <span className="like-burst" aria-hidden="true">
      <i>👍</i><i>👍</i><i>👍</i><i>👍</i>
    </span>
  )}
</button>
{liked && <p className={`like-thanks${likeCelebrating ? " is-celebrating" : ""}`} role="status">感谢！福小酿收到你的点赞啦。</p>}
```

- [ ] **Step 5: 运行源码契约测试并确认通过**

Run: `node --test tests/rendered-html.test.mjs`

Expected: PASS，全部 rendered HTML/source tests 通过。

### Task 2: 添加点赞冒泡与数字反馈样式

**Files:**
- Modify: `tests/rendered-html.test.mjs`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: Task 1 产出的 `.is-celebrating`、`.like-burst`、`.like-thanks` 与 `.like-count`。
- Produces: `like-pop`、`like-float`、`like-count-tick`、`like-thanks-in` 四个动画，以及 reduced-motion 降级规则。

- [ ] **Step 1: 写入失败的 CSS 契约测试**

加入：

```js
assert.match(css, /@keyframes like-pop/);
assert.match(css, /@keyframes like-float/);
assert.match(css, /@keyframes like-count-tick/);
assert.match(css, /@keyframes like-thanks-in/);
assert.match(css, /prefers-reduced-motion[\s\S]*\.like-button\.is-celebrating/);
```

- [ ] **Step 2: 运行测试并确认因动画样式缺失而失败**

Run: `node --test tests/rendered-html.test.mjs`

Expected: FAIL，失败信息指出找不到 `@keyframes like-pop`。

- [ ] **Step 3: 添加轻量点赞动效样式**

在 `.like-button` 区域加入 `position: relative; overflow: visible;`，并添加：

```css
@keyframes like-pop {
  0% { transform: scale(1); }
  45% { transform: scale(1.28) rotate(-8deg); }
  75% { transform: scale(0.94) rotate(3deg); }
  100% { transform: scale(1); }
}

@keyframes like-float {
  0% { opacity: 0; transform: translate3d(0, 4px, 0) scale(0.72); }
  20% { opacity: 1; }
  100% { opacity: 0; transform: translate3d(var(--burst-x), -48px, 0) scale(1.05) rotate(var(--burst-r)); }
}

@keyframes like-count-tick {
  0% { opacity: 0.45; transform: translateY(5px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes like-thanks-in {
  0% { opacity: 0; transform: translateY(-5px); }
  100% { opacity: 1; transform: translateY(0); }
}
```

将主图标、计数、浮起图标和感谢文字分别绑定到上述动画。四个浮起图标使用不同 `--burst-x`、`--burst-r` 和 `animation-delay`，总时长控制在 900ms 内。

- [ ] **Step 4: 添加减少动态效果降级**

在现有 `@media (prefers-reduced-motion: reduce)` 内加入：

```css
.like-button.is-celebrating .like-icon,
.like-button.is-celebrating .like-count,
.like-thanks.is-celebrating {
  animation: none;
}

.like-burst {
  display: none;
}
```

- [ ] **Step 5: 运行源码契约测试并确认通过**

Run: `node --test tests/rendered-html.test.mjs`

Expected: PASS。

### Task 3: 完整验证、提交并推送

**Files:**
- Verify: `app/lab-app.tsx`
- Verify: `app/globals.css`
- Verify: `tests/rendered-html.test.mjs`
- Verify: `docs/superpowers/specs/2026-07-22-like-celebration-design.md`
- Verify: `docs/superpowers/plans/2026-07-22-like-celebration.md`

**Interfaces:**
- Consumes: Task 1 与 Task 2 的最终实现。
- Produces: 通过测试并推送至 `origin/main` 的提交。

- [ ] **Step 1: 运行完整项目验证**

Run: `npm test`

Expected: Next.js production build 成功，全部 Node tests 通过。

Run: `npm run lint`

Expected: ESLint 退出码 0，无错误。

Run: `node --test tests/plausible.test.mjs tests/likes-route.test.mjs tests/lab-engine.test.mjs`

Expected: 全部单元测试通过。

- [ ] **Step 2: 检查差异质量**

Run: `git diff --check && git status --short`

Expected: `git diff --check` 无输出；状态只包含本功能相关文件。

- [ ] **Step 3: 提交实现**

```bash
git add app/lab-app.tsx app/globals.css tests/rendered-html.test.mjs docs/superpowers/plans/2026-07-22-like-celebration.md
git commit -m "Add 福小酿 thumbs-up celebration"
```

- [ ] **Step 4: 推送主分支**

Run: `git push origin main`

Expected: `main -> main`，远端包含新提交。
