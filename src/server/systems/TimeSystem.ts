import { DAY_CYCLE_DURATION_MS, DAY_START, NIGHT_START, type TimeState, VISION_RADIUS_DAY, VISION_RADIUS_NIGHT } from '$shared';


export function getTimeState(serverStartTime: number): TimeState {
    const elapsed = (Date.now() - serverStartTime) % DAY_CYCLE_DURATION_MS;
    const timeOfDay = elapsed / DAY_CYCLE_DURATION_MS;
    const isDay = timeOfDay >= DAY_START && timeOfDay < NIGHT_START;

    return {
        timeOfDay,
        isDay,
        visionRadius: isDay ? VISION_RADIUS_DAY : VISION_RADIUS_NIGHT
    };
}