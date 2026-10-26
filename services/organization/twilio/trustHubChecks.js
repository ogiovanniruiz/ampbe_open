var Organization = require('../../../models/organizations/organization')
var CallPool = require('../../../models/organizations/callPool')

const trustHubChecks = async (detail) => {
  let org;
  try {
    org = await Organization.findById(detail.orgID);
    if (!org) {
      return { error: true, reason: 'org_not_found' };
    }
  } catch (err) {
    console.error('DB error fetching org:', err.message);
    return { error: true, reason: 'db_error' };
  }

  if (!org.twilioAccount || !org.twilioAccount.sid || !org.twilioAccount.authToken) {
    return { error: true, reason: 'twilio_not_configured' };
  }

  let client;
  try {
    client = require('twilio')(org.twilioAccount.sid, org.twilioAccount.authToken);
  } catch (err) {
    console.error('Twilio client init failed:', err.message);
    return { error: true, reason: 'twilio_init_failed' };
  }

  try {
    const profiles = await client.trusthub.v1.customerProfiles.list({ limit: 1 });

    if (!profiles || profiles.length === 0) {
      return { error: true, reason: 'no_profiles_found' };
    }

    const customerProfileSid = profiles[0].sid;

    if (!customerProfileSid) {
                return {
            shaken_phonenumbers: [],
            profile_phonenumbers: [],
            tegrity_phonenumbers: [],
          };
    }

    const [profile_phonenumbers, approved_shaken_accounts] = await Promise.all([
      client.request({
        method: 'GET',
        uri: `https://trusthub.twilio.com/v1/CustomerProfiles/${customerProfileSid}/ChannelEndpointAssignments`,
      }),
      client.request({
        method: 'GET',
        uri: `https://trusthub.twilio.com/v1/TrustProducts?PolicySid=RN7a97559effdf62d00f4298208492a5ea&Status=twilio-approved`,
      }),
    ]);

    const approved_voice_tegrity_accounts = await client.request({
        method: 'GET',
        uri: `https://trusthub.twilio.com/v1/TrustProducts?PolicySid=RN5b3660f9598883b1df4e77f77acefba0&Status=twilio-approved`,
      })

    const approved_voice_tegrity_account_sid = approved_voice_tegrity_accounts.body.results?.[0]?.sid;

    const approved_shaken_account_sid = approved_shaken_accounts.body.results?.[0]?.sid;

    if (!approved_shaken_account_sid || !approved_voice_tegrity_account_sid) {
          return {
            shaken_phonenumbers: [],
            profile_phonenumbers: profile_phonenumbers.body.results,
            tegrity_phonenumbers: [],
          };
    }


    const voice_tegrity_phonenumbers = await client.request({
      method: 'GET',
      uri: `https://trusthub.twilio.com/v1/TrustProducts/${approved_voice_tegrity_account_sid}/ChannelEndpointAssignments`,
    });

    const shaken_phonenumbers = await client.request({
      method: 'GET',
      uri: `https://trusthub.twilio.com/v1/TrustProducts/${approved_shaken_account_sid}/ChannelEndpointAssignments`,
    });

    return {
      shaken_phonenumbers: shaken_phonenumbers.body.results,
      profile_phonenumbers: profile_phonenumbers.body.results,
      tegrity_phonenumbers: voice_tegrity_phonenumbers.body.results,
    };

  } catch (err) {
    // Twilio auth errors come back as status 20003
    if (err.status === 20003 || err.code === 20003) {
      console.error('Twilio authentication failed for org:', detail.orgID);
      return { error: true, reason: 'twilio_auth_failed' };
    }
    console.error('TrustHub API error:', err.message);
    return { error: true, reason: 'trusthub_api_error', message: err.message };
  }
};

module.exports = {trustHubChecks}