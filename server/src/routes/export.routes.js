import { Router } from 'express'
import { exportController } from '../controllers/export.controller.js'

const router = Router()

router.get('/medicines/excel', exportController.medicinesExcel)
router.get('/consumables/excel', exportController.consumablesExcel)
router.get('/icd10/excel', exportController.icd10Excel)
router.get('/invoice/:id/pdf', exportController.invoicePdf)

export default router
