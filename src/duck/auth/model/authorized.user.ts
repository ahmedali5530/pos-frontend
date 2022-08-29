import {User} from "../../../api/model/user";

export interface AuthorizedUser extends User{}

export function createAuthorizedUserFromApiUserAccount(userAccount: User): AuthorizedUser {
  return userAccount;
}
