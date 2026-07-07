export function calculateBMI(beratKg, tinggiCm) {
  if (!beratKg || !tinggiCm || tinggiCm <= 0) return null
  const tinggiM = tinggiCm / 100
  const bmi = beratKg / (tinggiM * tinggiM)
  return Math.round(bmi * 10) / 10
}

export function getBMICategory(bmi) {
  if (!bmi) return null
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25) return 'Normal'
  if (bmi < 30) return 'Overweight'
  return 'Obese'
}
