export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)

  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Data duplikat',
      message: `Field ${err.meta?.target?.join(', ')} sudah ada`,
    })
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Data tidak ditemukan',
      message: err.meta?.cause || 'Record tidak ditemukan',
    })
  }

  if (err.name === 'ValidationError' || err.isJoi) {
    return res.status(400).json({
      error: 'Validasi gagal',
      message: err.message,
      details: err.details,
    })
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Request body tidak valid',
      message: 'JSON tidak valid',
    })
  }

  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Terjadi kesalahan server',
  })
}
