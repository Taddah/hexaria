// server/services/EventResolutionService.ts

import { EventNode, EventEffect, EventChoice, EventOutcome, Event } from "$shared/components";


export class EventResolutionService {

    // ─── Résolution d'un choix ────────────────────────────────────────────────

    resolveChoice(event: Event, choiceId: string): { nextNode: EventNode; effects: EventEffect[]; choiceLabel: string; } {
        const currentNode = this.getNode(event, event.currentNodeId);
        const choice = currentNode.choices.find(c => c.id === choiceId);

        if (!choice) throw new Error(`Choice "${choiceId}" not found in node "${currentNode.id}"`);

        const outcome = this.rollOutcome(choice);
        const nextNode = this.getNode(event, outcome.nextNode);

        return { nextNode, effects: [...(outcome.effects ?? []), ...(nextNode.effects ?? [])], choiceLabel: choice.label };

    }

    // ─── Résolution d'un node terminal ───────────────────────────────────────

    resolveTerminal(event: Event, node: EventNode): EventEffect[] {
        if (node.choices.length > 0) throw new Error(`Node "${node.id}" is not terminal`);
        return node.effects ?? [];
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private getNode(event: Event, nodeId: string): EventNode {
        const node = event.event.nodes.find(n => n.id === nodeId);
        if (!node) throw new Error(`Node "${nodeId}" not found in event "${event.event.id}"`);
        return node;
    }

    private rollOutcome(choice: EventChoice): EventOutcome {
        const total = choice.outcomes.reduce((sum, o) => sum + o.weight, 0);
        let roll = Math.random() * total;

        for (const outcome of choice.outcomes) {
            roll -= outcome.weight;
            if (roll <= 0) return outcome;
        }

        return choice.outcomes[choice.outcomes.length - 1]!;
    }
}