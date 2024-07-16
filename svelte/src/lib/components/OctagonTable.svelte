<script lang="ts">
	import type { TableCardDetails } from '$lib';
	import PlayingCard from './PlayingCard.svelte';
	import PlayerHand from './PlayerHand.svelte';
	const {playerHands}: {playerHands: TableCardDetails} = $props();
</script>

<div class="block min-w-[350px] h-full aspect-square">
	<div class="relative">
		<img
			src="/octagon.svg"
			alt="Hexagon poker table"
			class="relative h-full m-auto aspect-square z-0"
		/>
		<div class="absolute top-[5%] left-[23%] rotate-[160deg]">
			<PlayerHand cards={playerHands[1]} />
		</div>
		<div class="absolute top-[5%] right-[23%] rotate-[-160deg]">
			<PlayerHand cards={playerHands[2]}  />
		</div>
		<div class="absolute top-[26%] right-0 rotate-[-115deg]">
			<PlayerHand cards={playerHands[3]}  />
		</div>
		<div class="absolute bottom-[26%] right-0 rotate-[-65deg]">
			<PlayerHand cards={playerHands[4]}  />
		</div>
		<div
			class="absolute left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2 grid grid-cols-5"
		>
			<PlayingCard details={playerHands.r1?.[0]}/>
			<PlayingCard details={playerHands.r2?.[0]}/>
			<PlayingCard details={playerHands.r3?.[0]}/>
			<PlayingCard details={playerHands.r4?.[0]}/>
			<PlayingCard details={playerHands.r5?.[0]}/>
		</div>


		<div class="absolute bottom-[5%] right-[23%] rotate-[-20deg]">
			<PlayerHand cards={playerHands[5]}  />
		</div>
		<div class="absolute bottom-[5%] left-[23%] rotate-[20deg]">
			<PlayerHand cards={playerHands[6]}  />
		</div>

		<div class="absolute bottom-[26%] left-0 rotate-[65deg]">
			<PlayerHand cards={playerHands[7]}  />
		</div>
		<div class="absolute top-[26%] left-0 rotate-[115deg]">
			<PlayerHand cards={playerHands[8]}  />
		</div>
	</div>
</div>
