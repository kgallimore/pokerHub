<script lang="ts">
import ThreeCard from './ThreeCard.svelte';
import {sliderValues} from '$lib/slider.svelte';

const { position, rz }: {position:{z:number,x:number}, rz:number} = $props();
</script>
<ThreeCard position={{x:position.x,y:.05,z:position.z}} rz={rz} />
<ThreeCard position={{x:position.x,y:.08,z:position.z}} rz={rz} />