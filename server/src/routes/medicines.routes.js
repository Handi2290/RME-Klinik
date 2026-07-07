import { Router } from 'express'
import { medicinesController } from '../controllers/pharmacy.controller.js'

const router = Router()

router.get('/', medicinesController.list)
router.get('/low-stock', medicinesController.getLowStock)
router.get('/near-expiry', medicinesController.getNearExpiry)
router.get('/:id', medicinesController.getById)
router.post('/', medicinesController.create)
router.put('/:id', medicinesController.update)
router.delete('/:id', medicinesController.delete)
router.post('/restock', medicinesController.restock)

export default router
