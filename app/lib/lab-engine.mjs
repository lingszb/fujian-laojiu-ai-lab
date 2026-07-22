const DIMENSIONS = [
  "energy",
  "social",
  "reflection",
  "adventure",
  "comfort",
  "celebration",
  "romance",
  "playful",
  "ai",
  "action",
];

const ANSWER_WEIGHTS = {
  "state-new": { energy: 14, adventure: 15, playful: 6 },
  "state-offline": { energy: -14, reflection: 8, comfort: 7 },
  "state-hustle": { energy: 18, action: 18, adventure: 12 },
  "state-survive": { energy: -20, comfort: 20, action: -10 },
  "state-unknown": { reflection: 15, playful: 5, comfort: 5 },
  "taste-sour": { adventure: 8, energy: 5 },
  "taste-sweet": { comfort: 10, playful: 10 },
  "taste-bubbles": { energy: 12, social: 8, celebration: 8 },
  "taste-quiet": { reflection: 12, comfort: 12, social: -5 },
  "taste-bold": { energy: 16, adventure: 12 },
  "delete-monday": { comfort: 8, playful: 5 },
  "delete-group": { social: -12, comfort: 8 },
  "delete-boss": { adventure: 8, playful: 10 },
  "delete-todos": { comfort: 10, action: -5 },
  "delete-rumination": { reflection: 12, comfort: 10 },
  "delete-anxiety": { comfort: 15, energy: -5 },
  "delete-bug": { reflection: 8, action: 10, ai: 4 },
  "delete-alarm": { comfort: 15, energy: -8 },
  "delete-ddl": { action: 12, playful: 8, energy: 5 },
  vacation: { comfort: 15 },
  wealth: { adventure: 10, playful: 15 },
  launch: { energy: 10, celebration: 12, action: 8 },
  love: { romance: 20, social: 8 },
  "ai-work": { ai: 20, comfort: 8 },
  "task-start": { action: 22, energy: 8 },
  "task-research": { reflection: 20 },
  "task-delay": { comfort: 12, action: -12, playful: 10 },
  "task-ai": { ai: 24, comfort: 10, playful: 8 },
};

const TASTE_PROFILES = {
  "taste-sour": { taste: "refreshing", sweetness: "less" },
  "taste-sweet": { taste: "fruit", sweetness: "sweet" },
  "taste-bubbles": { taste: "sparkling", sweetness: "balanced" },
  "taste-quiet": { taste: "refreshing", sweetness: "less" },
  "taste-bold": { taste: "fruit", sweetness: "balanced" },
};

const TASTE_TONE_INDEX = {
  "taste-sour": 0,
  "taste-sweet": 1,
  "taste-bubbles": 2,
  "taste-quiet": 3,
  "taste-bold": 4,
};

const STATE_TONE_NAMES = {
  "state-new": [
    "微醺版本已发布",
    "AI建议碰一杯",
    "先喝再开新局",
    "清醒请稍后",
    "甜度超标，理智欠费",
  ],
  "state-offline": [
    "低电量高酒量",
    "思考中，请勿清醒",
    "清醒请排队",
    "续杯才能续命",
    "模型拒绝断片",
  ],
  "state-hustle": [
    "推理已暂停，酒先上线",
    "本人缺席，酒精代班",
    "加班请求已退回",
    "先干一杯再上线",
    "算力已兑换酒力",
  ],
  "state-survive": [
    "为我的懒惰自罚一杯",
    "快乐即将满格",
    "理智今日售罄",
    "先碰杯，后解释",
    "残局交给这一杯",
  ],
  "state-unknown": [
    "请求已进入微醺态",
    "理智接口超时",
    "生成失败，请续杯",
    "本杯无需联网",
    "人格正在缓冲",
  ],
};

const DELETE_JOKE_NAMES = {
  "delete-boss": "老板勿扰特调",
  "delete-todos": "待办暂存酒",
  "delete-anxiety": "焦虑暂存云端",
  "delete-bug": "Bug 泡酒了",
};

const WISH_TASK_NAMES = {
  vacation: {
  },
  wealth: {
    "task-delay": "先喝出个亿",
    "task-ai": "AI 建议先发财",
  },
  launch: {
    "task-start": "开局先碰杯",
    "task-research": "先算一卦再开瓶",
    "task-delay": "启动失败，请续杯",
    "task-ai": "Agent 负责开局",
  },
  love: {
    "task-start": "先开瓶，后开工",
    "task-research": "脑子在加载，酒在出杯",
    "task-delay": "明日复明日，先把杯续",
    "task-ai": "让 AI 干活，我负责干杯",
  },
  "ai-work": {
    "task-start": "AI 已替你开局",
    "task-research": "上下文过长",
    "task-delay": "请重新生成快乐",
    "task-ai": "Token 余额不足",
  },
};

