const convertQueriesHousehold = async(queries) =>{

    const operators = {
        "=": "$eq",
        "!=": "$ne",
        "<": "$lt",
        "<=": "$lte",
        ">": "$gt",
        ">=": "$gte",
        "in": "$in",
        "not in": "$nin",
      };

    const ageOperators = {"=": '$eq', '>': '$lt', '>=': '$lte', '<': '$gt', '<=': '$gte'}

    const conditions = { "and": "$and", "or": "$or" };
    
    const mapRule = (rule) =>{

        const operator = operators[rule.operator] ? operators[rule.operator] : '$eq';
        let field = rule.field;
        let value = rule.value;
        let geometry = rule.geometry;
        let personIDs = rule.personIDs;

        if (!value) {
            value = null;
        }

        if(field === 'party'){
            if(value === 'mixed'){
                return {'hhParties.1': {$exists: true}}
            }else{
                return {$and: [{hhParties: value}, {'hhParties.1': {$exists: false}}]}
            }

        }else if(field === 'age'){
            var date = new Date();
            var now = date.getTime()
            var age = value
            var unixDob = now - age*31556952000
            var isoDob = new Date(unixDob)

            var subQuery = {}
            subQuery[ageOperators[rule.operator]] = isoDob
            return {'residents.dob': subQuery}

        }else if(field === 'renter'){

            if(value){
                return {'_id.unit': {$ne: ""}}

            }else{
                return {'_id.unit':  ""}
            }
        }else if(field === "blockgroups"){
            return {blockgroupID: {$in: value}}
            //return {location: {$geoIntersects: {$geometry: geometry}}}
        }else if(field === 'precincts'){
            return {precinctID: {$in: value}}
            //return {location: {$geoIntersects: {$geometry: geometry}}}
        }else if(field === 'polygons'){

            return {location: {$geoIntersects: {$geometry: geometry}}}
        }else if(field === 'scripts' || field === 'nonResponseSets'){

            return {'residents.personID': {[operator]: personIDs}}
        }else if(field === 'cities'){
            return {'_id.city': {$in: value}}
        }else if(field === 'tags'){

            return {['residents.tags.'+ value]: true}
        }else if(field === 'orgRegDate'){

            return {'residents.regDates.0': {[operator]: new Date(value)}}
        } else if (field === 'zips'){
            return {'_id.zip': {$in: value}}
        }
        else{
            var newField = 'residents.' + field
            let mongoDBQuery;
            mongoDBQuery = { [newField]: { [operator]: value } };
            return mongoDBQuery;
        }
    }

    const mapRuleSet = (ruleSet) => {

        if (ruleSet.rules.length < 1) {
          return {};
        }

        return {
          [conditions[ruleSet.condition]]: ruleSet.rules.map(rule => rule.operator ? mapRule(rule) : mapRuleSet(rule))
        }
    };
    
    let mongoDbQuery = mapRuleSet(queries);

    return mongoDbQuery

}
module.exports = {convertQueriesHousehold}
