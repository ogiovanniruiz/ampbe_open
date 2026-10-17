// Reads tags (and their values) from upload cells, against the org's tag definitions.
//   value column:  a column mapped to one tag; each cell holds the value ("3")
//   tag column:    "Immigrant Justice: 3; Housing: High; Volunteer" (the member export's format)
// A value the tag doesn't offer keeps the tag without a value and is counted as a miss.

const key = (text) => String(text ?? '').trim().toUpperCase()

const MISS_EXAMPLES = 20

const tagReader = (definitions) => {
    var byLabel = new Map((definitions || []).map(d => [key(d.label), d]))
    var misses = new Map() // "label|value" -> {label, value, count}

    // {label, value?} for a value of a tag; an unknown tag keeps the label as written
    const cellTag = (label, raw) => {
        var definition = byLabel.get(key(label))
        var name = definition?.label || String(label).trim()
        var value = String(raw ?? '').trim()
        if(!value) return {label: name}
        var offered = (definition?.values || []).find(v => key(v.value) === key(value))
        if(offered) return {label: name, value: offered.value}
        var missKey = `${name}|${value}`
        if(!misses.has(missKey)) misses.set(missKey, {label: name, value: value, count: 0})
        misses.get(missKey).count++
        return {label: name}
    }

    // A tag column cell: parts split on ';'. "Label: value" only when Label is a tag with values,
    // so plain tag names that contain a colon still come through whole.
    const tagColumnTags = (cell) => String(cell ?? '').split(';').map(part => part.trim()).filter(Boolean).map(part => {
        var colon = part.indexOf(':')
        if(colon > 0 && byLabel.has(key(part.slice(0, colon)))) return cellTag(part.slice(0, colon), part.slice(colon + 1))
        return {label: part}
    })

    // Adds or replaces the entry for this label
    const addTag = (tags, tag) => {
        var index = tags.findIndex(t => key(t.label) === key(tag.label))
        if(index >= 0) tags[index] = tag
        else tags.push(tag)
    }

    const missReport = () => {
        var list = [...misses.values()].sort((a, b) => b.count - a.count)
        return {tagValueMissCount: list.reduce((n, m) => n + m.count, 0), tagValueMisses: list.slice(0, MISS_EXAMPLES)}
    }

    return {cellTag, tagColumnTags, addTag, missReport}
}

module.exports = {tagReader}
