var OutreachReport = require('../../models/campaigns/outreachReport')
var Activity = require('../../models/activities/activity')
var pbcontacthistory = require('../../models/activities/phonebank/phonebankContactHistory')
var ccontacthistory = require('../../models/activities/canvass/canvassContactHistory')
var tbcontacthistory = require('../../models/activities/textbank/textbankContactHistory')

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

        var scriptIDArray = detail.data.selectedScript.map(x => x._id);
        var activityIDs = await Activity.find({scriptID: {$in: scriptIDArray}}, {_id: 1, scriptID: 1})

        var activityIDs = await Activity.aggregate([
            {$match: {scriptID: {$in: scriptIDArray}}}, 
            {$group: {_id: "$scriptID", 
                      activityID: {$push: "$_id"}}},
            {$project: {_id: 1, activityID: 1}}
        ] )

        var attempts = []

        for(var i = 0; i < activityIDs.length; i++){

            var totalRecords = 0
            var pbRecords = 0
            var cRecords = 0
            var tbRecords = 0

            var activityAgg = {activityID: {$in: activityIDs[i].activityID},
            'orgID': org ? org : { $exists: true },
            '$or': [{'textInitDate': datePicker ? datePicker : { $exists: true }},
                    {'callInitTime': datePicker ? datePicker : { $exists: true }},
                    {'scriptResponse.date': datePicker ? datePicker : { $exists: true }},
                    {'nonResponse.date': datePicker ? datePicker : { $exists: true }},
                    //{'date': datePicker ? datePicker : { $exists: true }}
                ]

        }

            if(detail.data.selectedActivityType === 'Phonebank' || detail.data.selectedActivityType === 'All' ){
                pbRecords = await pbcontacthistory.countDocuments(activityAgg)
            }

            if(detail.data.selectedActivityType === 'Canvass' || detail.data.selectedActivityType === 'All' ){
                cRecords = await ccontacthistory.countDocuments(activityAgg)
            }

            if(detail.data.selectedActivityType === 'Texting' || detail.data.selectedActivityType === 'All' ){
                tbRecords = await tbcontacthistory.countDocuments(activityAgg)
            }

            totalRecords = pbRecords + cRecords + tbRecords

            attempts.push({scriptID: activityIDs[i]._id, attempts: totalRecords})

        }

        const agg = [
            {
                '$match': {
                    'scriptResponse': {$exists: true},
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
                    'ids': {$sum: 1}
                }
            }, 
            

        ];

        var ids = await OutreachReport.aggregate(agg).allowDiskUse(true);

        var dncs = await OutreachReport.aggregate( [{              '$match': {
            'nonResponse': {$exists: true},
            'nonResponse.nonResponseType': "DNC",
            'campaignID': detail.campaignID,
            'activityType': activityType ? activityType : { $exists: true },
            'orgID': org ? org : { $exists: true }, 
            //'date': datePicker ? datePicker : { $exists: true }
        }}
        , {
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
        } 
        
        
        , {
            '$group': {
                '_id': '$scriptID',
                'dncs': {$sum: 1}
            }
        }, ])

        

        return {ids: ids, attempts: attempts, dncs: dncs}


    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getScriptReport}
