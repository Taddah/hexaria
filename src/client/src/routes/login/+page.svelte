<script lang="ts">
	import { signIn, signUp } from '$lib/services/supabaseClient';
	import { setSession } from '$lib/stores/authState.svelte';
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let error = $state('');
	let mode = $state<'login' | 'signup'>('login');

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!email.trim() || !password.trim()) {
			error = 'Veuillez remplir tous les champs.';
			return;
		}
		error = '';
		loading = true;

		try {
			const data = mode === 'login' ? await signIn(email, password) : await signUp(email, password);
			if (data.session) {
				setSession(data.session);
				goto('/');
			} else {
				error = 'Vérifiez votre email pour confirmer votre inscription.';
			}
		} catch (err: unknown) {
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'Une erreur est survenue.';
			}
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Hexaria — Connexion</title>
</svelte:head>

<main class="flex min-h-screen items-center justify-center bg-[var(--color-bg-dark)] p-4">
	<div
		class="flex w-[min(400px,90vw)] flex-col gap-6 rounded-lg border border-[var(--color-gold-dark)] bg-[var(--color-bg-panel)] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
	>
		<!-- Header -->
		<div class="flex flex-col items-center gap-1">
			<span class="text-4xl">⚔️</span>
			<h1 class="m-0 font-serif text-2xl font-bold tracking-[0.15em] text-[var(--color-gold)]">
				Hexaria
			</h1>
			<p class="m-0 font-serif text-[0.8rem] text-[var(--color-text-muted)]">
				{mode === 'login' ? 'Connectez-vous pour jouer' : 'Créez votre compte'}
			</p>
		</div>

		<!-- Form -->
		<form onsubmit={handleSubmit} class="flex flex-col gap-4">
			<div class="flex flex-col gap-1">
				<label
					for="email"
					class="font-serif text-[0.7rem] tracking-[0.1em] text-[var(--color-text-muted)] uppercase"
				>
					Email
				</label>
				<input
					id="email"
					type="email"
					autocomplete="email"
					bind:value={email}
					disabled={loading}
					class="rounded border border-[var(--color-border-btn)] bg-[var(--color-bg-btn)] px-3 py-2 text-sm text-[var(--color-text-light)] transition-colors duration-200 outline-none focus:border-[var(--color-gold)] disabled:opacity-50"
				/>
			</div>

			<div class="flex flex-col gap-1">
				<label
					for="password"
					class="font-serif text-[0.7rem] tracking-[0.1em] text-[var(--color-text-muted)] uppercase"
				>
					Mot de passe
				</label>
				<input
					id="password"
					type="password"
					autocomplete={mode === 'login' ? 'current-password' : 'new-password'}
					bind:value={password}
					disabled={loading}
					class="rounded border border-[var(--color-border-btn)] bg-[var(--color-bg-btn)] px-3 py-2 text-sm text-[var(--color-text-light)] transition-colors duration-200 outline-none focus:border-[var(--color-gold)] disabled:opacity-50"
				/>
			</div>

			{#if error}
				<p class="m-0 text-center text-xs text-[var(--color-hp)]" role="alert">{error}</p>
			{/if}

			<button
				type="submit"
				disabled={loading}
				class="mt-2 cursor-pointer rounded border-none bg-gradient-to-br from-[var(--color-gold-dark)] to-[var(--color-gold)] py-[0.6rem] font-serif text-sm font-semibold tracking-[0.05em] text-[var(--color-bg-dark)] transition-opacity duration-200 hover:not-disabled:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{#if loading}
					Chargement…
				{:else if mode === 'login'}
					Se connecter
				{:else}
					Créer un compte
				{/if}
			</button>
		</form>

		<!-- Mode toggle -->
		<button
			type="button"
			class="cursor-pointer border-none bg-transparent p-0 font-serif text-xs text-[var(--color-text-muted)] underline underline-offset-2 transition-colors duration-200 hover:text-[var(--color-gold)]"
			onclick={() => {
				mode = mode === 'login' ? 'signup' : 'login';
				error = '';
			}}
		>
			{mode === 'login' ? 'Pas de compte ? Créer un compte' : 'Déjà un compte ? Se connecter'}
		</button>
	</div>
</main>
