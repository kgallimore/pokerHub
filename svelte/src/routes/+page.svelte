<script lang="ts">
	import OctagonTable from '$lib/components/OctagonTable.svelte';
	import type { CardsResponse, SensorsResponse, TypedPocketBase } from '$lib/pocketbase-types';
	import PocketBase from 'pocketbase';
	import { PUBLIC_PB_URL } from '$env/static/public';
	import type { TableCardDetails } from '$lib';
	let { data } = $props();
	let sensorList = $state(data.sensors);
	let pb: TypedPocketBase | null;
	$effect(() => {
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
		}, {expand: 'cards'}).then(async () => {
			if(sensorList.length === 0 && pb){
				sensorList = await pb.collection('Sensors').getFullList({expand: 'cards'});
			}
		})
		return ()=>{pb?.collection('Sensors').unsubscribe()};
	});

	let tableCardDetails = $derived.by(()=>{
		let outputArray: TableCardDetails = {};
		for(let i = 0; i < 8; i++){
			const cards = sensorList[i]?.expand?.cards;
			if(cards && sensorList[i].position != null){
				outputArray[sensorList[i].position] = [cards[0], cards[1]];
			}
		}
		return outputArray;
	});
</script>

<div class="w-[calc(100vw-(100vw-100%))] h-screen md:p-20 p-4 flex justify-center overflow-hidden">
	<OctagonTable playerHands={tableCardDetails} />
</div>
