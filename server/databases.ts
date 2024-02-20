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
        if (this.local) {
            PouchDB.sync(this.local, this.remote, {live: true, retry: true,})
            return true
        }
        return false
    }

    static databases: { attachments: LocalRemoteServerSideDatabaseSyncHolder<{ event: string; name: string; teamNumber: number; fileSize: string; author : string | undefined; tags: string[] ; extraNotes: string }>; scoutingData: LocalRemoteServerSideDatabaseSyncHolder<{ event: string; teamNumber: number; matchNumber: number }>; basic: LocalRemoteServerSideDatabaseSyncHolder<{}> } = {
        "attachments": new LocalRemoteServerSideDatabaseSyncHolder<{ event: string; name: string; teamNumber: number; fileSize: string; author : string | undefined; tags: string[] ; extraNotes: string }>("attachment-db", false),
        "scoutingData": new LocalRemoteServerSideDatabaseSyncHolder<{ event: string; teamNumber: number; matchNumber: number }>("scouting-data", false),
        "basic": new LocalRemoteServerSideDatabaseSyncHolder<{}>("basic", false)
    };
    static locals: { attachments: PouchDB.Database<{ event: string; name: string; teamNumber: number; fileSize: string; author : string | undefined; tags: string[] ; extraNotes: string }>; scoutingData: PouchDB.Database<{ event: string; teamNumber: number; matchNumber: number}>; basic: PouchDB.Database<{}> } = {
        "attachments": this.databases.attachments.local!,
        "scoutingData": this.databases.scoutingData.local!,
        "basic": this.databases.basic.local!,
    };
    static remotes: { attachments: PouchDB.Database<{ event: string; name: string; teamNumber: number; fileSize: string; author : string | undefined; tags: string[] ; extraNotes: string }>; scoutingData: PouchDB.Database<{ event: string; teamNumber: number; matchNumber: number}>; basic: PouchDB.Database<{}> } = {
        "attachments": this.databases.attachments.remote,
        "scoutingData": this.databases.scoutingData.remote,
        "basic": this.databases.basic.remote,
    };
}

for (const database of Object.values(LocalRemoteServerSideDatabaseSyncHolder.databases)) {
    database.sync()
}

export default {
    LocalRemoteServerSideDatabaseSyncHolder: LocalRemoteServerSideDatabaseSyncHolder,
    databases: LocalRemoteServerSideDatabaseSyncHolder.databases,
    locals: LocalRemoteServerSideDatabaseSyncHolder.locals,
    remotes: LocalRemoteServerSideDatabaseSyncHolder.remotes
};