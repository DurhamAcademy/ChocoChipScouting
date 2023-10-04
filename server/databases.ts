import {couchDBBaseURL} from "../utils/URIs";
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
        PouchDB.sync(this.local, this.remote, {live: true, retry: true,})
    }

    static databases: { attachments: LocalRemoteServerSideDatabaseSyncHolder<{ name: string; team: number | undefined; author: string }>; scoutingData: LocalRemoteServerSideDatabaseSyncHolder<{ points: number }>; basic: LocalRemoteServerSideDatabaseSyncHolder<{}> } = {
        "attachments": new this<{name: string, team: number|undefined, author: string}>("attachment-db", false),
        "scoutingData": new this<{points: number}>("scouting-data", false),
        "basic": new this<{}>("basic", false)
    };
    static locals: { attachments: PouchDB.Database<{ name: string; team: number | undefined; author: string }>|null; scoutingData: PouchDB.Database<{ points: number }>|null; basic: PouchDB.Database<{}>|null } = {
        "attachments": this.databases.attachments.local,
        "scoutingData": this.databases.scoutingData.local,
        "basic": this.databases.basic.local,
    };
    static remotes: { attachments: PouchDB.Database<{ name: string; team: number | undefined; author: string }>; scoutingData: PouchDB.Database<{ points: number }>; basic: PouchDB.Database<{}> } = {
        "attachments": this.databases.attachments.remote,
        "scoutingData": this.databases.scoutingData.remote,
        "basic": this.databases.basic.remote,
    };
}

export default {
    LocalRemoteServerSideDatabaseSyncHolder: LocalRemoteServerSideDatabaseSyncHolder,
    databases: LocalRemoteServerSideDatabaseSyncHolder.databases,
    locals: LocalRemoteServerSideDatabaseSyncHolder.locals,
    remotes: LocalRemoteServerSideDatabaseSyncHolder.remotes
};