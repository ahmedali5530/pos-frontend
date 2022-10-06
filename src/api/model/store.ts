import {Terminal} from "./terminal";

export interface Store{
  id: string;
  name: string;
  location?: string;
  terminals: Terminal[];
}
