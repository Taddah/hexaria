<script lang="ts">
	import { getSocket } from '$lib/services/socket';

	let firstName = $state('');
	let lastName = $state('');
	let loading = $state(false);
	let error = $state('');

	let socket = getSocket();

	function handleSubmit() {
		if (!firstName.trim() || !lastName.trim()) {
			error = 'Veuillez renseigner prénom et nom.';
			return;
		}
		error = '';
		loading = true;
		socket.emit('create_character', { firstName, lastName });
		socket.once('character_created', (data) => {
			loading = false;
		});
		socket.once('character_error', (msg) => {
			loading = false;
			error = msg;
		});
	}
</script>

<main class="flex min-h-screen items-center justify-center bg-stone-900">
	<div
		class="flex w-[min(400px,90vw)] flex-col gap-6 rounded-md border border-stone-600 bg-stone-800 p-8"
	>
		<h1 class="text-center text-xl tracking-wider text-stone-100">⚔️ Entrez dans le monde</h1>

		<form onsubmit={handleSubmit} class="flex flex-col gap-4">
			<div class="flex flex-col gap-1">
				<label for="firstName" class="text-xs tracking-widest text-stone-400 uppercase"
					>Prénom</label
				>
				<input
					id="firstName"
					type="text"
					bind:value={firstName}
					placeholder="ex: Aldric"
					disabled={loading}
					class="rounded border border-stone-600 bg-stone-700 px-3 py-2 text-sm text-stone-100 transition-colors outline-none focus:border-amber-500 disabled:opacity-50"
				/>
			</div>

			<div class="flex flex-col gap-1">
				<label for="lastName" class="text-xs tracking-widest text-stone-400 uppercase">Nom</label>
				<input
					id="lastName"
					type="text"
					bind:value={lastName}
					placeholder="ex: Varen"
					disabled={loading}
					class="rounded border border-stone-600 bg-stone-700 px-3 py-2 text-sm text-stone-100 transition-colors outline-none focus:border-amber-500 disabled:opacity-50"
				/>
			</div>

			{#if error}
				<p class="text-center text-xs text-red-400">{error}</p>
			{/if}

			<button
				type="submit"
				disabled={loading}
				class="mt-2 rounded bg-amber-600 py-2 text-sm font-medium tracking-wide text-white transition-colors hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{loading ? 'Connexion...' : 'Entrer'}
			</button>
		</form>
	</div>
</main>
