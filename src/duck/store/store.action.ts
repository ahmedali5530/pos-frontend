import {createAction} from 'redux-actions';
import {EntityMeta} from '../entity/entity.action';
import {StoreSchema} from '../entity/entity.schema';
import {Store} from "../../api/model/store";

export const storeAction = createAction<Store, EntityMeta>(
  'STORE_ACTION',
  payload => payload,
  () => ({schema: StoreSchema})
);
