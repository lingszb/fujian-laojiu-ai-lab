"use client";

import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { alternateDrinkName, computeResult, normalizeCreatorName } from "./lib/lab-engine.mjs";

type Participation = "drink" | "nonalcoholic" | "personality";
type Screen = "age" | "home" | "creator" | "quiz" | "taste" | "brewing" | "result" | "receipt";
type Preferences = { tastes: string[]; sweetness: string; restrictions: string[] };

type Question = {
  lead: string;
  prompt: string;
  options: { id: string; label: string; detail?: string }[];
};

const QUESTIONS: Question[] = [
  {
    lead: "",
    prompt: "今天的你，更像哪句话？",
    options: [
      { id: "state-new", label: "🌱 今天状态不错，来点新的。" },
      { id: "state-offline", label: "🌧 脑子在线，人不在线。" },
      { id: "state-hustle", label: "🔥 今天准备狠狠干一票。" },
      { id: "state-survive", label: "🍃 今天先活着，其他明天再说。" },
      { id: "state-unknown", label: "🛸 我也不知道我是谁。" },
    ],
  },
  {
    lead: "",
    prompt: "如果今天是一杯酒，它应该……",
    options: [
      { id: "taste-sour", label: "🍋 先酸一下" },
      { id: "taste-sweet", label: "🍯 甜一点" },
      { id: "taste-bubbles", label: "🫧 冒点泡" },
      { id: "taste-quiet", label: "🌿 安静一点" },
      { id: "taste-bold", label: "🥃 浓一点，把我叫醒" },
    ],
  },
  {
    lead: "",
    prompt: "今天最想删掉什么？",
    options: [
      { id: "delete-monday", label: "📅 周一" },
      { id: "delete-group", label: "💬 工作群" },
      { id: "delete-boss", label: "💼 老板" },
      { id: "delete-todos", label: "📋 待办事项" },
      { id: "delete-rumination", label: "🧠 内耗" },
      { id: "delete-anxiety", label: "😮‍💨 焦虑" },
      { id: "delete-bug", label: "🐛 Bug" },
      { id: "delete-alarm", label: "⏰ 闹钟" },
      { id: "delete-ddl", label: "📝 DDL" },
    ],
  },
  {
    lead: "",
    prompt: "今天允许愿望不切实际，你选一个？",
    options: [
      { id: "vacation", label: "🏖 立刻放假，最好不用请假" },
      { id: "wealth", label: "💰 天降投资，也天降一个亿" },
      { id: "launch", label: "🚀 产品爆火，服务器也扛得住" },
      { id: "love", label: "❤️ 逛展遇见一个双向奔赴的新故事" },
      { id: "ai-work", label: "🤖 AI 替我修 Bug，我替 AI 喝彩" },
    ],
  },
  {
    lead: "",
    prompt: "如果今天要完成一个任务，你会……",
    options: [
      { id: "task-start", label: "🚀 马上开始" },
      { id: "task-research", label: "🧐 先研究" },
      { id: "task-delay", label: "😌 先拖一下" },
      { id: "task-ai", label: "🤖 让 AI 干 哈哈哈哈" },
    ],
  },
];

const RESTRICTIONS = [
  ["dairy", "不喝含乳饮品"],
  ["citrus", "对柑橘类敏感"],
  ["none", "无以上限制"],
];

const BREW_STEPS = ["读取今日状态", "提取情绪线索", "建立今日人格画像", "匹配福建老酒", "校验口味与限制", "正在命名这杯酒"];
const STORAGE_KEY = "fjl-ai-lab-v3";

function Seal({ small = false }: { small?: boolean }) {
  return <span className={small ? "seal seal--small" : "seal"} aria-hidden="true">酿</span>;
}

function LabHeader({ step, onBack }: { step?: string; onBack?: () => void }) {
  return (
    <header className="lab-header">
      {onBack ? <button className="icon-button" onClick={onBack} aria-label="返回上一页">←</button> : <span className="header-rule" />}
      <span className="lab-kicker">FUJIAN LAOJIU · FLAVOR LAB</span>
      <span className="step-code">{step ?? "FJL / 2026"}</span>
    </header>
  );
}

