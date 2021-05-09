var Membership = require('../../models/organizations/membership');
var MassGeocode = require('../amp/massGeocode');
var FindVoter = require('../amp/findVoter')
var Upload = require('../../models/organizations/upload');
var Organization = require('../../models/organizations/organization');
var mongoose = require('mongoose');

var states = {"AL":"ALABAMA","AK":"ALASKA","AZ":"ARIZONA","AR":"ARKANSAS","CA":"CALIFORNIA","CO":"COLORADO","CT":"CONNECTICUT","DE":"DELAWARE","FL":"FLORIDA","GA":"GEORGIA","HI":"HAWAII","ID":"IDAHO","IL":"ILLINOIS","IN":"INDIANA","IA":"IOWA","KS":"KANSAS","KY":"KENTUCKY","LA":"LOUISIANA","ME":"MAINE","MD":"MARYLAND","MA":"MASSACHUSETTS","MI":"MICHIGAN","MN":"MINNESOTA","MS":"MISSISSIPPI","MO":"MISSOURI","MT":"MONTANA","NE":"NEBRASKA","NV":"NEVADA","NH":"NEW HAMPSHIRE","NJ":"NEW JERSEY","NM":"NEW MEXICO","NY":"NEW YORK","NC":"NORTH CAROLINA","ND":"NORTH DAKOTA","OH":"OHIO","OK":"OKLAHOMA","OR":"OREGON","PA":"PENNSYLVANIA","RI":"RHODE ISLAND","SC":"SOUTH CAROLINA","SD":"SOUTH DAKOTA","TN":"TENNESSEE","TX":"TEXAS","UT":"UTAH","VT":"VERMONT","VA":"VIRGINIA","WA":"WASHINGTON","WV":"WEST VIRGINIA","WI":"WISCONSIN","WY":"WYOMING"};
var ethnicities = ['BLACK', 'HISPANIC', 'LATINO', 'ASIAN', 'WHITE', 'OTHER'];

