# shelfgames

Little games for book club, one per month. Each one lives at its own subdomain of
[shelfgames.party](https://shelfgames.party), named with the three-letter month and
two-digit year — November 2026 is `nov26.shelfgames.party`.

## Layout

```
games/
  nov26/            → nov26.shelfgames.party
    index.html      entry point
    src/            styles and scripts
    package.json    @shelfgames/nov26, plus "shelfgames" metadata (book, month, game)
```

Each month is its own [Bun workspace](https://bun.sh/docs/install/workspaces) under
`games/`. The `shelfgames` block in each game's `package.json` describes the month's
book, for the future root site that will show every month as a book on a shelf.

## Getting started

Requires [Bun](https://bun.sh) 1.2 or newer.

```sh
bun install
cd games/nov26 && bun run dev       # dev server with hot reload on http://localhost:3000
bun run build                       # from the root: build every game into games/*/dist
```

Games are plain HTML, CSS and JavaScript, bundled by Bun's built-in HTML bundler. No
framework is required, but a game can add whatever dependencies it needs to its own
`package.json`.

## Adding a month

1. Copy an existing game folder to `games/<mon><yy>` (for example `games/dec26`).
2. In its `package.json`, update `name` to `@shelfgames/<mon><yy>` and fill in the
   `shelfgames` metadata.
3. Run `bun install` from the root.