function combineAnswerWeights(...answerIds) {
  const combined = Object.fromEntries(DIMENSIONS.map((key) => [key, 0]));
  for (const answerId of answerIds) {
    const weights = ANSWER_WEIGHTS[answerId] ?? {};
    for (const [key, value] of Object.entries(weights)) combined[key] += value;
  }
  return Object.freeze(combined);
}

const TASTE_IDS_BY_TONE = Object.entries(TASTE_TONE_INDEX)
  .sort(([, left], [, right]) => left - right)
  .map(([tasteId]) => tasteId);

const DRINK_NAME_CATALOG = Object.freeze([
  ...Object.entries(STATE_TONE_NAMES).flatMap(([stateId, names]) =>
    names.map((name, index) => Object.freeze({
      name,
      weights: combineAnswerWeights(stateId, TASTE_IDS_BY_TONE[index]),
    })),
  ),
  ...Object.entries(DELETE_JOKE_NAMES).map(([deleteId, name]) => Object.freeze({
    name,
    weights: combineAnswerWeights(deleteId),
  })),
  ...Object.entries(WISH_TASK_NAMES).flatMap(([wishId, taskNames]) =>
    Object.entries(taskNames).map(([taskId, name]) => Object.freeze({
      name,
      weights: combineAnswerWeights(wishId, taskId),
    })),
  ),
]);

const RECIPES = [
  {
    id: "R01",
    name: "绝对日落",
    note: "橙汁、葡萄汽水与黄酒的明亮组合",
    personalities: { comfort: 1, social: 0.25, playful: 0.35 },
    tastes: { fruit: 1, lactic: 1, sweet: 0.8, refreshing: 0.35 },
    blockedBy: ["dairy"],
    allergens: ["可能含乳制品"],
    ingredients: [
      ["黄酒", "22%"],
      ["橙汁", "34%"],
      ["元气森林葡萄汽水", "44%"],
      ["冰块", "适量"],
    ],
    glass: { color: "#c589b5", sparkling: false },
    method: "古典杯加满冰，倒入黄酒和橙汁搅匀，补满葡萄汽水，轻轻提拉。",
    names: ["为我的懒惰自罚一杯", "脑子加载中，杯子先开机", "允许自己慢半拍"],
  },
  {
    id: "R02",
    name: "冰茶黄酒",
    note: "乌龙茶、水溶C与黄酒的清爽回味",
    personalities: { romance: 1, celebration: 0.85, social: 0.45 },
    tastes: { fruit: 1, sparkling: 0.78, sweet: 0.55, refreshing: 0.72 },
    blockedBy: ["sparkling", "citrus"],
    allergens: [],
    ingredients: [
      ["黄酒", "17%"],
      ["乌龙茶", "66%"],
      ["水溶C", "17%"],
      ["冰块", "适量"],
    ],
    glass: { color: "#f29a75", sparkling: true },
    method: "杯里加冰，先放黄酒，再加乌龙茶，最后沿杯壁倒入水溶C形成渐变，饮用前搅匀。",
    names: ["愿望很远，晚霞很近", "落日懂我，晚风也懂", "今晚允许故事有续集"],
  },
  {
    id: "R03",
    name: "一蓑烟雨",
    note: "雪碧、蓝色芬达与黄酒的蓝色气泡特调",
    personalities: { reflection: 1.45, adventure: 0.2, comfort: 0.3 },
    tastes: { fruit: 0.7, sparkling: 1, sweet: 0.65, refreshing: 0.82 },
    blockedBy: ["sparkling", "citrus"],
    allergens: [],
    ingredients: [
      ["雪碧", "38%"],
      ["蓝色芬达", "38%"],
      ["黄酒", "24%"],
      ["冰块", "适量"],
    ],
    glass: { color: "#4f9fd8", sparkling: true },
    method: "杯中加满冰，依次倒入黄酒、蓝色芬达与雪碧，轻轻提拉一次。",
    names: ["别催，灵感正在回温", "答案晚一点也算答案", "把没说完的留给回味"],
  },
  {
    id: "R04",
    name: "葡萄星球",
    note: "果香、气泡与明亮节奏",
    personalities: { social: 1, energy: 0.85, action: 0.65, celebration: 0.5 },
    tastes: { fruit: 0.8, sparkling: 1, sweet: 0.62, refreshing: 0.8 },
    blockedBy: ["sparkling", "dairy"],
    allergens: ["可能含乳制品"],
    ingredients: [
      ["黄酒", "17%"],
      ["葡萄汁", "33%"],
      ["乳酸菌", "50%"],
      ["冰块", "适量"],
    ],
    glass: { color: "#d995bc", sparkling: true },
    method: "将黄酒和葡萄汁加冰搅匀，缓慢倒入乳酸菌形成分层，或搅匀饮用。",
    names: ["产品会爆，杯子别空", "快乐正在请求加入群聊", "这一杯替我打开话题"],
  },
  {
    id: "R05",
    name: "碳酸超载",
    note: "橙香、乳酸与轻盈酸甜",
    personalities: { comfort: 1, playful: 0.7, ai: 0.35 },
    tastes: { fruit: 0.65, lactic: 1, sweet: 0.62, refreshing: 0.42 },
    blockedBy: ["dairy", "citrus"],
    allergens: ["可能含乳制品"],
    ingredients: [
      ["葡萄汁", "14%"],
      ["芬达（橙味）", "29%"],
      ["雪碧（柠檬味）", "43%"],
      ["黄酒", "14%"],
      ["冰块", "适量"],
    ],
    glass: { color: "#f2bd83", sparkling: false },
    method: "杯里加满冰，先放黄酒和葡萄汁，再倒入芬达和雪碧，用吧勺从底部提拉一次。",
    names: ["算力归你，松弛归我", "今天先不卷，酒会替我圆", "暂停营业，快乐续杯"],
  },
  {
    id: "R06",
    name: "快乐算法",
    note: "养乐多、橙汁与黄酒的快乐摇匀",
    personalities: { playful: 1, comfort: 0.75, social: 0.35 },
    tastes: { fruit: 0.85, lactic: 1, sweet: 0.72, refreshing: 0.5 },
    blockedBy: ["dairy", "citrus"],
    allergens: ["可能含乳制品"],
    ingredients: [
      ["养乐多", "37%"],
      ["橙汁", "37%"],
      ["黄酒", "26%"],
      ["冰块", "加满"],
    ],
    method: "摇壶加冰，将所有材料充分摇匀约15秒，过滤倒入加满新冰的杯中。",
    glass: { color: "#f2bd83", sparkling: false },
    names: ["本杯无需联网", "生成失败，请续杯", "请求已进入微醺态"],
  },
];

