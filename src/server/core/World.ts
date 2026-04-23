type Entity = number;

export class World {
  private nextEntityId: Entity = 0;
  private entities: Set<Entity> = new Set();

  private componentSignatures: Map<string, Set<Entity>> = new Map();
  private componentData: Map<string, Map<Entity, unknown>> = new Map();

  createEntity(): Entity {
    const id = this.nextEntityId++;
    this.entities.add(id);
    return id;
  }

  addComponent<T>(entity: Entity, componentName: string, data: T): void {
    if (!this.componentSignatures.has(componentName)) {
      this.initComponentSignatures(componentName);
    }

    this.componentSignatures.get(componentName)!.add(entity);
    this.componentData.get(componentName)!.set(entity, data);
  }


  removeComponent(entity: Entity, componentName: string): void {
    this.componentSignatures.get(componentName)?.delete(entity);
    this.componentData.get(componentName)?.delete(entity);
  }

  getComponent<T>(entity: Entity, componentName: string): T | undefined {
    return this.componentData.get(componentName)?.get(entity) as T | undefined;
  }


  deleteEntity(entity: Entity): void {
    this.entities.delete(entity);
    this.componentSignatures.forEach((set) => {
      set.delete(entity);
    });
    this.componentData.forEach((map) => {
      map.delete(entity);
    });
  }

  private initComponentSignatures(componentName: string): void {
    this.componentSignatures.set(componentName, new Set());
    this.componentData.set(componentName, new Map());
  }

  query(components: string[]): Entity[] {
    if (components.length === 0) return [];

    const sets: Set<Entity>[] = [];
    for (const c of components) {
      const s = this.componentSignatures.get(c);
      if (!s || s.size === 0) return [];
      sets.push(s);
    }

    if (sets.length === 0) return [];

    sets.sort((a, b) => a.size - b.size);

    const smallestSet = sets[0];
    const otherSets = sets.slice(1);
    const result: Entity[] = [];

    if (!smallestSet) return [];

    for (const entity of smallestSet) {
      let hasAll = true;
      for (const otherSet of otherSets) {
        if (!otherSet.has(entity)) {
          hasAll = false;
          break;
        }
      }
      if (hasAll) {
        result.push(entity);
      }
    }

    return result;
  }

  getFirst(components: string[]): Entity | undefined {
    if (components.length === 0) return undefined;

    const sets: Set<Entity>[] = [];
    for (const c of components) {
      const s = this.componentSignatures.get(c);
      if (!s || s.size === 0) return undefined;
      sets.push(s);
    }

    if (sets.length === 0) return undefined;

    sets.sort((a, b) => a.size - b.size);

    const smallestSet = sets[0];
    const otherSets = sets.slice(1);

    if (!smallestSet) return undefined;

    for (const entity of smallestSet) {
      let hasAll = true;
      for (const otherSet of otherSets) {
        if (!otherSet.has(entity)) {
          hasAll = false;
          break;
        }
      }
      if (hasAll) {
        return entity;
      }
    }

    return undefined;
  }
}
