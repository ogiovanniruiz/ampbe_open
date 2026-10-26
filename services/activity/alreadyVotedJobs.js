var crypto = require('crypto')
var CloseAlreadyVoted = require('./closeAlreadyVoted')

// A campaign-wide scan can run past the host's request timeout (30s on some hosts), so removals run here in the
// background and the client polls getJob. Jobs live in memory (one server process); a restart loses
// them and the client asks to retry, which is safe because a rerun only finds what's left.
const KEEP_FINISHED_MS = 10 * 60 * 1000

var jobs = new Map()
var runningByKey = new Map()

// key identifies the scope (campaign or activity) and apply, so a double click joins the running job
const startJob = (key, params) => {
    if(runningByKey.has(key)) return runningByKey.get(key)

    var jobID = crypto.randomUUID()
    var job = {status: 'running', done: 0, total: 0, result: null}
    jobs.set(jobID, job)
    runningByKey.set(key, jobID)

    CloseAlreadyVoted.closeAlreadyVoted({...params, onProgress: (done, total) => Object.assign(job, {done, total})})
        .then(result => Object.assign(job, {status: 'done', result}))
        .catch(e => {
            console.log(e.message)
            job.status = 'failed'
        })
        .finally(() => {
            runningByKey.delete(key)
            setTimeout(() => jobs.delete(jobID), KEEP_FINISHED_MS).unref()
        })

    return jobID
}

const getJob = (jobID) => jobs.get(jobID)

module.exports = {startJob, getJob}
