
var mongoose = require('mongoose');
var Membership = require('../../../models/people/membership');
 
var Organization = require('../../../models/organizations/organization')
var FindManyVoters = require('./findManyVoters')
var states = {"AL":"ALABAMA","AK":"ALASKA","AZ":"ARIZONA","AR":"ARKANSAS","CA":"CALIFORNIA","CO":"COLORADO","CT":"CONNECTICUT","DE":"DELAWARE","FL":"FLORIDA","GA":"GEORGIA","HI":"HAWAII","ID":"IDAHO","IL":"ILLINOIS","IN":"INDIANA","IA":"IOWA","KS":"KANSAS","KY":"KENTUCKY","LA":"LOUISIANA","ME":"MAINE","MD":"MARYLAND","MA":"MASSACHUSETTS","MI":"MICHIGAN","MN":"MINNESOTA","MS":"MISSISSIPPI","MO":"MISSOURI","MT":"MONTANA","NE":"NEBRASKA","NV":"NEVADA","NH":"NEW HAMPSHIRE","NJ":"NEW JERSEY","NM":"NEW MEXICO","NY":"NEW YORK","NC":"NORTH CAROLINA","ND":"NORTH DAKOTA","OH":"OHIO","OK":"OKLAHOMA","OR":"OREGON","PA":"PENNSYLVANIA","RI":"RHODE ISLAND","SC":"SOUTH CAROLINA","SD":"SOUTH DAKOTA","TN":"TENNESSEE","TX":"TEXAS","UT":"UTAH","VT":"VERMONT","VA":"VIRGINIA","WA":"WASHINGTON","WV":"WEST VIRGINIA","WI":"WISCONSIN","WY":"WYOMING"};
var Upload = require('../../../models/organizations/upload');
var jschardet = require("jschardet")
var CheckExistingMember = require('../createMember/checkExistingMember')
var {isConsentTag, applyConsent} = require('../consent')
var {newEnrollment} = require('../memberFields')
var {tagReader} = require('./uploadTags')
var {ensureTag} = require('../../organization/tags/orgTags')
var { parse } = require('csv-parse/sync')
 
