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
        "teamData": new LocalRemoteDatabaseSyncHolder<TeamData>("team-data"),
        "basic": new LocalRemoteDatabaseSyncHolder<{}>("basic")
    };
    static locals= {
        "attachments": this.databases.attachments.local,
        "scoutingData": this.databases.scoutingData.local,
        "teamData": this.databases.teamData.local,
        "basic": this.databases.basic.local,
    };
    static remotes = {
        "attachments": this.databases.attachments.remote,
        "scoutingData": this.databases.scoutingData.remote,
        "teamData": this.databases.teamData.remote,
        "basic": this.databases.basic.remote,
    };
}

export type ScoutingData = {
    auto: { speakerNA: number; missedSpeaker: number; amp: number; missedAmp: number; mobility: boolean };
    notes: {  notes: string; promptedNotes: Array<Array<boolean & number & Array<string>>> };
    endgame: { endgame: string[]; trap: number; spotlight: number };
    teamNumber: any;
    event: string;
    matchNumber: any;
    author: string;
    teleop: { speakerNA: number; missedSpeaker: number; amp: number; missedAmp: number; }
}

export type TeamData = {
    teamNum: number,
    teamName: string
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