function hash(value) {
  let number = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    number ^= value.charCodeAt(index);
    number = Math.imul(number, 16777619);
  }
  return number >>> 0;
}

export function normalizeCreatorName(value) {
  const cleaned = String(value ?? "")
    .replace(/[\u0000-\u001f\u007f<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return Array.from(cleaned).slice(0, 12).join("") || "今日酿造者";
}

function clamp(value) {
  return Math.max(32, Math.min(99, Math.round(value)));
}

function buildDimensions(answers) {
  const values = Object.fromEntries(DIMENSIONS.map((key) => [key, 50]));
  for (const answer of answers) {
    const weights = ANSWER_WEIGHTS[answer] ?? {};
    for (const [key, value] of Object.entries(weights)) values[key] += value;
  }
  for (const key of DIMENSIONS) values[key] = clamp(values[key]);
  return values;
}

function preferencesFromAnswers(answers, preferences) {
  const profile = TASTE_PROFILES[answers[1]];
  if (!profile) return preferences;
  return {
    ...preferences,
    tastes: [profile.taste],
    sweetness: profile.sweetness,
  };
}

function adjustedIngredients(recipe, preferences) {
  const base = recipe.ingredients.filter(([, amount]) => amount.endsWith("%"));
  if (base.length === 0) return recipe.ingredients;
  const ice = recipe.ingredients.find(([ingredient]) => ingredient === "冰块") ?? ["冰块", "适量"];
  const target = {
    sweet: (ingredient) => /汁|养乐多|汽水|芬达|雪碧/.test(ingredient),
    refreshing: (ingredient) => /柠檬|橙汁|汁|茶/.test(ingredient),
    sparkling: (ingredient) => /汽水|芬达|雪碧/.test(ingredient),
    tea: (ingredient) => /茶/.test(ingredient),
    fruit: (ingredient) => /汁|养乐多|汽水|芬达|雪碧/.test(ingredient),
  }[preferences.tastes[0]];
  const values = base.map(([ingredient, amount]) => ({ ingredient, value: Number.parseInt(amount, 10) }));
  const targetIndex = target ? values.findIndex(({ ingredient }) => target(ingredient)) : -1;
  if (targetIndex >= 0 && values.length > 1) {
    const donorIndex = values.map((item, index) => ({ ...item, index }))
      .filter(({ index }) => index !== targetIndex)
      .sort((a, b) => b.value - a.value)[0].index;
    const shift = Math.min(8, Math.max(0, values[donorIndex].value - 5));
    values[targetIndex].value += shift;
    values[donorIndex].value -= shift;
  }
  return [...values.map(({ ingredient, value }) => [ingredient, `${value}%`]), ice];
}

function scoreDrinkName(entry, dimensions, combinationKey, seed) {
  let dotProduct = 0;
  let answerMagnitude = 0;
  let nameMagnitude = 0;
  for (const key of DIMENSIONS) {
    const answerValue = dimensions[key] - 50;
    const nameValue = entry.weights[key];
    dotProduct += answerValue * nameValue;
    answerMagnitude += answerValue ** 2;
    nameMagnitude += nameValue ** 2;
  }

  const semanticMatch = dotProduct / Math.sqrt(Math.max(1, answerMagnitude * nameMagnitude));
  const combinationMatch = hash(`${combinationKey}:${entry.name}`) / 0xffffffff;
  const stableTieBreaker = hash(`${seed}:${entry.name}`) / 0xffffffff;
  return semanticMatch * 100 + combinationMatch * 12 + stableTieBreaker * 0.001;
}

function buildDrinkNames(answers, dimensions, seed) {
  const combinationKey = answers.join("|");
  return DRINK_NAME_CATALOG
    .map((entry) => ({
      name: entry.name,
      score: scoreDrinkName(entry, dimensions, combinationKey, seed),
    }))
    .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name, "zh-CN"))
    .slice(0, 3)
    .map(({ name }) => name);
}

