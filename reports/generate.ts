const DATA_DIR = "./deepdip2_data";

// gcloud storage rsync gs://deepdip2_data ./deepdip2_data/ -R

const walk = Deno.readDir(DATA_DIR);
const players = {};

for await (const entry of walk) {
  if (entry.isDirectory) {
    const date = entry.name;
    const dateWalk = Deno.readDir(`${DATA_DIR}/${date}`);
    for await (const playerEntry of dateWalk) {
      if (playerEntry.isFile) {
        const json = Deno.readTextFileSync(`${DATA_DIR}/${date}/${playerEntry.name}`);
        const data = JSON.parse(json);
        for (const d of data) {
          const name = d.display_name;

          players[name] ??= {};
          players[name][date] ??= [];
          players[name][date].push({
            height: d.height,
            ts: d.ts,
            rank: d.rank,
          });
        }
      }
    }
  }
}

Deno.mkdirSync("deepdip2_generated_reports", { recursive: true });

const promises = new Array<Promise<void>>(Object.keys(players).length);
for (const [name, data] of Object.entries(players)) {
  const report = {
    name,
    data
  };

  promises.push(Deno.writeTextFile(`deepdip2_generated_reports/${name}.json`, JSON.stringify(report)));
}

await Promise.all(promises);
await Deno.writeTextFile("deepdip2_generated_reports/.players.json", JSON.stringify(Object.keys(players)));

// gcloud storage rsync ./deepdip2_generated_reports gs://deepdip2_player_data -R

