<script lang="ts">
	import { T } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';
	import ThreeCardHand from './components/ThreeCardHand.svelte';
	import { CanvasTexture } from 'three';
	import { onDestroy } from 'svelte';
	import {BackTexture} from "$lib/BackTexture.svelte";
	import type { TableCardDetails } from '$lib';
	import ThreeCard from './components/ThreeCard.svelte';
	const {playerHands}: {playerHands: TableCardDetails} = $props();

	
	const backCtx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
	const backImg = new Image();
	backImg.src = 'playingCards/backs/blue2.svg';
	backImg.onload = () => {
		backCtx.drawImage(backImg, 0, 0);
		BackTexture.texture!.needsUpdate = true;
	};
	backCtx.canvas.width = 234;
	backCtx.canvas.height = 333;
	BackTexture.texture = new CanvasTexture(backCtx.canvas);

	onDestroy(() => {
		if(backCtx.canvas&& document.contains(backCtx.canvas))document.removeChild(backCtx.canvas);
	});
	let rotation=$state(Math.PI*2);
	setInterval(()=>{
		rotation -=0.01;
	},1000/60);
</script>

<T.PerspectiveCamera
	makeDefault
	position={[0, 15, 0]}
	oncreate={({ ref }: { ref: any }) => {
		ref.lookAt(0, 1, 0);
	}}
>
	<OrbitControls enableZoom={true} /></T.PerspectiveCamera
>
<T.DirectionalLight position={[20, 20, 20]} castShadow />
<T.DirectionalLight position={[-20, 20, 20]} castShadow />

<T.Mesh rotation.y={Math.PI/8} position={[0, -0.1, 0]} receiveShadow>
	<T.CylinderGeometry args={[5, 5, 0.1, 8]} />
	<T.MeshStandardMaterial color="green" />
</T.Mesh>

<ThreeCard position={{ x: -2.4, z: 0 }} rz={Math.PI} cardDetails={playerHands?.r1?.[0]}/>
<ThreeCard position={{ x: -1.2, z: 0 }} rz={Math.PI} cardDetails={playerHands?.r2?.[0]}/>
<ThreeCard position={{ x: 0, z: 0 }} rz={Math.PI} cardDetails={playerHands?.r3?.[0]}/>
<ThreeCard position={{ x: 1.2, z: 0 }} rz={Math.PI} cardDetails={playerHands?.r4?.[0]}/>
<ThreeCard position={{ x: 2.4, z: 0 }} rz={Math.PI} cardDetails={playerHands?.r5?.[0]}/>

<ThreeCardHand position={{ x: -1.5, z: -3.75 }} rz={Math.PI/8} cards={playerHands?.[1]}/>
<ThreeCardHand position={{ x: 1.5, z: -3.75 }} rz={-Math.PI/8} cards={playerHands?.[2]}/>
<ThreeCardHand position={{ x: 3.75, z: -1.5 }} rz={-Math.PI/8*3} cards={playerHands?.[3]}/>
<ThreeCardHand position={{ x: 3.75, z: 1.5 }} rz={Math.PI/8*3} cards={playerHands?.[4]}/>
<ThreeCardHand position={{ x: 1.5, z: 3.75 }} rz={Math.PI/8} cards={playerHands?.[5]}/>
<ThreeCardHand position={{ x: -1.5, z: 3.75 }} rz={-Math.PI/8} cards={playerHands?.[6]}/>
<ThreeCardHand position={{ x: -3.75, z: 1.5 }} rz={-Math.PI/8*3} cards={playerHands?.[7]}/>
<ThreeCardHand position={{ x: -3.75, z: -1.5 }} rz={Math.PI/8*3} cards={playerHands?.[8]}/>