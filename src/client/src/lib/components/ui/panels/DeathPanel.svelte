<script lang="ts">
    import { getSocket } from '$lib/services/socket';
    import { goto } from '$app/navigation';
    import { resetGameState } from '$lib/stores/gameState.svelte';
    import { onMount, onDestroy } from 'svelte';

    const socket = getSocket();

    let dead = $state(false);
    let deathData = $state<any>(null);

    function onDeath(data: any) {
        deathData = data;
        dead = true;
    }

    onMount(() => {
        socket.on('character:death', onDeath);
    });

    onDestroy(() => {
        socket.off('character:death', onDeath);
    });

    function handleReturn() {
        resetGameState();
        goto('/login');
    }
</script>

{#if dead && deathData}
    <div class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black text-white transition-opacity duration-1000">
        <div class="max-w-2xl text-center space-y-8 p-8 border border-[var(--color-gold-dark)] bg-[var(--color-bg-dark)] rounded-lg shadow-[0_0_50px_rgba(212,175,55,0.1)]">
            <h1 class="text-4xl font-bold tracking-widest uppercase text-red-600 mb-2" style="font-family: var(--font-serif);">Vous êtes mort</h1>
            
            <p class="text-xl italic text-neutral-400">
                Fauché à l'âge de {deathData.age} ans.
            </p>
            
            <div class="w-full h-px bg-gradient-to-r from-transparent via-[var(--color-gold-dark)] to-transparent opacity-50"></div>
            
            <div class="text-lg leading-relaxed text-neutral-300 whitespace-pre-wrap" style="font-family: var(--font-serif);">
                {deathData.lifeSummary}
            </div>

            <div class="pt-8">
                <button
                    onclick={handleReturn}
                    class="px-8 py-3 text-lg border border-[var(--color-gold-dark)] rounded transition-all hover:bg-[var(--color-gold-dark)]/20 hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] text-[var(--color-gold)] font-bold tracking-wider uppercase cursor-pointer"
                >
                    Accepter son sort
                </button>
            </div>
        </div>
    </div>
{/if}
