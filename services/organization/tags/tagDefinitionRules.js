var {isConsentTag} = require('../../membership/consent')
var {HEX, colorScale} = require('./tagColors')

// Rules shared by creating and editing a tag with values

const MAX_VALUES = 10

// The values a definition offers: every whole number of a range, or the words, in order. Returns {values} or {msg}.
const valueList = (detail) => {
    if(detail.valueType === 'range'){
        var min = Number(detail.range?.min), max = Number(detail.range?.max)
        if(!Number.isInteger(min) || !Number.isInteger(max)) return {msg: 'The range needs whole numbers.'}
        if(min >= max) return {msg: 'The first number of the range must be smaller than the last.'}
        if(max - min + 1 > MAX_VALUES) return {msg: `A range can have at most ${MAX_VALUES} values.`}
        return {values: Array.from({length: max - min + 1}, (_, i) => String(min + i)), range: {min, max}}
    }
    if(detail.valueType === 'list'){
        var words = (Array.isArray(detail.values) ? detail.values : []).map(v => String(v?.value ?? v ?? '').trim())
        if(words.length < 2) return {msg: 'Add at least two words.'}
        if(words.length > MAX_VALUES) return {msg: `A tag can have at most ${MAX_VALUES} words.`}
        if(words.some(w => !w || w.length > 30)) return {msg: 'Each word needs 1 to 30 characters.'}
        if(new Set(words.map(w => w.toUpperCase())).size !== words.length) return {msg: 'Each word must be different.'}
        return {values: words}
    }
    return {values: []}
}

// Problem with a tag name, or '' when it's fine
const labelProblem = (label) => {
    if(!label) return 'A tag name is required.'
    if(label.length > 60) return 'Tag names can be at most 60 characters.'
    if(isConsentTag(label, 'texting') || isConsentTag(label, 'email')) return 'Texting and email consent are set on each member, not with a tag.'
    return ''
}

// Each value with a color: the client's when valid, otherwise from the scale
const colorValues = (names, detail) => {
    var given = new Map((Array.isArray(detail.values) ? detail.values : []).filter(v => v && HEX.test(v.color)).map(v => [String(v.value).trim().toUpperCase(), v.color.toLowerCase()]))
    var scale = colorScale(names.length, detail.baseColor)
    return names.map((value, i) => ({value: value, color: given.get(value.toUpperCase()) || scale[i]}))
}

const singleColor = (detail) => HEX.test(detail.color) ? detail.color.toLowerCase() : colorScale(1, detail.baseColor)[0]

module.exports = {MAX_VALUES, valueList, labelProblem, colorValues, singleColor}
