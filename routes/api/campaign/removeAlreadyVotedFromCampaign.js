const Router = require('express').Router

const alreadyVotedJobs = require('../../../services/activity/alreadyVotedJobs')

// Starts the removal and returns {jobID}; poll getAlreadyVotedJob for the counts
module.exports = Router({ mergeParams: true }).post('/removeAlreadyVotedFromCampaign', async (req, res, next) => {
    try {
        var apply = req.body.apply === true
        res.send({jobID: alreadyVotedJobs.startJob(`campaign:${req.body.campaignID}:${apply}`, {campaignID: req.body.campaignID, apply})})
    } catch(e) {
        console.log(e.message)
        res.sendStatus(500)
    }
})
