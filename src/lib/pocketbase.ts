import PocketBase from 'pocketbase';
import type { TypedPocketBase } from '$lib/pocketbase-types';

import { writable, type Writable } from 'svelte/store';
import { env } from '$env/dynamic/public';

export const pbStore = writable(
	new PocketBase(env.PUBLIC_POCKETBASE_URL)
) as Writable<TypedPocketBase>;
