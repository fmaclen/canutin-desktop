# Canutin: desktop-2

#### A leaner version of [`https://github.com/canutin/desktop`](https://github.com/canutin/desktop)

---

## Get started

- `pnpm install` installs all backend dependencies (Electron, Prisma, Express)
- `pnpx prisma generate` puts Prisma's artifacts in `/node_modules`
- `pnpx prisma migrate dev` creates `/prisma/Canutin.dev.vault` and seeds it with the minimum required data (account/asset types, categories, etc).
- `pnpx prisma studio` UI tool for browsing the database contents
- `pnpm start` runs the app

---

### Current Stack

- [x] Electron
- [x] Prisma + SQLite
- [x] SvelteKit
