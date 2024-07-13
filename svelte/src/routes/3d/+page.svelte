<script lang="ts">
	import Scene from '$lib/Scene.svelte';
	  import { Environment } from '@threlte/extras'
	import { Canvas } from '@threlte/core';
	import type { CardsResponse, SensorsResponse, TypedPocketBase } from '$lib/pocketbase-types';
	import PocketBase from 'pocketbase';
	import { PUBLIC_PB_URL } from '$env/static/public';
	import type { TableCardDetails } from '$lib';
	import { NeutralToneMapping } from 'three';
	let { data } = $props();
	let sensorList = $state(data.sensors);
	let pb: TypedPocketBase | null;
	$effect(() => {
		pb = new PocketBase(PUBLIC_PB_URL) as TypedPocketBase;
		pb.authStore.loadFromCookie(document.cookie || '');
		pb.collection('Sensors').subscribe<SensorsResponse<{ cards: CardsResponse[] }>>(
			'*',
			(read) => {
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
			},
			{ expand: 'cards' }
		);
		if (sensorList.length === 0 && pb) {
			pb.collection('Sensors').getFullList({ expand: 'cards' });
		}
		return pb.collection('Sensors').unsubscribe;
	});

	let tableCardDetails = $derived.by(() => {
		let outputArray: TableCardDetails = {};
		for (let i = 0; i < 8; i++) {
			const cards = sensorList[i]?.expand?.cards;
			if (cards && sensorList[i].position != null) {
				outputArray[sensorList[i].position] = [cards[0], cards[1]];
			}
		}
		return outputArray;
	});
</script>

<div class="h-screen w-screen">
	<Canvas shadows={true} toneMapping={NeutralToneMapping} >
		<Environment
		path="/"
		files="blue_photo_studio_2k.hdr"
		isBackground={true}
		groundProjection={{ radius:100, height:1, scale: [100, 100, 100] }}
	  />
		<Scene playerHands={tableCardDetails} />
	</Canvas>
</div>