const uploadMembership = async(membershipData) => {
    try {
        var membershipList = membershipData.files[0].buffer.toString('utf-8');
        var fileName = membershipData.files[0].originalname;
        
        var orgID = membershipData.body.orgID;
        var userID = membershipData.body.userID;

        var lines = (membershipList).replace(/[\n|,](?=[^"]*"(?:[^"]*"[^"]*")*[^"]*$)/g, '').replace(/"/g, '').split('\n');
        var headers = lines[0].split(",");

        var upload = new Upload({orgID: orgID, fileName: fileName, userID: userID});
        await upload.save();

        var selectedTags = [];
        var orgTags = [];

        if(membershipData.body.selectedTags){
            selectedTags = membershipData.body.selectedTags.toString().split(",");
        }

        if(membershipData.body.orgTags){
            orgTags = membershipData.body.orgTags.toString().split(",");
        }

        var duplicatesList = [];
        var duplicates = [];

        for(var i = 1; i < lines.length; i++){

            var personID = mongoose.Types.ObjectId();
            var foundMember = {};
            var queryMembership = {"$and":[]};


            let memberObj = {resident: {personID: personID,
                             name: {},
                             phones: [],
                             orgID: orgID,
                             fileName: fileName,
                             method: "UPLOAD",
                             uploadID: upload._id,
                             tags: []},
                           address: {address: personID, city: '', state:{abbrv: 'CA', name: 'CALIFORNIA'}, zip: ''},
                           date: new Date()};

            let currentLine = lines[i].split(",");
    
            //if(currentLine.length <= 1){break}

            for(var j = 0; j < headers.length; j++){

                if(headers[j].trim() === getKeyByValue(membershipData.body, 'full name') && currentLine[j]){
                    memberObj['resident']['name'] = fullName(currentLine[j].replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/gmi, ''))
                }else if(headers[j].trim() === getKeyByValue(membershipData.body, 'first name') && currentLine[j]){
                    memberObj['resident']['name']["firstName"] = currentLine[j].toUpperCase().replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/gmi, '')
                }else if(headers[j].trim() === getKeyByValue(membershipData.body, 'middle name') && currentLine[j]){
                    memberObj['resident']['name']["middleName"] = currentLine[j].replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/gmi, '');
                }else if(headers[j].trim() === getKeyByValue(membershipData.body, 'last name') && currentLine[j]){
                    memberObj['resident']['name']["lastName"] = currentLine[j].replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/gmi, '');
                }else if(headers[j].trim() === getKeyByValue(membershipData.body, 'phone') && currentLine[j]){
                    memberObj['resident']['phones'] = formatPhone(currentLine[j]);
                }else if(headers[j].trim() === getKeyByValue(membershipData.body, 'email') && currentLine[j]){
                    memberObj['resident']['email'] = currentLine[j].toLowerCase().trim();
                }else if(headers[j].trim() === getKeyByValue(membershipData.body, 'address') && currentLine[j]){
                    memberObj['address']['address'] = currentLine[j].toUpperCase().replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/gmi, '');
                    memberObj['fullAddress1'] = currentLine[j].toUpperCase().replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/gmi, '');
                }else if(headers[j].trim() === getKeyByValue(membershipData.body, 'city') && currentLine[j]){
                    memberObj['address']['city'] = currentLine[j].toUpperCase().replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/gmi, '');
                }else if(headers[j].trim() === getKeyByValue(membershipData.body, 'state')){
                    memberObj['address']['state'] = getState(currentLine[j]);
                }else if(headers[j].trim() === getKeyByValue(membershipData.body, 'zip') && currentLine[j]){
                    memberObj['address']['zip'] = currentLine[j].trim();
                }else if(headers[j].trim() === getKeyByValue(membershipData.body, 'dob') && currentLine[j]){
                    memberObj['resident']['dob'] = formatDate(currentLine[j]);
                }else if(headers[j].trim() === getKeyByValue(membershipData.body, 'affidavit') && currentLine[j]){
                    memberObj['resident']['affidavit'] = currentLine[j].trim()
                }else if(headers[j].trim() === getKeyByValue(membershipData.body, 'ethnicity') && currentLine[j]){
                    memberObj['resident']['ethnicity'] = ethnicityCheck(currentLine[j].trim())
                }else if(headers[j].trim() === getKeyByValue(membershipData.body, 'tag')  && currentLine[j]){
                    var tag = currentLine[j].trim();
                    if(!orgTags.map(v => v.toUpperCase()).includes(tag.toUpperCase())){
                        await Organization.update({ _id: orgID }, { $push: { 'tags': tag } } );
                        orgTags.push(tag)
                    }
                    memberObj['resident']['tags'].push(tag)
                }

                memberObj['fullAddress2'] = (memberObj['address']['city'] + " " + memberObj['address']['state']['abbrv'] + " " + memberObj['address']['zip']).replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/gmi, '')
            }

            if(selectedTags.length){
                for(var k = 0; k < selectedTags.length; k++){
                    if (!memberObj['resident']['tags'].length || !memberObj['resident']['tags'].map(v => v.toUpperCase()).includes(selectedTags[k].toUpperCase())){
                        memberObj['resident']['tags'].push(selectedTags[k])
                    }
                }
            }

            // Duplicate Check
            if(memberObj['resident']['name']["firstName"] && (memberObj['resident']['phones']['number'] || memberObj['resident']['email'] || memberObj['fullAddress1'])) {

                queryMembership.$and.push({'resident.orgID': orgID});
                queryMembership.$and.push({'resident.name.firstName': memberObj['resident']['name']["firstName"]});

                if(memberObj['resident']['phones']['number']){
                    if(!queryMembership.$and[0].$or){queryMembership.$and.unshift({$or: []});}
                    queryMembership.$and[0].$or.push({'resident.phones.number': memberObj['resident']['phones']['number']});
                }
                if(memberObj['resident']['email']){
                    if(!queryMembership.$and[0].$or){queryMembership.$and.unshift({$or: []});}
                    queryMembership.$and[0].$or.push({'resident.email': memberObj['resident']['email']});
                }
                if(memberObj['fullAddress1']){
                    if(!queryMembership.$and[0].$or){queryMembership.$and.unshift({$or: []});}
                    if(!queryMembership.$and[0].$or[0] || !queryMembership.$and[0].$or[0].$and){queryMembership.$and[0].$or.unshift({$and: []}); }

                    queryMembership.$and[0].$or[0].$and.push({'address.address': memberObj['address']['address']});
                    queryMembership.$and[0].$or[0].$and.push({'address.city': memberObj['address']['city']});
                    queryMembership.$and[0].$or[0].$and.push({'address.zip': memberObj['address']['zip']});
                }

                foundMember = await Membership.findOne(queryMembership);
                if(foundMember) {
                    if(!duplicatesList[0]) { duplicatesList.push(lines[0]) }
                    duplicatesList.push(lines[i]);
                    duplicates.push(foundMember['resident']['name']);
                }
            }

            if(memberObj.resident.name.firstName && !foundMember){
                var member = new Membership(memberObj);
                await member.save()
            }
        }

        MassGeocode.massGeocodeMembership(upload._id);
        FindVoter.findVoterStatus(upload._id, 'auto');


        return {msg: "Finished", success: true, 'duplicatesList': duplicatesList, 'duplicates': duplicates}

    } catch(e){
        throw new Error(e.message)
    }
}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
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

function ethnicityCheck(ethnicity) {
    if (ethnicities.includes(ethnicity.toUpperCase())){
        return ethnicity;
    }
    return '';
}

module.exports = {uploadMembership}
