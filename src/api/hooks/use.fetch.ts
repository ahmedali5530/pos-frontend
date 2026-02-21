import {useDB} from "../db/db";
import {StringRecordId} from "surrealdb";
import {toRecordId} from "../model/common";

export const useFetch = () => {
  const db = useDB();

  const fetchById = async (id: string, fetches: string[] = []) => {
    const [record] =  await db.query(`SELECT * FROM ONLY ${toRecordId(id)} ${fetches.length > 0 ? `FETCH ${fetches.join(', ')}` : ''}`);

    return record;
  }

  return {
    fetchById
  }
}