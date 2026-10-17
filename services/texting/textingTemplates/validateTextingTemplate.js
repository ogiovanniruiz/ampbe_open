const MAX_MSG_LENGTH = 800

const validateTextingTemplate = (data) => {
    if(!data || typeof data.name !== 'string' || data.name.trim() === '') return false
    if(!Array.isArray(data.initTextMsgs) || data.initTextMsgs.length === 0) return false

    // A message needs text, an image, or both (matches what activities accept)
    return data.initTextMsgs.every(x =>
        x && typeof x.msg === 'string' && x.msg.length <= MAX_MSG_LENGTH &&
        (x.msg.trim() !== '' || (typeof x.imageUrl === 'string' && x.imageUrl.trim() !== ''))
    )
}

module.exports = {validateTextingTemplate}
