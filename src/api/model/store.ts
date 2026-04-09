import {Terminal} from "./terminal";
import {HydraId, HydraType} from "./hydra";
import {RecordId} from "surrealdb";

export interface Store {
  id: RecordId;
  name: string;
  location?: string;
  terminals?: Terminal[];
  is_active: boolean
}
