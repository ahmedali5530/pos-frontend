import { ActionMeta, createAction } from 'redux-actions';
import { Schema } from 'normalizr';

export interface EntityMeta {
  schema: Schema;
  mergeMode?: 'replace' | 'merge';
}

export interface ActionWithEntity<Payload, Meta extends EntityMeta = EntityMeta> extends ActionMeta<Payload, Meta> {
}

export interface EntityLoadedPayload {
  [entityName: string]: {
    [entityId: string]: object
  }
}

export interface EntityLoadedMeta {
  mergeMode?: 'replace' | 'merge';
}

export const entityLoaded = createAction(
  'ENTITY_LOADED',
  (payload: EntityLoadedPayload) => payload,
  (_: EntityLoadedPayload, meta: EntityLoadedMeta) => meta
);