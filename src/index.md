---
toc: false
sidebar: false
footer: false
---

<style>

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: var(--sans-serif);
  margin: 4rem 0 4rem;
  text-wrap: balance;
  text-align: center;
}

.hero h1 {
  max-width: none;
  font-size: 14vw;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(30deg, var(--theme-foreground-focus), currentColor);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero h2 {
  margin: 0;
  max-width: 34em;
  font-size: 20px;
  font-style: initial;
  font-weight: 500;
  line-height: 1.5;
  color: var(--theme-foreground-muted);
}

@media (min-width: 640px) {
  .hero h1 {
    font-size: 90px;
  }
}

</style>

<div class="hero">
    <img src="./dd2.svg" style="height: 200px" />
</div>

```js
const deepdip2 = "https://deepdip2.deno.dev"
const req = await fetch(`${deepdip2}/leaderboard`);
const { latest: globalLeaderboards, prev } = await req.json();

const rank = (r) => {
   return globalLeaderboards.find(e => e.rank == r) || globalLeaderboards[r]
};

const rankPrev = (r) => {
   return globalLeaderboards.find(e => e.rank == r) || globalLeaderboards[r]
};

const wr = rank(1);
const oldWr = rankPrev(1);
```

```js
const req = await fetch(`${deepdip2}/stats`)
const globalStats = await req.json();

function sparkbar(max) {
  return (x) => htl.html`<div style="
    background: var(--theme-green);
    color: black;
    font: 10px/1.6 var(--sans-serif);
    width: ${100 * x / max}%;
    padding-right: 3px;
    box-sizing: border-box;
    overflow: visible;
    display: flex;
    justify-content: end;">${x.toLocaleString("en-US")}`
}
```

```js
const req = await fetch(`${deepdip2}/bounty`);
const priceStats = await req.json();
```

```js
// Feel free to add more!
const streamers = {
 "BrenTM": "bren_tm2",
 "WirtualTM": "wirtual",
 "Scrapie98": "scrapie",
 "LarsTM": "lars_tm",
 "Spammiej": "spammiej",
 "simo_900": "simo_900"
}
```
<div class="grid grid-cols-4">
  <div class="card">
    <h2>WR height</h2>
    <div class="flex">
    <span class="big">
        ${Math.floor(wr.height)}
    </span>
    <span style="color: green">
        ${
          wr.height - oldWr.height ? `▲ ${wr.height - oldWr.height}` : ""
        }
    </span>
    </div>
  </div>
  <div class="card">
    <h2>Top player</h2>
    <span class="big">
        ${streamers[wr.name] ? html`<a href=https://twitch.tv/${streamers[wr.name]}>${wr.name}</a>` : wr.name}
    </span>
    <span style="color: red">
        ${
          wr.name !== oldWr.name ? `▼ ${oldWr.name}` : ""
        }
    </span>
  </div>
  <div class="card">
    <h2>2nd place</h2>
    <span class="big">
        ${streamers[rank(2).name] ? html`<a href=https://twitch.tv/${streamers[rank(2).name]}>${rank(2).name}</a>` : rank(2).name}
    </span>
    <span style="color: red">
        ${
          (rankPrev(2).name != wr.name && rank(2).name !== rankPrev(2).name) ? `▼ ${rankPrev(2).name}`: ""
        }
    </span>
  </div>
    <div class="card">
    <h2>3rd place</h2>
    <span class="big">
        ${streamers[rank(3).name] ? html`<a href=https://twitch.tv/${streamers[rank(3).name]}>${rank(2).name}</a>` : rank(3).name}
    </span>
    <span style="color: red">
        ${
          ((rankPrev(3).name != wr.name || rankPrev(3).name != rankPrev(2).name) && rank(3).name !== rankPrev(3).name) ? `▼ ${rankPrev(3).name}`: ""
        }
    </span>

  </div> 

  <div class="card">
    <h2>Total falls</h2>
    <span class="big">
        ${globalStats.falls}
    </span>
  </div> 
  <div class="card">
    <h2>Total floors fallen</h2>
    <span class="big">
        ${globalStats.floors_fallen}
    </span>
  </div>
  <div class="card">
    <h2>Total players</h2>
    <span class="big">
        ${globalStats.players}
    </span>
  </div>
  <div class="card">
    <h2>Prize pool</h2>
    <span class="big">
        $${priceStats.body.amount}
    </span>
  </div>
</div>

<div style="padding-top: 2em;">

<h2>Live leaderboard</h2>

```js
Inputs.table(globalLeaderboards, {
  columns: [
    "name",
    "height",
  ],
  format: {
    height: sparkbar(2000),
  },
  rows: 100,
  maxHeight: "100%"
})
```

</div>

<div style="padding-top: 2em;">

<h2>Records over time</h2>
<p>May lack data before 5 May 2024</p>

```js
const req = await fetch(`${deepdip2}/world_records`);
const records = await req.json();
```

```js
Plot.dot(records
.reverse()
.map(r => {
    r.timestamp = new Date(r.timestamp)
    r.title = `Rank ${r.rank}`
    return r;
}), {y: "height", x: "timestamp", z:"rank", fill: "rank", tip: true}).plot({
    grid: true,
  color: {
    scheme: "Observable10"
  },
  width: 1000,
  height: 500
})
```

</div>

---

View source on Github: https://github.com/littledivy/deepdip2
