<script lang="ts">
	import { T,useLoader } from '@threlte/core';
	import { interactivity } from '@threlte/extras';
	import { spring } from 'svelte/motion';
	import { Shape, TextureLoader  } from 'three';
    const { position, rz }: {position:{z:number,x:number,y:number}, rz:number} = $props();
	const scale = spring(.5);
	interactivity();

	const shape = new Shape();
	const length = 3,
		width = 2;
	shape.moveTo(-length/2, -width/2 -0.1);
	shape.lineTo(-length/2, width/2 - 0.1);
	shape.arc(0.1, 0, 0.1, Math.PI, Math.PI / 2, true);
	shape.lineTo(length/2 - 0.1, width/2);
	shape.arc(0, -0.1, 0.1, Math.PI / 2, Math.PI * 2, true);
	shape.lineTo(length/2, -width/2 -0.1);
	shape.arc(-0.1, 0, 0.1, 0, -Math.PI / 2, true);
	shape.lineTo(-length/2+0.1, -width/2-0.2);
	shape.arc(0, 0.1, 0.1, -Math.PI / 2, Math.PI, true);
	const extrudeSettings = {
		steps: 1,
		depth: 0.01,
		bevelEnabled: false
	};
    const backTexture = useLoader(TextureLoader).load('playingCards/pcback.jpg')
</script>
{#await backTexture then value}
<T.Mesh rotation.x={-Math.PI / 2} rotation.z={rz} position={[position.x,position.y,position.z]} scale={$scale} 	onpointerenter={() => scale.set(1)}
	onpointerleave={() => scale.set(.5)} castShadow>
	<T.ExtrudeGeometry args={[shape, extrudeSettings]} />
	<T.MeshBasicMaterial map={value} />
</T.Mesh>
{/await}
