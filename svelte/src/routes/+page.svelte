<script lang="ts">
	import type { PageData } from './$types';
	import { onDestroy, onMount } from 'svelte';
	import OctagonTable from '$lib/components/OctagonTable.svelte';
	import type { CardsResponse, SensorsResponse, TypedPocketBase } from '$lib/pocketbase-types';
	import PocketBase from 'pocketbase';
	import { PUBLIC_PB_URL } from '$env/static/public';
	import type { CardDetails, CardHand, TableCardDetails } from '$lib';
	let { data } = $props();
	let sensorList = $state(data.sensors);
	let pb: TypedPocketBase | null;
	onMount(() => {
		pb = new PocketBase(PUBLIC_PB_URL) as TypedPocketBase;
		pb.authStore.loadFromCookie(document.cookie || '');
		pb.collection('Sensors').subscribe<SensorsResponse<{cards:CardsResponse[]}>>('*', (read) => {
			switch (read.action) {
				case 'create':
					sensorList.push(read.record);
					break;
				case 'update':
					const index = sensorList.findIndex((sensor) => sensor.id === read.record.id);
					sensorList[index] = read.record;
					break;
				case 'delete':
					sensorList = sensorList.filter((sensor) => sensor.id !== read.record.id);
					break;
				default:
					throw 'Unknown action type';
			}
		}, {expand: 'cards'});
	});
	onDestroy(() => {
		pb?.collection('Sensors').unsubscribe();
	});
	let tableCardDetails = $derived.by(()=>{
		let outputArray: Array<CardHand> = [];
		for(let i = 0; i < 8; i++){
			const cards = sensorList[i]?.expand?.cards;
			if(cards){
				outputArray.push([cards[0], cards[1]] as CardHand);
			}else{
				outputArray.push([]);
			}
		}
		return outputArray as TableCardDetails['playerHands'];
	});
</script>

<div class="w-[calc(100vw-(100vw-100%))] h-screen p-4 flex justify-center">
	<OctagonTable playerHands={tableCardDetails} />
</div>
{#each sensorList as sensor}
	Sensor: {sensor.id}
	<br>
	{#if sensor.expand}
		{#each sensor.expand.cards as card}
		{card.rank} of {card.suit} 
			<br>
		{/each}
	{/if}
	<!-- {#each sensor.cards as card}
		Card: {card}
	{/each} -->
{/each}
<!-- <div class="bg-slate-400 w-[calc(100vw-(100vw-100%))] h-screen">
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
</div> -->
