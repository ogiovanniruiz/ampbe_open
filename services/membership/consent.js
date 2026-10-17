// Texting / email consent lives on member.enrollment. These tags are how it used to be recorded;
// any that still arrive (old clients, CSV uploads) are turned into the flags instead of being saved as tags.
const CONSENT_TAGS = {texting: 'Optin-Texting', email: 'Optin-Email'}

const TEXTING_OPTIN = {'enrollment.optinTexting.status': true}
const EMAIL_OPTIN = {'enrollment.optinEmail.status': true}

const isConsentTag = (tag, kind) => String(tag || '').trim().toUpperCase() === CONSENT_TAGS[kind].toUpperCase()

// Returns {tags (without the consent tags), texting, email}
const splitConsentTags = (tags) => {
    var list = Array.isArray(tags) ? tags : []
    return {
        tags: list.filter(tag => !isConsentTag(tag, 'texting') && !isConsentTag(tag, 'email')),
        texting: list.some(tag => isConsentTag(tag, 'texting')),
        email: list.some(tag => isConsentTag(tag, 'email')),
    }
}

// Sets consent on a member document (or plain object). Consent is only added unless allowRevoke is set.
// Each flag is only written when it changes. Returns true when anything changed.
const applyConsent = (member, consent, {allowRevoke = false} = {}) => {
    var changed = false
    var now = new Date()
    for(var [kind, field] of [['texting', 'optinTexting'], ['email', 'optinEmail']]){
        var wanted = consent?.[kind]
        if(wanted === undefined || wanted === null) continue
        wanted = !!wanted
        if(!wanted && !allowRevoke) continue

        var current = !!member.enrollment?.[field]?.status
        if(current === wanted) continue

        if(!member.enrollment) member.enrollment = {}
        member.enrollment[field] = {status: wanted, dateUpdated: now}
        changed = true
    }
    return changed
}

const hasTextingConsent = (member) => !!member?.enrollment?.optinTexting?.status
const hasEmailConsent = (member) => !!member?.enrollment?.optinEmail?.status

module.exports = {CONSENT_TAGS, TEXTING_OPTIN, EMAIL_OPTIN, isConsentTag, splitConsentTags, applyConsent, hasTextingConsent, hasEmailConsent}
