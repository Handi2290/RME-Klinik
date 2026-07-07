import prisma from '../config/database.js';
import { diagnosisSchema } from '../utils/validators.js';

/**
 * GET /api/diagnoses/mr/:mrId
 */
export const getByMrId = async (req, res, next) => {
  try {
    const diagnoses = await prisma.diagnosis.findMany({
      where: { mrId: parseInt(req.params.mrId) },
      include: { icd10: true },
    });

    res.json({ data: diagnoses });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/diagnoses
 */
export const create = async (req, res, next) => {
  try {
    const { error, value } = diagnosisSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.details[0].message,
      });
    }

    // Jika icdId diberikan, ambil kode ICD-10 otomatis
    if (value.icdId && !value.icdCode) {
      const icd = await prisma.icd10.findUnique({ where: { id: value.icdId } });
      if (icd) {
        value.icdCode = icd.code;
      }
    }

    const diagnosis = await prisma.diagnosis.create({
      data: value,
      include: { icd10: true },
    });

    res.status(201).json({
      message: 'Diagnosis berhasil ditambahkan.',
      data: diagnosis,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/diagnoses/:id
 */
export const update = async (req, res, next) => {
  try {
    const { error, value } = diagnosisSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.details[0].message,
      });
    }

    delete value.mrId;

    if (value.icdId && !value.icdCode) {
      const icd = await prisma.icd10.findUnique({ where: { id: value.icdId } });
      if (icd) {
        value.icdCode = icd.code;
      }
    }

    const diagnosis = await prisma.diagnosis.update({
      where: { id: parseInt(req.params.id) },
      data: value,
      include: { icd10: true },
    });

    res.json({
      message: 'Diagnosis berhasil diperbarui.',
      data: diagnosis,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/diagnoses/:id
 */
export const remove = async (req, res, next) => {
  try {
    await prisma.diagnosis.delete({
      where: { id: parseInt(req.params.id) },
    });

    res.json({ message: 'Diagnosis berhasil dihapus.' });
  } catch (err) {
    next(err);
  }
};
