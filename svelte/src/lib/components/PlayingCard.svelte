<script lang="ts">
	const { details }: {details?: {suit: string, rank: string}} = $props();
</script>
<img
	class="max-h-[15vh] max-w-[15vw] min-h-[4rem] inline h-full hover:scale-[150%] duration-300"
	src={details ?`/playingCards/fronts/${details.suit}_${details.rank}.svg` : `/playingCards/backs/red.svg`}
	alt={details? `${details.rank} of ${details.suit}`:`No card`}
/>
