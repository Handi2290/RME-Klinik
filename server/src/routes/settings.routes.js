import { Router } from 'express'
import { settingsController } from '../controllers/settings.controller.js'
import { roleGuard } from '../middleware/roleGuard.js'
import { uploadImage } from '../middleware/upload.js'

const router = Router()

router.get('/', settingsController.getAll)
router.put('/', roleGuard('MASTER'), settingsController.update)
router.get('/print-template', settingsController.getPrintTemplate)
router.put('/print-template', roleGuard('MASTER'), settingsController.updatePrintTemplate)
router.post('/print-template/logo', roleGuard('MASTER'), uploadImage.single('logo'), settingsController.uploadLogo)
router.post('/illustration', roleGuard('MASTER'), uploadImage.single('image'), settingsController.uploadIllustration)

export default router
