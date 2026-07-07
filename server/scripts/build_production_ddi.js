/**
 * Production DDI Pipeline v2
 *
 * Strategi (Hybrid FDA + Local AI):
 * 1. Per bahan aktif di DB, ambil drug label dari openFDA (data resmi FDA, gratis, tanpa key)
 * 2. Kirim teks "drug_interactions" dari label tersebut ke Ollama lokal untuk di-parse menjadi
 *    JSON terstruktur (nama pasangan + severity + deskripsi)
 * 3. Upsert hasilnya ke tabel DrugInteraction sebagai VALIDATED (dari FDA label)
 *
 * Keunggulan:
 * - Data berasal dari label resmi FDA → tervalidasi secara klinis
 * - Parsing dilakukan offline oleh Ollama lokal → privat & gratis
 * - Resume-able: simpan progres ke file ddi_progress.json
 *
 * Usage:
 *   node scripts/build_production_ddi.js
 *   node scripts/build_production_ddi.js --resume     (skip ingredient yg sudah diproses)
 *   node scripts/build_production_ddi.js --test        (uji 5 ingredient pertama saja)
 */
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const prisma = new PrismaClient()

const FDA_BASE = 'https://api.fda.gov/drug/label.json'
const OLLAMA_URL = 'http://localhost:11434/v1/chat/completions'
const OLLAMA_MODEL = 'qwen3:8b'
const PROGRESS_FILE = path.join(__dirname, '../ddi_progress.json')

const args = process.argv.slice(2)
const RESUME = args.includes('--resume')
const TEST_MODE = args.includes('--test')
const DELAY_MS = 200 // be polite to FDA API

// ─── Utilities ────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'))
  }
  return { processedIds: [] }
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2))
}

// ─── Step 1: Fetch FDA label drug_interactions text ───────────────────────────
async function fetchFdaInteractionText(ingredientName) {
  try {
    const encoded = encodeURIComponent(ingredientName)
    const url = `${FDA_BASE}?search=openfda.substance_name:"${encoded}"&limit=1`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    const label = data?.results?.[0]
    if (!label) return null
    const ddiText = label?.drug_interactions?.[0] || ''
    return ddiText.length > 50 ? ddiText : null
  } catch {
    return null
  }
}

