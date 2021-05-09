const HouseHold = require('../../models/houseHolds/houseHold')

const regenerateResidents = async(address) => {
    try { 

        db.rivvoterfile.aggregate(
            [{$match: {
                "szSitusCity": {$ne: ""},
                "szStreetName": {$ne: ""},
                "sHouseNum": {$ne: "", $ne: "0"}}},
            {$addFields: {
              'phones': [
                {$cond: [{$ne: ["$phone", ""]}, {type: '?', number: "$phone"}, null]},
            ]}},
            {$addFields: {
              'phones': {$filter: {input: "$phones", as: "p", cond: {$ne: ["$$p", null]}}}
            }},
            {$addFields: {
              'emails': [
                {$cond: [{$ne: ["$szEmailAddress", ""]}, {$toLower: '$szEmailAddress'}, null]},
            ]}},
            {$addFields: {
              'emails': {$filter: {input: "$emails", as: "p", cond: {$ne: ["$$p", null]}}}
            }},
            {$group: {
                _id:{
                    streetNum:  { $trim: { input:"$sHouseNum"}},
                    prefix: {$toUpper:  { $trim: { input:"$sPreDir"}}},
                    street: {$toUpper: { $trim: { input:"$szStreetName"}}},
                    suffix: {$toUpper: { $trim: { input: "$sStreetSuffix" } }},
                    unit: {$toUpper: { $trim: { input: '$sUnitNum'} }},
                    city: {$toUpper: { $trim: { input:"$szSitusCity"}}},
                    state: {abbrv: "CA", name: "CALIFORNIA"},
                    zip:  { $trim: { input:"$sSitusZip"}},
                    },
                hhParties: {$addToSet: '$ourParty'},
                residents: {$push: {_id: {$toString: '$_id'},
                            personID: {"$concat":[{$toUpper:'$szNameFirst'},{$toUpper:'$szNameMiddle'},{$toUpper:'$szNameLast'},{ $trim: { input:"$sHouseNum"}},{$toUpper:  { $trim: { input:"$sPreDir"}}},{$toUpper: { $trim: { input:"$szStreetName"}}},{$toUpper: { $trim: { input: "$sStreetSuffix" } }},{$toUpper: { $trim: { input: '$sUnitNum'} }},{$toUpper: { $trim: { input:"$szSitusCity"}}},"CA",{ $trim: { input:"$sSitusZip"}},"_",'$lVoterUniqueID',"_", '$sAffNumber']}, 
                                    name: { firstName: {$toUpper:'$szNameFirst'},
                                            middleName: {$toUpper:'$szNameMiddle'},
                                            lastName: {$toUpper:'$szNameLast'}},
                                    phones: '$phones',
                                    creationInfo: {userID: '0001', orgID: '0001', creationType: 'VOTERFILE'},
                                    emails: '$emails',
                                    dob:  {$toDate: '$dob'},
                                    party: '$ourParty',
                                    voterID: '$lVoterUniqueID',
                                    affidavit: '$sAffNumber',
                                    pav: '$pav',
                                    ethnicity: '$ethnicity',
                                    generalPropensity: {$toInt: '$generalPropensity'},
                                    primaryPropensity: {$toInt: '$primaryPropensity'},
                                    regDates: [{$toDate: '$orgRegDate'},{$toDate: '$regDate'}],
                                    tags: '$tags'  
                     }},
            },
        }, {$out: 'rivhouseholds'}], {allowDiskUse: true})  
        
        
        db.sbvoterfile.aggregate(
          [{$match: {
              "city": {$ne: ""},
              "street": {$ne: ""},
              "house_number": {$ne: "", $ne: "0"}}},
          {$addFields: {
            'phones': [
              {$cond: [{$ne: ["$phone_1", ""]}, {type: '?', number: "$phone_1"}, null]},
              {$cond: [{$ne: ["$phone_2", ""]}, {type: '?', number: "$phone_2"}, null]},
          ]}},
          {$addFields: {
            'phones': {$filter: {input: "$phones", as: "p", cond: {$ne: ["$$p", null]}}}
          }},
          {$addFields: {
            'languages': [
              {$cond: [{$ne: ["$language", ""]}, "$language", null]},
          ]}},
          {$addFields: {
            'languages': {$filter: {input: "$languages", as: "p", cond: {$ne: ["$$p", null]}}}
          }},
          {$addFields: {
            'emails': [
              {$cond: [{$ne: ["$email", ""]}, {$toLower: '$email'}, null]},
          ]}},
          {$addFields: {
            'emails': {$filter: {input: "$emails", as: "p", cond: {$ne: ["$$p", null]}}}
          }},
          {$group: {
              _id:{
                  streetNum: "$house_number",
                  prefix:  "$pre_dir",
                  street: "$street",
                  suffix: "$type",
                  unit: '$apartment_number',
                  city: {$trim: {input: "$city"}},
                  state: {abbrv: "CA", name: "CALIFORNIA"},
                  zip: "$zip",
                  },
              hhParties: {$addToSet: '$ourParty'},
              residents: {$push: {_id: {$toString: '$_id'},
                                  name: { firstName: '$name_first',
                                          middleName: '$name_middle',
                                          lastName: '$name_last'},
                                  personID: {"$concat":["$name_first","$name_middle","$name_last","$house_number","$pre_dir","$street","$type","$apartment_number",{$trim: {input: "$city"}},"CA","$zip","_","$voter_id","_","$affidavit"]}, 
                                  phones: '$phones',
                                  creationInfo: {userID: '0001', orgID: '0001', creationType: 'VOTERFILE'},
                                  emails: '$emails',
                                  dob:  {$toDate: '$dob'},
                                  gender: '$gender',
                                  party: '$ourParty',
                                  voterID: '$voter_id',
                                  affidavit: '$affidavit',
                                  languages: '$languages',
                                  pav: '$pav',
                                  ethnicity: '$ethnicity',
                                  generalPropensity: {$toInt: '$generalPropensity'},
                                  primaryPropensity: {$toInt: '$primaryPropensity'},
                                  regDates: [{$toDate: '$orgRegDate'},{$toDate: '$regDate'}],  
                                  tags: '$tags'        
                   }},
              precinct: {$first: '$precinct_name'},
          },
      }, {$out: 'sbhouseholds'}], {allowDiskUse: true})

    db.sbhouseholds.aggregate( [
      {$merge : { into: "households", on: "_id", whenMatched: [{$set: {residents: "$$new.residents"}}], whenNotMatched: "discard"} }
    ])

    db.rivhouseholds.aggregate( [
      {$merge : { into: "households", on: "_id", whenMatched: [{$set: {residents: "$$new.residents"}}], whenNotMatched: "discard"} }
    ])

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {regenerateResidents}