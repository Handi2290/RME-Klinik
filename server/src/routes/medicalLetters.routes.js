import { Router } from 'express'
import { medicalLettersController } from '../controllers/medicalLetters.controller.js'

const router = Router()

router.post('/', medicalLettersController.create)
router.get('/:id/pdf', medicalLettersController.generatePdf)

export default router
