<script lang="ts">
  import Scene from '$lib/Scene.svelte'
  import { Canvas } from '@threlte/core'
  import {sliderValues} from '$lib/slider.svelte';

</script>
<div class="h-screen w-screen ">
  <input type="range" class="range w-full z-50" min="-360" max=360 step="1" bind:value={sliderValues[0]}>
  <input type="range" class="range w-full z-50" min="-100" max=100 step="1" bind:value={sliderValues[1]}>

  {sliderValues[0]}
  {sliderValues[1]}

    <Canvas >
        <Scene />
      </Canvas>
</div>
