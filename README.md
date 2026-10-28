# shelfgames

Little games for book club, one per month. Each one lives at its own subdomain of
[shelfgames.party](https://shelfgames.party), named with the three-letter month and
two-digit year — November 2026 is `nov26.shelfgames.party`.

## Layout

```
site/               → shelfgames.party, the bookshelf of every month's book
games/
  nov26/            → nov26.shelfgames.party
    index.html      entry point
    src/            styles, scripts and *.test.js files
    package.json    @shelfgames/nov26, plus "shelfgames" metadata (book, month, game)
```

The site and each month are their own [Bun workspaces](https://bun.sh/docs/install/workspaces),
built with [Vite](https://vite.dev) and tested with [Vitest](https://vitest.dev).

The root site reads the `shelfgames` block in every `games/*/package.json` at build time and
puts that book on the shelf, linked to its subdomain:

```json
"shelfgames": {
  "subdomain": "nov26",
  "month": "2026-11",
  "book": "The House in the Cerulean Sea",
  "author": "TJ Klune",
  "isbn": "9781250217288",
  "game": "Which Marsyas Island Resident Are You?"
}
```

The cover comes from [Open Library](https://openlibrary.org) by ISBN. To use a specific
image instead, add `"cover"` with its URL. With neither, or if the cover can't load, the book
gets a cloth-bound cover with its title in gold. The site's tests check that every game's
metadata is complete and that its subdomain matches its folder and month.

## Getting started

Requires [Bun](https://bun.sh), which installs packages and runs the workspaces.

```sh
bun install
bun run build               # build every game into games/*/dist
bun run test                # run every game's tests (Vitest projects)
```

Inside `site/` or a game folder (for example `cd games/nov26`):

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
   `shelfgames` metadata. Its book shows up on the root site automatically.
3. Run `bun install` from the root, then `bun run test` to check the metadata.
