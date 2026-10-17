var Organization = require('../../../models/organizations/organization')
var {findTag, isStyled} = require('./orgTags')
var {valueList, labelProblem, colorValues, singleColor} = require('./tagDefinitionRules')

const fail = (msg) => ({success: false, msg: msg})

// Adds a tag with values and colors to the org's tag list; an existing plain tag gets the values
const createTagDefinition = async(detail) => {
    try {
        var label = String(detail.label || '').trim()
        var valueType = ['range', 'list'].includes(detail.valueType) ? detail.valueType : 'none'
        if(!detail.orgID) return fail('Missing organization.')
        if(labelProblem(label)) return fail(labelProblem(label))

        var org = await Organization.findOne({_id: detail.orgID}, {tagDefinitions: 1}).lean()
        if(!org) return fail('Organization not found.')
        var existing = findTag(org, label)
        if(existing && isStyled(existing)) return fail(`"${existing.label}" already has values.`)

        var list = valueList({...detail, valueType})
        if(list.msg) return fail(list.msg)

        var values = colorValues(list.values, detail)

        // An existing plain tag keeps its spelling, author and date, and gets the values in its place
        var definition = {
            label: existing?.label || label,
            valueType: valueType,
            values: values,
            createdBy: existing?.createdBy || (detail.userID ? String(detail.userID) : undefined),
            dateCreated: existing?.dateCreated || new Date(),
        }
        if(list.range) definition.range = list.range
        if(valueType === 'none') definition.color = singleColor(detail)

        if(existing){
            await Organization.updateOne({_id: detail.orgID, 'tagDefinitions.label': existing.label}, {$set: {'tagDefinitions.$': definition}})
        } else {
            await Organization.updateOne({_id: detail.orgID}, {$push: {tagDefinitions: definition}})
        }
        return {success: true, definition: definition, existingTag: !!existing}
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {createTagDefinition}
