<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { supabase } from '$lib/services/supabaseClient';
	import { setSession } from '$lib/stores/authState.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { disconnectSocket } from '$lib/services/socket';
	import { onDestroy } from 'svelte';

	let { children } = $props();

	onMount(async () => {
		const {
			data: { session }
		} = await supabase.auth.getSession();
		setSession(session);

		if (!session && window.location.pathname !== '/login') {
			goto('/login');
		}

		supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
			if (!session) {
				disconnectSocket();
				goto('/login');
			}
		});
	});

	onDestroy(() => {
		disconnectSocket();
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