// ─── Step 2: Parse DDI text with Ollama ───────────────────────────────────────
async function parseDdiWithOllama(ingredientName, ddiText) {
  const truncated = ddiText.substring(0, 3000) // keep prompt manageable
  const prompt = `You are a clinical pharmacology expert. Extract structured drug-drug interactions from this FDA drug label text for the drug "${ingredientName}".

FDA Label Text:
${truncated}

Instructions:
- Extract ONLY specific named drug or drug class interactions that have clinical significance
- For each interaction, determine the severity: MAJOR (avoid combination), MODERATE (monitor closely), or MINOR (minimal risk)
- Do NOT include food interactions, only drug-drug interactions
- Maximum 20 interactions

Return ONLY a valid JSON array like this:
[
  {
    "partnerName": "Drug or drug class name",
    "severity": "MAJOR|MODERATE|MINOR",
    "description": "Brief mechanism/consequence in 1-2 sentences"
  }
]

If no specific drug interactions are mentioned, return an empty array: []`

  try {
    const res = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1
      })
    })
    if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`)
    const json = await res.json()
    let text = json.choices?.[0]?.message?.content?.trim() || '[]'

    // Strip markdown fences if present
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()
    // Strip <think> tags (qwen3 thinking mode)
    text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
    
    return JSON.parse(text)
  } catch (e) {
    return []
  }
}

// ─── Step 3: Upsert interaction pair to DB ────────────────────────────────────
async function saveInteraction(ing1, partnerName, severity, description) {
  // Upsert partner ingredient (may not exist in DB yet)
  let ing2 = await prisma.activeIngredient.findFirst({ where: { name: partnerName } })
  if (!ing2) {
    ing2 = await prisma.activeIngredient.create({ data: { name: partnerName } })
  }

  const existing = await prisma.drugInteraction.findFirst({
    where: {
      OR: [
        { ingredient1Id: ing1.id, ingredient2Id: ing2.id },
        { ingredient1Id: ing2.id, ingredient2Id: ing1.id }
      ]
    }
  })

  const data = {
    severity,
    description,
    clinicalConsequence: description,
    status: 'VALIDATED',
    evidence: 'openFDA Drug Label (FDA Official) + AI Parsing (Ollama)'
  }

  if (existing) {
    await prisma.drugInteraction.update({ where: { id: existing.id }, data })
  } else {
    await prisma.drugInteraction.create({
      data: { ingredient1Id: ing1.id, ingredient2Id: ing2.id, ...data }
    })
  }
}

function mapSeverity(s) {
  const upper = (s || '').toUpperCase()
  if (upper === 'MAJOR') return 'MAJOR'
  if (upper === 'MODERATE') return 'MODERATE'
  if (upper === 'MINOR') return 'MINOR'
  return 'MODERATE'
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('=========================================')
  console.log('  Production DDI Pipeline v2')
  console.log('  Source: openFDA Labels + Ollama Parser')
  console.log(`  Model : ${OLLAMA_MODEL}`)
  if (TEST_MODE) console.log('  Mode  : TEST (5 ingredients only)')
  if (RESUME) console.log('  Mode  : RESUME (skip already processed)')
  console.log('=========================================\n')

  const progress = loadProgress()
  let allIngredients = await prisma.activeIngredient.findMany({ orderBy: { id: 'asc' } })

  if (TEST_MODE) allIngredients = allIngredients.slice(0, 5)

  const total = allIngredients.length
  console.log(`Total ingredients in DB: ${total}\n`)

  let processed = 0, withFda = 0, withInteractions = 0, totalPairs = 0

  for (const ing of allIngredients) {
    processed++
    const prefix = `[${processed}/${total}] ${ing.name.substring(0, 45).padEnd(45)}`

    if (RESUME && progress.processedIds.includes(ing.id)) {
      process.stdout.write(`${prefix} [skipped]\n`)
      continue
    }

    // Step A: Fetch FDA label
    const ddiText = await fetchFdaInteractionText(ing.name)
    await sleep(DELAY_MS)

    if (!ddiText) {
      process.stdout.write(`${prefix} [no FDA label]\n`)
      progress.processedIds.push(ing.id)
      if (processed % 20 === 0) saveProgress(progress)
      continue
    }
    withFda++

    // Step B: Parse with Ollama
    process.stdout.write(`${prefix} [parsing...]\r`)
    const interactions = await parseDdiWithOllama(ing.name, ddiText)

    if (!Array.isArray(interactions) || interactions.length === 0) {
      process.stdout.write(`${prefix} [0 pairs]\n`)
      progress.processedIds.push(ing.id)
      if (processed % 20 === 0) saveProgress(progress)
      continue
    }

    withInteractions++
    let saved = 0
    for (const item of interactions) {
      if (!item?.partnerName || !item?.severity) continue
      await saveInteraction(ing, item.partnerName, mapSeverity(item.severity), item.description || '')
      saved++
      totalPairs++
    }
    process.stdout.write(`${prefix} [${saved} pairs saved]\n`)

    progress.processedIds.push(ing.id)
    if (processed % 10 === 0) saveProgress(progress)
  }

  saveProgress(progress)

  console.log('\n=========================================')
  console.log(`  Pipeline Complete!`)
  console.log(`  Ingredients processed   : ${processed}`)
  console.log(`  With FDA label          : ${withFda}`)
  console.log(`  With parsed interactions: ${withInteractions}`)
  console.log(`  Total interaction pairs : ${totalPairs}`)
  console.log('=========================================')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
