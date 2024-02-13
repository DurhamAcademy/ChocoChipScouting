import {couchDBBaseURL} from "~/utils/URIs";
import PouchDB from "pouchdb"

class LocalRemoteServerSideDatabaseSyncHolder<Content extends {} = {}> {
    name: string
    local: PouchDB.Database<Content> | null = null
    remote: PouchDB.Database<Content>

    constructor(name: string, local: boolean) {
        this.name = name;
        if (local)
            this.local = new PouchDB(name, {skip_setup: true, name: name})
        this.remote = new PouchDB(couchDBBaseURL + name, {
            skip_setup: true,
            name: name,
            adapter: "http"
        })
    }

    async sync() {
        if (this.local) {
            PouchDB.sync(this.local, this.remote, {live: true, retry: true,})
            return true
        }
        return false
    }

    static databases = {
        "attachments": new this<{ event: any; name: string; teamNumber: number; fileSize: string; author : string | undefined; tags: string[] ; extraNotes: string; dateUploaded: string }>("attachment-db", false),
        "scoutingData": new this<{points: number}>("scouting-data", false),
        "basic": new this<{}>("basic", false),
        "users": new this<{}>("_users", false)
    };
    static locals = {
        "attachments": this.databases.attachments.local,
        "scoutingData": this.databases.scoutingData.local,
        "basic": this.databases.basic.local,
        "users": this.databases.users.local,
    };
    static remotes = {
        "attachments": this.databases.attachments.remote,
        "scoutingData": this.databases.scoutingData.remote,
        "basic": this.databases.basic.remote,
        "users": this.databases.users.remote,
    };
}

export default {
    LocalRemoteServerSideDatabaseSyncHolder: LocalRemoteServerSideDatabaseSyncHolder,
    databases: LocalRemoteServerSideDatabaseSyncHolder.databases,
    locals: LocalRemoteServerSideDatabaseSyncHolder.locals,
    remotes: LocalRemoteServerSideDatabaseSyncHolder.remotes
};