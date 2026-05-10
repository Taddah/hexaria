<script lang="ts">
	import { authState } from '$lib/stores/authState.svelte';
	import { initializeSocket, getSocket, isSocketInitialized } from '$lib/services/socket';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import LegacyMenu from '$lib/components/ui/panels/LegacyMenu.svelte';

	let firstName = $state('');
	let lastName = $state('');
	let loading = $state(true);
	let error = $state('');
	let hasCharacter = $state(false);
	let existingFirstName = $state('');
	let existingLastName = $state('');
	let showLegacyMenu = $state(false);

	onMount(() => {
		if (!authState.session) {
			goto('/login');
			return;
		}

		try {
			if (!isSocketInitialized()) {
				initializeSocket();
			}
			const socket = getSocket();

			socket.emit('get_character');

			socket.on(
				'character_info',
				(data: { hasCharacter: boolean; firstName?: string; lastName?: string }) => {
					hasCharacter = data.hasCharacter;
					if (data.firstName) existingFirstName = data.firstName;
					if (data.lastName) existingLastName = data.lastName;
					loading = false;
				}
			);

			socket.on('character_error', (msg: string) => {
				error = msg;
				loading = false;
			});
		} catch (err) {
			console.error('[CHARACTER] Failed to initialize socket:', err);
			error = 'Impossible de se connecter au serveur.';
			loading = false;
		}
	});

	function handleCreate() {
		if (!firstName.trim() || !lastName.trim()) {
			error = 'Veuillez renseigner prénom et nom.';
			return;
		}
		error = '';
		loading = true;
		const socket = getSocket();
		socket.emit('create_character', { firstName: firstName.trim(), lastName: lastName.trim() });
	}

	function handleJoin() {
		loading = true;
		error = '';
		const socket = getSocket();
		socket.emit('join_game');
	}
</script>

<svelte:head>
	<title>Hexaria — Personnage</title>
</svelte:head>

<main class="flex min-h-screen items-center justify-center bg-[var(--color-bg-dark)] p-4">
	<div
		class="flex w-[min(420px,90vw)] flex-col gap-6 rounded-lg border border-[var(--color-gold-dark)] bg-[var(--color-bg-panel)] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
	>
		<!-- Header -->
		<div class="flex flex-col items-center gap-1">
			<span class="text-4xl">⚔️</span>
			<h1 class="m-0 font-serif text-2xl font-bold tracking-[0.15em] text-[var(--color-gold)]">
				Hexaria
			</h1>
		</div>

		{#if loading}
			<!-- Loading -->
			<div class="flex flex-col items-center gap-2 py-8">
				<span class="animate-pulse text-2xl">⏳</span>
				<p class="m-0 font-serif text-[0.85rem] text-[var(--color-text-muted)]">Chargement…</p>
			</div>
		{:else if hasCharacter}
			<!-- Existing character -->
			<div class="flex flex-col items-center gap-2 py-4">
				<p class="m-0 font-serif text-[0.85rem] text-[var(--color-text-muted)]">Bienvenue,</p>
				<p
					class="m-0 font-serif text-xl font-bold text-[var(--color-text-light)] [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]"
				>
					{existingFirstName}
					{existingLastName}
				</p>
				<button
					type="button"
					onclick={handleJoin}
					class="mt-2 w-full cursor-pointer rounded border-none bg-gradient-to-br from-[var(--color-gold-dark)] to-[var(--color-gold)] py-[0.7rem] font-serif text-[0.9rem] font-semibold tracking-[0.05em] text-[var(--color-bg-dark)] transition-all duration-200 hover:-translate-y-px hover:opacity-90 active:translate-y-0"
				>
					Jouer
				</button>
			</div>
		{:else}
			<!-- Create character form -->
			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleCreate();
				}}
				class="flex flex-col gap-4"
			>
				<div class="flex flex-col gap-1">
					<label
						for="char-first-name"
						class="font-serif text-[0.7rem] tracking-[0.1em] text-[var(--color-text-muted)] uppercase"
					>
						Prénom
					</label>
					<input
						id="char-first-name"
						type="text"
						bind:value={firstName}
						placeholder="ex: Aldric"
						class="rounded border border-[var(--color-border-btn)] bg-[var(--color-bg-btn)] px-3 py-2 text-sm text-[var(--color-text-light)] transition-colors duration-200 outline-none focus:border-[var(--color-gold)]"
					/>
				</div>

				<div class="flex flex-col gap-1">
					<label
						for="char-last-name"
						class="font-serif text-[0.7rem] tracking-[0.1em] text-[var(--color-text-muted)] uppercase"
					>
						Nom
					</label>
					<input
						id="char-last-name"
						type="text"
						bind:value={lastName}
						placeholder="ex: Varen"
						class="rounded border border-[var(--color-border-btn)] bg-[var(--color-bg-btn)] px-3 py-2 text-sm text-[var(--color-text-light)] transition-colors duration-200 outline-none focus:border-[var(--color-gold)]"
					/>
				</div>

				{#if error}
					<p class="m-0 text-center text-xs text-[var(--color-hp)]" role="alert">{error}</p>
				{/if}

				<button
					type="submit"
					class="mt-2 w-full cursor-pointer rounded border-none bg-gradient-to-br from-[var(--color-gold-dark)] to-[var(--color-gold)] py-[0.7rem] font-serif text-[0.9rem] font-semibold tracking-[0.05em] text-[var(--color-bg-dark)] transition-all duration-200 hover:-translate-y-px hover:opacity-90 active:translate-y-0"
				>
					Créer et jouer
				</button>
			</form>
		{/if}

		{#if error && !loading && hasCharacter}
			<p class="m-0 text-center text-xs text-[var(--color-hp)]" role="alert">{error}</p>
		{/if}

		<div class="mt-4 flex justify-center border-t border-[var(--color-gold-dark)] pt-6">
			<button
				type="button"
				class="cursor-pointer border-none bg-transparent p-0 font-serif text-sm tracking-wider text-[var(--color-text-muted)] uppercase transition-colors hover:text-[var(--color-gold)]"
				onclick={() => {
					showLegacyMenu = true;
				}}
			>
				Ouvrir le livre des morts
			</button>
		</div>
	</div>

	{#if showLegacyMenu}
		<LegacyMenu onClose={() => (showLegacyMenu = false)} />
	{/if}
</main>
