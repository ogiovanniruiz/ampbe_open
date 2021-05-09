const convertQueriesMembership = async(queries) =>{

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

        if(field === 'voter'){
            return { "resident.voter": value }

        }else if(field === 'age'){
            var date = new Date();
            var now = date.getTime()
            var age = value
            var unixDob = now - age*31556952000
            var isoDob = new Date(unixDob)

            var subQuery = {}
            subQuery[ageOperators[rule.operator]] = isoDob
            return {'resident.dob': subQuery}

        }else if(field === "blockgroups"){
            return {location: {$geoIntersects: {$geometry: geometry}}}

        }else if(field === 'precincts'){
            return {location: {$geoIntersects: {$geometry: geometry}}}

        }else if(field === 'polygons'){
            return {location: {$geoIntersects: {$geometry: geometry}}}

        }else if(field === 'scripts' || field === 'nonResponseSets'){
            return {'resident.personID': {[operator]: personIDs}}

        }else if(field === 'cities'){
            return {'address.city': {$in: value}}

        }else if(field === 'tags'){
            return {'resident.tags': {$in: value}}

        }else if(field === 'uploads'){
            return {'resident.uploadID': {$in: value}}
        }else{
            var newField = "resident." + field
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
module.exports = {convertQueriesMembership}