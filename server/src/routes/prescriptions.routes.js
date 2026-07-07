import { Router } from 'express'
import { prescriptionsController } from '../controllers/prescriptions.controller.js'

const router = Router()

router.get('/mr/:mrId', prescriptionsController.getByMR)
router.post('/', prescriptionsController.create)
router.post('/compound', prescriptionsController.createCompound)
router.delete('/:id', prescriptionsController.delete)

export default router
