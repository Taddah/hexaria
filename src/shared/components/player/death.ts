export const DEATH_INTENT_COMPONENT = 'DeathIntentComponent';

export interface DeathIntentComponent {
    deadline: number | null; // null = mort immédiate au prochain tick
    cause: 'AGE' | 'INJURY' | 'EVENT';
    eventName?: string;
}
