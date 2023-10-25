<script lang="ts">
	import PlayingCard from './PlayingCard.svelte';
	import PlayerHand from './PlayerHand.svelte';
</script>

<div class="block min-w-[350px] h-full aspect-square">
	<div class="relative">
		<img
			src="/octagon.svg"
			alt="Hexagon poker table"
			class="relative h-full m-auto aspect-square"
		/>
		<div class="absolute top-5 left-1/2 transform -translate-x-1/2 h-[15%] rotate-180">
			<PlayerHand />
		</div>
		<div class="absolute top-[14%] left-[11%] rotate-[135deg] h-[15%]">
			<PlayerHand />
		</div>
		<div class="absolute top-[14%] right-[11%] rotate-[-135deg] h-[15%]">
			<PlayerHand />
		</div>
		<div class="absolute top-1/2 rotate-90 -translate-y-1/2 h-[15%]">
			<PlayerHand />
		</div>
		<div
			class="absolute left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2 grid grid-cols-5 h-[15%]"
		>
			<PlayingCard />
			<PlayingCard />
			<PlayingCard />
			<PlayingCard />
			<PlayingCard />
		</div>
		<div class="absolute top-1/2 right-0 -rotate-90 -translate-y-1/2 h-[15%]">
			<PlayerHand />
		</div>
		<div class="absolute bottom-[14%] left-[11%] rotate-45 h-[15%]">
			<PlayerHand />
		</div>
		<div class="absolute bottom-[14%] right-[11%] -rotate-45 h-[15%]">
			<PlayerHand />
		</div>
		<div class="absolute bottom-5 left-1/2 transform -translate-x-1/2 h-[15%]">
			<PlayerHand />
		</div>
	</div>

	<!-- <div
		class="grid grid-cols-5 h-full w-1/2 absolute top-1/2 left-1/2 -translate-x-[50%] -translate-y-[50%] items-center"
	>
		<div class="col-span-2" />
		<div class="flex justify-center">
			<slot name="0"
				><img
					class="max-h-[15vh] max-w-[15vw] w-[clamp(10rem, 2/5, 10vw)]"
					src={`/playingCards/backs/red.svg`}
					alt={`No card`}
				/></slot
			>
		</div>
		<div class="col-span-2" />
		<div />
		<div class="flex justify-center">
			<slot name="1"
				><img
					class="max-h-[15vh] max-w-[15vw] w-[clamp(10rem, 2/5, 10vw)]"
					src={`/playingCards/backs/red.svg`}
					alt={`No card`}
				/></slot
			>
		</div>
		<div />
		<div class="flex justify-center">
			<slot name="2"
				><img
					class="max-h-[15vh] max-w-[15vw] w-[clamp(10rem, 2/5, 10vw)]"
					src={`/playingCards/backs/red.svg`}
					alt={`No card`}
				/></slot
			>
		</div>
		<div />
		<div class="flex justify-center">
			<slot name="3"
				><img
					class="max-h-[15vh] max-w-[15vw] w-[clamp(10rem, 40%, 10vw)]"
					src={`/playingCards/backs/red.svg`}
					alt={`No card`}
				/></slot
			>
		</div>
		<div class="col-span-3">
			<img
				class="max-h-[15vh] max-w-[15vw] w-1/5 inline-block"
				src={`/playingCards/backs/red.svg`}
				alt={`No card`}
			/><img
				class="max-h-[15vh] max-w-[15vw] w-1/5 inline-block"
				src={`/playingCards/backs/red.svg`}
				alt={`No card`}
			/>
			<img
				class="max-h-[15vh] max-w-[15vw] w-1/5 inline-block"
				src={`/playingCards/backs/red.svg`}
				alt={`No card`}
			/>
			<img
				class="max-h-[15vh] max-w-[15vw] w-1/5 inline-block"
				src={`/playingCards/backs/red.svg`}
				alt={`No card`}
			/>
			<img
				class="max-h-[15vh] max-w-[15vw] w-1/5 inline-block"
				src={`/playingCards/backs/red.svg`}
				alt={`No card`}
			/>
		</div>

		<div class="flex justify-center">
			<slot name="4"
				><img
					class="max-h-[15vh] max-w-[15vw] w-[clamp(10rem, 2/5, 10vw)]"
					src={`/playingCards/backs/red.svg`}
					alt={`No card`}
				/></slot
			>
		</div>
		<div />

		<div class="flex justify-center">
			<slot name="5"
				><img
					class="max-h-[15vh] max-w-[15vw] w-[clamp(10rem, 2/5, 10vw)]"
					src={`/playingCards/backs/red.svg`}
					alt={`No card`}
				/></slot
			>
		</div>
		<div />

		<div class="flex justify-center">
			<slot name="6"
				><img
					class="max-h-[15vh] max-w-[15vw] w-[clamp(10rem, 2/5, 10vw)]"
					src={`/playingCards/backs/red.svg`}
					alt={`No card`}
				/></slot
			>
		</div>
		<div class="col-span-2" />
		<div class="flex justify-center">
			<slot name="7"
				><img
					class="max-h-[15vh] max-w-[15vw] w-[clamp(10rem, 2/5, 10vw)]"
					src={`/playingCards/backs/red.svg`}
					alt={`No card`}
				/></slot
			>
		</div>
		<div class="col-span-2" />
	</div> -->
</div>
