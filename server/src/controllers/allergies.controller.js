import prisma from '../config/database.js';
import { allergySchema } from '../utils/validators.js';

/**
 * GET /api/allergies/patient/:patientId
 */
export const getByPatientId = async (req, res, next) => {
  try {
    const allergies = await prisma.allergy.findMany({
      where: { patientId: parseInt(req.params.patientId) },
    });

    res.json({ data: allergies });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/allergies
 */
export const create = async (req, res, next) => {
  try {
    const { error, value } = allergySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.details[0].message,
      });
    }

    const allergy = await prisma.allergy.create({ data: value });
    res.status(201).json({
      message: 'Alergi berhasil ditambahkan.',
      data: allergy,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/allergies/:id
 */
export const update = async (req, res, next) => {
  try {
    const { error, value } = allergySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.details[0].message,
      });
    }

    const allergy = await prisma.allergy.update({
      where: { id: parseInt(req.params.id) },
      data: value,
    });

    res.json({
      message: 'Alergi berhasil diperbarui.',
      data: allergy,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/allergies/:id
 */
export const remove = async (req, res, next) => {
  try {
    await prisma.allergy.delete({
      where: { id: parseInt(req.params.id) },
    });

    res.json({ message: 'Alergi berhasil dihapus.' });
  } catch (err) {
    next(err);
  }
};
