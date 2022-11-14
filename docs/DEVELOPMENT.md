# Canutin: Develoment

- [Overview](#overview)
- [Environment setup](#environment-setup)
- [Running the app](#running-the-app)
- [Testing](#testing)
- [Other commands](#other-commands)
- [Current stack](#current-stack)
- [Contributing](#contributing)

---

## Overview

The repository is split into two semi-independent codebases:

- A [SvelteKit](https://kit.svelte.dev/) SSR app that serves a front-end on `localhost` and handles 95% of the functionality. Code lives in `<root>/sveltekit`
- A minimal [Electron](https://www.electronjs.org/) implementation that starts/stops the SvelteKit process through a tray menu interface. Doesn't make use of a [`BrowserWindow`](https://www.electronjs.org/docs/latest/api/browser-window) and instead relies on native OS interface components. Code lives in `<root>/electron`

## Environment setup

1. Install **Electron** dependencies

```bash
% npm install
```

2. Install **SvelteKit** dependencies

```bash
% cd sveltekit && npm install
```

3. Generate **Prisma's** artifacts.

```bash
% cd sveltekit && npx prisma generate
```

4. Create and seed a vault which will be seeded with the minimum required data (account/asset types, categories, etc).

```bash
% cd sveltekit && npx prisma migrate dev
```

## Running the app

The **Electron** and **SvelteKit** dev environments can be run independently of one another.

To run only the **SvelteKit** dev server:

```bash
% npm run start
```

To run the **Electron** together with **SvelteKit**:

```bash
% npm run dev
```

**Note:** This command needs a build of the SvelteKit app first, to create a build run `npm run build:sveltekit`. Because this build is bundled for distribution, if you make changes to the SvelteKit files you'll have to re-run the command for changes to be updated unlike `npm run start` which auto-reloads.

To **package the app** for distribution run:

```bash
% npm run package
```

This command will create builds of everything and will copy all of the files that are needed to run the released app. For details on what happens in the background check the `package.json` on the root directory.

#### Testing

**Electron** (Jest)

```bash
% npm test
```

**SvelteKit** (Playwright)

```javascript
% cd sveltekit && npm test
```

#### Other commands

[**Prisma Studio**](https://www.prisma.io/docs/concepts/components/prisma-studio)

Allows you to browse the database data in a GUI.

```bash
% cd sveltekit && npx prisma studio
```

## Current Stack

- TypeScript
- Electron
- Electron-Builder
- SvelteKit
- Prisma + SQLite

## Contributing

Here's ways in which you can contribute:

- Found a **bug** or have a **feature request**?
  1. Search for it in the [existing issues](https://github.com/canutin/desktop/issues)
  2. Open a [new issue](https://github.com/canutin/desktop/issues/new) if it doesn't yet exist
- Comment or upvote [existing issues](https://github.com/canutin/desktop/issues) _(active issues will likely be prioritized)_
- Submit a [pull request](https://github.com/canutin/desktop/pulls) _(please discuss in an issue first)_
