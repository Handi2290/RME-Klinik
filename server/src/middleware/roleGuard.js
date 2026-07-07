export const roleGuard = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Tidak terautentikasi' })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Akses ditolak',
        message: `Role ${req.user.role} tidak memiliki akses ke resource ini`
      })
    }

    next()
  }
}
