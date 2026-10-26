const Router = require('express').Router

const alreadyVotedJobs = require('../../../services/activity/alreadyVotedJobs')

// Starts the removal and returns {jobID}; poll getAlreadyVotedJob for the counts
module.exports = Router({ mergeParams: true }).post('/removeAlreadyVoted', async (req, res, next) => {
    try {
        var apply = req.body.apply === true
        res.send({jobID: alreadyVotedJobs.startJob(`activity:${req.body.activityID}:${apply}`, {activityIDs: [req.body.activityID], apply})})
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
