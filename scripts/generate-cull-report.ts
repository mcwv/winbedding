import { pool } from '../app/lib/db';
import * as fs from 'fs';
import * as path from 'path';

async function generateCullReport() {
    console.log('--- Generating Cull Report ---');

    try {
        // Tools with basically no value
        const cullRes = await pool.query(`
      SELECT t.id, t.name, t.tagline, c.name as category, length(t.description) as d_len
      FROM tools t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE (t.description IS NULL OR length(t.description) < 60)
        AND (t.tagline IS NULL OR length(t.tagline) < 30)
        AND (t.logo_url IS NULL OR t.logo_url = '')
        AND (t.screenshot_url IS NULL OR t.screenshot_url = '')
      ORDER BY d_len ASC;
    `);

        let report = '# Removal Recommendation Report (Auto-Cull)\n\n';
        report += `**Total Tools targeted for removal**: ${cullRes.rows.length}\n\n`;
        report += '| Name | Category | Desc Length | Tagline |\n';
        report += '| :--- | :--- | :--- | :--- |\n';

        cullRes.rows.forEach(tool => {
            report += `| ${tool.name} | ${tool.category} | ${tool.d_len || 0} | ${tool.tagline || 'N/A'} |\n`;
        });

        const reportPath = path.join(__dirname, 'cull-report.md');
        fs.writeFileSync(reportPath, report);
        console.log(`Report generated at: ${reportPath}`);

    } catch (err) {
        console.error('Report generation failed:', err);
    } finally {
        await pool.end();
    }
}

generateCullReport();
