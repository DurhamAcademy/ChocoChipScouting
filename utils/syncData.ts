import PouchDB from "pouchdb";
import databases from "~/utils/databases";

export function syncData(){
    Promise.all([
        PouchDB.sync(databases.locals.scoutingData, databases.remotes.scoutingData, { live: true }),
        PouchDB.sync(databases.locals.attachments, databases.remotes.attachments, { live: true }),
        PouchDB.sync(databases.locals.teamInfo, databases.remotes.teamInfo, { live: true }),
    ]).then(() => {
        return true
    }).catch(() => {
        return false
    })
}