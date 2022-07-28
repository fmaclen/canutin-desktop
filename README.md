# Canutin: desktop-2

#### A leaner version of [`https://github.com/canutin/desktop`](https://github.com/canutin/desktop)

---

## Setup

You'll need to run these commands to set up the environment before getting started.

1. Install all backend dependencies (**Electron, Prisma**)

```bash
% npm install
```

2. Install all frontend dependencies (**SvelteKit**)

```bash
% cd sveltekit && npm install
```

3. Generate **Prisma's** artifacts.

```bash
% npx prisma generate
```

4. Create and seed a vault which will be seeded with the minimum required data (account/asset types, categories, etc).

```bash
% npx prisma migrate dev
```

---

## Usage

The **Electron** and **SvelteKit** dev environments can be run independently of one another.

To run only the **SvelteKit** dev server (including **Prisma**):

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

**Electron unit tests**

```bash
% npm test
```

**SvelteKit integration tests**

```javascript
// TODO
```

#### Other commands

**Prisma Studio**

```bash
% npx prisma studio
```

**SveteKit Preview**

```bash
% cd sveltekit && npm run preview
```

---

### Current Stack

- Electron
- Electron-Builder
- Prisma + SQLite
- SvelteKit
- TypeScript
