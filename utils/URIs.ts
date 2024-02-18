
const couchDBBaseURL = (typeof window !== 'undefined')?`http://${window.location.hostname}:5984`:(process.env.couchDBHostname!==undefined)?`http://${process.env.couchDBHostname}:5984`:`http://localhost:5984`

export {
    couchDBBaseURL
};