export default function LabApp() {
  const [booting, setBooting] = useState(true);
  const [screen, setScreen] = useState<Screen>("home");
  const [participation, setParticipation] = useState<Participation>("drink");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [creatorInput, setCreatorInput] = useState("");
  const [creatorName, setCreatorName] = useState("今日酿造者");
  const [preferences, setPreferences] = useState<Preferences>({ tastes: [], sweetness: "balanced", restrictions: ["none"] });
  const [seed, setSeed] = useState("fjl-guest");
  const [brewIndex, setBrewIndex] = useState(0);
  const [nameOffset, setNameOffset] = useState(0);
  const [toast, setToast] = useState("");
  const [staffMode, setStaffMode] = useState(false);
  const [glassWobbling, setGlassWobbling] = useState(false);
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);
  const [mounted, setMounted] = useState(false);
  const brewTimers = useRef<number[]>([]);
  const glassWobbleTimer = useRef<number | null>(null);
  const receiptRef = useRef<HTMLElement | null>(null);

  const result = useMemo(() => computeResult({ answers, preferences, seed, alcoholFree: participation === "nonalcoholic" }), [answers, preferences, seed, participation]);
  const displayName = useMemo(() => alternateDrinkName(result, nameOffset), [result, nameOffset]);
  const glassTheme = result.recipe?.glass ?? { color: "#829c96", sparkling: false };
  const glassStyle = {
    "--liquid-color": glassTheme.color,
  } as CSSProperties;

  useEffect(() => {
    let saved: null | Record<string, unknown> = null;
    try {
      saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    if (saved) {
      if (Array.isArray(saved.answers)) setAnswers(saved.answers as string[]);
      if (saved.preferences) setPreferences(saved.preferences as Preferences);
      if (saved.participation === "drink" || saved.participation === "nonalcoholic" || saved.participation === "personality") setParticipation(saved.participation);
      if (typeof saved.seed === "string") setSeed(saved.seed);
      if (typeof saved.creatorName === "string") {
        const restoredName = normalizeCreatorName(saved.creatorName);
        setCreatorName(restoredName);
        setCreatorInput(restoredName === "今日酿造者" ? "" : restoredName);
      }
      if (typeof saved.questionIndex === "number") setQuestionIndex(saved.questionIndex);
      if (["home", "creator", "quiz", "taste", "result", "receipt"].includes(String(saved.screen))) setScreen(saved.screen as Screen);
    } else {
      setSeed(`${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
    }
    setMounted(true);
    const timer = window.setTimeout(() => setBooting(false), 850);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mounted || screen === "age" || screen === "brewing") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ screen, participation, questionIndex, answers, preferences, seed, creatorName }));
  }, [mounted, screen, participation, questionIndex, answers, preferences, seed, creatorName]);

  useEffect(() => {
    if (screen !== "brewing") return;
    setBrewIndex(0);
    brewTimers.current = BREW_STEPS.map((_, index) => window.setTimeout(() => setBrewIndex(index), index * 720));
    brewTimers.current.push(window.setTimeout(() => setScreen("result"), 4600));
    return () => brewTimers.current.forEach(window.clearTimeout);
  }, [screen]);

  useEffect(() => () => {
    if (glassWobbleTimer.current !== null) window.clearTimeout(glassWobbleTimer.current);
  }, []);

  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  function chooseAnswer(id: string) {
    const next = [...answers];
    next[questionIndex] = id;
    setAnswers(next);
    window.setTimeout(() => {
      if (questionIndex === QUESTIONS.length - 1) setScreen("taste");
      else setQuestionIndex((value) => value + 1);
    }, 260);
  }

  function goBackFromQuiz() {
    if (questionIndex === 0) setScreen("creator");
    else setQuestionIndex((value) => value - 1);
  }

  function continueWithCreator(value: string) {
    const normalized = normalizeCreatorName(value);
    setCreatorName(normalized);
    setCreatorInput(normalized === "今日酿造者" ? "" : normalized);
    setQuestionIndex(Math.min(answers.length, QUESTIONS.length - 1));
    setScreen("quiz");
  }

  function toggleRestriction(id: string) {
    setPreferences((current) => {
      if (id === "none") return { ...current, restrictions: ["none"] };
      const withoutNone = current.restrictions.filter((item) => item !== "none");
      return {
        ...current,
        restrictions: withoutNone.includes(id) ? withoutNone.filter((item) => item !== id) : [...withoutNone, id],
      };
    });
  }

  function restart() {
    window.localStorage.removeItem(STORAGE_KEY);
    setScreen("home");
    setAnswers([]);
    setQuestionIndex(0);
    setNameOffset(0);
    setCreatorInput("");
    setCreatorName("今日酿造者");
    setPreferences({ tastes: [], sweetness: "balanced", restrictions: ["none"] });
    setSeed(`${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  }

  function wobbleGlass() {
    if (glassWobbling) return;
    setGlassWobbling(true);
    glassWobbleTimer.current = window.setTimeout(() => {
      setGlassWobbling(false);
      glassWobbleTimer.current = null;
    }, 900);
  }

  async function shareResult(copyOnly = false) {
    const copy = `今日状态：${result.dailyStatus}\n今日酒方：${result.recipe?.name ?? "一种今天的风味"}\nWOPC × 福建老酒 AI 调酒实验室生成`;
    if (!copyOnly && navigator.share) {
      try {
        await navigator.share({ title: "WOPC × 福建老酒 AI 调酒实验室", text: copy, url: window.location.href });
        return;
      } catch {
        return;
      }
    }
    await navigator.clipboard?.writeText(copy);
    flash("分享文案已复制");
  }

  async function downloadReceipt() {
    const receipt = receiptRef.current;
    if (!receipt || downloadingReceipt) return;
    setDownloadingReceipt(true);

    try {
      await document.fonts.ready;
      const image = await toPng(receipt, {
        backgroundColor: "#fbf7ed",
        cacheBust: true,
        pixelRatio: 2,
        width: receipt.offsetWidth,
        height: receipt.scrollHeight,
        style: { margin: "0", transform: "none" },
      });
      const filename = displayName.replace(/[\\/:*?"<>|]/g, "-").slice(0, 40) || "AI酒方";
      const link = document.createElement("a");
      link.download = `${filename}-WOPCX福建老酒.png`;
      link.href = image;
      link.click();
      flash("酒方图片已下载");
    } catch {
      flash("图片生成失败，请稍后再试");
    } finally {
      setDownloadingReceipt(false);
    }
  }

  if (booting) {
    return (
      <main className="lab-shell boot-screen" aria-live="polite">
        <div className="boot-mark"><Seal /></div>
        <p className="lab-kicker">WOPC × 福建老酒</p>
        <div className="flow-line"><span /></div>
        <p className="boot-copy">正在连接今日风味……</p>
      </main>
    );
  }

  return (
    <main className="lab-shell">
      {toast && <div className="toast" role="status">{toast}</div>}

      {screen === "age" && (
        <section className="screen age-screen">
          <LabHeader step="CHECK" onBack={() => setScreen("home")} />
          <div className="screen-body age-body">
            <div className="section-index">00 / BEFORE WE BEGIN</div>
            <Seal />
            <h1>开始之前，<br />先确认一件认真事。</h1>
            <p className="lead-copy">本体验包含酒精饮品。请根据活动所在地法律与现场要求选择。</p>
            <div className="stack-actions">
              <button className="primary-button" onClick={() => { setParticipation("drink"); setScreen("creator"); }}>我已年满十八周岁，符合饮酒年龄，继续体验 <span>→</span></button>
              <button className="secondary-button" onClick={() => { setParticipation("nonalcoholic"); setScreen("creator"); }}>我要喝无酒精</button>
            </div>
          </div>
          <p className="legal-copy">未成年人、孕妇、驾驶人员及不宜饮酒者请勿饮酒。饮酒后请勿驾车。</p>
        </section>
      )}

      {screen === "home" && (
        <section className="screen home-screen">
          <LabHeader />
          <div className="home-title-block">
            <div className="online-line"><span /> 福小酿在线</div>
            <p className="brand-name">WOPC × 福建老酒</p>
            <p className="brand-sub">AI 调酒实验室</p>
            <h1>把今天的你，<br /><em>酿</em>成一杯酒。</h1>
          </div>
          <div className="agent-note">
            <Seal small />
            <div>
              <strong>福小酿 · 首席酿造 Agent</strong>
              <p>回答几个有趣的问题，我来读取今天的你，并签发一张专属酒方。</p>
            </div>
          </div>
          <button className="primary-button home-cta" onClick={() => setScreen("age")}>
            {answers.length ? "继续刚才的酿造" : "开始酿造今天"} <span>→</span>
          </button>
          <div className="home-meta"><span>约 60 秒</span><span>答案只留在当前设备</span></div>
        </section>
      )}

      {screen === "creator" && (
        <section className="screen creator-screen">
          <LabHeader step="CREATOR" onBack={() => setScreen("age")} />
          <div className="creator-body">
            <div className="section-index">01 / CREATED BY</div>
            <Seal />
            <h1>这张酒方，<br />签给谁？</h1>
            <p>输入你的昵称，它会作为酒方制作人印在小票上。</p>
            <label className="creator-field">
              <span>你的昵称</span>
              <input
                value={creatorInput}
                maxLength={12}
                autoComplete="nickname"
                placeholder="例如：今晚不改 Bug"
                onChange={(event) => setCreatorInput(event.target.value)}
              />
              <em>{Array.from(creatorInput).length} / 12</em>
            </label>
          </div>
          <div className="creator-actions">
            <button className="primary-button" onClick={() => continueWithCreator(creatorInput)}>
              {creatorInput.trim() ? "以这个名字开始" : "以今日酿造者开始"} <span>→</span>
            </button>
            <button className="text-button" onClick={() => continueWithCreator("")}>暂不署名</button>
            <p>昵称仅保存在当前设备，不会上传。</p>
          </div>
        </section>
      )}

      {screen === "quiz" && (
        <section className="screen quiz-screen" key={questionIndex}>
          <LabHeader step={`${questionIndex + 1} / ${QUESTIONS.length}`} onBack={goBackFromQuiz} />
          <div className="progress-track"><span style={{ width: `${((questionIndex + 1) / QUESTIONS.length) * 100}%` }} /></div>
          <div className="question-head">
            <div className="agent-inline"><Seal small /><span>福小酿说</span></div>
            {QUESTIONS[questionIndex].lead && <p>{QUESTIONS[questionIndex].lead}</p>}
            <h2>{QUESTIONS[questionIndex].prompt}</h2>
          </div>
          <div className="answer-list" role="radiogroup" aria-label={QUESTIONS[questionIndex].prompt}>
            {QUESTIONS[questionIndex].options.map((option, index) => {
              const selected = answers[questionIndex] === option.id;
              return (
                <button className={`answer-option ${selected ? "is-selected" : ""}`} role="radio" aria-checked={selected} key={option.id} onClick={() => chooseAnswer(option.id)}>
                  <span className="answer-letter">{String.fromCharCode(65 + index)}</span>
                  <span>{option.label}</span>
                  <span className="answer-check">{selected ? "✓" : ""}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {screen === "taste" && (
        <section className="screen taste-screen">
          <LabHeader step="CHECK" onBack={() => { setQuestionIndex(QUESTIONS.length - 1); setScreen("quiz"); }} />
          <div className="question-head compact-head">
            <div className="agent-inline"><Seal small /><span>最后校准</span></div>
            <h2>再确认一件重要的事。</h2>
            <p>口味已经记下了，现在只确认不能喝的。</p>
          </div>
          <div className="taste-section">
            <div className="field-label"><span>饮食限制</span><em>可多选</em></div>
            <div className="restriction-list">
              {RESTRICTIONS.map(([id, label]) => <button key={id} className={preferences.restrictions.includes(id) ? "restriction is-selected" : "restriction"} onClick={() => toggleRestriction(id)}><span>{preferences.restrictions.includes(id) ? "✓" : ""}</span>{label}</button>)}
            </div>
          </div>
          <div className="sticky-action">
            <button className="primary-button" disabled={!preferences.restrictions.length} onClick={() => setScreen("brewing")}>交给福小酿 <span>→</span></button>
            <p>所有限制都会被严格保留。</p>
          </div>
        </section>
      )}

      {screen === "brewing" && (
        <section className="screen brewing-screen">
          <LabHeader step="BREWING" onBack={() => setScreen("taste")} />
          <div className="brew-vessel" aria-hidden="true"><span className="brew-liquid" /><Seal /></div>
          <div className="brew-copy">
            <p>福小酿正在酿造</p>
            <h2>{BREW_STEPS[brewIndex]}</h2>
            <div className="brew-dots"><span /><span /><span /></div>
          </div>
          <ol className="brew-status">
            {BREW_STEPS.map((step, index) => <li key={step} className={index <= brewIndex ? "is-active" : ""}><span>{index < brewIndex ? "✓" : index + 1}</span>{step}</li>)}
          </ol>
        </section>
      )}

      {screen === "result" && (
        <section className="screen result-screen">
          <LabHeader step="SIGNED" onBack={() => setScreen("taste")} />
          <div className="signed-line"><Seal small /><span>福小酿为你签发</span></div>
          <p className="result-label">TODAY&apos;S PRESCRIPTION</p>
          <h1>《{displayName}》</h1>
          <div className="personality-block">
            <span>今日人格</span>
            <strong>{result.personalityTitle}</strong>
          </div>
          {participation !== "personality" && result.recipe ? (
            <div className="recommendation">
              <div><span>推荐酒款</span><strong>{result.recipe.name}</strong></div>
              <p>{result.reason}</p>
            </div>
          ) : (
            <div className="recommendation personality-only">
              <div><span>今日状态</span><strong>{result.dailyStatus}</strong></div>
              <p>{participation === "personality" ? "本次仅展示人格结果，不提供酒精饮品领取引导。" : result.reason}</p>
            </div>
          )}
          <blockquote>“{result.agentNote}”<cite>— 福小酿</cite></blockquote>
          <div className="result-actions">
            <button className="primary-button" onClick={() => setScreen("receipt")}>查看我的 AI 酒方 <span>→</span></button>
            <button className="text-button" onClick={() => setNameOffset((value) => (value + 1) % 3)}>换一句酒名 <span>{(nameOffset % 3) + 1}/3</span></button>
          </div>
        </section>
      )}

      {screen === "receipt" && (
        <section className="screen receipt-screen">
          <LabHeader step="RECEIPT" onBack={() => setScreen("result")} />
          <div className="thermal-printer">
            <div className="printer-mouth" aria-hidden="true" />
            <article ref={receiptRef} className={staffMode ? "receipt staff-receipt" : "receipt"}>
              <div className="receipt-body">
                <div className="receipt-title">
                  <h2 className="receipt-wine-name">《{displayName}》</h2>
                  <p className="receipt-creator"><span>CREATED BY</span><strong>{creatorName}</strong></p>
                </div>
                <button
                  type="button"
                  className={`recipe-glass${glassWobbling ? " is-wobbling" : ""}`}
                  style={glassStyle}
                  onClick={wobbleGlass}
                  aria-label="轻晃这杯酒"
                  title={`${result.recipe?.name ?? "今日风味"}，点击轻晃`}
                >
                  <span className="glass-bowl">
                    <span className="mixed-liquid">
                      <span className="liquid-surface" aria-hidden="true" />
                      {glassTheme.sparkling && (
                        <span className="glass-bubbles" aria-hidden="true"><i /><i /><i /><i /></span>
                      )}
                    </span>
                    <span className="glass-highlight" aria-hidden="true" />
                    <span className="glass-reflection" aria-hidden="true" />
                  </span>
                  <span className="glass-rim" aria-hidden="true" />
                  <span className="glass-stem" aria-hidden="true" />
                  <span className="glass-base" aria-hidden="true" />
                </button>

                <div className="receipt-meta">
                  <div><span>CASHIER</span><strong>福小酿</strong></div>
                  <div><span>PAYMENT</span><strong>{creatorName}</strong></div>
                  <div><span>DATE</span><strong>2026-07-17</strong></div>
                  <div><span>COUNTER</span><strong>NO.{result.receiptNumber.slice(-3)}</strong></div>
                </div>

                <div className="thermal-rule" />
                <div className="receipt-row"><span>MBTI</span><strong>{result.receiptProfile.mbti}</strong></div>
                <div className="receipt-table-head"><span>今日状态 / ITEM</span><strong>SIGNAL</strong></div>
                <div className="metric-list">
                  {result.metrics.map((metric) => (
                    <div className="metric" key={metric.label}>
                      <div><span>{metric.label}</span><strong>{metric.value}%</strong></div>
                      <div className="metric-track"><span style={{ width: `${metric.value}%` }} /></div>
                    </div>
                  ))}
                </div>
                <div className="thermal-rule" />
                <div className="receipt-row receipt-total"><span>TOTAL</span><strong>{result.receiptProfile.total}</strong></div>
                <div className="receipt-row"><span>TYPE</span><strong>{result.receiptProfile.type}</strong></div>
                <div className="receipt-row"><span>RARITY</span><strong>{result.receiptProfile.rarity}</strong></div>

                <p className="receipt-verdict">{result.receiptProfile.verdict}</p>

                {participation !== "personality" && result.recipe && (
                  <div className="receipt-section formula-section">
                    <div className="formula-title"><span>FORMULA</span><strong>{result.recipe.id} / {result.adjustmentCode}</strong></div>
                    <h3>{result.recipe.name}</h3>
                    <dl>{result.recipe.ingredients.map(([ingredient, amount]) => <div key={ingredient}><dt>{ingredient}</dt><dd>{amount}</dd></div>)}</dl>
                    {result.recipe.allergens.length > 0 && <p className="allergen">注意：{result.recipe.allergens.join("、")}</p>}
                  </div>
                )}

                <div className="receipt-section note-section">
                  <span>AI NOTE</span>
                  <p>{result.dailyStatus}</p>
                </div>

                <div className="receipt-barcode" aria-hidden="true">{result.receiptProfile.barcode}</div>
                <div className="receipt-number"><span>{result.receiptNumber}</span><strong>FJL / 2026</strong></div>
                <footer>
                  {participation === "drink" ? "含酒精 · 请理性饮酒" : participation === "nonalcoholic" ? "无酒精 · 请适量饮用" : "仅展示娱乐人格结果"}<br />PERSONALITY RESULT FOR TODAY ONLY
                  <strong className="receipt-producer">WOPC × 福建老酒出品</strong>
                </footer>
              </div>
            </article>
          </div>
          <div className="receipt-actions">
            {participation !== "personality" && result.recipe && <button className="primary-button" onClick={() => setStaffMode((value) => !value)}>{staffMode ? "退出出杯模式" : "给工作人员看"} <span>{staffMode ? "×" : "↗"}</span></button>}
            <div className="share-row"><button disabled={downloadingReceipt} onClick={downloadReceipt}>{downloadingReceipt ? "正在生成图片…" : "下载酒方图片"}</button><button onClick={() => shareResult(false)}>分享这一杯</button><button onClick={() => shareResult(true)}>复制文案</button></div>
            <button className="text-button restart-button" onClick={restart}>再测一次</button>
          </div>
        </section>
      )}
    </main>
  );
}
