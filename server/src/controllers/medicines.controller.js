import prisma from '../config/database.js';
import { medicineSchema } from '../utils/validators.js';
import { generateMedicineCode } from '../utils/idGenerator.js';

/**
 * GET /api/medicines
 */
export const getAll = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      kategori,
      jenis,
      depot,
      isActive,
      sortBy = 'namaObat',
      sortOrder = 'asc',
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};

    if (search) {
      where.OR = [
        { namaObat: { contains: search, mode: 'insensitive' } },
        { kode: { contains: search, mode: 'insensitive' } },
        { kandungan: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (kategori) where.kategori = kategori;
    if (jenis) where.jenis = jenis;
    if (depot) where.depot = depot;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [data, total] = await Promise.all([
      prisma.medicine.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.medicine.count({ where }),
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
 * GET /api/medicines/:id
 */
export const getById = async (req, res, next) => {
  try {
    const medicine = await prisma.medicine.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!medicine) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Obat tidak ditemukan.',
      });
    }

    res.json({ data: medicine });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/medicines
 */
export const create = async (req, res, next) => {
  try {
    const { error, value } = medicineSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.details[0].message,
      });
    }

    if (!value.kode) {
      value.kode = await generateMedicineCode();
    }

    const medicine = await prisma.medicine.create({ data: value });
    res.status(201).json({
      message: 'Obat berhasil ditambahkan.',
      data: medicine,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/medicines/:id
 */
export const update = async (req, res, next) => {
  try {
    const { error, value } = medicineSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.details[0].message,
      });
    }

    if (!value.kode) delete value.kode;

    const medicine = await prisma.medicine.update({
      where: { id: parseInt(req.params.id) },
      data: value,
    });

    res.json({
      message: 'Obat berhasil diperbarui.',
      data: medicine,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/medicines/:id/stock
 */
export const updateStock = async (req, res, next) => {
  try {
    const { jumlah, tipe } = req.body; // tipe: 'masuk' atau 'keluar'

    if (!jumlah || jumlah <= 0) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Jumlah harus lebih dari 0.',
      });
    }

    const id = parseInt(req.params.id);
    const medicine = await prisma.medicine.findUnique({ where: { id } });

    if (!medicine) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Obat tidak ditemukan.',
      });
    }

    if (tipe === 'keluar' && medicine.stok < jumlah) {
      return res.status(400).json({
        error: 'INSUFFICIENT_STOCK',
        message: `Stok tidak mencukupi. Stok tersedia: ${medicine.stok}.`,
      });
    }

    const updated = await prisma.medicine.update({
      where: { id },
      data: {
        stok: tipe === 'masuk' ? { increment: jumlah } : { decrement: jumlah },
      },
    });

    res.json({
      message: `Stok obat berhasil ${tipe === 'masuk' ? 'ditambah' : 'dikurangi'}.`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/medicines/:id
 */
export const remove = async (req, res, next) => {
  try {
    await prisma.medicine.delete({
      where: { id: parseInt(req.params.id) },
    });

    res.json({ message: 'Obat berhasil dihapus.' });
  } catch (err) {
    next(err);
  }
};
