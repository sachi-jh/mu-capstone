const { PrismaClient } = require("@prisma/client");
require("dotenv").config();
const apiKey = process.env.NPS_API_KEY;

const prisma = new PrismaClient();

//seeds park data, picks 60 (theres 61 on the nps website, and listed as 63 need to figure out the discrepency)
async function main() {
  try {
    const response = await fetch(`https://developer.nps.gov/api/v1/parks?limit=500&api_key=${apiKey}`);
    if (!response.ok) {
      console.error("Error fetching national parks");
    }
    const data = await response.json();
    const nationalParks = data.data.filter((elem) => elem.designation.includes("National Park"));
    const nationalParksData = nationalParks.map((park) => ({
      name: park.fullName,
      description: park.description,
      state: park.states,
      park_id: park.parkCode,
    }));
    for (const park of nationalParksData) {
      await prisma.park.create({ data: park });
    }
  } catch (e) {
    console.error(e);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
