import auth from "pouchdb-authentication";
import PouchDB from "pouchdb";
PouchDB.plugin(auth);
export default auth