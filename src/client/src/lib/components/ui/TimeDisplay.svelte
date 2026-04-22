<script lang="ts">
	let { year }: { year: number } = $props();
</script>

<div class="pointer-events-auto absolute right-6 top-5 flex h-[46px] min-w-[150px] items-center justify-center rounded-full bg-[#1c1917] border-[3px] border-[#5e5345] shadow-[0_4px_10px_rgba(0,0,0,0.5)] px-6 z-20">
	<span class="text-[17px] font-semibold tracking-wider text-[#e6decb]">Année {year}</span>
</div>
