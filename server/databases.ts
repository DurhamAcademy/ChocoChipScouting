import {couchDBBaseURL} from "~/utils/URIs";
import PouchDB from "pouchdb"
import {Attachments, ScoutingData, TeamData} from "../utils/databases";

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
            const sync = await PouchDB.sync(this.local, this.remote, {live: true, retry: true,});
            return true
        }
        return false
    }

    static databases = {
        "attachments": new LocalRemoteServerSideDatabaseSyncHolder<Attachments>("attachments", false),
        "scoutingData": new LocalRemoteServerSideDatabaseSyncHolder<ScoutingData>("scouting-data", false),
        "teamData": new LocalRemoteServerSideDatabaseSyncHolder<TeamData>("team-data", false),
        "basic": new LocalRemoteServerSideDatabaseSyncHolder<{}>("basic", false),
    };
    static locals = {
        "attachments": this.databases.attachments.local!,
        "scoutingData": this.databases.scoutingData.local!,
        "teamData": this.databases.teamData.local!,
        "basic": this.databases.basic.local!,
    };
    static remotes = {
        "attachments": this.databases.attachments.remote,
        "scoutingData": this.databases.scoutingData.remote,
        "teamData": this.databases.teamData.remote,
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