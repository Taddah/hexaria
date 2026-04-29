<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { initializeSocket } from '$lib/services/socket';
	import { onDestroy } from 'svelte';

	let { children } = $props();

	let socket = initializeSocket();
	onDestroy(() => socket.disconnect());
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
