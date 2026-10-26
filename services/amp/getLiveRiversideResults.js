// Puppeteer (headless Chrome) was removed from the deploy to speed it up; see docs/LIVE_ELECTION_SCRAPER.md
// to bring it back. Loaded lazily so the server still starts without it.
const loadPuppeteer = () => {
  try {
    return require("puppeteer");
  } catch (e) {
    return null;
  }
};

const RACES = [
  "Riverside City Council Ward 2",
  "Riverside City Council Ward 4",
  "Riverside City Council Ward 6",
"Mbr, Riverside County Bd of Education, TA 1",
"Mbr, Riverside County Bd of Education, TA 2",
"Mbr Gov Bd Murrieta Valley USD TA 3",
];

const URL = "https://www.livevoterturnout.com/ENR/riversidecaenr/11/en/Index_11.html";

const getLiveRiversideResults = async () => {
  const puppeteer = loadPuppeteer();
  if (!puppeteer) {
    console.log("Live Riverside results are disabled (puppeteer not installed). See docs/LIVE_ELECTION_SCRAPER.md");
    return [];
  }
  //const browser = await puppeteer.launch({ args: ["--no-sandbox"] });

const browser = await puppeteer.launch({
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
  args: ["--no-sandbox", "--disable-setuid-sandbox"]
});
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: "networkidle0", timeout: 30000 });
  const html = await page.content();

  await browser.close();

  const results = [];

  for (const raceName of RACES) {
    // Find race ID from checkbox: data-race="36"> Riverside City Council Ward 2
    const anchorMatch = html.match(
      new RegExp(`data-race="(\\d+)"[^>]*>\\s*${raceName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`)
    );
    if (!anchorMatch) {
      console.warn(`Race not found: ${raceName}`);
      continue;
    }

    const raceId = anchorMatch[1];

    const contentMatch = html.match(
      new RegExp(`id="raceContentId_${raceId}"[\\s\\S]*?\\[\\[([\\s\\S]*?)\\]\\];`)
    );
    if (!contentMatch) {
      console.warn(`Data not found for race: ${raceName} (id ${raceId})`);
      continue;
    }

    const rows = [];
    const rowRegex = /'([^']+)',\s*[\d.]+,\s*[\d.]+,\s*[\d.]+,\s*[\d.]+,\s*([\d.]+)/g;
    let m;
    while ((m = rowRegex.exec(contentMatch[1])) !== null) {
      rows.push({
        candidate: m[1],
        votes: m[2],        // last number in the array
        percent: null,      // not clearly present in raw data
      });
    }

    const totalVotes = rows.reduce((sum, r) => sum + Number(r.votes), 0);
rows.forEach(r => {
  r.percent = totalVotes > 0
    ? ((Number(r.votes) / totalVotes) * 100).toFixed(1)
    : "0.0";
});

    results.push({ race: raceName, candidates: rows });
  }

  return results;
};

module.exports = { getLiveRiversideResults };