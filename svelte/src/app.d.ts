import {TypedPocketBase} from '$lib/pocketbase-types';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			pb: TypedPocketBase
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
