var Activity = require('../../models/activities/activity')
var Script = require('../../models/scripts/script.js')
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const ISODate = mongoose.Types.ISODate
var TextbankContactHistory = require('../../models/activities/textbank/textbankContactHistory')

const getTextingReport = async(detail) => {
    try {

        var datePicker = '';

        if (detail.reportPickerStart && !detail.reportPickerEnd) {
            var datePicker = {'$gte': detail.reportPickerStart};
        }
        if (!detail.reportPickerStart && detail.reportPickerEnd) {
            var datePicker = {'$lte': detail.reportPickerEnd};
        }
        if (detail.reportPickerStart && detail.reportPickerEnd) {
            var datePicker = {'$gte': detail.reportPickerStart, '$lte': detail.reportPickerEnd};
        }

        var activity = await Activity.findById(ObjectId(detail.activityID))
        var script = {};
        if(activity.scriptID) {
            script = await Script.findById(ObjectId(activity.scriptID));
        }

        var VERYPOSITIVE = [];
        var POSITIVE = [];
        var NEUTRAL = [];
        var NEGATIVE = [];
        var VERYNEGATIVE = [];

        if (script.questions) {
            for(var i = 0; i < script.questions.length; i++){
                await VERYPOSITIVE.push({
                    [script.questions[i]._id]: {
                        '$size': {
                            '$filter': {
                                'input': '$residents.scriptResponse',
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
                                'input': '$residents.scriptResponse',
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
                                'input': '$residents.scriptResponse',
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
                                'input': '$residents.scriptResponse',
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
                                'input': '$residents.scriptResponse',
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

        var agg = [
            {
                '$match': {
                    'activityID': detail.activityID
                }
            }, {
                '$unwind': {
                    'path': '$scriptResponse.questionResponses',
                    'preserveNullAndEmptyArrays': true
                }
            }, {
                '$addFields': {
                    'scriptResponseTimePST': {
                        '$dateToString': {
                            'format': '%Y-%m-%d',
                            'date': {'$cond': {if: '$scriptResponse.date', then: '$scriptResponse.date', else: '$nonResponse.date'}},
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
                    '_id': '$userID',
                    'residents': {
                        '$push': '$$ROOT'
                    }
                }
            }, {
                '$project': {
                    '_id': 1,
                    'sent': {
                        '$size': '$residents'
                    },
                    'successful': {
                        '$size': {
                            '$filter': {
                                'input': '$residents',
                                'cond': {
                                    '$and': [
                                        {'$eq': ['$$this.textSuccessful', true]}
                                    ]
                                }
                            }
                        }
                    },
                    'received': {
                        '$size': {
                            '$filter': {
                                'input': '$residents',
                                'cond': {
                                    '$and': [
                                        {'$eq': ['$$this.textReceived.status', true]}
                                    ]
                                }
                            }
                        }
                    },
                    VERYPOSITIVE,
                    POSITIVE,
                    NEUTRAL,
                    NEGATIVE,
                    VERYNEGATIVE,
                    'IMP': {
                        '$size': {
                            '$filter': {
                                'input': '$residents.nonResponse',
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
                                'input': '$residents.nonResponse',
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
                                'input': '$residents.nonResponse',
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
                                'input': '$residents.nonResponse',
                                'cond': {
                                    '$and': [
                                        {'$eq': ['$$this.nonResponseType', 'NONRESPONSE']}
                                    ]
                                }
                            }
                        }
                    }
                }
        }];

        var report = await TextbankContactHistory.aggregate(agg).allowDiskUse(true);

        return {activities: report, script: script};
    } catch(e){
        throw new Error(e.message)
    }
};

module.exports = {getTextingReport}
