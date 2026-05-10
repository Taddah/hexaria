import { DAY_CYCLE_DURATION_MS, DAY_START, NIGHT_START, type TimeState, VISION_RADIUS_DAY, VISION_RADIUS_NIGHT, DEBUG_MODE } from '$shared';

let currentTimeOfDay: number = DAY_START;
let currentYear: number = 1;

export function initTimeOfDay(timeOfDay: number) {
    currentTimeOfDay = timeOfDay;
}

export function initYear(year: number) {
    currentYear = year;
}

export function getCurrentYear(): number {
    return currentYear;
}

export function tickTimeOfDay(deltaMs: number) {
    currentTimeOfDay = (currentTimeOfDay + deltaMs / DAY_CYCLE_DURATION_MS) % 1;
}

export function incrementYear(): void {
    currentYear++;
}

export function getTimeState(): TimeState {
    if (DEBUG_MODE) {
        return { timeOfDay: 0.5, isDay: true, visionRadius: 10, year: currentYear };
    }

    const isDay = currentTimeOfDay >= DAY_START && currentTimeOfDay < NIGHT_START;
    return {
        timeOfDay: currentTimeOfDay,
        isDay,
        visionRadius: isDay ? VISION_RADIUS_DAY : VISION_RADIUS_NIGHT,
        year: currentYear,
    };
}
