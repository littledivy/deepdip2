# `deepdip2.live`

Observablity dashboard for the Deep Dip 2 Trackmania event.

https://deepdip2.live

## Design

This project mainly consists of 3 services:

`api.ts`: Main egde service running on Deno Deploy. Also collects global leaderboard and stats data every 20min. Deno KV backup is stored in a public bucket: `gs://deepdip2_leaderboard`.

`watchdog.ts`: Collect and store live player heights from Dips++ plugin. Runs every 20s on a GCP VM. All raw data is stored in a public bucket: `gs://deepdip2_data`.

`reports/generate.ts`: Gather heights-per-player-per-day data from `gs://deepdip2_data`. All player data is stored in a public bucket: `gs://deepdip2_player_data`. This is updated once every day.

## Dataset

### Raw heights data

```
gcloud storage rsync gs://deepdip2_data ./deepdip2_data/ -R
```

```
├── [ 288]  deepdip2_data
│   ├── [ 57K]  2024-05-07
│   │   ├── [ 17K]  1715089294795.json
│   │   ├── [ 17K]  1715089314402.json
│   │   ├── ...
│   ├── [ 57K]  2024-05-08
│   │   ├── ...
│   ├──  ...
```

### Heights data by player name

```
gcloud storage rsync gs://deepdip2_player_data ./deepdip2_player_data -R
```

```
├── [213K]  deepdip2_generated_reports
│   ├── [ 23K]  A--Raczej.json
│   ├── [ 25K]  A-SoronSR.json
│   ├── [ 38K]  A3D3X.json
│   ├── [5.0K]  A4T.Seraph.json
│   ├── ...
```

Feel free to contact me on Discord `@littledivy` 
if you want to use the dataset for your own visualizations / videos.

## Third party APIs

- https://dips-plus-plus.xk.io/ for leaderboard, live heights and stats.
- https://matcherino.com/tournaments/111501 for prize pool data
- Discord channels API for community submitted twitch clips.

## Cost

This project is expected to update till top 5 finishes. After that, it'll be made read-only to save storage costs.

- deepdip2.live - $4.16
- Storage (as of May 13) - $0.41
    - `gs://deepdip2_data` - 817 MB
    - `gs://deepdip2_player_data` - 214 MB
    - `gs://deepdip2_leaderboard` - 90 MB

Total 824k unique visitors from 5 May - 13 May.

## License

This project is licensed under the MIT license. See [LICENSE](./LICENSE)

