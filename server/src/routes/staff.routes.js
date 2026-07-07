import { Router } from 'express'
import { staffController } from '../controllers/staff.controller.js'
import { roleGuard } from '../middleware/roleGuard.js'

const router = Router()

router.get('/', staffController.list)
router.get('/doctors', staffController.getDoctors)
router.post('/', roleGuard('MASTER'), staffController.create)
router.put('/:id', roleGuard('MASTER'), staffController.update)
router.patch('/:id/toggle-active', roleGuard('MASTER'), staffController.toggleActive)

export default router
