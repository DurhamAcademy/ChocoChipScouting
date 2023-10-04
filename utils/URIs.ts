

const couchDBBaseURL = (typeof window !== 'undefined')?`http://${window.location.hostname}:5984`:`http://localhost:5984`

export {
    couchDBBaseURL
};