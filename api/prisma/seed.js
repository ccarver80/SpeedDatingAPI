const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const genders = [
    {
      name: "Male",
    },
    {
      name: "Female",
    },
  ];

  for (let i = 0; i < genders.length; i++) {
    const new_catagory = await prisma.gender.create({
      data: {
        name: genders[i].name,
      },
    });

    const seeking = await prisma.seeking.create({
      data: {
        name: genders[i].name,
      },
    });
  }
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })

  .catch(async (e) => {
    console.error(e);

    await prisma.$disconnect();

    process.exit(1);
  });
