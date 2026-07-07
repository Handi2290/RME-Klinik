import { Router } from 'express'
import { invoicesController } from '../controllers/invoices.controller.js'

const router = Router()

router.get('/', invoicesController.list)
router.post('/', invoicesController.create)
router.post('/:id/pay', invoicesController.processPayment)
router.get('/:id/history', invoicesController.getPaymentHistory)

export default router
