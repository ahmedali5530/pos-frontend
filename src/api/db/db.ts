import {ActionResult, RecordIdRange, StringRecordId, Surreal, Table} from "surrealdb";
import {Tables} from "./tables.ts";
import {toast} from "sonner";
import {useDatabase} from "../../hooks/useDatabase.ts";

export const useDB = () => {
  const databaseContext = useDatabase();
  const {client, isConnected, isConnecting} = databaseContext;

  // Only throw error if we're not connecting and not connected
  // The provider ensures children only render when connected, so this should rarely happen
  if (!isConnected && !isConnecting) {
    throw new Error('Database is not connected. Please ensure DatabaseProvider is wrapping your app and connection is established.');
  }

  const query = async <T = any>(sql: string, parameters?: any): Promise<T[]> => {
    // log sql in dev mode

    try {
      // Perform a custom advanced query
      const result: ActionResult<Record<string, T>>[] = await client.query(sql, parameters);

      if (import.meta.env.DEV) {
        console.group('DB Query Debug')
        console.info(sql.trim());
        console.info(parameters);
        console.info(result);
        console.groupEnd()
      }

      return result;
    } catch (e) {
      console.error('ERROR while query', e, sql);
      toast.error(e);
      throw e;
    }
  }

  const select = async <T>(thing: Tables | string): Promise<T[]> => {
    try {
      if (import.meta.env.DEV) {
        console.group('DB Select Debug')
        console.info(thing);
        console.groupEnd()
      }

      return client.select(thing);
    } catch (e) {
      console.log('ERROR while select', e);
      toast.error(e);
      throw e;
    }
  }

  const del = async (thing: Tables | string) => {
    try {
      if (import.meta.env.DEV) {
        console.group('DB Delete Debug')
        console.info(thing);
        console.groupEnd()
      }

      return client.delete(thing);
    } catch (e) {
      console.error('ERROR while delete', e);
      toast.error(e);
      throw e;
    }
  }

  async function insert(thing: Tables | string, data: any) {
    try {
      if (import.meta.env.DEV) {
        console.group('DB Insert Debug')
        console.info(thing);
        console.info(data);
        console.groupEnd()
      }

      return client.insert(thing, data);
    } catch (e) {
      console.error('ERROR while insert', e);
      toast.error(e);
      throw e;
    }
  }


  const update = async (thing: Tables | string | any, data: any) => {
    try {
      if (import.meta.env.DEV) {
        console.group('DB Update Debug')
        console.info(thing);
        console.info(data);
        console.groupEnd()
      }

      return client.update(thing, data);
    } catch (e) {
      console.error('ERROR while updating', e);
      toast.error(e);
      throw e;
    }
  }

  const patch = async (thing: Tables | string | any, data: any) => {
    try {
      if (import.meta.env.DEV) {
        console.group('DB Patch Debug')
        console.info(thing);
        console.info(data);
        console.groupEnd()
      }

      return client.patch(thing, data);
    } catch (e) {
      console.error('ERROR while patching', e);
      toast.error(e);
      throw e;
    }
  }

  const merge = async (thing: Tables | string | any, data: any) => {
    try {
      if (import.meta.env.DEV) {
        console.group('DB Merge Debug')
        console.info(thing);
        console.info(data);
        console.groupEnd()
      }

      return client.merge(thing, data);
    } catch (e) {
      console.error('ERROR while merging', e);
      toast.error(e);
      throw e;
    }
  }

  const upsert = async (thing: Tables | string | any, data: any) => {
    try {
      if (import.meta.env.DEV) {
        console.group('DB Upsert Debug')
        console.info(thing);
        console.info(data);
        console.groupEnd()
      }

      return client.upsert(thing, data);
    } catch (e) {
      console.error('ERROR while upserting', e);
      toast.error(e);
      throw e;
    }
  }

  const live = async (thing: Tables | string, callback: (action: any, result: any) => void, diff?: boolean) => {
    try {
      if (import.meta.env.DEV) {
        console.group('DB Live Debug')
        console.info(thing);
        console.groupEnd()
      }

      return client.live(thing, callback, diff)
    } catch (e) {
      console.log('ERROR while live query', e);
      toast.error(e);
      throw e;
    }
  }

  return {
    query,
    db: client, // Expose the client for direct access if needed
    select,
    delete: del,
    insert, create: insert,
    update,
    patch,
    merge,
    upsert,
    live
  }
}
