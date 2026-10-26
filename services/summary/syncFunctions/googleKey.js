const { BigQuery } = require('@google-cloud/bigquery');
const OrgServiceAccount = require('../../../models/organizations/orgServiceAccount')

// The org's uploaded service-account key; undefined if none is uploaded or it's invalid
const getOrgGoogleKey = async(orgID) => {
    if(!orgID) return undefined
    const account = await OrgServiceAccount.findOne({orgID: String(orgID)}, {key: 1}).lean()
    if(!account?.key) return undefined
    try {
        return JSON.parse(account.key)
    } catch(e) {
        console.error(`Service account key for org ${orgID} is not valid JSON`)
        return undefined
    }
}

const getBigQueryClient = async(orgID) => {
    const key = await getOrgGoogleKey(orgID)
    if(!key) return undefined
    return new BigQuery({credentials: key, projectId: key.project_id})
}

module.exports = {getOrgGoogleKey, getBigQueryClient}
