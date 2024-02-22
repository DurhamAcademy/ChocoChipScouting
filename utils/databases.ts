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

    static databases: {
        attachments: LocalRemoteDatabaseSyncHolder<{ event: any; name: string; teamNumber: number; fileSize: string; author : string | undefined; tags: string[] ; extraNotes: string }>;
        scoutingData: LocalRemoteDatabaseSyncHolder<{ event: any; teamNumber: any; matchNumber: any }>;
        scheduleData: LocalRemoteDatabaseSyncHolder<{ event: any; teams: any; assignees: any; }>;
        basic: LocalRemoteDatabaseSyncHolder<{}> } = {
        "attachments": new LocalRemoteDatabaseSyncHolder<{ event: any; name: string; teamNumber: number; fileSize: string; author : string | undefined; tags: string[] ; extraNotes: string }>("attachment-db"),
        "scoutingData": new LocalRemoteDatabaseSyncHolder<{ event: any; teamNumber: number; matchNumber: number }>("scouting-data"),
        "scheduleData": new LocalRemoteDatabaseSyncHolder<{event: any; teams: any; assignees: any}>("schedule-data"),
        "basic": new LocalRemoteDatabaseSyncHolder<{}>("basic")
    };
    static locals: {
        attachments: PouchDB.Database<{ event: any; name: string; teamNumber: number; fileSize: string; author : string | undefined; tags: string[] ; extraNotes: string }>;
        scoutingData: PouchDB.Database<{ event: any; teamNumber: any; matchNumber: any}>;
        scheduleData: PouchDB.Database<{ event: any; teams: any; assignees: any; }>;
        basic: PouchDB.Database<{}> } = {
        "attachments": this.databases.attachments.local,
        "scoutingData": this.databases.scoutingData.local,
        "scheduleData": this.databases.scheduleData.local,
        "basic": this.databases.basic.local,
    };
    static remotes: {
        attachments: PouchDB.Database<{ event: any; name: string; teamNumber: number; fileSize: string; author : string | undefined; tags: string[] ; extraNotes: string }>;
        scoutingData: PouchDB.Database<{ event: any; teamNumber: any; matchNumber: any}>;
        scheduleData: PouchDB.Database<{ event: any; teams: any; assignees: any; }>;
        basic: PouchDB.Database<{}> } = {
        "attachments": this.databases.attachments.remote,
        "scoutingData": this.databases.scoutingData.remote,
        "scheduleData": this.databases.scheduleData.remote,
        "basic": this.databases.basic.remote,
    };
}

for (const database of Object.values(LocalRemoteDatabaseSyncHolder.databases)) {
    database.sync()
}

export default {
    databases: LocalRemoteDatabaseSyncHolder.databases,
    locals: LocalRemoteDatabaseSyncHolder.locals,
    remotes: LocalRemoteDatabaseSyncHolder.remotes
};