import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

function cleanString(str) {
    if (!str) return ''
    return String(str).trim().replace(/^,/, '').replace(/,$/, '').trim()
}

function ensureProtocol(url) {
    if (!url) return ''
    let clean = url.trim()
    if (clean.startsWith('http')) return clean
    return 'https://' + clean
}

function isValidUrl(url) {
    if (!url) return false
    if (url.length > 500) return false
    if (!url.startsWith('http://') && !url.startsWith('https://')) return false
    return !url.includes(' ') && !url.includes(',')
}

const csvContent = fs.readFileSync(path.join(process.cwd(), 'bedwinning - AI-Tools.csv'), 'utf-8')
const csvRecords = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    bom: true // Handle BOM if present
})

console.log('Total records:', csvRecords.length)
if (csvRecords.length > 0) {
    console.log('First record keys:', Object.keys(csvRecords[0]))
    console.log('First record sample:', csvRecords[0])

    const r = csvRecords[0]
    const name = cleanString(r.title)
    const url = ensureProtocol(r.apply_link)

    console.log('Parsed Name:', name)
    console.log('Parsed URL:', url)
    console.log('Is Valid URL?', isValidUrl(url))
}
