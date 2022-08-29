import localforage from "localforage";

localforage.config({
  driver      : localforage.INDEXEDDB,
  name        : 'pos application',
  version     : 1.0,
});

export default localforage;