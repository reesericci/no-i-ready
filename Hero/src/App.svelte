<script lang="ts">
	export { text, strikethrough };
	import { onMount, afterUpdate, tick } from 'svelte';
	import { fly } from 'svelte/transition'
	import sleep from 'ko-sleep'
	
	let text = [];
	let strikethrough = []
	let currentStrike = false;


	const strikethoughSet = new Set()
	let currentIndex = 0;

	onMount(() => {
		strikethrough.forEach((el) => {
			strikethoughSet.add(el)
		})

		let interval = setInterval(updateText, 2000)

		if(strikethoughSet.has(text[currentIndex])) {
			currentStrike = true;
		} else {
			currentStrike = false;
		}
	});
		
	function updateText() {
		if(currentIndex == text.length - 1) {
			currentIndex = 0;
		} else { 
			currentIndex += 1
		}
	}

	$: if(strikethoughSet.has(text[currentIndex])) {
			currentStrike = true;
		} else {
			currentStrike = false;
		}
</script>


<main>
	<h1>
	say NO to	
	</h1>
	{#key currentIndex}
		<h1 class:currentStrike id="animatedText" in:fly="{{ delay: 500, x: -1000, duration: 500, opacity: 1}}" out:fly="{{ x: 1000, duration: 500, opacity: 1}}">
			{text[currentIndex]}
		</h1>
	{/key}
</main>

<style>
	@import url('https://fonts.cdnfonts.com/css/neue-haas-grotesk-text-pro');
	main {
			height: 100vh;
			width: 100vw;
			position: relative;
	}
	main, h1 {
			font-size: 20vw;
			font-family: 'Neue Haas Grotesk Text Pro';
			font-weight: 700;
			color: #FF0000;
			margin-left: 5px;
			text-align: center;
	}

	.currentStrike {
		text-decoration: line-through;
	}

	@media only screen and (max-width: 800px) {
			main {
					visibility: hidden;
					height: inherit;
			}
			main, h1 {
					visibility: visible;
			}
	} 
</style>