<script lang="ts">
	import { onMount } from 'svelte';
	import Octagon from '$lib/components/OctagonTable.svelte';
	export let data;
	onMount(() => {
		setInterval(() => {
			fetch('/api/commPorts')
				.then((res) => res.json())
				.then((json) => {
					data = json;
				});
		}, 1000);
	});
</script>

<div class="w-[calc(100vw-(100vw-100%))] h-screen p-4 flex justify-center">
	<Octagon />
</div>

<div class="bg-slate-400 w-[calc(100vw-(100vw-100%))] h-screen">
	{#if data?.state}
		{#each data.state as item}
			<div class="grid grid-cols-{item.sensors.length}">
				{#each item.sensors as sensor}
					<div class="flex">
						{#each sensor.card as playingCard}
							{#if playingCard?.card}
								<img
									src={`/playingCards/fronts/${playingCard.suit}_${playingCard.card}.svg`}
									alt={`${playingCard.card} of ${playingCard.suit}`}
									class="drop-shadow hover:drop-shadow-2xl pt-4 px-1"
								/>
							{:else}
								<img src={`/playingCards/backs/red.svg`} alt={`No card`} />
							{/if}
						{/each}
					</div>
				{/each}
			</div>
		{/each}
	{/if}
</div>
