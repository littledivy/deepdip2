import { serveDir } from "jsr:@std/http/file-server";

const kv = await Deno.openKv();

async function syncLeaderboard() {
  try {
    const r = await fetch("https://dips-plus-plus.xk.io/leaderboard/global");
    const leaderboard = await r.json();

    const timestamp = Date.now();
    console.log("Updating leaderboard at", timestamp);
    await kv.set(["leaderboard", timestamp], leaderboard);

    const r2 = await fetch("https://dips-plus-plus.xk.io/overview");
    const stats = await r2.json();
    await kv.set(["stats", timestamp], stats);
  } catch (e) {
    console.error("Failed to sync leaderboard", e);
  }
}

Deno.cron("Sync leaderboard", "*/10 * * * *", syncLeaderboard);

syncLeaderboard();

Deno.serve(async function (req) {
  const url = new URL(req.url);
  switch (url.pathname) {
    case "/leaderboard": {
      const iter = await kv.list({ prefix: ["leaderboard"] }, {
        reverse: true,
      });
      const { value: leaderboard } = await iter.next();
      const { value: prev } = await iter.next();
      if (leaderboard === null) {
        return new Response("Not Found", { status: 404 });
      }

      return new Response(JSON.stringify({ prev: prev?.value, latest: leaderboard.value }), {
        headers: {
          "content-type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
      break;
    }
    case "/world_records": {
      const records = [];
      const iter = await kv.list({ prefix: ["leaderboard"] });
      for await (const { value: record, key } of iter) {
        for (const r of record) {
          if (r.rank > 3) {
            break;
          }

          records.push({
            height: r.height,
            timestamp: key[1],
            rank: r.rank,
          });
        }
      }

      return new Response(JSON.stringify(records), {
        headers: {
          "content-type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
      break;
    }
    case "/stats": {
      const iter = await kv.list({ prefix: ["stats"] }, { reverse: true });
      const { value: stats } = await iter.next();

      return new Response(JSON.stringify(stats.value), {
        headers: {
          "content-type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
      break;
    }
    case "/update": {
      await syncLeaderboard();
      return new Response("Ok");
      break;
    }
    case "/bounty": {
      const req = await fetch("https://api.matcherino.com/__api/bounties/totalSpent?bountyId=111501");
      return new Response(req.body, {
        headers: {
          "content-type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
      break;
    }
    default:
      return serveDir(req, { fsRoot: "./dist" });
  }
}, { port: 8000 });
