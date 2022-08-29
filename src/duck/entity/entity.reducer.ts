import { ActionMeta, handleActions } from 'redux-actions';
import { EntityState, INITIAL_STATE } from './entity.state';
import { entityLoaded, EntityLoadedMeta, EntityLoadedPayload } from './entity.action';
import { EntityMergeMode } from './entity.model';
import {merge} from 'lodash';


export const entityReducer = handleActions<EntityState, any, any>({

  [entityLoaded.toString()]: (state: EntityState, action: ActionMeta<EntityLoadedPayload, EntityLoadedMeta>) => {
    state = { ...state };

    for (let entityName in action.payload) {
      state[entityName] = { ...state[entityName] };

      for (let entityId in action.payload[entityName]) {
        if (action.meta && action.meta.mergeMode && action.meta.mergeMode === EntityMergeMode.REPLACE) {
          state[entityName][entityId] = action.payload[entityName][entityId];
        } else {
          state[entityName][entityId] = merge({}, state[entityName][entityId], action.payload[entityName][entityId]);
        }
      }
    }

    return state;
  }

}, INITIAL_STATE);
