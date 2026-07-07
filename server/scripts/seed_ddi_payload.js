import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const prisma = new PrismaClient()

async function main() {
  console.log('--- Seeding Production Drug Interactions ---')
  
  const payloadPath = path.join(__dirname, '../deferiprone_ddi_payload.json')
  if (!fs.existsSync(payloadPath)) {
    console.error('Payload file not found:', payloadPath)
    process.exit(1)
  }

  const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'))
  let interactionCount = 0

  for (const item of payload) {
    // 1. Upsert Ingredient 1
    const ing1Data = {
      name: item.ingredient1.name,
      kfaCode: item.ingredient1.kfaCode || null
    }
    const ing1 = await prisma.activeIngredient.upsert({
      where: item.ingredient1.kfaCode ? { kfaCode: item.ingredient1.kfaCode } : { name: item.ingredient1.name },
      update: ing1Data,
      create: ing1Data
    })

    // 2. Upsert Ingredient 2
    const ing2Data = {
      name: item.ingredient2.name,
      kfaCode: item.ingredient2.kfaCode || null
    }
    const ing2 = await prisma.activeIngredient.upsert({
      where: item.ingredient2.kfaCode ? { kfaCode: item.ingredient2.kfaCode } : { name: item.ingredient2.name },
      update: ing2Data,
      create: ing2Data
    })

    // 3. Check existing interaction
    const existingInteraction = await prisma.drugInteraction.findFirst({
      where: {
        OR: [
          { ingredient1Id: ing1.id, ingredient2Id: ing2.id },
          { ingredient1Id: ing2.id, ingredient2Id: ing1.id }
        ]
      }
    })

    const interactionData = {
      severity: item.severity,
      description: item.description,
      clinicalConsequence: item.clinicalConsequence,
      status: 'VALIDATED', // Since this is from a trusted production source
      evidence: 'Medical reference / Clinical guideline'
    }

    if (existingInteraction) {
      await prisma.drugInteraction.update({
        where: { id: existingInteraction.id },
        data: interactionData
      })
      console.log(`Updated interaction: ${ing1.name} + ${ing2.name} [${item.severity}]`)
    } else {
      await prisma.drugInteraction.create({
        data: {
          ingredient1Id: ing1.id,
          ingredient2Id: ing2.id,
          ...interactionData
        }
      })
      console.log(`Created interaction: ${ing1.name} + ${ing2.name} [${item.severity}]`)
    }
    interactionCount++
  }

  console.log(`Successfully processed ${interactionCount} interactions from payload.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
