// Ensures defaultInitTextMsg is one of initTextMsgs. Returns false if it is not.
const normalizeTextMetaData = (textMetaData) => {
    if(!textMetaData) return true

    var msgs = textMetaData.initTextMsgs || []

    if(msgs.length === 0){
        delete textMetaData.defaultInitTextMsg
        return true
    }

    if(msgs.length === 1){
        textMetaData.defaultInitTextMsg = msgs[0]
        return true
    }

    if(!textMetaData.defaultInitTextMsg) return true

    var match = msgs.find(x => x.msg === textMetaData.defaultInitTextMsg.msg && (x.imageUrl || '') === (textMetaData.defaultInitTextMsg.imageUrl || ''))
    if(!match) return false

    textMetaData.defaultInitTextMsg = match
    return true
}

module.exports = {normalizeTextMetaData}
