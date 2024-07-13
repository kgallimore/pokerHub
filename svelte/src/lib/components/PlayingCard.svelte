<script lang="ts">
	const { details }: { details?: { suit: string; rank: string } } = $props();
	let prevDetails = $state(details);
	let showFace = $state(!!details);
	$effect(() => {
		if (details === prevDetails) return;
		if (details) {
			prevDetails = details;
			showFace = !!prevDetails;
		} else if (prevDetails) {
			showFace = false;
			setTimeout(() => {
			prevDetails = details;
		}, 300);
		}
	});
</script>

<div class="perspective-1000">
	<div
		class="relative h-[7vh] w-[5vw] min-w-[3.75rem] min-h-[5.25rem] aspect-[2.5/3.5] transform-style-3d duration-500"
		class:rotate-y-180={showFace}
	>
		<div class="absolute backface-hidden">
			<img class="w-full h-full" src={`/playingCards/backs/red.svg`} alt="Test" />
		</div>
		<div class="absolute backface-hidden rotate-y-180">
			<img
				class="h-full w-full"
				src={prevDetails
					? `/playingCards/fronts/${prevDetails.suit}_${prevDetails.rank}.svg`
					: `/playingCards/backs/red.svg`}
				alt={prevDetails ? `${prevDetails.rank} of ${prevDetails.suit}` : `No card`}
			/>
		</div>
	</div>
</div>
