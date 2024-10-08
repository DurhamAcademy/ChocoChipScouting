import databases from "~/server/databases";
import PouchDB from "pouchdb";
import SecurityHelper from "pouchdb-security-helper"

PouchDB.plugin(SecurityHelper)

export default defineNitroPlugin((nitroApp) => {
    // @ts-ignore
    nitroApp.hooks.hookOnce('request', async function () {
        let config = useRuntimeConfig();
        let databaseInfoResponses
        try {
            databaseInfoResponses = await Promise.all(Object.values(databases.databases)
                .map((database) => ({
                    name: database.name,
                    database: database
                }))
                .map((object) => {
                    const name = object.name
                    return {
                        db: new PouchDB(`http://${process.env.NUXT_COUCH_DB_HOSTNAME}:5984/` + name, {
                            name: name,
                            auth: {
                                username: config.couchDB.serverAdminUser.username,
                                password: config.couchDB.serverAdminUser.password
                            }
                        }),
                        localRemoteDatabaseObject: object.database
                    };
                })
                .map(async (object) => {
                    const db = object.db
                    //TODO: https://www.npmjs.com/package/pouchdb-security-helper
                    // use this for adding the correct access roles to the right databases
                    try {
                        if (!db.name.endsWith("_users")) {
                            let security = db.security();
                            security.members.set({
                                names:[],
                                roles: object.localRemoteDatabaseObject.memberRoles
                            })
                            security.admins.set({
                                names:[],
                                roles: object.localRemoteDatabaseObject.adminRoles
                            })
                            await security.save()
                        }
                    } catch (e) {
                        console.error(e)
                    }
                    return db
                })
                .map(async (db) => {
                    const udb = await db;
                    let databaseInfo = await udb.info();
                    return databaseInfo
                }))
            await databases.databases.basic.remote.post({"serverSetupComplete": true})
        } finally {
            console.group("Database Info Responses")
            if (databaseInfoResponses !== undefined)

                console.debug(databaseInfoResponses.map((i)=> ({
                    name: i.db_name,
                    count: i.doc_count
                })))
            else
                console.error("database responses are undefined (an error occured while getting info from CouchDB)")
            console.groupEnd()
        }
    })
})