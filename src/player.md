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
```

```js
// Feel free to add more!
const twitchStreamers = {
 "BrenTM": "bren_tm2",
 "WirtualTM": "wirtual",
 "Scrapie98": "scrapie",
 "Larstm": "lars_tm",
 "Spammiej": "spammiej",
 "simo_900": "simo_900",
 "eLconn21": "elconn21"
}
const ytStreamers = {
  "WirtualTM": "WirtualTV"
}
```

```js
if(name) display(html`<div class="hero"><h1>${name}</h1></div>`);
```

```js
const gcsBucket = 'https://storage.googleapis.com/deepdip2_player_data';
let biggestFall = NaN;
let records, dates;
if (name) {
const req = await fetch(`${gcsBucket}/${name}.json`);
records = await req.json();

dates = Object.keys(records.data).sort((a, b) => Date.parse(a) - Date.parse(b));

// Calculate biggest height fall.
const falls = dates.map(s => {
  const data = records.data[s];
  const max = data.reduce((acc, s) => Math.max(acc, s.height), 0);
  const min = data.reduce((acc, s) => Math.min(acc, s.height), Infinity);
  return max - min;
});
biggestFall = Math.max(...falls);
}
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

```js
if(name) {
display(html`
<div class="grid grid-cols-2">
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
 </div>`)
 }
```

```js
if (twitchStreamers[name]) display(html`
 <div class="card">
    <span>
    <img height=20 src=https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Twitch_Glitch_Logo_Purple.svg/512px-Twitch_Glitch_Logo_Purple.svg.png />
    </span>
    <a href=https://twitch.tv/${twitchStreamers[name]} class="big" style="margin-left:5px;">
        ${twitchStreamers[name]}
    </a>
  </div>
  `)
```

```js
if (ytStreamers[name]) display(html`
 <div class="card">
    <span>
    <img height=20 src=https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg />
    </span>
    <a href=https://youtube.com/${ytStreamers[name]} class="big" style="margin-left:5px;">
        ${ytStreamers[name]}
    </a>
  </div>
    `)
```

```js
if(name) {
display(html`
<div style="padding-top: 2em;">
<h2>Daily heights</h2>
${dates.map(s => {
const data = records.data[s].sort((a, b) => a.ts - b.ts);
return html`<h3 style="margin-top:1em">${new Date(Date.parse(s)).toLocaleDateString()}</h3> ${Plot.plot({
  y: {grid: true},
  width: width,
  marks: [
    Plot.lineY(data.map(s => {
        s.timestamp = new Date(s.ts * 1000)
        return s;
    }),{x: "timestamp", y: (d, c) => {
    const prev = data[c - 1];
    return prev && d.ts - prev.ts < 1000 ? d.height : null;
    }, tip: true}),
  ]
})}`
})}
</div>
`);
}
```

```js
let textGen, text;
if (!name) {
  const req = await fetch(`${gcsBucket}/.players.json`);

  const players = await req.json();

  text = Inputs.search(players, {
      placeholder: "Search for a player",
  });
  display(text)


  textGen = Generators.input(text);
}
```

```js
if (textGen) display(Inputs.bind(html`<div class="grid grid-cols-3">${
    textGen?.map((s) =>
      html`<div class="card"><a href=/player?q=${s}><p>${s}</p></a></div>`
    )
  }</div>`, text))
```

