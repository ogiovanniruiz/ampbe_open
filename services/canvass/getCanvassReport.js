var Activity = require('../../models/activities/activity')
var Script = require('../../models/scripts/script.js')
var mongoose = require('mongoose');
const CanvassContactHistory = require('../../models/activities/canvass/canvassContactHistory');
const ObjectId = mongoose.Types.ObjectId;

const getCanvassReport = async(detail) => {
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
                VERYPOSITIVE.push({
                    [script.questions[i]._id]: {
                        '$size': {
                            '$filter': {
                                'input': '$residents.scriptResponse.questionResponses',
                                    'cond': {
                                    '$and': [
                                        { '$eq': ['$$this.idType', 'VERYPOSITIVE'] },
                                        { '$eq': ['$$this.question', script.questions[i].question]},
                                    ]
                                }
                            }
                        }
                    }
                })

                POSITIVE.push({
                    [script.questions[i]._id]: {
                        '$size': {
                            '$filter': {
                                'input': '$residents.scriptResponse.questionResponses',
                                'cond': {
                                    '$and': [
                                        { '$eq': ['$$this.idType', 'POSITIVE'] },
                                        { '$eq': ['$$this.question', script.questions[i].question]},
                                    ]
                                }
                            }
                        }
                    }
                })

                NEUTRAL.push({
                    [script.questions[i]._id]: {
                        '$size': {
                            '$filter': {
                                'input': '$residents.scriptResponse.questionResponses',
                                'cond': {
                                    '$and': [
                                        { '$eq': ['$$this.idType', 'NEUTRAL'] },
                                        { '$eq': ['$$this.question', script.questions[i].question]},
                                    ]
                                }
                            }
                        }
                    }
                })

                NEGATIVE.push({
                    [script.questions[i]._id]: {
                        '$size': {
                            '$filter': {
                                'input': '$residents.scriptResponse.questionResponses',
                                'cond': {
                                    '$and': [
                                        { '$eq': ['$$this.idType', 'NEGATIVE'] },
                                        { '$eq': ['$$this.question', script.questions[i].question]},
                                    ]
                                }
                            }
                        }
                    }
                })

                VERYNEGATIVE.push({
                    [script.questions[i]._id]: {
                        '$size': {
                            '$filter': {
                                'input': '$residents.scriptResponse.questionResponses',
                                'cond': {
                                    '$and': [
                                        { '$eq': ['$$this.idType', 'VERYNEGATIVE'] },
                                        { '$eq': ['$$this.question', script.questions[i].question]},
                                    ]
                                }
                            }
                        }
                    }
                })

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
                    },
                    {
                        '$group': {
                            '_id': '$userID',
                            'residents': {
                                '$push': '$$ROOT'
                            }
                        }
                    },                    
                    {
                        '$project': {
                            '_id': 1,
                            'residents': 1,
                            VERYPOSITIVE,
                            POSITIVE,
                            NEUTRAL,
                            NEGATIVE,
                            VERYNEGATIVE,
                            'IMP': {
                                '$size': {
                                    '$filter': {
                                        'input': '$residents',
                                        'cond': {
                                            '$eq': [
                                                '$$this.nonResponse.nonResponseType', 'IMP'
                                            ]
                                        }
                                    }
                                }
                            },
                            'INVALIDADDRESS': {
                                '$size': {
                                    '$filter': {
                                        'input': '$residents',
                                        'cond': {
                                            '$eq': [
                                                '$$this.nonResponse.nonResponseType', 'INVALIDADDRESS'
                                            ]
                                        }
                                    }
                                }
                            },'DNC': {
                                '$size': {
                                    '$filter': {
                                        'input': '$residents',
                                        'cond': {
                                            '$eq': [
                                                '$$this.nonResponse.nonResponseType', 'DNC'
                                            ]
                                        }
                                    }
                                }
                            },
                            'NONRESPONSE': {
                                '$size': {
                                    '$filter': {
                                        'input': '$residents',
                                        'cond': {
                                            '$eq': [
                                                '$$this.nonResponse.nonResponseType', 'NONRESPONSE'
                                            ]
                                        }
                                    }
                                }
                            },                        
                        }
                    },
                    {
                        '$project': {
                            '_id': 1,
                            VERYPOSITIVE: 1,
                            POSITIVE: 1,
                            NEUTRAL: 1,
                            NEGATIVE: 1,
                            VERYNEGATIVE: 1,
                            IMP: 1,
                            INVALIDADDRESS: 1,
                            DNC: 1,
                            NONRESPONSE: 1                       
                        }
                    },

        ];

        

        var report = await CanvassContactHistory.aggregate(agg).allowDiskUse(true);

        return {activities: report, script: script};
    } catch(e){
        throw new Error(e.message)
    }
};

module.exports = {getCanvassReport}
