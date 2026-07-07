import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('--- Mapping Demo Medicines to Active Ingredients ---')
  
  const medicines = await prisma.medicine.findMany()
  const ingredients = await prisma.activeIngredient.findMany()

  let count = 0
  for (const med of medicines) {
    const medName = med.namaObat.toLowerCase()
    
    // Find matching ingredient by name (simple string match for demo)
    let matchedIngredient = null
    if (medName.includes('amoxicillin') || medName.includes('amox')) {
      matchedIngredient = ingredients.find(i => i.name === 'Amoxicillin')
    } else if (medName.includes('pct') || medName.includes('paracetamol') || medName.includes('panadol')) {
      matchedIngredient = ingredients.find(i => i.name === 'Paracetamol')
    } else if (medName.includes('omeprazole')) {
      matchedIngredient = ingredients.find(i => i.name === 'Omeprazole')
    } else if (medName.includes('clopidogrel')) {
      matchedIngredient = ingredients.find(i => i.name === 'Clopidogrel')
    } else if (medName.includes('aspirin') || medName.includes('aspilet')) {
      matchedIngredient = ingredients.find(i => i.name === 'Aspirin')
    } else if (medName.includes('simvastatin')) {
      matchedIngredient = ingredients.find(i => i.name === 'Simvastatin')
    } else if (medName.includes('metformin')) {
      matchedIngredient = ingredients.find(i => i.name === 'Metformin')
    } else if (medName.includes('antasida')) {
       // Let's create an ingredient for antasida if it doesn't exist just in case, but no interactions are defined.
       // Actually, let's just map it to something or skip.
    }

    if (matchedIngredient) {
      try {
        await prisma.medicineIngredient.upsert({
          where: {
            medicineId_activeIngredientId: {
              medicineId: med.id,
              activeIngredientId: matchedIngredient.id
            }
          },
          update: {},
          create: {
            medicineId: med.id,
            activeIngredientId: matchedIngredient.id,
            kekuatan: 'Default Demo'
          }
        })
        console.log(`Mapped: ${med.namaObat} -> ${matchedIngredient.name}`)
        count++
      } catch (err) {
         console.error(`Failed to map ${med.namaObat}:`, err.message)
      }
    }
  }

  // FOR DEMO: Let's also forcefully create a MAJOR interaction between Amoxicillin and Paracetamol
  // so the user immediately sees the warning when those two are in the list.
  const amox = ingredients.find(i => i.name === 'Amoxicillin')
  const pct = ingredients.find(i => i.name === 'Paracetamol')
  if (amox && pct) {
     const existing = await prisma.drugInteraction.findFirst({
        where: {
          OR: [
            { ingredient1Id: amox.id, ingredient2Id: pct.id },
            { ingredient1Id: pct.id, ingredient2Id: amox.id }
          ]
        }
     })
     if (existing) {
        await prisma.drugInteraction.update({
           where: { id: existing.id },
           data: {
             severity: 'MAJOR',
             description: '[DEMO PURPOSE] Interaksi fiktif antara Paracetamol dan Amoxicillin agar kotak peringatan muncul untuk testing.',
             clinicalConsequence: 'Hanya untuk pengujian UI.'
           }
        })
     } else {
        await prisma.drugInteraction.create({
           data: {
             ingredient1Id: amox.id,
             ingredient2Id: pct.id,
             severity: 'MAJOR',
             description: '[DEMO PURPOSE] Interaksi fiktif antara Paracetamol dan Amoxicillin agar kotak peringatan muncul untuk testing.',
             clinicalConsequence: 'Hanya untuk pengujian UI.',
             status: 'UNVALIDATED'
           }
        })
     }
     console.log('Added DEMO MAJOR interaction between Amoxicillin and Paracetamol.')
  }

  console.log(`Successfully mapped ${count} medicines to active ingredients.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
