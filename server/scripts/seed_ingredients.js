import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

const defaultIngredients = [
  { name: 'Paracetamol', kfaCode: 'KFA-001', description: 'Analgesik dan antipiretik' },
  { name: 'Amoxicillin', kfaCode: 'KFA-002', description: 'Antibiotik penisilin' },
  { name: 'Omeprazole', kfaCode: 'KFA-003', description: 'Proton pump inhibitor (PPI)' },
  { name: 'Clopidogrel', kfaCode: 'KFA-004', description: 'Antiplatelet' },
  { name: 'Aspirin', kfaCode: 'KFA-005', description: 'NSAID dan Antiplatelet' },
  { name: 'Simvastatin', kfaCode: 'KFA-006', description: 'Obat penurun kolesterol' },
  { name: 'Metformin', kfaCode: 'KFA-007', description: 'Obat antidiabetes' }
]

async function main() {
  console.log('--- Seeding Active Ingredients ---')
  
  const args = process.argv.slice(2)
  let ingredientsToSeed = defaultIngredients

  if (args[0]) {
    const jsonPath = path.resolve(process.cwd(), args[0])
    if (fs.existsSync(jsonPath)) {
      try {
        const fileContent = fs.readFileSync(jsonPath, 'utf-8')
        const parsedData = JSON.parse(fileContent)
        if (Array.isArray(parsedData)) {
          ingredientsToSeed = parsedData
          console.log(`Loaded ${ingredientsToSeed.length} ingredients from ${jsonPath}`)
        } else {
          console.error('Invalid JSON format. Expected an array of ingredient objects.')
          process.exit(1)
        }
      } catch (err) {
        console.error('Error reading or parsing JSON file:', err)
        process.exit(1)
      }
    } else {
      console.error(`File not found: ${jsonPath}`)
      process.exit(1)
    }
  } else {
    console.log('No JSON file provided. Using default dummy data.')
  }

  let count = 0
  for (const item of ingredientsToSeed) {
    if (!item.name) continue
    
    try {
      await prisma.activeIngredient.upsert({
        where: { name: item.name },
        update: {
          kfaCode: item.kfaCode || null,
          description: item.description || null,
        },
        create: {
          name: item.name,
          kfaCode: item.kfaCode || null,
          description: item.description || null,
        }
      })
      count++
    } catch (err) {
      console.error(`Failed to upsert ${item.name}:`, err.message)
    }
  }

  console.log(`Successfully seeded ${count} active ingredients.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
