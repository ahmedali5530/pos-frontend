import {RecordId, StringRecordId} from "surrealdb";
import {Tables} from "../db/tables";
import {useDB} from "../db/db";

type DatabaseClient = ReturnType<typeof useDB>;

export interface ReactSelectOptionProps{
  value: string,
  label: string,
  [key: string]: string
}

export interface LabelValue {
  label: string;
  value: string|null
}

export const toRecordId = (id: any) => {
  if(typeof id === 'undefined'){
    return id;
  }

  if(typeof id === 'string'){
    return new StringRecordId(id);
  }

  if('id' in id && 'tb' in id){
    return new RecordId(id.tb, id.id)
  }

  return id;
}

export const toSurrealDBDate = (date: string) => {
  return `"${date}"`;
}

export const fetchNextSequentialNumber = async (
  db: DatabaseClient,
  table: Tables,
  field: string
): Promise<number> => {
  const [rows] = await db.query(
    `SELECT math::max(${field}) as max_value FROM ${table} GROUP ALL`
  );

  const maxValue = rows?.[0]?.max_value ?? 0;
  const parsedValue = Number(maxValue);

  if (Number.isFinite(parsedValue)) {
    return parsedValue + 1;
  }

  return 1;
};

export const isUniqueRecordNumber = async (
  db: DatabaseClient,
  table: Tables,
  field: string,
  value?: number | string | null,
  currentId?: string
): Promise<boolean> => {
  if (value === undefined || value === null || value === "") {
    return true;
  }

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return true;
  }

  const [rows] = await db.query(
    `SELECT id FROM ${table} WHERE ${field} = $value LIMIT 1`,
    { value: numericValue }
  );

  const existingRecord = rows?.[0];
  if (!existingRecord) {
    return true;
  }

  const existingId = toRecordId(existingRecord.id);
  const currentRecordId = toRecordId(currentId);

  if (existingId && currentRecordId && existingId === currentRecordId) {
    return true;
  }

  return false;
};
