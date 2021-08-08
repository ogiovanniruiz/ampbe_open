var OutreachReport = require('../../models/campaigns/outreachReport')

const getScriptReport = async(detail) => {
    try {

        var datePicker = '';

        if (detail.data.reportPickerStart && !detail.data.reportPickerEnd) {
            var datePicker = {'$gte': detail.data.reportPickerStart};
        }
        if (!detail.data.reportPickerStart && detail.data.reportPickerEnd) {
            var datePicker = {'$lte': detail.data.reportPickerEnd};
        }
        if (detail.data.reportPickerStart && detail.data.reportPickerEnd) {
            var datePicker = {'$gte': detail.data.reportPickerStart, '$lte': detail.data.reportPickerEnd};
        }

        var activityType = '';
        if (detail.data.selectedActivityType !== 'All') {
            activityType = detail.data.selectedActivityType;
        }

        var org = '';
        if (detail.orgID !== '') {
            org = detail.orgID;
        }

        var scriptArray = await detail.data.selectedScript;

        var VERYPOSITIVE = [];
        var POSITIVE = [];
        var NEUTRAL = [];
        var NEGATIVE = [];
        var VERYNEGATIVE = [];

        if (scriptArray.length) {
            for(var h = 0; h < scriptArray.length; h++) {
                var script = scriptArray[h];

                if (script.questions) {
                    for(var i = 0; i < script.questions.length; i++){
                        await VERYPOSITIVE.push({
                            [script.questions[i]._id]: {
                                '$size': {
                                    '$filter': {
                                        'input': '$outReachEntry.scriptResponse',
                                        'cond': {
                                            '$and': [
                                                { '$eq': ['$$this.questionResponses.idType', 'VERYPOSITIVE'] },
                                                { '$eq': ['$$this.questionResponses.question', script.questions[i].question]}
                                            ]
                                        }
                                    }
                                }
                            }
                        });
                        await POSITIVE.push({
                            [script.questions[i]._id]: {
                                '$size': {
                                    '$filter': {
                                        'input': '$outReachEntry.scriptResponse',
                                        'cond': {
                                            '$and': [
                                                { '$eq': ['$$this.questionResponses.idType', 'POSITIVE'] },
                                                { '$eq': ['$$this.questionResponses.question', script.questions[i].question]}
                                            ]
                                        }
                                    }
                                }
                            }
                        });
                        await NEUTRAL.push({
                            [script.questions[i]._id]: {
                                '$size': {
                                    '$filter': {
                                        'input': '$outReachEntry.scriptResponse',
                                        'cond': {
                                            '$and': [
                                                { '$eq': ['$$this.questionResponses.idType', 'NEUTRAL'] },
                                                { '$eq': ['$$this.questionResponses.question', script.questions[i].question]}
                                            ]
                                        }
                                    }
                                }
                            }
                        });
                        await NEGATIVE.push({
                            [script.questions[i]._id]: {
                                '$size': {
                                    '$filter': {
                                        'input': '$outReachEntry.scriptResponse',
                                        'cond': {
                                            '$and': [
                                                { '$eq': ['$$this.questionResponses.idType', 'NEGATIVE'] },
                                                { '$eq': ['$$this.questionResponses.question', script.questions[i].question]}
                                            ]
                                        }
                                    }
                                }
                            }
                        });
                        await VERYNEGATIVE.push({
                            [script.questions[i]._id]: {
                                '$size': {
                                    '$filter': {
                                        'input': '$outReachEntry.scriptResponse',
                                        'cond': {
                                            '$and': [
                                                { '$eq': ['$$this.questionResponses.idType', 'VERYNEGATIVE'] },
                                                { '$eq': ['$$this.questionResponses.question', script.questions[i].question]}
                                            ]
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
            }
        }

        const agg = [
            {
                '$match': {
                    'campaignID': detail.campaignID,
                    'activityType': activityType ? activityType : { $exists: true },
                    'orgID': org ? org : { $exists: true },
                }
            }, {
                '$group': {
                    '_id': {'personID':'$personID', 'orgID':'$orgID'},
                    'outReachReport': {
                        '$last': '$$ROOT'
                    }
                }
            }, {
                '$unwind': {
                    'path': '$outReachReport.scriptResponse.questionResponses',
                    'preserveNullAndEmptyArrays': true
                }
            }, {
                '$addFields': {
                    'scriptResponseTimePST': {
                        '$dateToString': {
                            'format': '%Y-%m-%d',
                            'date': {'$cond': {if: '$outReachReport.scriptResponse.date', then: '$outReachReport.scriptResponse.date', else: '$outReachReport.nonResponse.date'}},
                            'timezone': 'America/Los_Angeles'
                        }
                    }
                }
            }, {
                '$match': {
                    'scriptResponseTimePST': datePicker ? datePicker : { $exists: true },
                }
            }, {
                '$group': {
                    '_id': '$outReachReport.scriptID',
                    'outReachEntry': {
                        '$push': '$outReachReport'
                    }
                }
            }, {
                '$project': {
                    '_id': 1,
                    VERYPOSITIVE,
                    POSITIVE,
                    NEUTRAL,
                    NEGATIVE,
                    VERYNEGATIVE
                }
            }
        ];
        return await OutreachReport.aggregate(agg).allowDiskUse(true);

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getScriptReport}
