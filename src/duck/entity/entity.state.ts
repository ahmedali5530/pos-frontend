export interface EntityState {
  [entityName: string]: {
    [entityId: string]: object
  }
}

export const INITIAL_STATE: EntityState = {};