const writeUpload = async(membershipData, upload) => {
 
    var encoding = jschardet.detect(membershipData.files[0].buffer)
 
    var membershipList = membershipData.files[0].buffer.toString(encoding.encoding);
 
    var orgID = membershipData.body.orgID;
 
    // Proper CSV parsing instead of the old regex-based comma/newline stripper.
    // `columns: true` uses row 1 as headers and returns an array of row objects,
    // e.g. { "First Name": "JANE", "Last Name": "DOE", ... }
    // This correctly handles quoted fields containing commas/newlines, \r\n line
    // endings, and doesn't degrade in performance as file size grows (the old
    // regex was effectively O(n^2) and could hang or misparse on large files).
    var records = parse(membershipList, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
        relax_column_count: true
    });
 
    if (!records.length) {
        console.log("NO ROWS FOUND IN UPLOAD.")
        await Upload.updateOne({_id: upload._id}, {$set:{uploadFinished: true}})
        return;
    }
 
    var headers = Object.keys(records[0]);
 
    var selectedTags = [];
    var orgTags = [];
 
    if(membershipData.body.selectedTags){
        selectedTags = membershipData.body.selectedTags.toString().split(",");
    }
 
    if(membershipData.body.orgTags){
        orgTags = membershipData.body.orgTags.toString().split(",");
    }

    // Tags with values: columns mapped to one tag ("tagValue:<label>"), and "Label: value" in the tag column
    var org = await Organization.findOne({_id: orgID}, {tagDefinitions: 1}).lean()
    var tags = tagReader(org?.tagDefinitions || [])
    var valueColumns = new Map(Object.entries(membershipData.body)
        .filter(([header, field]) => typeof field === 'string' && field.startsWith('tagValue:'))
        .map(([header, field]) => [header.trim(), field.slice('tagValue:'.length)]))
 
    for(var i = 0; i < records.length; i++){
 
        var personID = new mongoose.Types.ObjectId();

        let memberObj = {resident: {personID: personID,
                                    name: {},
                                    phones: [],
                                    emails: [],
                                    voterID: ""
                                    },
                        enrollment: newEnrollment({orgID: orgID, source: 'Upload', sourceID: upload._id, createdBy: upload.userID}),
                        tags: [],
                        activityIDs: [],
                         address: {street: '',
                                    prefix: '',
                                    suffix: '',
                                    unit: '',
                                    streetNum: personID, 
                                    city: '', 
                                    state: {abbrv: 'CA', name: 'CALIFORNIA'}, 
                                    zip: ''},
                        location: {type: "Point", coordinates: [0,0]}
                         };
 
        let currentRow = records[i];
 
        for(var j = 0; j < headers.length; j++){
            var header = headers[j];
            var value = currentRow[header];

            // A column for one tag: a filled cell is that member's value
            if(valueColumns.has(header.trim())){
                if(value && value.trim()) tags.addTag(memberObj['tags'], tags.cellTag(valueColumns.get(header.trim()), value))
                continue
            }
 
            if(header.trim() === getKeyByValue(membershipData.body, 'full name') && value){
                memberObj['resident']['name'] = fullName(value.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/gmi, ''))
            }else if(header.trim() === getKeyByValue(membershipData.body, 'first name') && value){
                memberObj['resident']['name']["firstName"] = value.toUpperCase().replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/gmi, '')
            }else if(header.trim() === getKeyByValue(membershipData.body, 'voterID') && value){
                memberObj['resident']["voterID"] = value.toUpperCase().replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/gmi, '')
            }else if(header.trim() === getKeyByValue(membershipData.body, 'middle name') && value){
                memberObj['resident']['name']["middleName"] = value.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/gmi, '');
            }else if(header.trim() === getKeyByValue(membershipData.body, 'last name') && value){
                memberObj['resident']['name']["lastName"] = value.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/gmi, '');
            }else if(header.trim() === getKeyByValue(membershipData.body, 'phone') && value){
                memberObj['resident']['phones'] = formatPhone(value);
            }else if(header.trim() === getKeyByValue(membershipData.body, 'email') && value){
                memberObj['resident']['emails'] = value.toLowerCase().trim();
            }else if(header.trim() === getKeyByValue(membershipData.body, 'address') && value){
                memberObj['fullAddress1'] = value.toUpperCase().replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/gmi, '');
            }else if(header.trim() === getKeyByValue(membershipData.body, 'unit') && value){
                memberObj['address']['unit'] = value.toLowerCase().trim();
            }else if(header.trim() === getKeyByValue(membershipData.body, 'address2') && value){
                memberObj['fullAddress2'] = value.toUpperCase().replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/gmi, '');
                memberObj['address']['city'] = split_address2(value.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/gmi, '')).city
                memberObj['address']['zip'] = split_address2(value.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/gmi, '')).zip
            }else if(header.trim() === getKeyByValue(membershipData.body, 'city') && value){
                memberObj['address']['city'] = value.toUpperCase().replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/gmi, '');
            }else if(header.trim() === getKeyByValue(membershipData.body, 'state')){
                memberObj['address']['state'] = getState(value);
            }else if(header.trim() === getKeyByValue(membershipData.body, 'zip') && value){
                memberObj['address']['zip'] = value.trim();
            }else if(header.trim() === getKeyByValue(membershipData.body, 'ethnicity') && value){
                memberObj['resident']['ethnicity'] = ethnicityCheck(value.trim())
            }else if(header.trim() === getKeyByValue(membershipData.body, 'tag') && value){
                for(var cellTag of tags.tagColumnTags(value)){
                    // The old consent tags become the member's consent flags, not tags
                    if(isConsentTag(cellTag.label, 'texting') || isConsentTag(cellTag.label, 'email')){
                        applyConsent(memberObj, {texting: isConsentTag(cellTag.label, 'texting') || undefined, email: isConsentTag(cellTag.label, 'email') || undefined})
                        continue
                    }
                    if(!orgTags.map(v => v.toUpperCase()).includes(cellTag.label.toUpperCase())){
                        var added = await ensureTag(orgID, cellTag.label, membershipData.body.userID)
                        if(added) cellTag.label = added.tag
                        orgTags.push(cellTag.label)
                    }
                    tags.addTag(memberObj['tags'], cellTag)
                }
            }
        }
 
        if(selectedTags.length){
            for(var k = 0; k < selectedTags.length; k++){
                if(isConsentTag(selectedTags[k], 'texting') || isConsentTag(selectedTags[k], 'email')){
                    applyConsent(memberObj, {texting: isConsentTag(selectedTags[k], 'texting') || undefined, email: isConsentTag(selectedTags[k], 'email') || undefined})
                    continue
                }
                if (!memberObj['tags'].some(t => t.label.toUpperCase() === String(selectedTags[k]).toUpperCase())){
                    memberObj['tags'].push({label: selectedTags[k]})
                }
            }
        }
 
        if(memberObj.resident.name.firstName || memberObj.resident.voterID){
            console.log("WRITING...", i)
 
            if(upload.checkDuplicates){
                var results = await CheckExistingMember.checkExistingMember(memberObj)
 
                if(!results){
                    var member = new Membership(memberObj);
                    await member.save()
                }else{
                    console.log("MEMBER ALREADY EXISTS.")
                }
 
            }else{
                var member = new Membership(memberObj);
                await member.save()
            }
 
        }
    }
 
    // Values that didn't match their tag (imported without a value), for the upload's list
    await Upload.updateOne({_id: upload._id}, {$set:{uploadFinished: true, ...tags.missReport()}})
 
    if(upload.checkVoterfile){
        FindManyVoters.findManyVoterStatus(upload._id);
    }
 
}
 
