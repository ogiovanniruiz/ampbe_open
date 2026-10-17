const cheerio = require("cheerio");

const RACES = [
  "City of San Bernardino Member, City Council Ward 1",
  "City of San Bernardino Member, City Council Ward 2",
  "City of San Bernardino Member, City Council Ward 4",
  "City of San Bernardino Mayor",
  "San Bernardino County Member, Board of Supervisors District 4",
  "City of Loma Linda Member, City Council District 3"
  

];

const getLiveSBResults = async(data) => {

    const URL = "https://results.rov.sbcounty.gov/Results/20260602/";
    const html = await fetch(URL).then(r => r.text());
    const $ = cheerio.load(html);

    function extractRace(raceName) {
      // Find the h2 containing the race name
      const heading = $("h2").filter((_, el) =>
        $(el).text().trim().includes(raceName)
      ).first();

      if (!heading.length) return null;

      // Walk up to the containing table
      const table = heading.closest("table");
      if (!table.length) return null;

      const rows = [];

      table.find("tr").each((_, tr) => {
        const cells = $(tr).find("td");
        if (cells.length < 3) return; // need at least name, party, votes

        const name = $(cells[0]).text().trim();
        const party = $(cells[1]).text().trim() || null;
        const votesText = $(cells[2]).text().trim();
        const percentText = cells.length >= 4 ? $(cells[3]).text().trim() : "N/A";

        // Skip header/summary rows
        if (
          !name ||
          name === "Candidate" ||
          name === "Times Cast" ||
          name.startsWith("Total") ||
          name.startsWith("Precincts") ||
          name.startsWith("Unresolved")
        ) return;

        const votes = Number(votesText.replace(/,/g, ""));
        if (isNaN(votes)) return;

        rows.push({
          candidate: name,
          party: party || null,
          votes,
          percent: percentText || "N/A",
        });
      });

      return { race: heading.text().trim(), candidates: rows };
    }

    return RACES.map(extractRace).filter(Boolean);

}

module.exports = {getLiveSBResults}