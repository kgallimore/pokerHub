<script lang="ts">
	import type { CardHand } from '$lib';
	import PlayingCard from './PlayingCard.svelte';
	const {cards}: {cards: CardHand} = $props();
</script>

<div class="flex justify-center">
	<div class="inline-block mr-[-12.5%] rotate-12">
		<PlayingCard details={cards[0]} />
	</div>
	<div class="inline-block ml-[-12.5%] -rotate-12">
		<PlayingCard details={cards[1]} />
	</div>
</div>
