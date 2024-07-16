<script lang="ts">
	import ThreeCard from './ThreeCard.svelte';
	import type { CardHand } from '$lib';
    import { T } from '@threlte/core';

	const { position, rz,cards }: { position: { z: number; x: number }; rz: number, cards?:CardHand } = $props();
</script>
<T.Group position={[position.x ?? 0,0, position.z ?? 0]} rotation.y={rz}
>
<ThreeCard position={{ x: -0.6, y: 0, z: 0 }} cardDetails={cards?.[0]} />
<ThreeCard position={{ x: 0.6, y: 0.02, z: 0 }} cardDetails={cards?.[1]} />
</T.Group>


<!-- <ThreeCard position={{x:position.x,y:.08,z:position.z}} rz={rz} /> -->
