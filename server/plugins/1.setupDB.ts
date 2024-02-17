import databases from "~/server/databases";
import PouchDB from "pouchdb";
import SecurityHelper from "pouchdb-security-helper"

PouchDB.plugin(SecurityHelper)

export default defineNitroPlugin((nitroApp) => {
    // @ts-ignore
    nitroApp.hooks.hookOnce('request', async function () {
        var config = useRuntimeConfig();
        let databaseInfoResponses
        try {
            databaseInfoResponses = await Promise.all(Object.values(databases.databases)
                .map((database) => database.name)
                .map((name) => {
                    console.log(name)
                    return new PouchDB(`http://${process.env.couchDBHostname}:5984/` + name, {
                        name: name,
                        auth: {username: config.couchDB.serverAdminUser.username, password: config.couchDB.serverAdminUser.password}
                    })
                })
                .map(async (db) => {
                    //TODO: https://www.npmjs.com/package/pouchdb-security-helper
                    // use this for adding the correct access roles to the right databases
                    try {
                        if (!db.name.endsWith("_users")) {
                            let security = db.security();
                            if (!security.roleHasAccess("verified"))
                                security.members.roles.add("verified")
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