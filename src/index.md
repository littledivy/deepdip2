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

<div class="hero">
    <img src="./dd2.svg" style="height: 200px" />
</div>

```js
const deepdip2 = "https://deepdip2.deno.dev";
const req = await fetch(`${deepdip2}/leaderboard`);
const { latest: globalLeaderboards, prev = [] } = await req.json();

const rank = (r) => {
  return globalLeaderboards.find((e) => e.rank == r) || globalLeaderboards[r];
};

const rankPrev = (r) => {
  return globalLeaderboards.find((e) => e.rank == r) || globalLeaderboards[r];
};

const wr = rank(1);
const oldWr = rankPrev(1);

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
  17: 1910.0, // 17 fin
};

const heightToFloor = (height) => {
  for (let floor = Object.keys(floorHeights).length - 1; floor >= 0; floor--) {
    if (height >= floorHeights[floor]) {
      return floor;
    }
  }
  return -1;
};
```

```js
const req = await fetch(`${deepdip2}/stats`);
const globalStats = await req.json();

function sparkbar(max) {
  return (x) =>
    htl.html`<div style="
    background: var(--theme-green);
    color: black;
    font: 10px/1.6 var(--sans-serif);
    width: ${100 * x / max}%;
    padding-right: 3px;
    box-sizing: border-box;
    overflow: visible;
    display: flex;
    justify-content: end;">${x.toLocaleString("en-US")}`;
}
```

```js
const req = await fetch(`${deepdip2}/bounty`);
const priceStats = await req.json();
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
        ${html`<a href="/player?q=${wr.name}">${wr.name}</a>`}
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
        ${html`<a href="/player?q=${rank(2).name}">${rank(2).name}</a>`}
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
        ${html`<a href="/player?q=${rank(3).name}">${rank(3).name}</a>`}
    </span>
    <span style="color: red">
        ${
          ((rankPrev(3).name != wr.name || rankPrev(3).name != rankPrev(2).name) && rank(3).name !== rankPrev(3).name) ? `▼ ${rankPrev(3).name}`: ""
        }
    </span>

</div>
  <div class="card">
    <h2>WR floor</h2>
    <span class="big">
        ${heightToFloor(wr.height)}
    </span>
  </div>
  <div class="card">
    <h2>Total falls</h2>
    <span class="big">
        ${globalStats.falls}
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


```js
const progress = Mutable(false)
const liveData = Generators.observe((change) => {
    const interval = setInterval(async () => {
        progress.value = true;
        const r = fetch(`${deepdip2}/live`);
        const data = await r.then((res) => res.json());
        change(data);
        setTimeout(() => {
            progress.value = false;
        }, 1000);
    }, 5000);
    return () => clearInterval(interval);
});

function classes(...classes) {
  return classes.filter(Boolean).join(" ");
}
const loading = (props = {}) => {
  const { class: c, size = 20, style = "" } = props;
  const id = Math.random().toString(36).substr(2, 9);
  const loadingStyle = [0, 83, 166, 250, 333, 416, 500, 583, 666, 750, 833, 916]
    .map((mil, i) => {
      const p = mil / 10; // opacity: 0.6
      const initO = (0.6 * p) / 100;
      const points = [
        { p: 0, o: initO },
        { p, o: 0 },
        { p: p + 0.1, o: 0.6 },
        { p: 100, o: initO }
      ]
        .sort((a, b) => a.p - b.p)
        // filter unique p values
        .filter((v, i, a) => i === 0 || v.p !== a[i - 1].p);
      return `
	@keyframes spin-${id}-${i} {
		${points.map(({ p, o }) => `${p}% { opacity: ${o}; }`).join("\n")}
	}
`;
    })
    .join("\n");

  return html`
<style>${loadingStyle}</style>
<svg
  class="${classes(c)}"
  style="${style}"
  width="${size}"
  height="${(size / 20) * 21}"
viewBox="0 0 20 21"
  xmlns="http://www.w3.org/2000/svg"
