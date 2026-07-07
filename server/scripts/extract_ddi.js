import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()
const prisma = new PrismaClient()

// Attempt to load Google GenAI SDK if available
let genai = null
try {
  // Use dynamic import for ESM if available or just check env
  // Since it might not be installed, we will just rely on try/catch
  // In pure ESM, conditional import is await import(). We can use that.
} catch (e) {}

const USE_GEMINI = !!process.env.GEMINI_API_KEY

if (USE_GEMINI) {
  console.log('✅  GEMINI_API_KEY found. Using Google Gemini API (Free Tier available) for Knowledge Extraction.')
} else {
  console.log('⚠️  No GEMINI_API_KEY found. Using Local Ollama API (http://localhost:11434) as free fallback.')
}

async function extractInteractionMock(ing1, ing2) {
  const pair = [ing1.name.toLowerCase(), ing2.name.toLowerCase()].sort().join('-')
  
  await new Promise(resolve => setTimeout(resolve, 500))

  if (pair.includes('clopidogrel') && pair.includes('omeprazole')) {
    return {
      severity: 'MAJOR',
      description: 'Omeprazole may decrease the effectiveness of Clopidogrel by inhibiting CYP2C19.',
      clinicalConsequence: 'Increased risk of cardiovascular events.',
      evidence: 'Simulated Mock Data'
    }
  } else if (pair.includes('aspirin') && pair.includes('clopidogrel')) {
    return {
      severity: 'MODERATE',
      description: 'Concurrent use increases bleeding risk, though often prescribed together intentionally.',
      clinicalConsequence: 'Increased bleeding risk.',
      evidence: 'Simulated Mock Data'
    }
  } else if (pair.includes('paracetamol') && pair.includes('amoxicillin')) {
    return null
  }

  if (Math.random() > 0.8) {
    return {
      severity: 'MINOR',
      description: `Possible minor interaction between ${ing1.name} and ${ing2.name}.`,
      clinicalConsequence: 'Monitor patient.',
      evidence: 'Simulated Mock Data'
    }
  }
  
  return null
}

async function extractInteractionGemini(ing1, ing2) {
  try {
    const { GoogleGenAI } = await import('@google/genai')
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    const prompt = `
      You are a clinical pharmacist AI. Analyze the potential drug-drug interaction (DDI) between the following two active ingredients:
      1. ${ing1.name}
      2. ${ing2.name}

      Based on biomedical literature and clinical guidelines, is there a known interaction?
      Provide your answer in strict JSON format matching this schema:
      {
        "hasInteraction": boolean,
        "severity": "MAJOR" | "MODERATE" | "MINOR" | "UNKNOWN",
        "description": "Brief description of the interaction mechanism.",
        "clinicalConsequence": "Clinical consequences if co-administered.",
        "evidence": "Brief mention of literature or guidelines."
      }
      If there is no significant interaction, set hasInteraction to false and omit the rest.
      Return ONLY valid JSON.
    `

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
         temperature: 0.7,
      }
    })

    let text = response.text().trim()
    if (text.startsWith('```json')) text = text.slice(7)
    if (text.startsWith('```')) text = text.slice(3)
    if (text.endsWith('```')) text = text.slice(0, -3)

    const data = JSON.parse(text)
    if (data.hasInteraction && data.severity) {
      return {
        severity: data.severity,
        description: data.description,
        clinicalConsequence: data.clinicalConsequence,
        evidence: data.evidence
      }
    }
    return null
  } catch (error) {
    console.error(`Error querying Gemini for ${ing1.name} and ${ing2.name}:`, error.message)
    return null
  }
}

async function extractInteractionCustom(ing1, ing2) {
  try {
    const prompt = `
      You are a clinical pharmacist AI. Analyze the potential drug-drug interaction (DDI) between the following two active ingredients:
      1. ${ing1.name}
      2. ${ing2.name}

      Based on biomedical literature and clinical guidelines, is there a known interaction?
      Provide your answer in strict JSON format matching this schema:
      {
        "hasInteraction": boolean,
        "severity": "MAJOR" | "MODERATE" | "MINOR" | "UNKNOWN",
        "description": "Brief description of the interaction mechanism.",
        "clinicalConsequence": "Clinical consequences if co-administered.",
        "evidence": "Brief mention of literature or guidelines."
      }
      If there is no significant interaction, set hasInteraction to false and omit the rest.
      Return ONLY valid JSON.
    `

    // By default, let's target a local Ollama instance running on port 11434 
    // Format compatible with Ollama's OpenAI API emulation
    const response = await fetch('http://localhost:11434/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen3:8b', // Menggunakan model Qwen3 8B yang sudah ada di PC Anda
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.2
      })
    })

    if (!response.ok) {
       throw new Error(`API returned ${response.status}: ${await response.text()}`)
    }

    const json = await response.json()
    let text = json.choices[0].message.content.trim()

    if (text.startsWith('```json')) text = text.slice(7)
    if (text.startsWith('```')) text = text.slice(3)
    if (text.endsWith('```')) text = text.slice(0, -3)

    const data = JSON.parse(text)
    if (data.hasInteraction && data.severity) {
      return {
        severity: data.severity,
        description: data.description,
        clinicalConsequence: data.clinicalConsequence,
        evidence: data.evidence
      }
    }
    return null
  } catch (error) {
    const cause = error.cause ? error.cause.message || error.cause : ''
    console.error(`Error querying Local Ollama AI for ${ing1.name} and ${ing2.name}:`, error.message, cause)
    return null
  }
}

async function main() {
  console.log('--- Starting AI-Powered Knowledge Extraction Pipeline ---')
  
  const ingredients = await prisma.activeIngredient.findMany()
  console.log(`Found ${ingredients.length} active ingredients. Generating pairs...`)

  const pairs = []
  for (let i = 0; i < ingredients.length; i++) {
    for (let j = i + 1; j < ingredients.length; j++) {
      pairs.push([ingredients[i], ingredients[j]])
    }
  }

  console.log(`Total pairs to analyze: ${pairs.length}`)

  let added = 0
  for (const [ing1, ing2] of pairs) {
    console.log(`Analyzing: ${ing1.name} + ${ing2.name}...`)
    
    const existing = await prisma.drugInteraction.findFirst({
      where: {
        OR: [
          { ingredient1Id: ing1.id, ingredient2Id: ing2.id },
          { ingredient1Id: ing2.id, ingredient2Id: ing1.id }
        ]
      }
    })

    if (existing) {
      console.log(`  -> Interaction already analyzed (Status: ${existing.status}). Skipping.`)
      continue
    }

    const interactionData = USE_GEMINI 
      ? await extractInteractionGemini(ing1, ing2) 
      : await extractInteractionCustom(ing1, ing2)

    if (interactionData) {
      console.log(`  -> Found ${interactionData.severity} interaction! Saving...`)
      await prisma.drugInteraction.create({
        data: {
          ingredient1Id: ing1.id,
          ingredient2Id: ing2.id,
          severity: interactionData.severity,
          description: interactionData.description,
          clinicalConsequence: interactionData.clinicalConsequence,
          evidence: interactionData.evidence,
          status: 'UNVALIDATED'
        }
      })
      added++
    } else {
      console.log(`  -> No significant interaction found.`)
    }
  }

  console.log(`Pipeline completed. Added ${added} new interactions to the preliminary graph database.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