function scoreRecipe(recipe, dimensions, preferences) {
  let score = 0;
  for (const [key, weight] of Object.entries(recipe.personalities)) {
    score += (dimensions[key] - 50) * weight;
  }
  for (const taste of preferences.tastes) {
    score += (recipe.tastes[taste] ?? 0) * 75;
  }
  if (preferences.sweetness === "less") score += (1 - recipe.tastes.sweet) * 25;
  if (preferences.sweetness === "sweet") score += recipe.tastes.sweet * 25;
  return score;
}

function personalityTitle(dimensions) {
  if (dimensions.social >= 75 && dimensions.celebration >= 65) return "气氛稳定输出者";
  if (dimensions.reflection >= 75 && dimensions.adventure >= 50) return "安静但敢想的探索者";
  if (dimensions.ai >= 70 && dimensions.comfort >= 60) return "把工作交给 AI 的松弛派";
  if (dimensions.romance >= 65) return "给今天留镜头的人";
  if (dimensions.comfort >= 70) return "温柔摆烂型行动派";
  return "认真生活的即兴派";
}

function dailyStatus(dimensions) {
  if (dimensions.social >= 75 && dimensions.celebration >= 65) return "话题未定，酒局已开。";
  if (dimensions.ai >= 70 && dimensions.comfort >= 60) return "算力在线，行动稍后。";
  if (dimensions.energy <= 35 && dimensions.comfort >= 70) return "电量告急，快乐续航。";
  if (dimensions.reflection >= 75 && dimensions.adventure >= 50) return "答案不明，酒方明确。";
  if (dimensions.action >= 70 && dimensions.energy >= 65) return "开局很快，清醒很慢。";
  if (dimensions.romance >= 65) return "心事未读，酒意先到。";
  if (dimensions.comfort >= 70) return "今日宜松弛，忌过度努力。";
  return "状态已读，酒方生成。";
}

