import PocketBase from 'pocketbase';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
    declare namespace App {
        interface Locals {
            pb: PocketBase
        }
    }
}
