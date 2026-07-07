import prisma from '../config/database.js';
import { vitalSignSchema } from '../utils/validators.js';
import { calculateBMI } from '../utils/bmiCalculator.js';

/**
 * GET /api/vital-signs/:mrId
 */
export const getByMrId = async (req, res, next) => {
  try {
    const vitalSign = await prisma.vitalSign.findUnique({
      where: { mrId: parseInt(req.params.mrId) },
    });

    if (!vitalSign) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Tanda vital belum dicatat untuk rekam medis ini.',
      });
    }

    res.json({ data: vitalSign });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/vital-signs
 */
export const create = async (req, res, next) => {
  try {
    const { error, value } = vitalSignSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.details[0].message,
      });
    }

    // Auto-calculate BMI
    if (value.beratBadan && value.tinggiBadan) {
      const bmiResult = calculateBMI(value.beratBadan, value.tinggiBadan);
      if (bmiResult) {
        value.bmi = bmiResult.bmi;
      }
    }

    const vitalSign = await prisma.vitalSign.create({ data: value });
    res.status(201).json({
      message: 'Tanda vital berhasil dicatat.',
      data: vitalSign,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/vital-signs/:mrId
 */
export const update = async (req, res, next) => {
  try {
    const { error, value } = vitalSignSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.details[0].message,
      });
    }

    const mrId = parseInt(req.params.mrId);
    delete value.mrId;

    // Auto-calculate BMI
    if (value.beratBadan && value.tinggiBadan) {
      const bmiResult = calculateBMI(value.beratBadan, value.tinggiBadan);
      if (bmiResult) {
        value.bmi = bmiResult.bmi;
      }
    }

    const vitalSign = await prisma.vitalSign.upsert({
      where: { mrId },
      update: value,
      create: { mrId, ...value },
    });

    res.json({
      message: 'Tanda vital berhasil diperbarui.',
      data: vitalSign,
    });
  } catch (err) {
    next(err);
  }
};