function metricSet(dimensions) {
  const spirit = clamp(50 + (dimensions.energy - 50) * 0.55 - (dimensions.comfort - 50) * 0.2);
  const social = clamp(50 + (dimensions.social - 50) * 0.65);
  const groupThree = [
    ["冒险指数", clamp(50 + (dimensions.adventure - 50) * 0.6 + (dimensions.action - 50) * 0.15)],
    ["灵感发酵度", clamp(50 + (dimensions.reflection - 50) * 0.72)],
    ["摆烂合法度", clamp(50 + (dimensions.comfort - 50) * 0.65 - (dimensions.action - 50) * 0.18)],
  ].sort((a, b) => Math.abs(b[1] - 50) - Math.abs(a[1] - 50));
  const groupFour = [
    ["续命需求", clamp(50 + (dimensions.comfort - 50) * 0.55 - (dimensions.energy - 50) * 0.35)],
    ["AI 依赖度", clamp(50 + (dimensions.ai - 50) * 0.75)],
    ["庆祝必要度", clamp(50 + (dimensions.celebration - 50) * 0.72)],
  ].sort((a, b) => Math.abs(b[1] - 50) - Math.abs(a[1] - 50));
  return [
    { label: "精神浓度", value: spirit },
    { label: "社交指数", value: social },
    { label: groupThree[0][0], value: groupThree[0][1] },
    { label: groupFour[0][0], value: groupFour[0][1] },
  ];
}

const RECEIPT_TYPES = {
  "机器人": { rarity: "6.0%", glyph: " [o_o]\n/|___|\\\n  |_|" },
  "猫头鹰": { rarity: "2.8%", glyph: " ,___,\n (o o)\n /|_|\\\n  / \\" },
  "鸭": { rarity: "12.0%", glyph: "  __\n<(o )\n (  >\n  ^^" },
  "白猫": { rarity: "8.0%", glyph: " /\\_/\\\n( o.o )\n > ^ <" },
  "狐狸": { rarity: "6.5%", glyph: " /\\_/\\\n( o_o )\n /   \\\n  \\_/" },
  "云团": { rarity: "14.0%", glyph: " .--.\n( .. )\n '--'\n  .." },
};

function receiptType(dimensions) {
  if (dimensions.ai >= 70) return "机器人";
  if (dimensions.reflection >= 75) return "猫头鹰";
  if (dimensions.social >= 75) return "鸭";
  if (dimensions.romance >= 65) return "白猫";
  if (dimensions.adventure >= 70) return "狐狸";
  return "云团";
}

function receiptTotal(dimensions) {
  if (dimensions.social >= 75 && dimensions.celebration >= 65) return "边开局边发光";
  if (dimensions.reflection >= 75 && dimensions.adventure >= 50) return "安静里开新路";
  if (dimensions.ai >= 70 && dimensions.comfort >= 60) return "让算力替我松弛";
  if (dimensions.romance >= 65) return "把愿望留给晚风";
  if (dimensions.comfort >= 70) return "柔软但会开工";
  return "认真即兴生活";
}

function receiptVerdict(dimensions) {
  const fastDecision = dimensions.action >= dimensions.reflection;
  const softLanding = dimensions.comfort >= 60;
  if (fastDecision && softLanding) return "FAST START. SOFT LAND.";
  if (fastDecision) return "FAST START. BRIGHT SPARK.";
  if (softLanding) return "QUIET PLAN. SOFT EXIT.";
  return "QUIET PLAN. LIVE WIRES.";
}

function buildReceiptProfile(dimensions, stableHash) {
  const type = receiptType(dimensions);
  const prototype = RECEIPT_TYPES[type];
  const barcode = Array.from({ length: 16 }, (_, index) => ((stableHash >>> (index % 24)) & 1 ? "||" : "|")).join(" ");
  return {
    mbti: "N/A",
    total: receiptTotal(dimensions),
    type,
    rarity: prototype.rarity,
    typeGlyph: prototype.glyph,
    verdict: receiptVerdict(dimensions),
    barcode,
  };
}

function reasonFor(recipe, preferences) {
  const tasteText = preferences.tastes.includes("tea")
    ? "茶香"
    : preferences.tastes.includes("sparkling")
      ? "气泡与果香"
      : preferences.tastes.includes("lactic")
        ? "乳酸与柔和果香"
        : preferences.tastes.includes("refreshing")
          ? "清爽回味"
          : "果香";
  const reasons = {
    R01: `你今天更需要放慢节奏，${tasteText}会把黄酒的温度放得更柔和。`,
    R02: `你给今天留了一个值得拍下来的画面，${tasteText}正好接住这份明亮。`,
    R03: `你习惯先想清楚，也愿意给灵感一点时间。${tasteText}更贴近今天的安静节奏。`,
    R04: `你选择了主动开局，也偏爱${tasteText}。今天适合让杯子先把话题打开。`,
    R05: `你今天不必用力进入状态，${tasteText}会让这一杯轻松出现。`,
    R06: `你今天更适合轻松一点，${tasteText}会把快乐摇得更均匀。`,
  };
  return reasons[recipe.id];
}

