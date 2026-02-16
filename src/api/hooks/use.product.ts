import {useFetch} from "./use.fetch";
import {ITEM_FETCHES} from "../model/product";

export const useProduct = () => {
  const fetch = useFetch();
  const fetchProduct = async (id: string) => {
    return await fetch.fetchById(id, ITEM_FETCHES);
  }

  return {
    fetchProduct
  }
}