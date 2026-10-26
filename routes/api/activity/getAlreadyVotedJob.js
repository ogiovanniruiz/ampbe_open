const Router = require('express').Router

const alreadyVotedJobs = require('../../../services/activity/alreadyVotedJobs')

// {status: 'running'|'done'|'failed', done, total, result}; 404 once the job is gone (finished long ago or server restarted)
module.exports = Router({ mergeParams: true }).post('/getAlreadyVotedJob', async (req, res, next) => {
    try {
        var job = alreadyVotedJobs.getJob(req.body.jobID)
        if(!job) return res.sendStatus(404)
        res.send(job)
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
