import { Router } from 'express'
import { consumablesController } from '../controllers/pharmacy.controller.js'

const router = Router()

router.get('/', consumablesController.list)
router.get('/low-stock', consumablesController.getLowStock)
router.get('/near-expiry', consumablesController.getNearExpiry)
router.post('/', consumablesController.create)
router.put('/:id', consumablesController.update)
router.delete('/:id', consumablesController.delete)

export default router
