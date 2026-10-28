# shelfgames

Little games for book club, one per month. Each one lives at its own subdomain of
[shelfgames.party](https://shelfgames.party), named with the three-letter month and
two-digit year — November 2026 is `nov26.shelfgames.party`.

## Layout

```
games/
  nov26/            → nov26.shelfgames.party
    index.html      entry point
    src/            styles, scripts and *.test.js files
    package.json    @shelfgames/nov26, plus "shelfgames" metadata (book, month, game)
```

Each month is its own [Bun workspace](https://bun.sh/docs/install/workspaces) under
`games/`, built with [Vite](https://vite.dev) and tested with [Vitest](https://vitest.dev). The `shelfgames` block in each game's `package.json` describes the month's
book, for the future root site that will show every month as a book on a shelf.

## Getting started

Requires [Bun](https://bun.sh), which installs packages and runs the workspaces.

```sh
bun install
bun run build               # build every game into games/*/dist
bun run test                # run every game's tests (Vitest projects)
```

Inside a game folder (for example `cd games/nov26`):

```sh
bun run dev                 # Vite dev server with hot reload
bun run build               # production build into dist/
bun run preview             # serve the production build locally
bun run test                # Vitest in watch mode
```

Games are plain HTML, CSS and JavaScript. Keep game logic that's worth testing in its
own module (like `games/nov26/src/quiz.js`) so Vitest can import it without a browser.

## Adding a month

1. Copy an existing game folder to `games/<mon><yy>` (for example `games/dec26`).
2. In its `package.json`, update `name` to `@shelfgames/<mon><yy>` and fill in the
   `shelfgames` metadata.
3. Run `bun install` from the root.
