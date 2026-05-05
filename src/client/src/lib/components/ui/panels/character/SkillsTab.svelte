<script lang="ts">
	import { gameState } from '$lib/stores/gameState.svelte';
	import { getSkillName, getSkillTitle, SKILL_LIST, SKILL_TITLES } from '$shared';

	let skills = $derived(gameState.localPlayer?.skills ?? {});

	// Seuils pour la barre de progression (xp max du palier suivant)
	const THRESHOLDS = [1, 5, 15, 40, 100, 250, Infinity];

	function getProgress(xp: number): { current: number; max: number } {
		const STEPS = [0, 1, 5, 15, 40, 100, 250];
		const i = STEPS.findLastIndex((t) => xp >= t);
		const from = STEPS[i] ?? 0;
		const to = STEPS[i + 1] ?? STEPS[i];
		if (to === from) return { current: 1, max: 1 }; // légende, barre pleine
		return { current: xp - from, max: to - from };
	}

	// Regrouper par catégorie — en dur pour l'instant
	const CATEGORIES: Record<string, SKILL_LIST[]> = {
		Récolte: [SKILL_LIST.WOODCUTTING, SKILL_LIST.MINING],
		Physique: [SKILL_LIST.ATHLETICS]
	};

	// Skills connus (dans SKILL_TITLES) présents dans les données joueur
	const knownSkills = Object.keys(SKILL_TITLES);
</script>

<div class="flex flex-col gap-4">
	{#each Object.entries(CATEGORIES) as [category, skillKeys]}
		{@const visibleSkills = skillKeys.filter((k) => skills[k])}
		{#if visibleSkills.length}
			<div class="flex flex-col gap-2">
				<p
					class="text-xs font-bold tracking-widest uppercase"
					style="color: var(--color-gold-dark); font-family: var(--font-serif);"
				>
					{category}
				</p>

				{#each visibleSkills as skillKey}
					{@const data = skills[skillKey]}
					{@const title = getSkillTitle(skillKey, data.xp)}
					{@const progress = getProgress(data.xp)}
					<div class="flex flex-col gap-1">
						<div class="flex items-center justify-between">
							<span class="text-xs" style="color: var(--color-text-light);"
								>{getSkillName(skillKey)}</span
							>
							<span class="text-xs font-bold" style="color: var(--color-gold);">{title}</span>
						</div>
						<div
							class="h-1.5 w-full overflow-hidden rounded-full"
							style="background: var(--color-bg-dark);"
						>
							<div
								class="h-full rounded-full transition-all"
								style="width: {(progress.current / progress.max) *
									100}%; background: var(--color-gold-dark);"
							></div>
						</div>
						<div class="flex justify-between">
							<span class="text-xs" style="color: var(--color-text-muted);">
								{data.xp.toFixed(1)} xp
							</span>
							<span class="text-xs" style="color: var(--color-text-muted);">
								{progress.current.toFixed(1)} / {progress.max}
							</span>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	{/each}

	<!-- Skills inconnus mais présents (futurs skills) -->
	{#each knownSkills.filter((k) => !Object.values(CATEGORIES)
				.flat()
				.includes(k as SKILL_LIST) && skills[k]) as skillKey}
		<p class="text-xs" style="color: var(--color-text-muted);">{skillKey} — non catégorisé</p>
	{/each}
</div>
