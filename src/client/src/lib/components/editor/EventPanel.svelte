<script lang="ts">
	import { ActionType, type EventPolarity, type GameEvent } from '$shared';

	let {
		event,
		onchange
	}: {
		event: GameEvent;
		onchange: (e: GameEvent) => void;
	} = $props();
</script>

<div class="shrink-0 overflow-y-auto p-3">
	<h2 class="mb-2 text-xs font-bold tracking-wider text-gray-400 uppercase">Event</h2>
	<div class="grid grid-cols-2 gap-x-2 gap-y-1">
		<div class="col-span-2 flex flex-col gap-0.5">
			<label class="text-xs text-gray-500">ID</label>
			<input
				class="rounded border border-gray-600 bg-gray-800 px-2 py-1 text-xs text-white"
				value={event.id}
				oninput={(e) => onchange({ ...event, id: e.currentTarget.value })}
			/>
		</div>
		<div class="col-span-2 flex flex-col gap-0.5">
			<label class="text-xs text-gray-500">Titre</label>
			<input
				class="rounded border border-gray-600 bg-gray-800 px-2 py-1 text-xs text-white"
				value={event.title}
				oninput={(e) => onchange({ ...event, title: e.currentTarget.value })}
			/>
		</div>
		<div class="flex flex-col gap-0.5">
			<label class="text-xs text-gray-500">Probabilité</label>
			<input
				type="number"
				class="rounded border border-gray-600 bg-gray-800 px-2 py-1 text-xs text-white"
				value={event.probability}
				oninput={(e) => onchange({ ...event, probability: Number(e.currentTarget.value) })}
			/>
		</div>
		<div class="flex flex-col gap-0.5">
			<label class="text-xs text-gray-500">Polarité</label>
			<select
				class="rounded border border-gray-600 bg-gray-800 px-2 py-1 text-xs text-white"
				value={event.polarity}
				onchange={(e) => onchange({ ...event, polarity: e.currentTarget.value as EventPolarity })}
			>
				<option value="positive">positive</option>
				<option value="negative">negative</option>
				<option value="neutral">neutral</option>
			</select>
		</div>
		<div class="col-span-2 flex flex-col gap-0.5">
			<label class="text-xs text-gray-500">Triggers</label>
			<div class="flex flex-wrap gap-x-3 gap-y-1">
				{#each Object.values(ActionType) as action}
					<label class="flex items-center gap-1 text-xs text-white">
						<input
							type="checkbox"
							checked={event.triggers?.includes(action) ?? false}
							onchange={(e) => {
								const triggers = e.currentTarget.checked
									? [...(event.triggers ?? []), action]
									: (event.triggers ?? []).filter((t) => t !== action);
								onchange({ ...event, triggers });
							}}
						/>
						{action}
					</label>
				{/each}
			</div>
		</div>
	</div>
</div>
