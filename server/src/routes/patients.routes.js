import { Router } from 'express'
import { patientsController } from '../controllers/patients.controller.js'

const router = Router()

router.get('/', patientsController.list)
router.get('/:id', patientsController.getById)
router.post('/', patientsController.create)
router.put('/:id', patientsController.update)
router.get('/:id/history', patientsController.getHistory)

export default router
