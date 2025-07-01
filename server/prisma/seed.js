const { PrismaClient } = require("@prisma/client");
require("dotenv").config();
const apiKey = process.env.NPS_API_KEY;

const prisma = new PrismaClient();

async function main() {
  //seeds park data, picks 61/63 (sequoia and kings canyon are 1 entry and american samoa does not appear in the list)
  // try {
  //   const response = await fetch(`https://developer.nps.gov/api/v1/parks?limit=500&api_key=${apiKey}`);
  //   if (!response.ok) {
  //     console.error("Error fetching national parks");
  //   }
  //   const data = await response.json();
  //   const nationalParks = data.data.filter((elem) => elem.designation.includes("National Park") || elem.designation.includes("National and State Parks"));
  //   const nationalParksData = nationalParks.map((park) => ({
  //     name: park.fullName,
  //     description: park.description,
  //     state: park.states,
  //     park_id: park.parkCode,
  //     image_url: park.images[0].url
  //   }));
  //   for (const park of nationalParksData) {
  //     const exists = await prisma.park.findUnique({ where: { park_id: park.park_id } });
  //     if (!exists){
  //       await prisma.park.create({ data: park });
  //     }
  //   }
  // } catch (e) {
  //   console.error(e);
  // }


  //seeds things to do data
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

    const activitiesData = activitiesList.map((activity) => {
    const relatedPark = activity.relatedParks[0];
    return {
      name: activity.title,
      activity_type: activity.activities[0]?.name || "General",
      associated_park_id: relatedPark.parkCode,
      description: activity.shortDescription || "No description available"
    };
  });

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
