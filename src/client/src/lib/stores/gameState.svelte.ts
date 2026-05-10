import type {
	EventComponent,
	TileData,
	BodyModifiersComponent,
	EventHistory,
	PositionComponent,
	IdentityComponent,
	InventoryComponent,
	BodyComponent,
	FatigueComponent,
	SkillsComponent
} from '$shared';

export interface EntityDTO {
	id: number;
	position: PositionComponent;
	identity: IdentityComponent;
	inventory?: InventoryComponent;
	gameEvents?: EventComponent;
	body: BodyComponent;
	bodyModifiers: BodyModifiersComponent;
	fatigue: FatigueComponent;
	skills: SkillsComponent;
}

export interface TimeDTO {
	timeOfDay: number;
	isDay: boolean;
	visionRadius: number;
	year: number;
}

interface GameState {
	selectedHex: TileData | null;
	localPlayer: EntityDTO | null;
	exploredTiles: string[];
	path: { q: number; r: number }[];
	playerAnimPosition: { x: number; y: number; z: number } | null;
	map: Record<string, TileData>;
	updatedTiles: TileData[];
	entities: EntityDTO[];
	hexSize: number;
	time: TimeDTO;
	mapLoaded: boolean;
	connected: boolean;
	eventsHistory: EventHistory[];
}

export const gameState = $state<GameState>({
	selectedHex: null,
	localPlayer: null,
	exploredTiles: [],
	path: [],
	playerAnimPosition: null,
	map: {},
	updatedTiles: [],
	entities: [],
	hexSize: 75,
	time: {
		timeOfDay: 0.5,
		isDay: true,
		visionRadius: 3,
		year: 1
	},
	mapLoaded: false,
	connected: false,
	eventsHistory: []
});

export function resetGameState() {
	gameState.selectedHex = null;
	gameState.localPlayer = null;
	gameState.exploredTiles = [];
	gameState.path = [];
	gameState.playerAnimPosition = null;
	gameState.map = {};
	gameState.updatedTiles = [];
	gameState.entities = [];
	gameState.hexSize = 75;
	gameState.time = {
		timeOfDay: 0.5,
		isDay: true,
		visionRadius: 3,
		year: 1
	};
	gameState.mapLoaded = false;
	gameState.connected = false;
	gameState.eventsHistory = [];
}