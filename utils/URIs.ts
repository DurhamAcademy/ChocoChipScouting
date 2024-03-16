
let couchDBBaseURL: string;
if (typeof window !== 'undefined') {
    let protocol = "http://"
    let port = 5984
    if (window.isSecureContext && (location.hostname!="localhost")) {
        port = 6984
        protocol = "https://"
    }
    couchDBBaseURL = `${location.protocol}//${window.location.hostname}:${port}`;
} else {
    if (process.env.NUXT_COUCH_DB_HOSTNAME !== undefined) {
        couchDBBaseURL = `http://${process.env.NUXT_COUCH_DB_HOSTNAME}:5984`;
    } else {
        couchDBBaseURL = `http://localhost:5984`;
    }
}

export {
    couchDBBaseURL
};