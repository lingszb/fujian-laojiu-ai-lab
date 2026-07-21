# Analytics Funnel, Global Likes, and 一蓑烟雨 Recipe Design

## Goal

Record the core quiz funnel in Plausible, add a global “为福小酿点赞” interaction to the receipt actions, and update the 一蓑烟雨 recipe to the new blue sparkling formula.

## Analytics

The client exposes one small `trackPlausible` helper and sends these interactive custom events without nicknames or other personal text:

- `Start Quiz`: once per test run when the user enters the first quiz question.
- `Answer Question`: once for each answer selection, with `question` and `answer` properties.
- `Generate Recipe`: once per test run when brewing finishes and the result is produced.
- `Like Fuxiaoniang`: after the global like API accepts a new like.

Per-run guards prevent timers, rerenders, or back-navigation from duplicating funnel events. A restart clears the guards for the next run.

## Global Like Counter

Use a Cloudflare D1 binding and a same-origin API route:

- `GET /api/likes` returns the current global total.
- `POST /api/likes` atomically increments the total and returns the new value.
- The browser stores a local liked flag so the same browser cannot increment repeatedly through the UI.
- The receipt page fetches the total when opened.
- The button sits between “给工作人员看” and the download/share row.
- Before liking it shows an outline heart and the current total; after success it shows a filled heart and “已为福小酿点赞”.
- If the API is unavailable, the existing UI continues to work and a short toast explains that the like was not recorded.

The public counter is intentionally lightweight. Browser storage discourages accidental repeat likes but is not an anti-abuse security boundary.

## 一蓑烟雨 Recipe

Keep the name `一蓑烟雨` and replace its liquid formula with the normalized `5:5:3` ratio:

- 雪碧：38%
- 蓝色芬达：38%
- 黄酒：24%
- 冰块：适量

Update its description, taste profile, restrictions, preparation copy, and glass presentation to a blue sparkling drink. The alcohol-free transformation continues to remove 黄酒 and redistribute its percentage to the largest non-alcoholic ingredient, producing a 62% / 38% non-alcoholic formula.

## Verification

- Unit-test Plausible event guards and like state behavior where possible.
- Verify the D1 API returns and increments an integer total.
- Verify the 一蓑烟雨 percentages total 100% and retain ice.
- Run the engine tests, full build/render tests, lint or type checks available in the project, and `git diff --check`.

## Delivery

Commit the implementation and push `main` to `origin` after all verification passes, as explicitly requested.
