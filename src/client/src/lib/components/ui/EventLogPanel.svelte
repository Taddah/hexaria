<script lang="ts">
    import { eventsStore } from '$lib/services/eventService';

    let container: HTMLDivElement | undefined = $state();

    $effect(() => {
        // Trigger effect on eventsStore change
        const _ = $eventsStore.length; 
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    });

    function formatTime(d: Date) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
</script>

<div class="pointer-events-auto absolute bottom-6 right-6 w-[400px] h-48 z-20">
	<div class="h-full rounded-md border border-[#4a433a] bg-[#1a1715]/95 shadow-[0_8px_30px_rgba(0,0,0,0.7)] backdrop-blur-md ring-1 ring-[#695d4e] ring-inset p-[1px] flex flex-col">
		<div class="bg-[#24211d]/90 border-b border-[#3e3831] px-3 py-1.5 flex items-center justify-between shadow-inner rounded-t-sm">
            <span class="text-[12px] font-bold tracking-widest text-[#cfc5b3] uppercase drop-shadow-md">Logs du monde</span>
        </div>
        <div bind:this={container} class="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5 text-[12px] custom-scrollbar">
            {#each $eventsStore as ev}
                <div class="text-[#a19688] leading-tight">
                    <span class="text-[#8c7a65] font-mono opacity-80">[{formatTime(ev.timestamp)}]</span> 
                    <span class="ml-1 text-[#dcd1c4]">{ev.text}</span>
                </div>
            {/each}
            {#if $eventsStore.length === 0}
                <div class="text-[#73685a] italic text-center mt-auto mb-auto">Aucun évènement enregistré...</div>
            {/if}
        </div>
	</div>
</div>

<style>
    .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #4a433a;
        border-radius: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #5a5043;
    }
</style>
