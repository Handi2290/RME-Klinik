import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

// GET /api/ddi/check?ingredients=1,2,3
router.get('/check', async (req, res) => {
  try {
    const { ingredients } = req.query
    if (!ingredients) {
      return res.status(400).json({ error: 'Please provide a comma-separated list of ingredient IDs' })
    }

    const ids = ingredients.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id))
    
    if (ids.length < 2) {
      return res.json({ interactions: [] })
    }

    const interactions = await prisma.drugInteraction.findMany({
      where: {
        AND: [
          { ingredient1Id: { in: ids } },
          { ingredient2Id: { in: ids } }
        ]
      },
      include: {
        ingredient1: true,
        ingredient2: true
      }
    })

    res.json({ interactions })
  } catch (error) {
    console.error('Error checking DDI:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

// GET /api/ddi/check-medicines?medicines=1,2,3
router.get('/check-medicines', async (req, res) => {
  try {
    const { medicines } = req.query
    if (!medicines) {
      return res.status(400).json({ error: 'Please provide a comma-separated list of medicine IDs' })
    }

    const medIds = medicines.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id))
    
    if (medIds.length < 2) {
      return res.json({ interactions: [] })
    }

    // Get all active ingredients for these medicines
    const medicineIngredients = await prisma.medicineIngredient.findMany({
      where: { medicineId: { in: medIds } }
    })
    
    const ingredientIds = [...new Set(medicineIngredients.map(mi => mi.activeIngredientId))]

    if (ingredientIds.length < 2) {
      return res.json({ interactions: [] })
    }

    const interactions = await prisma.drugInteraction.findMany({
      where: {
        AND: [
          { ingredient1Id: { in: ingredientIds } },
          { ingredient2Id: { in: ingredientIds } }
        ]
      },
      include: {
        ingredient1: true,
        ingredient2: true
      }
    })

    res.json({ interactions })
  } catch (error) {
    console.error('Error checking DDI by medicines:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

export default router
