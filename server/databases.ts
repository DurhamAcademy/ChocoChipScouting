import {couchDBBaseURL} from "~/utils/URIs";
import PouchDB from "pouchdb"
import {Attachments, ScoutingData, TeamInfo} from "~/utils/databases";

class LocalRemoteServerSideDatabaseSyncHolder<Content extends {} = {}> {
    name: string
    local: PouchDB.Database<Content> | null = null
    remote: PouchDB.Database<Content>
    memberRoles: string[]
    adminRoles: string[]

    constructor(name: string, local: boolean, memberRoles: string[], adminRoles: string[]) {
        this.name = name;
        if (local)
            this.local = new PouchDB(name, {skip_setup: true, name: name})
            this.remote = new PouchDB(couchDBBaseURL + name, {
            skip_setup: true,
            name: name,
            adapter: "http"
        })
        this.memberRoles = memberRoles
        this.adminRoles = adminRoles
    }

    async sync() {
        if (this.local) {
            const sync = await PouchDB.sync(this.local, this.remote, {live: true, retry: true,});
            return true
        }
        return false
    }

    static databases = {
        "attachments": new LocalRemoteServerSideDatabaseSyncHolder<Attachments>("attachments", false, ["drive team", "scout", 'pit', 'other', '_admin'], ["_admin", "admin"]),
        "scoutingData": new LocalRemoteServerSideDatabaseSyncHolder<ScoutingData>("scouting-data", false, ["drive team", "scout", 'pit', 'other', '_admin'], ["_admin", "admin"]),
        "teamInfo": new LocalRemoteServerSideDatabaseSyncHolder<TeamInfo>("team-info", false, [], []),
        "basic": new LocalRemoteServerSideDatabaseSyncHolder<{}>("basic", false, ["drive team", "scout", 'pit', 'other', '_admin'], ["_admin", "admin"]),
    };
    static locals = {
        "attachments": this.databases.attachments.local!,
        "scoutingData": this.databases.scoutingData.local!,
        "teamInfo": this.databases.teamInfo.local!,
        "basic": this.databases.basic.local!,
    };
    static remotes = {
        "attachments": this.databases.attachments.remote,
        "scoutingData": this.databases.scoutingData.remote,
        "teamInfo": this.databases.teamInfo.remote,
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