import { serveDir } from "jsr:@std/http/file-server";

const kv = await Deno.openKv();

const headers = {
  "User-Agent":
    "deepdip2.live proxy and caching (contact: @littledivy on Discord)",
};

async function globalLeaderboard() {
  const r = await fetch("https://dips-plus-plus.xk.io/leaderboard/global", {
    headers,
  });
  const leaderboard = await r.json();
  return leaderboard;
}

async function overview() {
  const r = await fetch("https://dips-plus-plus.xk.io/overview", {
    headers,
  });
  const overview = await r.json();
  return overview;
}

async function syncLeaderboard() {
  try {
    const leaderboard = await globalLeaderboard();

    const timestamp = Date.now();
    console.log("Updating leaderboard at", timestamp);
    await kv.set(["leaderboard", timestamp], leaderboard);

    const stats = await overview();
    await kv.set(["stats", timestamp], stats);
  } catch (e) {
    console.error("Failed to sync leaderboard", e);
  }
}

Deno.cron("Sync leaderboard", "*/30 * * * *", syncLeaderboard);

syncLeaderboard();

Deno.serve(async function (req) {
  const url = new URL(req.url);
  switch (url.pathname) {
    case "/leaderboard": {
      let leaderboard, prev;
      try {
        const iter = await kv.list({ prefix: ["leaderboard"] }, {
          reverse: true,
        });
        const { value: leaderboard_ } = await iter.next();
        const { value: prev_ } = await iter.next();

        leaderboard = leaderboard_.value;
        prev = prev_.value;
        if (leaderboard === null) {
          return new Response("Not Found", { status: 404 });
        }
      } catch (e) {
        leaderboard = await globalLeaderboard();
      }

      return new Response(
        JSON.stringify({ prev, latest: leaderboard }),
        {
          headers: {
            "content-type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
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
      let stats;
      try {
        const iter = await kv.list({ prefix: ["stats"] }, { reverse: true });
        const { value } = await iter.next();
        stats = value.value;
      } catch (e) {
        console.error("Failed to get stats", e);
        stats = await overview();
      }

      return new Response(JSON.stringify(stats), {
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
      const req = await fetch(
        "https://api.matcherino.com/__api/bounties/totalSpent?bountyId=111501",
      );
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
