<script lang="ts">
	import { T} from '@threlte/core';
	import { OrbitControls  } from '@threlte/extras';
    import ThreeCardHand from './components/ThreeCardHand.svelte';
	import {sliderValues} from '$lib/slider.svelte';

</script>

<T.PerspectiveCamera
	makeDefault
	position={[10, 10, 0]}
	oncreate={({ ref }: { ref: any }) => {
		ref.lookAt(0, 1, 0);
	}}
>  <OrbitControls
enableZoom={true}
/></T.PerspectiveCamera>
<T.DirectionalLight position={[0, 10, 10]} castShadow />

<T.Mesh position={[0, -0.1, 0]} receiveShadow>
	<T.CylinderGeometry args={[5, 5, 0.1, 6]} />
	<T.MeshStandardMaterial color="green" />
</T.Mesh>

<ThreeCardHand position={{x:-3.25,z:2}} rz={-5*(Math.PI/6)} />
<ThreeCardHand position={{x:0,z:4}} rz={-(Math.PI/2)} />
<ThreeCardHand position={{x:3.25,z:2}} rz={-(Math.PI/6)} />
<!--Bottom Right-->
<ThreeCardHand position={{x:3.25,z:-2}} rz={Math.PI/6} />
<ThreeCardHand position={{x:0,z:-4}} rz={Math.PI/2} />
<ThreeCardHand position={{x:-3.25,z:-2}} rz={5*(Math.PI/6)} />
