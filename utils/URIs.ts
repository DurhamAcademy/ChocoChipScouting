
let couchDBBaseURL: string;
if (typeof window !== 'undefined') {
    let protocol = "http://"
    let port = 5984
    if (window.isSecureContext) {
        port = 6984
        protocol = "https://"
    }
    couchDBBaseURL = `${protocol}${window.location.hostname}:5984`;
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