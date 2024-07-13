<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import { interactivity } from '@threlte/extras';
	import { spring } from 'svelte/motion';
	import { CanvasTexture } from 'three';
	import { BackTexture } from '$lib/BackTexture.svelte';
	import type { CardDetails } from '$lib';
	const { invalidate } = useThrelte();
	const {
		position,
		rz,
		cardDetails
	}: { position: { z?: number; x?: number; y?: number }; rz?: number; cardDetails?: CardDetails } =
		$props();
	let lastWasCard = !!cardDetails;
	const scale = spring(0.5);
	const flipCard = spring(cardDetails ? 0 : Math.PI);

	interactivity();
	const frontCtx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
	const frontImg = new Image();
	frontImg.src = cardDetails
		? `playingCards/fronts/${cardDetails.suit}_${cardDetails.rank}.svg`
		: 'playingCards/other/blank_card.svg';
	frontImg.onload = () => {
		frontCtx.drawImage(frontImg, 0, 0);
		frontTexture!.needsUpdate = true;
	};
	frontCtx.canvas.width = 234;
	frontCtx.canvas.height = 333;
	let frontTexture = new CanvasTexture(frontCtx.canvas);

	$effect(() => {
		const frontImg = new Image();
		frontImg.src = cardDetails
			? `playingCards/fronts/${cardDetails.suit}_${cardDetails.rank}.svg`
			: 'playingCards/other/blank_card.svg';
			if(!cardDetails || lastWasCard)flipCard.set(Math.PI);
			lastWasCard = !!cardDetails;
		frontImg.onload = () => {
			frontCtx.drawImage(frontImg, 0, 0);
			flipCard.set(cardDetails ? 0 : Math.PI);
			frontTexture!.needsUpdate = true;
			invalidate();
		};
	});
	$effect(() => {
		return () => {
			if (frontCtx.canvas && document.contains(frontCtx.canvas))
				document.removeChild(frontCtx.canvas);
		};
	});
	let yPos = $state(position.y ?? 0);
	scale.subscribe((value) => {
		yPos = position.y ?? 0 + value;
	});
	$inspect(yPos)
</script>
<T.Mesh
	position={[position.x ?? 0,(position.y ?? 0) + $scale, position.z ?? 0]}
	rotation.y={rz ?? 0}
	rotation.z={$flipCard}
	scale={$scale}
	onpointerenter={() => scale.set(1)}
	onpointerleave={() => scale.set(0.5)}
	castShadow
	receiveShadow
>
	<T.BoxGeometry args={[2.34, 0.01, 3.33]}/>
	{#each [...Array(2).keys()] as index}
		<T.MeshBasicMaterial
			color="white"
			attach={(parent: { material: any[] }, self: any) => {
				if (Array.isArray(parent.material)) parent.material = [...parent.material, self];
				else parent.material = [self];
			}}
		/>
	{/each}
	<T.MeshBasicMaterial
		map={frontTexture}
		attach={(parent: { material: any[] }, self: any) => {
			if (Array.isArray(parent.material)) parent.material = [...parent.material, self];
			else parent.material = [self];
		}}
	/>
	<T.MeshBasicMaterial
		map={BackTexture.texture}
		attach={(parent: { material: any[] }, self: any) => {
			if (Array.isArray(parent.material)) parent.material = [...parent.material, self];
			else parent.material = [self];
		}}
	/>
	{#each [...Array(2).keys()] as index}
		<T.MeshBasicMaterial
			color="white"
			attach={(parent: { material: any[] }, self: any) => {
				if (Array.isArray(parent.material)) parent.material = [...parent.material, self];
				else parent.material = [self];
			}}
		/>
	{/each}
</T.Mesh>
