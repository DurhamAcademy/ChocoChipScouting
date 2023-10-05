// `nuxt/kit` is a helper subpath import you can use when defining local modules
// that means you do not need to add `@nuxt/kit` to your project's dependencies
import { createResolver, defineNuxtModule, addServerHandler } from 'nuxt/kit'
import databases from "../../server/databases";
import PouchDB from "pouchdb";
import SecurityHelper from "pouchdb-security-helper"

PouchDB.plugin(SecurityHelper)

console.error("this should never be in the web console, if you are seeing this something very VERY VERY bad happened")
console.error("this should never be in the web console, if you are seeing this something very VERY VERY bad happened")
console.error("this should never be in the web console, if you are seeing this something very VERY VERY bad happened")
console.error("this should never be in the web console, if you are seeing this something very VERY VERY bad happened")
console.error("this should never be in the web console, if you are seeing this something very VERY VERY bad happened")

export default defineNuxtModule({
    meta: {
        name: 'databaseStarter'
    },
    setup () {
        // const { resolve } = createResolver(import.meta.url)
        //
        //
        // // Add an API route
        // addServerHandler({
        //     route: '/api/hello',
        //     handler: resolve('./runtime/api-route')
        // })
    },
    hooks: {
        ready: async function () {
            let databaseInfoResponses
            try {
                databaseInfoResponses = await Promise.all(Object.values(databases.databases)
                    .map((database) => database.name)
                    .map((name) => {
                        console.log(name)
                        return new PouchDB("http://localhost:5984/" + name, {name: name, auth: {username: "admin", password: "password"}})
                    })
                    .map(async (db) => {
                        //TODO: https://www.npmjs.com/package/pouchdb-security-helper
                        // use this for adding the correct access roles to the right databases
                        if (db.name !== "_users") {
                            let security = await db.security();
                            if (security.members.roles.items.indexOf("verified") == -1)
                                security.members.roles.add("verified")
                        }
                        return db
                    })
                    .map(async (db) => {
                        const udb = await db;
                        return await udb.info()
                    } ))
            } finally {
                console.group("Database Info Responses")
                if (databaseInfoResponses !== undefined)
                    console.debug(databaseInfoResponses)
                else
                    console.error("database responses are undefined (an error occured while getting info from CouchDB)")
                console.groupEnd()
            }
        }
    }
})
