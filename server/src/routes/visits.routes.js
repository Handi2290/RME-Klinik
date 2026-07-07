import { Router } from 'express'
import { visitsController } from '../controllers/visits.controller.js'

const router = Router()

router.get('/', visitsController.list)
router.get('/today', visitsController.getToday)
router.get('/queue-stats', visitsController.getQueueStats)
router.post('/', visitsController.create)
router.put('/:id', visitsController.update)
router.patch('/:id/status', visitsController.updateStatus)
router.delete('/:id', visitsController.delete)

export default router
