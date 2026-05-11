export const ATTRIBUTES_COMPONENT = 'AttributesComponent';

export interface IAttributes {
    strength: number;
    endurance: number;
    agility: number;
    intelligence: number;
    charisma: number;
    willpower: number;
    discretion: number;
}

export interface AttributesComponent extends IAttributes { }

export type AttributeKey = keyof IAttributes;

export type AttributeLabel =
    | 'Très faible'
    | 'Faible'
    | 'Moyen'
    | 'Bon'
    | 'Remarquable'
    | 'Exceptionnel';

export const ATTRIBUTE_THRESHOLDS: { label: AttributeLabel; min: number }[] = [
    { label: 'Exceptionnel', min: 120 },
    { label: 'Remarquable', min: 80 },
    { label: 'Bon', min: 50 },
    { label: 'Moyen', min: 25 },
    { label: 'Faible', min: 10 },
    { label: 'Très faible', min: 0 },
];

export interface AttributesDTO {
    strength: AttributeLabel;
    endurance: AttributeLabel;
    agility: AttributeLabel;
    intelligence: AttributeLabel;
    charisma: AttributeLabel;
    willpower: AttributeLabel;
    discretion: AttributeLabel;
}

export const DEFAULT_ATTRIBUTES: IAttributes = {
    strength: 10,
    endurance: 10,
    agility: 10,
    intelligence: 10,
    charisma: 10,
    willpower: 10,
    discretion: 10,
};

export function toAttributeLabel(value: number): AttributeLabel {
    for (const { label, min } of ATTRIBUTE_THRESHOLDS) {
        if (value >= min) return label;
    }
    return 'Très faible';
}

export function toAttributesDTO(attrs: IAttributes): AttributesDTO {
    return Object.fromEntries(
        Object.entries(attrs).map(([k, v]) => [k, toAttributeLabel(v as number)])
    ) as unknown as AttributesDTO;
}
