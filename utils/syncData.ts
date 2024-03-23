import PouchDB from "pouchdb";
import databases from "~/utils/databases";

export function syncData(){
    Promise.all([
        PouchDB.sync(databases.locals.scoutingData, databases.remotes.scoutingData),
        PouchDB.sync(databases.locals.attachments, databases.remotes.attachments),
        PouchDB.sync(databases.locals.teamInfo, databases.remotes.teamInfo),
    ]).then(() => {
        return true
    }).catch(() => {
        return false
    })
}