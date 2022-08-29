import { getEntityByIdSelector } from './_entity';
import { UserAccountSchema } from '../entity.schema';
import { WithEntityState } from '../../_root/root.state';
import {User} from "../../../api/model/user";

export const getUserAccount = (state: WithEntityState, id: string): User | undefined => getEntityByIdSelector(state, {
  schema: UserAccountSchema, id
});