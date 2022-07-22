# Canutin: desktop-2

#### A leaner version of [`https://github.com/canutin/desktop`](https://github.com/canutin/desktop)

---

## Setup

You'll need to run these commands to set up the environment before getting started.

0. Install [`pnpm`](https://pnpm.io/installation) if you didn't already have it.

1. Install all backend dependencies (**Electron, Prisma**)

```bash
% pnpm isntall
```

2. Install all frontend dependencies (**SvelteKit**)

```bash
% cd app && pnpm install
```

3. Generate **Prisma's** artifacts (The path will be: `/node_modules/@prisma/client/.prisma/client`).
   The contents of this folder will be packaged with the Electron app. Also, SvelteKit gets the `PrismaClient` from these files in dev mode.

```bash
% pnpx prisma generate
```

4. Create and seed a vault (The path will be: `/prisma/Canutin.dev.vault`) which will be seeded with the minimum required data (account/asset types, categories, etc).

```bash
% pnpx prisma migrate dev
```

---

## Usage

The **Electron** and **SvelteKit** dev environments can be run independently of one another.

To run only the **SvelteKit** dev server (including **Prisma**):

```bash
% pnpm start
```

To run the **Electron** together with **SvelteKit**:

```bash
% pnpm dev
```

**Note:** This command needs a build of the SvelteKit app first, to create a build run `pnpm build:sveltekit`. Because this build is bundled for distribution, if you make changes to the SvelteKit files you'll have to re-run the command for changes to be updated unlike `pnpm start` which auto-reloads.

To **package the app** for distribution run:

```bash
% pnpm package
```

This command will create builds of everything and will copy all of the files that are needed to run the released app. For details on what happens in the background check the `package.json` on the root directory.

#### Other commands

**Prisma Studio**

```bash
% pnpx prisma studio
```

**SveteKit Preview**

```bash
% cd app && pnpm preview
```

---

### Current Stack

- Electron
- Electron-Builder
- Prisma + SQLite
- SvelteKit
- TypeScript
