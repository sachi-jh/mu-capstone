const { PrismaClient } = require("@prisma/client");
require("dotenv").config();
const apiKey = process.env.NPS_API_KEY;

const prisma = new PrismaClient();

async function main() {
  // Seeds park data, picks 61/63 (sequoia and kings canyon are 1 entry and american samoa does not appear in the list)
  try {
    const response = await fetch(`https://developer.nps.gov/api/v1/parks?limit=500&api_key=${apiKey}`);
    if (!response.ok) {
      console.error("Error fetching national parks");
    }
    const data = await response.json();
    const nationalParks = data.data.filter((elem) => elem.designation.includes("National Park") || elem.designation.includes("National and State Parks"));
    const nationalParksData = nationalParks.map((park) => ({
      name: park.fullName,
      description: park.description,
      state: park.states,
      npsParkCode: park.parkCode,
      image_url: park.images[0].url
    }));
    for (const park of nationalParksData) {
      const exists = await prisma.park.findUnique({ where: { npsParkCode: park.npsParkCode } });
      if (!exists){
        await prisma.park.create({ data: park });
      }
    }
  } catch (e) {
    console.error(e);
  }


  // Seeds things to do data from API
  try {
    const response = await fetch(`https://developer.nps.gov/api/v1/thingstodo?limit=3504&api_key=${apiKey}`);
    if (!response.ok) {
      console.error("Error fetching national parks");
    }
    const data = await response.json();
    const activitiesList = data.data.filter((activity) => {
        const relatedPark = activity.relatedParks[0];
        return relatedPark && (
          relatedPark.designation?.includes("National Park") ||
          relatedPark.designation?.includes("National and State Park")
        );
    });

    const activitiesData = await Promise.all(activitiesList.map(async (activity) => {
      const relatedPark = activity.relatedParks[0];
      const relatedParkObj = await prisma.park.findUnique({where: {npsParkCode: relatedPark.parkCode}})
      if(relatedParkObj){
        return {
          name: activity.title,
          activity_type: activity.activities[0]?.name || "General",
          locationId: relatedParkObj.id,
          description: activity.shortDescription || "No description available"
        };
      }
    }));

    for (const activity of activitiesData){
        try {
          await prisma.thingstodo.create({
            data: activity
          });
        } catch (err) {
          console.error(`Failed to create activity: ${activity.name}`, err);
        }
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
