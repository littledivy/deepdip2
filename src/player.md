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

.hero img {
  max-width: calc(100vw - 108px);
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

```js
const query = window.location.search;
const params = new URLSearchParams(query);

const name = params.get('q');
if (!name) {
  throw new Error('No name provided.');
}
```

<div class="hero">
  <h1>${name}</h1>
</div>

```js
const req = await fetch(`https://storage.googleapis.com/deepdip2_player_data/${name}.json`);
const records = await req.json();

const dates = Object.keys(records.data).sort((a, b) => Date.parse(a) - Date.parse(b));

// Calculate biggest height fall.
const falls = dates.map(s => {
  const data = records.data[s];
  const max = data.reduce((acc, s) => Math.max(acc, s.height), 0);
  const min = data.reduce((acc, s) => Math.min(acc, s.height), Infinity);
  return max - min;
});
const biggestFall = Math.max(...falls);
```

```js
const deepdip2 = "https://deepdip2.deno.dev"
const req = await fetch(`${deepdip2}/leaderboard`);

const leaderboard = await req.json();

const floorHeights = {
    0: 4.0,
    1: 104.0, // 01
    2: 208.0, // 02
    3: 312.0, // 03
    4: 416.0, // 04
    5: 520.0, // 05
    6: 624.0, // 06
    7: 728.0, // 07
    8: 832.0, // 08
    9: 936.0, // 09
    10: 1040.0, // 10
    11: 1144.0, // 11
    12: 1264.0, // 12
    13: 1376.0, // 13
    14: 1480.0, // 14
    15: 1584.0, // 15
    16: 1688.0, // 16
    17: 1910.0  // 17 fin
};
  
  
const heightToFloor = (height) => {
    for (let floor = Object.keys(floorHeights).length - 1; floor >= 0; floor--) {
        if (height >= floorHeights[floor]) {
        return floor;
        }
    }
    return -1;
}

const player = leaderboard.latest.find(s => s.name === name);
```

<div class="grid grid-cols-4">
 <div class="card">
    <h2>Rank</h2>
    <div class="flex">
    <span class="big">
      ${player.rank}
    </span>
    </div>
  </div>

  <div class="card">
    <h2>PB</h2>
    <div class="flex">
    <span class="big">
        ${Math.floor(player.height)}
    </span>
    </div>
  </div>
  <div class="card">
    <h2>PB floor</h2>
    <div class="flex">
    <span class="big">
        ${heightToFloor(player.height)}
    </span>
    </div>
  </div>
  <div class="card">
    <h2>Biggest fall</h2>
    <div class="flex">
    <span class="big">
        ${Math.floor(biggestFall)}
    </span>
    </div>
  </div>
</div>

<div style="padding-top: 2em;">

<h2>Daily heights</h2>

```js
html`${dates.map(s => {
console.log(s)
const data  = records.data[s].sort((a, b) => a.ts - b.ts);
return html`<h3 style="margin-top:1em">${new Date(Date.parse(s)).toLocaleDateString()}</h3> ${Plot.plot({
  y: {grid: true},
  width: width,
  marks: [
    Plot.lineY(data.map(s => {
        s.timestamp = new Date(s.ts * 1000)
        return s;
    }),{x: "timestamp", y: (d, c) => {
    const prev = data[c - 1];
    // If a long time has passed, more than 10 minutes, we don't want to draw a line
    return prev && d.ts - prev.ts < 1000 ? d.height : null;
    }, tip: true}),
  ]
})}`
})}`
```

</div>

