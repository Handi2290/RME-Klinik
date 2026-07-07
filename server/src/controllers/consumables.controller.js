import prisma from '../config/database.js';
import { consumableSchema } from '../utils/validators.js';
import { generateConsumableCode } from '../utils/idGenerator.js';

/**
 * GET /api/consumables
 */
export const getAll = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      jenis,
      depot,
      isActive,
      sortBy = 'namaBarang',
      sortOrder = 'asc',
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};

    if (search) {
      where.OR = [
        { namaBarang: { contains: search, mode: 'insensitive' } },
        { kode: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (jenis) where.jenis = jenis;
    if (depot) where.depot = depot;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [data, total] = await Promise.all([
      prisma.consumable.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.consumable.count({ where }),
    ]);

    res.json({
      data,
      meta: {
        total,
        page: parseInt(page),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/consumables/:id
 */
export const getById = async (req, res, next) => {
  try {
    const consumable = await prisma.consumable.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!consumable) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'BHP tidak ditemukan.',
      });
    }

    res.json({ data: consumable });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/consumables
 */
export const create = async (req, res, next) => {
  try {
    const { error, value } = consumableSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.details[0].message,
      });
    }

    if (!value.kode) {
      value.kode = await generateConsumableCode();
    }

    const consumable = await prisma.consumable.create({ data: value });
    res.status(201).json({
      message: 'BHP berhasil ditambahkan.',
      data: consumable,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/consumables/:id
 */
export const update = async (req, res, next) => {
  try {
    const { error, value } = consumableSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.details[0].message,
      });
    }

    if (!value.kode) delete value.kode;

    const consumable = await prisma.consumable.update({
      where: { id: parseInt(req.params.id) },
      data: value,
    });

    res.json({
      message: 'BHP berhasil diperbarui.',
      data: consumable,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/consumables/:id/stock
 */
export const updateStock = async (req, res, next) => {
  try {
    const { jumlah, tipe } = req.body;

    if (!jumlah || jumlah <= 0) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Jumlah harus lebih dari 0.',
      });
    }

    const id = parseInt(req.params.id);
    const consumable = await prisma.consumable.findUnique({ where: { id } });

    if (!consumable) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'BHP tidak ditemukan.',
      });
    }

    if (tipe === 'keluar' && consumable.stok < jumlah) {
      return res.status(400).json({
        error: 'INSUFFICIENT_STOCK',
        message: `Stok tidak mencukupi. Stok tersedia: ${consumable.stok}.`,
      });
    }

    const updated = await prisma.consumable.update({
      where: { id },
      data: {
        stok: tipe === 'masuk' ? { increment: jumlah } : { decrement: jumlah },
      },
    });

    res.json({
      message: `Stok BHP berhasil ${tipe === 'masuk' ? 'ditambah' : 'dikurangi'}.`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/consumables/:id
 */
export const remove = async (req, res, next) => {
  try {
    await prisma.consumable.delete({
      where: { id: parseInt(req.params.id) },
    });

    res.json({ message: 'BHP berhasil dihapus.' });
  } catch (err) {
    next(err);
  }
};
