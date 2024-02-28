
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
    if (process.env.couchDBHostname !== undefined) {
        couchDBBaseURL = `http://${process.env.couchDBHostname}:5984`;
    } else {
        couchDBBaseURL = `http://localhost:5984`;
    }
}

export {
    couchDBBaseURL
};