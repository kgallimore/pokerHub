<script lang="ts">
	import { onMount } from 'svelte';

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

<div class="bg-slate-400">
	{#if data?.state}
		{#each data.state as item}
			<p>Connected: {item.connected}</p>
			<div class="grid grid-cols-{item.sensors.length}">
				{#each item.sensors as sensor}
					<div>
						{#if sensor.card}
							<img
								src={`/playingCards/fronts/${sensor.card.suit}_${sensor.card.card}.svg`}
								alt={`${sensor.card.card} of ${sensor.card.suit}`}
							/>
						{:else}
							<img src={`/playingCards/backs/red.svg`} alt={`No card`} />
						{/if}
					</div>
				{/each}
			</div>
		{/each}
	{/if}
	<h1>Welcome to SvelteKit</h1>
	<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
</div>