>
  <g fill="currentColor">
    <path
      d="M6.366 1.706a1 1 0 10-1.732 1l1.5 2.598a1 1 0 001.732-1l-1.5-2.598z"
      style="animation:spin-${id}-11 1000ms linear infinite normal forwards"
      opacity="0"
    />
    <path
      d="M1.706 6.366l2.598 1.5a1 1 0 101-1.732l-2.598-1.5a1 1 0 10-1 1.732z"
      style="animation:spin-${id}-10 1000ms linear infinite normal forwards"
      opacity="0"
    />
    <path
      d="M5 10a1 1 0 00-1-1H1a1 1 0 000 2h3a1 1 0 001-1z"
      style="animation:spin-${id}-9 1000ms linear infinite normal forwards"
      opacity="0"
    />
    <path
      d="M5.67 12.5a1 1 0 00-1.366-.366l-2.598 1.5a1 1 0 101 1.732l2.598-1.5A1 1 0 005.67 12.5z"
      style="animation:spin-${id}-8 1000ms linear infinite normal forwards"
      opacity="0"
    />
    <path
      d="M7.5 14.33a1 1 0 00-1.366.366l-1.5 2.598a1 1 0 101.732 1l1.5-2.598A1 1 0 007.5 14.33z"
      style="animation:spin-${id}-7 1000ms linear infinite normal forwards"
      opacity="0"
    />
    <path
      d="M10 15a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1z"
      style="animation:spin-${id}-6 1000ms linear infinite normal forwards"
      opacity="0"
    />
    <path
      d="M13.866 14.696a1 1 0 00-1.732 1l1.5 2.598a1 1 0 101.732-1l-1.5-2.598z"
      style="animation:spin-${id}-5 1000ms linear infinite normal forwards"
      opacity="0"
    />
    <path
      d="M18.294 13.634l-2.598-1.5a1 1 0 10-1 1.732l2.598 1.5a1 1 0 101-1.732z"
      style="animation:spin-${id}-4 1000ms linear infinite normal forwards"
      opacity="0"
    />
    <path
      d="M19 9h-3a1 1 0 000 2h3a1 1 0 000-2z"
      style="animation:spin-${id}-3 1000ms linear infinite normal forwards"
      opacity="0"
    />
    <path
      d="M14.33 7.5a1 1 0 001.366.366l2.598-1.5a1 1 0 10-1-1.732l-2.598 1.5A1 1 0 0014.33 7.5z"
      style="animation:spin-${id}-2 1000ms linear infinite normal forwards"
      opacity="0"
    />
    <path
      d="M12.5 5.67a1 1 0 001.366-.366l1.5-2.598a1 1 0 10-1.732-1l-1.5 2.598A1 1 0 0012.5 5.67z"
      style="animation:spin-${id}-1 1000ms linear infinite normal forwards"
      opacity="0"
    />
    <path
      d="M10 0a1 1 0 00-1 1v3a1 1 0 002 0V1a1 1 0 00-1-1z"
      style="animation:spin-${id}-0 1000ms linear infinite normal forwards"
      opacity="0"
    />
  </g>
</svg>
`;
}
```

<h2>Live leaderboard ${progress ? loading({ style: "", size: 20, class: "" }) : ""}</h2>

```js
Inputs.table(
  liveData.slice(0, 10).map((s) => {
    s.floor = heightToFloor(s.height);
    s.name = s.display_name;
    return s;
  }),
  {
    columns: [
      "name",
      "floor",
      "height",
    ],
    format: {
      height: sparkbar(2000),
    },
    rows: 100,
    maxHeight: "100%",
  },
)
```

</div>

<div style="padding-top: 2em;">

<h2>Global leaderboard</h2>

```js
Inputs.table(
  globalLeaderboards.map((s) => {
    s.floor = heightToFloor(s.height);
    return s;
  }),
  {
    columns: [
      "name",
      "floor",
      "height",
    ],
    format: {
      height: sparkbar(2000),
    },
    rows: 100,
    maxHeight: "100%",
  },
)
```

</div>

<h2>Clips</h2>
<p>Posted on <code>#twitch-clips</code> on the public discord server</p>

```js
const clipsData = FileAttachment("./clips.json").json();
```

```js
const clips = Inputs.search(clipsData, {
  placeholder: "Search for clips",
  filter: (s) => (q) =>
    q.embeds[0]?.title.toLowerCase().includes(s.toLowerCase()),
});
display(clips);

const clipsGen = Generators.input(clips);
```

```js
Inputs.bind(
  html`<div class="grid grid-cols-3">${
    clipsGen.map((s) =>
      s.embeds[0] &&
      html`<div class="card"><a href=${s.content}><p>${
        s.embeds[0]?.title
      }</p><img style=${`max-width: ${width / 4}px`} src=${
        s.embeds[0]?.thumbnail?.url
      } /></a></div>`
    )
  }</div>`,
  clips,
)
```

---

View source on Github: https://github.com/littledivy/deepdip2
