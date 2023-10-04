// `nuxt/kit` is a helper subpath import you can use when defining local modules
// that means you do not need to add `@nuxt/kit` to your project's dependencies
import { createResolver, defineNuxtModule, addServerHandler } from 'nuxt/kit'
import databases from "../../server/databases";
import PouchDB from "pouchdb";

export default defineNuxtModule({
    meta: {
        name: 'hello'
    },
    setup () {
        console.log("hello!!!")
        const { resolve } = createResolver(import.meta.url)


        // Add an API route
        addServerHandler({
            route: '/api/hello',
            handler: resolve('./runtime/api-route')
        })
    },
    hooks: {ready: function () {
            Object.values(databases.databases).map((database)=>database.name).map((name) => {
                return new PouchDB(name, {name: name, auth:{username: "admin", password: "password"}})
            });
        }}
})
