<script lang="ts">
	import type { TileData, EntityDTO } from '$lib/stores/gameStore';

	let { displayedHex, playersOnHex }: { displayedHex: TileData | null | undefined, playersOnHex: EntityDTO[] } = $props();

    function formatBiome(type: string | undefined) {
        if (!type) return 'Inconnu';
        switch (type) {
            case 'WATER': return 'Eau 💧';
            case 'PLAINS': return 'Plaine 🌾';
            case 'FOREST': return 'Forêt 🌲';
            case 'MOUNTAIN': return 'Montagne ⛰️';
            default: return type;
        }
    }
</script>

<div class="pointer-events-auto absolute top-0 left-1/2 -translate-x-1/2 h-12 z-20 flex items-center">
	<div class="rounded-b-[1.5rem] border-b-[3px] border-l-[3px] border-r-[3px] border-[#695d4e] bg-[#1a1715]/95 shadow-md flex px-8 h-full items-center gap-6 text-[#cfc5b3] text-[14px] whitespace-nowrap backdrop-blur-md">
        {#if displayedHex}
            <div class="font-bold text-[#e1d5c2] tracking-wider">
                Hex [{displayedHex.q}, {displayedHex.r}]
            </div>
            
            <div class="w-px h-6 bg-[#4a433a] opacity-50"></div>

            <div class="flex gap-2 items-center">
                <span class="text-[#938a7c]">Biome :</span> 
                <span class="font-semibold text-[#cfc5b3]">{formatBiome(displayedHex.type)}</span>
            </div>

            {#if displayedHex.resource && displayedHex.resource.amount > 0}
                <div class="w-px h-6 bg-[#4a433a] opacity-50"></div>
                <div class="flex gap-2 items-center">
                    <span class="text-[#938a7c]">Ressource :</span> 
                    <span class="font-semibold text-[#cfc5b3]">
                        {displayedHex.resource.amount} {displayedHex.resource.type === 'wood' ? 'Bois 🌲' : 'Fer ⛏️'}
                    </span>
                </div>
            {/if}

            <div class="w-px h-6 bg-[#4a433a] opacity-50"></div>

            <div class="flex gap-2 items-center">
                <span class="text-[#938a7c]">Joueurs :</span>
                <span class="font-semibold text-[#e1d5c2]">
                    {#if playersOnHex.length === 0}
                        0
                    {:else}
                        {playersOnHex.map(p => p.identity.name).join(', ')}
                    {/if}
                </span>
            </div>
        {:else}
            <div class="italic text-[#938a7c]">Aucun hexagone ciblé</div>
        {/if}
	</div>
</div>
