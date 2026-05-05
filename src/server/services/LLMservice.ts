import { EventHistory } from "$shared/components";
import Groq from "groq-sdk";

export interface EventContext {
    actionType: string;
    fatigue: string;
    recentActions: EventHistory[];
    polarity: string;
    baseTitle: string;
    baseDescription: string;
}

export interface EventNarrative {
    nodes: {
        [nodeId: string]: {
            description: string;
            choiceLabels?: { [choiceId: string]: string };
        };
    };
}

export interface EventDefinition {
    id: string;
    title: string;
    polarity: string;
    nodes: EventNode[];
}

export interface EventNode {
    id: string;
    description: string;
    choices?: { id: string; label: string; outcomes: any[] }[];
    effects?: any[];
}

export class LLMService {
    private groq: Groq;

    constructor() {
        this.groq = new Groq({ apiKey: "process.env.GROQ_API_KEY" });
    }

    async enrichAllNodes(event: EventDefinition, ctx: EventContext): Promise<EventNarrative> {
        const prompt = buildFullEventPrompt(event, ctx);

        const completion = await this.groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
        });

        const content = JSON.parse(completion.choices[0]!.message.content!);
        return content as EventNarrative;
    }
}

export function applyNarrative(node: EventNode, narrative: EventNarrative | null) {
    if (!narrative) return node;
    const enriched = narrative.nodes[node.id];
    if (!enriched) return node;

    return {
        ...node,
        description: enriched.description ?? node.description,
        choices: node.choices?.map(c => ({
            ...c,
            label: enriched.choiceLabels?.[c.id] ?? c.label
        }))
    };
}

function buildFullEventPrompt(event: EventDefinition, ctx: EventContext): string {
    const nodesBlock = event.nodes.map(node => {
        const choicesBlock = node.choices?.map(c => `  - id: "${c.id}", label: "${c.label}"`).join('\n') ?? '';
        return `Node "${node.id}":
  Description brute: "${node.description}"${choicesBlock ? `\n  Choix:\n${choicesBlock}` : ''}`;
    }).join('\n\n');

    const expectedJson: EventNarrative = {
        nodes: Object.fromEntries(event.nodes.map(n => [
            n.id,
            {
                description: "...",
                ...(n.choices?.length ? {
                    choiceLabels: Object.fromEntries(n.choices.map(c => [c.id, "..."]))
                } : {})
            }
        ]))
    };

    return `
Tu es le narrateur d'un jeu de survie médiéval sombre, style "Darkest Dungeon".
Phrases courtes, images concrètes, tension palpable. Jamais cliché. En français.

Événement : "${event.title}"
Tonalité : ${ctx.polarity}
Action déclenchante : ${ctx.actionType}
Fatigue du joueur : ${ctx.fatigue}
Actions récentes : ${ctx.recentActions.slice(-3).map(r => r.toString()).join(', ')}

Nodes à enrichir :
${nodesBlock}

Retourne UNIQUEMENT ce JSON (même structure, tous les nodes) :
${JSON.stringify(expectedJson, null, 2)}
`.trim();
}
