import { Middleware } from 'redux';
import { ActionWithEntity, entityLoaded } from './entity.action';
import { normalize } from 'normalizr';

export const entityMiddleware: Middleware = () => (next) => (action: ActionWithEntity<any>) => {

  if (!action.type || !action.meta || !action.meta.schema) {
    return next(action);
  }

  const { payload, meta } = action;
  const { schema, mergeMode, ...metaRest } = meta;

  const normalizedPayload = normalize(payload, schema);

  // pass entity action to entity reducer
   //TODO: should be fixed later
  next(entityLoaded(normalizedPayload.entities as any, { mergeMode }));

  // pass original action with modified data to next middleware
  return next({
    ...action,
    payload: normalizedPayload.result,
    meta: metaRest
  });
};