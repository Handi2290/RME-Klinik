import { Router } from 'express'
import { icd10Controller } from '../controllers/icd10.controller.js'
import { uploadImport } from '../middleware/upload.js'

const router = Router()

router.get('/', icd10Controller.list)
router.get('/search', icd10Controller.search)
router.get('/categories', icd10Controller.getCategories)
router.get('/:id', icd10Controller.getById)
router.post('/', icd10Controller.create)
router.put('/:id', icd10Controller.update)
router.delete('/:id', icd10Controller.delete)
router.post('/import', uploadImport.single('file'), icd10Controller.import)

export default router
