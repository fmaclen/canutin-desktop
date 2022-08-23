import { writable } from 'svelte/store';

// NOTE:
// It'd probably be better to set the default value to `false` and only set it to
// `true` after we check that the vault is migrated and seeded in `/vault/+page.server.ts`
// except the store can only be updated from the front-end and because we are throwing
// a redirect to `/` the load function in `/vault/+page.svelte`'s never runs.
const isVaultReadyStore = writable(true);

export default isVaultReadyStore;
