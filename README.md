# WORDEULE

WORDEULE is a Wordle-like word game, **in English and in French**, made by 2 friends for a class project, with a lot more modes, a global leaderboard and a stamped-on-paper look.

Available [here](https://wordeule.oxoghost.dev) !

See the presentations about the architectural choices of the game, and its state before and after our oral exam [here](docs/States.md) and who did what is in [docs/Repartition.md](docs/Repartition.md).

---

## Contents

- [WORDEULE](#wordeule)
  - [Contents](#contents)
  - [How to play](#how-to-play)
  - [Game modes](#game-modes)
  - [Languages](#languages)
  - [Score](#score)
  - [Tech stack](#tech-stack)
  - [Run it on your computer](#run-it-on-your-computer)
  - [Project structure](#project-structure)
  - [How it works](#how-it-works)
  - [Configuration](#configuration)
  - [The server and its API](#the-server-and-its-api)
  - [Tests](#tests)
  - [Deployment](#deployment)
  - [Known limits](#known-limits)
  - [Authors](#authors)

## How to play

Find the hidden word, in English or in French, in a limited number of tries. Each guess must be a real word of the right length. After each guess, every letter takes a color:

| Color | Meaning |
| --- | --- |
| Blue | The letter is in the word, at this exact place |
| Yellow | The letter is in the word, but somewhere else |
| Black | The letter is not in the word (or all its copies are already found) |

Type with the keyboard or with the one on the screen, which also shows the state of every letter. A refused word (too short, or not in the dictionary) shakes the line and doesn't use a try. At the end of a game, the **Share** button sends your result as colored squares, without any letter.

## Game modes

| Mode | Letters | Tries | Rules |
| --- | --- | --- | --- |
| **Daily** | 5 | 6 | One word a day, the same for everybody (it changes at midnight UTC). One attempt per day: a reload picks up where you stopped. A counter shows the time left before the next word, and how many players found today's word. |
| **Classic** | 5 | 6 | Endless: a win gives a new word and keeps the score, a loss ends the run. |
| **Custom** | 3 to 10 | 3 to 10 | Your rules, including 1 to 10 grids. Endless like classic. The settings are saved, and the length is in the address (`/custom/7`). |
| **Hardcore** | 5 | 9 | 4 grids at the same time. Every guess is played on all grids, a grid stops when its word is found, you win when all 4 are found. |
| **Locked** | 5 | 6 | The hard mode. A letter found at its place is locked there and pre-filled on every new line. A letter found elsewhere must be used in the next guesses. |
| **Survival** | 4 to 10 | 6 | Endless, and every word found makes the next one a letter longer (up to 10). One miss ends the run. |
| **Blitz** | 5 | 6 | A clock of 90 seconds, and every word found adds 15 seconds. Find as many words as you can; a missed word gives nothing and a new one starts right away. |
| **Reverse** | 5 | 3 | The game shows a row of colors and you must find any word that gives exactly these colors. Endless: the first puzzle missed ends the run. |
| **Duel** | 5 | 6 | You and a friend play the same secret word, from a link or a 6-character code. The fewest tries wins, then the fastest. Not ranked, and it needs the server. |

Daily, classic, hardcore, locked, survival, blitz and reverse are **ranked**: they are played on the server (see [The server and its API](#the-server-and-its-api)). If the server can't be reached, the game falls back to a local, unranked game and says so.

## Languages

The whole game exists in English and in French. The language is chosen with the `EN | FR` buttons at the top of the pages that are not a game (menu, welcome, stats, leaderboard, rules...). It is saved in the browser, and the first time it follows the language of the browser.

- **Separate scores.** The difficulty of the two languages can't be compared, so their scores are never mixed: each language has its own leaderboards, its own daily word and daily attempt, its own counter of players who found the word, and its own stats. A player can play both.
- **Words.** English: the dictionary of [an-array-of-english-words](https://www.npmjs.com/package/an-array-of-english-words) and the [10,000 most common English words](https://github.com/first20hours/google-10000-english). French: the dictionary of [an-array-of-french-words](https://www.npmjs.com/package/an-array-of-french-words) and the most frequent words of the French [FrequencyWords](https://github.com/hermitdave/FrequencyWords) list (built from film subtitles). The dictionary checks the guesses, the common words that are also in the dictionary are the words to guess.
- **Accents.** The game compares plain letters. A French word is typed without accents (`é` on the keyboard counts as `E`), and shown with its accents at the end of the game, with a link to its page on the French Wiktionary (`fr.wiktionary.org`) instead of the English one.
- **Keyboard.** QWERTY in English, AZERTY in French.
- **Texts.** All the texts are in [src/i18n/en.js](src/i18n/en.js) and [src/i18n/fr.js](src/i18n/fr.js), with the same keys. A component writes `t('game.won', { tries: 3, max: 6 })` and gets the text in the current language.

The pages also include a **leaderboard** (global, one tab per ranked mode, with an all-time, weekly and daily view, your own rank, and the number of words found in each run), **stats** (one tab per mode: streaks, a daily calendar, average tries, a heatmap of the letters you play), **settings** (username, a color-blind palette, reduced animations) and a **How to play** page.

## Score

A won word gives `(tries left + 1) x 100` points, multiplied by the difficulty. A lost word gives nothing.

| Bonus | Multiplier |
| --- | --- |
| 6 letters | x1.5 |
| 7 letters or more | x2 |
| Locked mode | x1.5 |
| Each grid | x number of grids (hardcore: x4) |

In the endless modes the score of a run keeps growing until the first loss, and the leaderboard shows how many words were found to make it (the daily word shows its tries).

## Tech stack

- **Site:** React 19, React Router, Vite, Tailwind CSS 4.
- **Server:** Node.js 24 and Express, with a SQLite database (`node:sqlite`, nothing to compile), `helmet` and `express-rate-limit`.
- **Shared code:** the rules of the game (colors, locked mode, score, run engine) are in [shared/](shared) and used by both the site and the server.
- **PWA:** the site can be installed and keeps working offline (`vite-plugin-pwa`).
- **Tests:** Vitest and Supertest.
- **Deployment:** Docker (2 containers) behind the nginx of a VPS.
- **Words:** a dictionary to check the guesses and a list of common words for the words to guess, in each language (see [Languages](#languages)), served by jsDelivr.

## Run it on your computer

You need Node.js 24 or newer.

```bash
npm install
npm run dev
```

The site is on http://localhost:5173. Without the server the game still works, but every mode is unranked (and Duel is not available). In a second terminal:

```bash
cd server
npm install
npm start
```

The server downloads the word lists the first time (they are cached in `server/data/words`) and keeps its data in `server/data/wordeule.db`. In production, set the `DAILY_SECRET` environment variable: it decides the daily words, so keep it private.

The Vite dev server forwards `/api` to the server on port 3000 (see [vite.config.js](vite.config.js)).

Other commands:

| Command | What it does |
| --- | --- |
| `npm run build` | Builds the site in `dist/` |
| `npm run preview` | Serves the build |
| `npm run lint` | Checks the code with ESLint |
| `npm test` | Runs the automated tests (site, shared code and server) |

## Project structure

```
shared/                rules used by both the site and the server
  rules.js             modes, score, word list sources, limits of each mode
  evaluate.js          colors of a guess (duplicate letters included)
  locked.js            rules of the locked mode
  score.js             points and difficulty bonus
  run.js               the engine of a run: rounds, guesses, scores, blitz clock, reverse patterns
  words.js, text.js    parsing of the word lists, removal of the accents
  daily.js             the daily word from a seed
src/
  config.js            the settings of the site (see below)
  i18n/                the texts: en.js, fr.js, the translate function and the language provider/hook
  main.jsx             entry point
  index.css            Tailwind and the look of the game
  pages/               one file per page: home (state and routes), daily, modepage (classic, locked,
                       hardcore, survival, reverse), blitz, duel, custom, stats, leaderboard, settings,
                       howtoplay, about, welcome
  components/          pieces used by the pages: game, grid, keyboard, pattern, timer, tabs, countdown, menu...
  game/                the game logic of the browser, with no display
    engines.js         the local engine (in the browser) and the remote engine (the server)
    launch.js          starts a run on the server, or locally when it can't be reached
    useGame.js         typing and rules of a game (React hook)
    stats.js           numbers of the stats page
    share.js           text of the shared result
    words.js           downloads the word lists of a language
  data/
    storage.js         everything saved in the browser (localStorage)
    api.js             calls to the server, with the player token
server/
  index.js             starts the server
  app.js               the Express app: security middleware and routes
  routes/              players, runs (the games), scores (leaderboard), duels
  store.js, db.js      SQLite storage
  words.js             word lists of the server, cached on disk
  migrate.js           imports the old scores.json
  test/                tests of the API
docker/nginx.conf      nginx inside the site container
deploy/nginx-host.conf nginx of the VPS
Dockerfile, docker-compose.yml
docs/                  presentation, work split, checklist
```

## How it works

- **One game state, shared.** Only one mode runs at a time, so the state of the current game (word, guesses, score...) lives in `Home` and is passed to the pages as one `game` prop. A page asks `launchRun` for a game and hands the result to `start`.
- **The server plays the game.** A ranked game is a *run* on the server. The browser sends its guesses and gets back the colors, never the answer: the answer is only revealed when the round is over. The server checks every guess (length, dictionary, locked-mode rules, tries left, the clock in blitz, a minimum delay between two guesses) and computes the score itself. The browser keeps the colored rows, so the grid, the keyboard and the shared text work from them.
- **One engine, two places.** [shared/run.js](shared/run.js) is the whole engine of a run. The server stores it in SQLite, and the browser runs the very same code for custom games and when the server can't be reached.
- **The game logic is not in the display.** `useGame` handles the typing and the rules, and returns what the screen needs. The real keyboard and the on-screen keyboard both call the same `onKey` function.
- **Colors.** `evaluate` works in two passes: first the letters at the right place, then the others, so a green letter always has priority over a yellow one when a letter is repeated.
- **Several grids.** A game has a list of answers. Every guess is played on every grid, and each grid only displays the guesses up to its own solution.
- **Daily word.** The word list is shuffled with a seed derived from the server secret `DAILY_SECRET` and indexed by the number of days since 1970 (UTC), so everyone gets the same word and nobody can compute it. The versions of the word lists are pinned, so the list never changes under our feet. The run of the day lives on the server, so a reload (or another device) picks up where you stopped. When the server can't be reached, the browser offers a practice word with a public seed, clearly unranked.
- **Words.** Two lists are downloaded once per session. The full dictionary checks the guesses, so rare real words are accepted. The words to guess are only taken from the common words that are also in the dictionary, so they are fair and an answer is always a valid guess. This works for every word length, from 3 letters (about 400 answers) to 10 letters (about 560).
- **Results.** Every finished word is saved in the browser (for the stats). The leaderboard is computed by the server from the runs it played.
- **Players.** The first time, the server gives the browser a random token (only its hash is stored) and attaches the username to it. A username can't be taken twice, whatever its case, and the token is needed to play a ranked game. Usernames from the old leaderboard are given to the first player who registers them.

## Configuration

The settings of the game are in [src/config.js](src/config.js) (custom mode limits, languages, keyboard layouts, share squares, daily counter) and in [shared/rules.js](shared/rules.js) (modes, score, word list sources, blitz and survival settings), which the server uses too. The settings of the server are in [server/config.js](server/config.js): rate limits, size of the leaderboard.

| Environment variable | Used by | Meaning |
| --- | --- | --- |
| `DAILY_SECRET` | server | Decides the daily words. Required in production. |
| `DATA_DIR` | server | Where the database and the word lists are kept (`/data` with Docker). |
| `PORT` | server | Port of the API (3000). |
| `TRUST_PROXY` | server | Number of proxies in front of the API (2 behind the two nginx). |

## The server and its API

Every ranked game is a run played on the server, stored in `wordeule.db` (in the `wordeule-data` volume with Docker). Routes that need a player send `Authorization: Bearer <token>`.

| Route | What it does |
| --- | --- |
| `POST /api/players` | Creates a player: `{ username }`, returns the token (409 if the name is taken). |
| `GET /api/players/me`, `PATCH /api/players/me` | The current player, and renaming. |
| `POST /api/runs` | Starts a run: `{ mode, lang }`. The daily run is resumed if it exists. |
| `POST /api/runs/:id/guess` | Plays a word: `{ guess }`, returns the colored rows, the status and the score. |
| `POST /api/runs/:id/next` | Starts the next word of an endless run. |
| `GET /api/scores/:lang/:mode?period=all\|week\|today` | The top players, and the rank of the current player. |
| `GET /api/daily/count/:lang` | Number of players who found today's word in a language. |
| `POST /api/duels`, `POST /api/duels/:code/join`, `GET /api/duels/:code` | Creates, joins and follows a duel. The other player's result is hidden until you have finished. |

What the server does against cheating and abuse:

- the score is computed by the server, there is no route to send one;
- the answer is never sent before the end of the round, and the daily word depends on a server secret;
- guesses are validated against the dictionary, the tries, the locked-mode rules and (in blitz) the clock, with at least 250 ms between two guesses;
- request bodies are limited to 2 kB and checked, errors never show a stack trace, `helmet` sets the security headers;
- rate limits per address on reading, playing, starting a game and creating a player;
- usernames are normalized and limited to letters, digits, spaces, `.`, `_` and `-`;
- tokens are random and only their hash is stored; the database has unique usernames and indexes on the leaderboard queries.

On the first start, an old `scores.json` in the data folder is imported and renamed `scores.json.migrated`.

## Tests

```bash
npm test
```

The tests are next to the code they check. Shared code (`shared/*.test.js`): coloring of the letters (with duplicates in the guess and in the word), the rules of the locked mode, the score and its bonuses, the daily word, the choice of the answers (including French words with accents) and the whole run engine of every mode. Site (`src/**/*.test.js`): the stats, the shared text, the local and remote engines and the translations (English and French must have the same keys). Server (`server/test`): players, the rules of a run, the daily run, the leaderboard and its periods, the import of the old scores, the duels (including the hidden result) and the rate limits, with an in-memory database and a small word list.

## Deployment

The site is deployed with Docker on a VPS, behind nginx.

- [Dockerfile](Dockerfile) builds the site and serves it with nginx. [docker/nginx.conf](docker/nginx.conf) gives `index.html` for every page (the routes are handled by React Router) and forwards `/api/` to the server.
- [server/Dockerfile](server/Dockerfile) builds the API. It is built from the root of the repository, because it also needs the `shared/` folder.
- [docker-compose.yml](docker-compose.yml) runs both containers. The site only listens on `127.0.0.1:8081`, and the database is kept in a Docker volume, so it survives a new deployment. Put `DAILY_SECRET=<a long random text>` in a `.env` file next to it: the compose file refuses to start without it.
- [deploy/nginx-host.conf](deploy/nginx-host.conf) is the nginx config of the VPS: it forwards the domain to the site container. It also explains how to add HTTPS with certbot.

A `deploy.sh` script (not committed, it is specific to our server) sends the project to the VPS and runs `docker compose up -d --build`.

Before a deployment, make sure `package-lock.json` is up to date (`npm install`), because the build uses `npm ci`.

## Known limits

- Usernames are protected by a token kept in the browser, not by an account: clearing the data of the site loses the token, and the name can then be taken by someone else.
- Someone could still play by asking another program for the best word after each guess (a solver): the server can't tell. Server-side games only stop forged scores and answers read from the code.
- A server with no network access the first time can't download the word lists.
- The words to guess come from lists of common words: the English one comes from the web and has plurals and some web words (SEARCH, ONLINE...), the French one comes from film subtitles and has verb forms and a few English words. Neither is curated like the official Wordle list.
- The French dictionary is a 4.5 MB file, downloaded only when French is played (and by the server, once).

## Authors

Made with love by [Oxoghost](https://github.com/OxoGhost01) and [Coubitic](https://github.com/coubitic).
