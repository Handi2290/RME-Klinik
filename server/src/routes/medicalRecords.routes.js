import { Router } from 'express'
import { medicalRecordsController, vitalSignsController, diagnosesController, allergiesController } from '../controllers/medicalRecords.controller.js'

const router = Router()

// Medical Records
router.get('/visit/:visitId', medicalRecordsController.getByVisit)
router.post('/', medicalRecordsController.create)
router.put('/:id', medicalRecordsController.update)
router.get('/:id/edit-history', medicalRecordsController.getEditHistory)

// Vital Signs
router.post('/vital-signs', vitalSignsController.create)
router.put('/vital-signs/:id', vitalSignsController.update)

// Diagnoses
router.get('/diagnoses/:mrId', diagnosesController.getByMR)
router.post('/diagnoses', diagnosesController.create)
router.delete('/diagnoses/:id', diagnosesController.delete)

// Allergies
router.get('/allergies/patient/:patientId', allergiesController.getByPatient)
router.post('/allergies', allergiesController.create)
router.delete('/allergies/:id', allergiesController.delete)

export default router
