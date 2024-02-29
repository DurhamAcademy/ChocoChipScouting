import PouchDB from "pouchdb"

class LocalRemoteDatabaseSyncHolder<Content extends {} = {}> {
    name: string
    local: PouchDB.Database<Content>
    remote: PouchDB.Database<Content>

    constructor(name: string) {
        this.name = name;
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

    static databases = {
        "attachments": new LocalRemoteDatabaseSyncHolder<Attachments>("attachments"),
        "scoutingData": new LocalRemoteDatabaseSyncHolder<ScoutingData>("scouting-data"),
        "basic": new LocalRemoteDatabaseSyncHolder<{}>("basic")
    };
    static locals= {
        "attachments": this.databases.attachments.local,
        "scoutingData": this.databases.scoutingData.local,
        "basic": this.databases.basic.local,
    };
    static remotes = {
        "attachments": this.databases.attachments.remote,
        "scoutingData": this.databases.scoutingData.remote,
        "basic": this.databases.basic.remote,
    };
}

export type ScoutingData = {
    auto: {speakerNA: number; amp: number; mobility: boolean};
    notes: {efficiency: number; notes: string; reliability: number};
    endgame: {endgame: string[]; trap: number};
    teamNumber: number;
    event: string;
    matchNumber: number;
    teleop: {speakerA: number; speakerNA: number; amp: number};
}

export type Attachments = {
    name: string;
    team: number;
    author: string | undefined;
}

for (const database of Object.values(LocalRemoteDatabaseSyncHolder.databases)) {
    database.sync()
}


export default {
    databases: LocalRemoteDatabaseSyncHolder.databases,
    locals: LocalRemoteDatabaseSyncHolder.locals,
    remotes: LocalRemoteDatabaseSyncHolder.remotes
};
