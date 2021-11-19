var OutreachReport = require('../../models/campaigns/outreachReport');
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const getOrgReport = async(detail) => {
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
            var activityType = detail.data.selectedActivityType;
        }

        var VERYPOSITIVE = [];
        var POSITIVE = [];
        var NEUTRAL = [];
        var NEGATIVE = [];
        var VERYNEGATIVE = [];

        var script = await detail.data.selectedScript;
        if (script.questions) {
            for(var i = 0; i < script.questions.length; i++){
                VERYPOSITIVE.push({
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
                POSITIVE.push({
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
                NEUTRAL.push({
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
                NEGATIVE.push({
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
                VERYNEGATIVE.push({
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

        const agg = [
            {
                '$match': {
                    'campaignID': detail.campaignID,
                    'activityType': activityType ? activityType : { $exists: true },
                    'scriptID': detail.data.selectedScript._id,
                }
            },
            {
                '$project':{
                    user: 0,
                    person: 0,
                    campaignID: 0,
                    activityType: 0,
                    member: 0,

                    
                }
            } ,
            {
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
                    '_id': '$outReachReport.orgID',
                    'outReachEntry': {
                        '$push': '$outReachReport'
                    }
                }
            }, {
                '$project': {
                    VERYPOSITIVE,
                    POSITIVE,
                    NEUTRAL,
                    NEGATIVE,
                    VERYNEGATIVE,
                    'IMP': {
                        '$size': {
                            '$filter': {
                                'input': '$outReachEntry.nonResponse',
                                'cond': {
                                    '$and': [
                                        {'$eq': ['$$this.nonResponseType', 'IMP']}
                                    ]
                                }
                            }
                        }
                    },
                    'INVALIDPHONE': {
                        '$size': {
                            '$filter': {
                                'input': '$outReachEntry.nonResponse',
                                'cond': {
                                    '$and': [
                                        {'$eq': ['$$this.nonResponseType', 'INVALIDPHONE']}
                                    ]
                                }
                            }
                        }
                    },
                    'DNC': {
                        '$size': {
                            '$filter': {
                                'input': '$outReachEntry.nonResponse',
                                'cond': {
                                    '$and': [
                                        {'$eq': ['$$this.nonResponseType', 'DNC']}
                                    ]
                                }
                            }
                        }
                    },
                    'NONRESPONSE': {
                        '$size': {
                            '$filter': {
                                'input': '$outReachEntry.nonResponse',
                                'cond': {
                                    '$and': [
                                        {'$eq': ['$$this.nonResponseType', 'NONRESPONSE']}
                                    ]
                                }
                            }
                        }
                    }
                }
            }
        ];

        //console.log(JSON.stringify(agg, null, 2))
        var report = await OutreachReport.aggregate(agg).allowDiskUse(true);
        return report;
    } catch(e){

        throw new Error(e.message)

    }
}

module.exports = {getOrgReport}
