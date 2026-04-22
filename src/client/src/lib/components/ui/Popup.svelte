<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, children, onClose }: { title: string; children: Snippet; onClose: () => void } = $props();

    function handleBackdropClick(e: MouseEvent) {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }
</script>

<div 
    class="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/60 shadow-2xl backdrop-blur-sm"
    onclick={handleBackdropClick}
    role="presentation"
>
	<div class="rounded-sm border-[4px] border-[#937c61] bg-[#1a1715] p-1 shadow-2xl min-w-[400px]">
		<div class="border-[1.5px] border-[#5a5043] bg-[#24211d] pt-3 pb-3 px-3 relative">
			
            <button 
                onclick={onClose} 
                class="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded bg-[#1c1917] text-[#a19688] border border-[#3e3831] hover:text-[#e6decb] hover:bg-[#3e3831] transition-all z-10"
            >
                ✖
            </button>

			<div class="text-center bg-[#1c1917] border border-[#3e3831] py-1 mb-5 rounded-sm shadow-inner relative mx-6 mt-1">
				<span class="text-[15px] font-bold tracking-widest text-[#cfc5b3] uppercase">{title}</span>
			</div>

			<div class="p-2">
				{@render children()}
			</div>

		</div>
	</div>
</div>
