import csv
import json
import re
import sys

csv.field_size_limit(10**7) # Increase limit for large JSON fields

CSV_FILE = 'data/tools-5.csv'
SQL_FILE = 'data/update_enriched_tools.sql'

# Flexible mapping from JSON keys to SQL columns
MAPPING = {
    'description': ['description', 'long_description', 'short_description'],
    'features': ['features', 'key_features'],
    'cons': ['limitations', 'weaknesses', 'cons'],
    'pros': ['strengths', 'pros'],
    'platforms': ['platforms', 'supported_platforms', 'operating_systems'],
    'integrations': ['integrations'],
    'use_cases': ['use_cases', 'common_use_cases'],
    'target_audience': ['target_audience'],
    'pricing_model': ['pricing', 'pricing_model', 'model'],
    'api_available': ['api_available'],
    'tags': ['categories', 'tags'],
    'v2_category': ['categories', 'primary_category'],
    'verdict': ['verdict', 'conclusion']
}

ARRAY_COLUMNS = ['features', 'cons', 'pros', 'platforms', 'integrations', 'use_cases', 'target_audience', 'tags']
BOOLEAN_COLUMNS = ['api_available', 'has_free_tier', 'has_trial', 'has_free_trial']
TEXT_COLUMNS = ['description', 'pricing_model', 'v2_category', 'verdict', 'tagline']

def normalize_pricing(val):
    if not val: return None
    s = str(val).lower()
    if any(word in s for word in ['free trial', 'trial']): return 'freemium' # Usually trial implies some free access then paid
    if 'freemium' in s or 'free tier' in s: return 'freemium'
    if 'free' in s and 'paid' not in s: return 'free'
    if 'subscription' in s or 'monthly' in s or 'yearly' in s: return 'subscription'
    if 'paid' in s or 'premium' in s: return 'paid'
    if 'contact' in s or 'quote' in s: return 'contact'
    return 'subscription' # Default for many AI tools

def format_sql_value(val, col_name):
    if val is None:
        return 'NULL'
    
    if col_name == 'pricing_model':
        val = normalize_pricing(val)

    if col_name in ARRAY_COLUMNS:
        if isinstance(val, str):
            val = [v.strip() for v in val.split(',') if v.strip()]
        if isinstance(val, list):
            # Escaping for Postgres array format
            escaped_vals = [str(v).replace("'", "''").replace('"', '\\"') for v in val]
            return f"'{{{', '.join([f'\"{v}\"' for v in escaped_vals])}}}'"
        return 'NULL'
    
    if col_name in BOOLEAN_COLUMNS:
        if isinstance(val, bool):
            return 'TRUE' if val else 'FALSE'
        if isinstance(val, (int, float)):
            return 'TRUE' if val > 0 else 'FALSE'
        if isinstance(val, str):
            s = val.lower()
            if s in ['true', 'yes', '1']: return 'TRUE'
            if s in ['false', 'no', '0']: return 'FALSE'
        return 'NULL'
    
    if col_name in TEXT_COLUMNS:
        escaped_val = str(val).replace("'", "''")
        return f"'{escaped_val}'"
    
    return 'NULL'

def extract_from_json(output_json, target_col):
    keys = MAPPING.get(target_col, [])
    for k in keys:
        if k in output_json:
            val = output_json[k]
            if val is not None:
                if target_col == 'v2_category' and isinstance(val, list):
                    return val[0] if val else None
                return val
    return None

def main():
    print(f"Reading {CSV_FILE}...")
    sql_statements = []
    
    with open(CSV_FILE, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            raw_output = row.get('prompt_1_output')
            if not raw_output or raw_output.strip() == '':
                continue
                
            try:
                # Handle potential triple-backtick wrapping or other non-JSON noise
                raw_output = raw_output.strip()
                if raw_output.startswith('```json'):
                    raw_output = raw_output[7:-3].strip()
                elif raw_output.startswith('```'):
                    raw_output = raw_output[3:-3].strip()

                output_data = json.loads(raw_output)
                
                # Check for nested message structure
                if isinstance(output_data, dict) and 'output' in output_data:
                    output_list = output_data.get('output', [])
                    if output_list and 'content' in output_list[0]:
                        message_content = output_list[0]['content'][0]['text']
                        try:
                            output_data = json.loads(message_content)
                        except:
                            pass
                
                updates = {}
                for col in COLUMNS_TO_UPDATE:
                    val = extract_from_json(output_data, col)
                    # If JSON doesn't have it, but CSV has it in prompt_1_output (some models might put things in top level)
                    # No, prompt_1_output is the whole JSON.
                    
                    if val is not None:
                        updates[col] = format_sql_value(val, col)
                
                # Fallback: if v2_category is still None, use first tag if available
                if not updates.get('v2_category') or updates['v2_category'] == 'NULL':
                    tags = extract_from_json(output_data, 'tags')
                    if tags and isinstance(tags, list) and len(tags) > 0:
                        updates['v2_category'] = format_sql_value(tags[0], 'v2_category')

                if updates:
                    set_clause = ', '.join([f"{col} = {val}" for col, val in updates.items()])
                    tool_id = row['id']
                    sql = f"UPDATE tools SET {set_clause}, updated_at = NOW() WHERE id = {tool_id};"
                    sql_statements.append(sql)
                    
            except Exception as e:
                # print(f"Error parsing row {row.get('id', 'unknown')}: {e}")
                continue

    print(f"Generated {len(sql_statements)} UPDATE statements.")
    
    with open(SQL_FILE, 'w', encoding='utf-8') as f:
        f.write("-- AI Tools Enrichment Update\n")
        f.write("-- Generated from tools-5.csv\n\n")
        f.write('\n'.join(sql_statements))
        
    print(f"SQL file saved to {SQL_FILE}")

COLUMNS_TO_UPDATE = TEXT_COLUMNS + ARRAY_COLUMNS + BOOLEAN_COLUMNS

if __name__ == '__main__':
    main()
