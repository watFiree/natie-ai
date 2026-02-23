import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter: pool });

const modelPricingData = [
  {
    modelName: 'gpt-4o',
    modelProvider: 'openai',
    inputPricePerToken: '0.0000025',
    outputPricePerToken: '0.00001',
  },
  {
    modelName: 'gpt-4o-mini',
    modelProvider: 'openai',
    inputPricePerToken: '0.00000015',
    outputPricePerToken: '0.0000006',
  },
];

async function main() {
  console.log('Start seeding ...');

  for (const pricing of modelPricingData) {
    const result = await prisma.modelPricing.upsert({
      where: {
        modelName_modelProvider: {
          modelName: pricing.modelName,
          modelProvider: pricing.modelProvider,
        },
      },
      update: {
        inputPricePerToken: pricing.inputPricePerToken,
        outputPricePerToken: pricing.outputPricePerToken,
      },
      create: pricing,
    });
    console.log(`Upserted model pricing: ${result.modelName} (${result.modelProvider})`);
  }

  console.log('Seeding finished.');
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
