const SOS_RACES = [
  { name: "Governor", endpoint: "governor" },
  { name: "Lieutenant Governor", endpoint: "lieutenant-governor" },
  { name: "Insurance Commissioner", endpoint: "insurance-commissioner" },
  { name: "US Representative District 40", endpoint: "us-rep/district/40" },
  { name: "US Representative District 48", endpoint: "us-rep/district/48" },
  { name: "State Assembly District 36", endpoint: "state-assembly/district/36" },
  { name: "State Assembly District 47", endpoint: "state-assembly/district/47" }
];

const getLiveSOSResults = async () => {
  const results = await Promise.all(
    SOS_RACES.map(async ({ name, endpoint }) => {
      const res = await fetch(`https://api.sos.ca.gov/returns/${endpoint}`);
      const data = await res.json();

      const candidates = (data.candidates || []).map((c) => ({
        candidate: c.Name,
        votes: String(c.Votes),
        percent: c.Percent + "%",
      }));

      return { race: name, candidates };
    })
  );

  return results;
};

module.exports = { getLiveSOSResults };