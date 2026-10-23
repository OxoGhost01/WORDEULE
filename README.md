# WORDEULE

WORDEULE is a Wordle-like word game made by 2 friends for a class project, with a lot more modes, a global leaderboard and a stamped-on-paper look.

Available [here](https://wordeule.oxoghost.dev) !

See the presentations about the architectural choices of the game, and its state before and after our oral exam [here](docs/States.md) and who did what is in [docs/Repartition.md](docs/Repartition.md).

---

## Contents

- [WORDEULE](#wordeule)
  - [Contents](#contents)
  - [How to play](#how-to-play)
  - [Game modes](#game-modes)
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

Find the hidden English word in a limited number of tries. Each guess must be a real word of the right length. After each guess, every letter takes a color:

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

The pages also include a **leaderboard** (global, one tab per mode), **stats** (one tab per mode) and a **How to play** page.

## Score

A won word gives `(tries left + 1) x 100` points, multiplied by the difficulty. A lost word gives nothing.

| Bonus | Multiplier |
| --- | --- |
| 6 letters | x1.5 |
| 7 letters or more | x2 |
| Locked mode | x1.5 |
| Each grid | x number of grids (hardcore: x4) |

In the endless modes the score of a run keeps growing until the first loss.

## Tech stack

- **Site:** React 19, React Router, Vite, Tailwind CSS 4.
- **Server:** Node.js and Express (a tiny leaderboard API, scores in a JSON file).
- **Tests:** Vitest.
- **Deployment:** Docker (2 containers) behind the nginx of a VPS.
- **Words:** the English dictionary of the [an-array-of-english-words](https://www.npmjs.com/package/an-array-of-english-words) package to check the guesses, and the [10,000 most common English words](https://github.com/first20hours/google-10000-english) for the words to guess, both served by jsDelivr.

## Run it on your computer

You need Node.js 22 or newer.

```bash
npm install
npm run dev
```

The site is on http://localhost:5173. The game works on its own, but the leaderboard and the "players who found the word" counter need the server. In a second terminal:

```bash
cd server
npm install
npm start
```

The Vite dev server forwards `/api` to the server on port 3000 (see [vite.config.js](vite.config.js)).

Other commands:

| Command | What it does |
| --- | --- |
| `npm run build` | Builds the site in `dist/` |
| `npm run preview` | Serves the build |
| `npm run lint` | Checks the code with ESLint |
| `npm test` | Runs the automated tests |

## Project structure

```
src/
  config.js            all the settings of the game (see below)
  main.jsx             entry point
  index.css            Tailwind and the look of the game
  pages/               one file per page: home (state and routes), daily, classic, custom,
                       hardcore, locked, stats, leaderboard, howtoplay, about, welcome
  components/          pieces used by the pages: game, grid, keyboard, tabs, countdown, menu...
  game/                the game logic, with no display
    evaluate.js        colors of a guess (duplicate letters included)
    locked.js          rules of the locked mode
    useGame.js         typing and rules of a game (React hook)
    score.js           points and difficulty bonus
    stats.js           numbers of the stats page
    share.js           text of the shared result
    words.js           loads the word lists, picks words
    *.test.js          automated tests
  data/
    storage.js         everything saved in the browser (localStorage)
    api.js             calls to the server
server/
  server.js            the leaderboard API
  config.js            settings of the server
docker/nginx.conf      nginx inside the site container
deploy/nginx-host.conf nginx of the VPS
Dockerfile, docker-compose.yml
docs/                  presentation, work split, checklist
```

## How it works

- **One game state, shared.** Only one mode runs at a time, so the state of the current game (word, guesses, score...) lives in `Home` and is passed to the pages as one `game` prop. A page only has to call `start(mode, words, answers, maxTries)` with its own rules.
- **The game logic is not in the display.** `useGame` handles the typing and the rules, and returns what the screen needs. The real keyboard and the on-screen keyboard both call the same `onKey` function.
- **Colors.** `evaluate` works in two passes: first the letters at the right place, then the others, so a green letter always has priority over a yellow one when a letter is repeated.
- **Several grids.** A game has a list of answers. Every guess is played on every grid, and each grid only displays the guesses up to its own solution.
- **Daily word.** The word list is shuffled with a fixed seed and indexed by the number of days since 1970 (UTC), so everyone gets the same word without any server. The versions of the word lists are pinned, so the list never changes under our feet. The guesses of the day are saved in the browser, so a reload can't give a new attempt.
- **Words.** Two lists are downloaded once per session. The full dictionary checks the guesses, so rare real words are accepted. The words to guess are only taken from the common words that are also in the dictionary, so they are fair and an answer is always a valid guess. This works for every word length, from 3 letters (about 400 answers) to 10 letters (about 560).
- **Results.** Every finished word is saved in the browser (for the stats) and sent to the server (for the leaderboard).

## Configuration

Every setting of the game is in [src/config.js](src/config.js): the rules of each mode, the limits of the custom mode, the score and its bonuses, the addresses of the word lists, the keyboard layout, the share squares, the daily settings... Change a value there instead of in the code. The server has its own file, [server/config.js](server/config.js), and the list of modes must be the same in both.

## The server and its API

The server keeps the best score of every player. A result only replaces the previous one if its score is better. Scores are stored in `server/data/scores.json` (in the `wordeule-data` volume with Docker).

| Route | What it does |
| --- | --- |
| `GET /api/scores/:mode` | The best players of a mode. For `daily`, only the players of today's word. |
| `POST /api/scores` | Sends a result: `{ username, mode, score, length }` |
| `GET /api/daily/count` | Number of players who found today's word |

The server checks the mode, the score, the length and the username. Modes: `daily`, `classic`, `hardcore`, `locked`, `custom`.

## Tests

```bash
npm test
```

The tests are next to the code they check (`src/game/*.test.js`): coloring of the letters (with duplicates in the guess and in the word), the rules of the locked mode, the score and its bonuses, the stats, the choice of the answers among the common words, and the shared text.

## Deployment

The site is deployed with Docker on a VPS, behind nginx.

- [Dockerfile](Dockerfile) builds the site and serves it with nginx. [docker/nginx.conf](docker/nginx.conf) gives `index.html` for every page (the routes are handled by React Router) and forwards `/api/` to the server.
- [server/Dockerfile](server/Dockerfile) builds the leaderboard server.
- [docker-compose.yml](docker-compose.yml) runs both containers. The site only listens on `127.0.0.1:8081`, and scores are kept in a Docker volume, so they survive a new deployment.
- [deploy/nginx-host.conf](deploy/nginx-host.conf) is the nginx config of the VPS: it forwards the domain to the site container. It also explains how to add HTTPS with certbot.

A `deploy.sh` script (not committed, it is specific to our server) sends the project to the VPS and runs `docker compose up -d --build`.

Before a deployment, make sure `package-lock.json` is up to date (`npm install`), because the build uses `npm ci`.

## Known limits

- A score can be faked by sending a request to the API, and a username is not protected. A real fix needs accounts and a server that checks the games.
- The daily word is computed in the browser, so it can be found by reading the code.
- The daily attempt is saved in the browser: clearing the data or using another browser gives a new one.
- The words to guess come from a list of words that are common on the web: it has plurals and some web words (SEARCH, ONLINE...) and it is not curated like the official Wordle list.
- Scores are stored in a JSON file, which is enough for a few players but not for many.

## Authors

Made with love by [Oxoghost](https://github.com/OxoGhost01) and [Coubitic](https://github.com/coubitic).
