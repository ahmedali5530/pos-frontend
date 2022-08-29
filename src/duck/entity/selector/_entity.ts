// Selector
import { WithEntityState } from '../../_root/root.state';
import { EntityState } from '../entity.state';
import { createSelector } from 'reselect';
import { denormalize, schema as Schema } from 'normalizr';

export const getState = (state: WithEntityState): EntityState => {
  return state.entity;
};

export const getEntityByIdSelector = createSelector(
  [getState, (_: any, entity: { schema: Schema.Entity, id: string }) => entity],
  (state, { schema, id }) => denormalize(id, schema, state)
);

export const getEntityByIdListSelector = createSelector(
  [getState, (_: any, entityList: { schema: Schema.Entity, idList: string[] }) => entityList],
  (state, { schema, idList }) => denormalize(idList, new Schema.Array(schema), state)
);