function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}
 
 
function split_address2(address2){
 
    var splitAddress = address2.split(" ");
    let zip = splitAddress[splitAddress.length - 1];
 
    let city_array = splitAddress.slice(0, -3);
 
    if(city_array.length > 1){
        city = city_array.join(" ")
    }else{
        city = city_array[0]
    }
 
    return {city, zip}
}
 
function fullName(fullName) {
    var splitName = fullName.split(" ");
    var name = {'fullName': fullName};
    if(splitName.length === 1) {
        name['firstName'] = splitName[0].replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/gmi, '');
        return name;
    }
    if(splitName.length === 2) {
        name['firstName'] = splitName[0].replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/gmi, '');
        name["lastName"] = splitName[1].replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/gmi, '');
        return name;
    }
    if(splitName.length === 3) {
        name['firstName'] = splitName[0].replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/gmi, '');
        name['middleName'] = splitName[1].replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/gmi, '');
        name["lastName"] = splitName[2].replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/gmi, '');
        return name;
    }
    if(splitName.length >= 4) {
        name['firstName'] = splitName[0].replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/gmi, '');
        name['middleName'] = splitName[1].replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/gmi, '');
        name['lastName'] = splitName[2].replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/gmi, '');
        for (var i = 3; i < splitName.length; i++) {
            name["lastName"] = name["lastName"]+' '+splitName[i].replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/gmi, '');
        }
        return name;
    }
    return name;
}
 
function formatPhone(phone) {
    return {type: '?', number: phone.replace(/[^0-9]/g,"")};
}
 
function getState(state) {
    if (!state){
        return {abbrv: 'CA', name: 'CALIFORNIA'};
    }
    if (states[state]){
        return {abbrv: state, name: states[state]};
    }
    var stateAbbrv = Object.keys(states).find(key => states[key] === state);
    if (stateAbbrv){
        return {abbrv: stateAbbrv, name: state};
    }
}
 
function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
 
    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;
 
    return [year, month, day].join('-');
}
 
module.exports = {writeUpload}