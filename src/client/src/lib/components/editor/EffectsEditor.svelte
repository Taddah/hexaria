<script lang="ts">
	import { type EventEffect, EffectType, Resource, BodyPart } from '$shared';

	let { effects, onchange }: { effects: EventEffect[]; onchange: (e: EventEffect[]) => void } =
		$props();

	const effectTypes = Object.values(EffectType);
	const resources = Object.values(Resource);
	const bodyParts = Object.values(BodyPart);

	const BODY_EFFECT_OPTIONS = [
		{ value: -3, label: 'Guérison complète' },
		{ value: -2, label: 'Soin important' },
		{ value: -1, label: 'Soin léger' },
		{ value: 1, label: 'Blessure légère' },
		{ value: 2, label: 'Blessure grave' },
		{ value: 3, label: 'Perte de membre' }
	];

	function addEffect() {
		onchange([...effects, { type: EffectType.RESOURCE, stat: Resource.WOOD, value: 0 }]);
	}

	function removeEffect(i: number) {
		onchange(effects.filter((_, idx) => idx !== i));
	}

	function onTypeChange(i: number, newType: EffectType) {
		const defaultStat =
			newType === EffectType.RESOURCE
				? Resource.WOOD
				: newType === EffectType.BODY
					? BodyPart.HEAD
					: '';
		const defaultValue = newType === EffectType.BODY ? 1 : 0;
		onchange(
			effects.map((e, idx) =>
				idx === i ? ({ type: newType, stat: defaultStat, value: defaultValue } as EventEffect) : e
			)
		);
	}

	function onStatChange(i: number, stat: string) {
		onchange(effects.map((e, idx) => (idx === i ? ({ ...e, stat } as EventEffect) : e)));
	}

	function onValueChange(i: number, value: number) {
		onchange(effects.map((e, idx) => (idx === i ? ({ ...e, value } as EventEffect) : e)));
	}
</script>

<div class="mt-2 flex flex-col gap-2">
	<span class="text-xs font-semibold text-gray-400 uppercase">Effets</span>

	{#each effects as effect, i}
		<div class="flex flex-wrap items-center gap-2 rounded bg-gray-700 px-2 py-1">
			<!-- Type -->
			<select
				class="rounded bg-gray-600 px-1 py-0.5 text-xs text-white"
				value={effect.type}
				onchange={(e) => onTypeChange(i, e.currentTarget.value as EffectType)}
			>
				{#each effectTypes as t}
					<option value={t}>{t}</option>
				{/each}
			</select>

			<!-- Stat -->
			{#if effect.type === EffectType.RESOURCE}
				<select
					class="rounded bg-gray-600 px-1 py-0.5 text-xs text-white"
					value={effect.stat}
					onchange={(e) => onStatChange(i, e.currentTarget.value)}
				>
					{#each resources as r}
						<option value={r}>{r}</option>
					{/each}
				</select>
			{:else if effect.type === EffectType.BODY}
				<select
					class="rounded bg-gray-600 px-1 py-0.5 text-xs text-white"
					value={effect.stat}
					onchange={(e) => onStatChange(i, e.currentTarget.value)}
				>
					{#each bodyParts as b}
						<option value={b}>{b}</option>
					{/each}
				</select>
			{:else}
				<input
					type="text"
					class="w-24 rounded bg-gray-600 px-1 py-0.5 text-xs text-white"
					value={effect.stat}
					oninput={(e) => onStatChange(i, e.currentTarget.value)}
					placeholder="stat"
				/>
			{/if}

			<!-- Value -->
			{#if effect.type === EffectType.BODY}
				<select
					class="rounded bg-gray-600 px-1 py-0.5 text-xs text-white"
					value={effect.value}
					onchange={(e) => onValueChange(i, Number(e.currentTarget.value))}
				>
					{#each BODY_EFFECT_OPTIONS as opt}
						<option value={opt.value}>{opt.label}</option>
					{/each}
				</select>
			{:else}
				<input
					type="number"
					class="w-16 rounded bg-gray-600 px-1 py-0.5 text-xs text-white"
					value={effect.value}
					oninput={(e) => onValueChange(i, Number(e.currentTarget.value))}
				/>
			{/if}

			<!-- Delete -->
			<button
				class="ml-auto rounded bg-red-700 px-2 py-0.5 text-xs text-white hover:bg-red-600"
				onclick={() => removeEffect(i)}>✕</button
			>
		</div>
	{/each}

	<button
		class="rounded bg-blue-700 px-2 py-1 text-xs text-white hover:bg-blue-600"
		onclick={addEffect}>+ Effet</button
	>
</div>