function noteFor(recipe) {
  return {
    R01: "今天不用和昨天比较，先让快乐回一点血。",
    R02: "愿望可以很远，今晚的画面先到。",
    R03: "答案不一定立刻出现，回味也算进度。",
    R04: "先庆祝愿意开始，结果可以晚一点到。",
    R05: "不用一直在线，偶尔加载也很正常。",
    R06: "把复杂留给算法，把快乐留在杯里。",
  }[recipe.id];
}

function adjustmentFor(recipe, preferences) {
  if (recipe.id === "R01") return preferences.sweetness === "sweet" ? "GRAPE_PLUS" : "STANDARD";
  if (recipe.id === "R02") return "BRIGHT";
  if (recipe.id === "R03") return "TEA";
  if (recipe.id === "R04") return preferences.tastes.includes("sparkling") ? "SPARKLING" : "STANDARD";
  return "SOFT";
}

export function computeResult({ answers, preferences, seed, alcoholFree = false }) {
  const dimensions = buildDimensions(answers);
  const effectivePreferences = preferencesFromAnswers(answers, preferences);
  const drinkNames = buildDrinkNames(answers, dimensions, seed);
  const available = RECIPES.filter(
    (recipe) => !recipe.blockedBy.some((restriction) => effectivePreferences.restrictions.includes(restriction)),
  );
  const stableHash = hash(`${seed}:${answers.join("|")}:${JSON.stringify(preferences)}`);
  const receiptNumber = `FJL-2026-${String(100 + (stableHash % 900)).padStart(3, "0")}`;
  const base = {
    personalityTitle: personalityTitle(dimensions),
    dailyStatus: dailyStatus(dimensions),
    metrics: metricSet(dimensions),
    receiptNumber,
    dimensions,
    receiptProfile: buildReceiptProfile(dimensions, stableHash),
    drinkNames,
  };

  if (available.length === 0) {
    return {
      ...base,
      recipe: null,
      adjustmentCode: null,
      drinkName: "今天的限制，值得被认真对待",
      drinkNames: ["今天的限制，值得被认真对待"],
      reason: "你的饮食限制很重要，今天不勉强匹配。可以向现场工作人员咨询。",
      agentNote: "不合适的就不勉强，这也是一种懂自己。",
    };
  }

  const recipe = available
    .map((item, priority) => ({ item, priority, score: scoreRecipe(item, dimensions, effectivePreferences) }))
    .sort((a, b) => b.score - a.score || a.priority - b.priority)[0].item;
  const drinkName = drinkNames[stableHash % drinkNames.length];
  const finalRecipe = alcoholFree
    ? {
        ...recipe,
        name: {
          R01: "绝对日落 0.0",
          R02: "冰茶清醒版",
          R03: "一蓑烟雨 0.0",
          R04: "葡萄星球 0.0",
          R05: "碳酸超载 0.0",
          R06: "快乐算法 0.0",
        }[recipe.id],
        ingredients: (() => {
          const liquids = recipe.ingredients
            .filter(([ingredient, amount]) => ingredient !== "冰块" && amount.endsWith("%"))
            .map(([ingredient, amount]) => [ingredient, Number.parseInt(amount, 10)]);
          const alcohol = liquids.filter(([ingredient]) => /福建老酒|黄酒/.test(ingredient)).reduce((sum, [, amount]) => sum + amount, 0);
          const nonAlcohol = liquids.filter(([ingredient]) => !/福建老酒|黄酒/.test(ingredient));
          const target = nonAlcohol.reduce((best, item, index) => item[1] > best.value ? { index, value: item[1] } : best, { index: 0, value: -1 }).index;
          if (nonAlcohol.length > 0) nonAlcohol[target][1] += alcohol;
          return [...nonAlcohol.map(([ingredient, amount]) => [ingredient, `${amount}%`]), recipe.ingredients.find(([ingredient]) => ingredient === "冰块") ?? ["冰块", "适量"]];
        })(),
      }
    : recipe;
  return {
    ...base,
    recipe: { ...finalRecipe, ingredients: adjustedIngredients(finalRecipe, effectivePreferences) },
    adjustmentCode: adjustmentFor(recipe, effectivePreferences),
    drinkName,
    reason: reasonFor(recipe, effectivePreferences),
    agentNote: noteFor(recipe),
  };
}

export function alternateDrinkName(result, offset) {
  const names = result.drinkNames?.length ? result.drinkNames : [result.drinkName];
  const current = Math.max(0, names.indexOf(result.drinkName));
  return names[(current + offset) % names.length];
}
