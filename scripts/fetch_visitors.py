#!/usr/bin/env python3
"""
Fetch aggregated visitor counts (country -> count) from a configured endpoint or Plausible,
and write to data/visitors.json. Intended for use in a scheduled GitHub Action.

Behaviour:
- If env `VISITOR_DATA_ENDPOINT` is set, GET that URL and expect a JSON mapping (ISO2 -> count).
- Else if `PLAUSIBLE_API_KEY` and `PLAUSIBLE_SITE` are set, call Plausible aggregate API to get country breakdown.

The script writes `data/visitors.json` with the mapping when data is available.
"""
import os
import sys
import json
import re
from pathlib import Path

import requests

OUT_PATH = Path(__file__).resolve().parents[1] / 'data' / 'visitors.json'
OUT_PATH.parent.mkdir(parents=True, exist_ok=True)

def write_output(mapping):
    with OUT_PATH.open('w', encoding='utf8') as f:
        json.dump(mapping, f, indent=2, ensure_ascii=False)
    print(f'Wrote {OUT_PATH} with {len(mapping)} entries')

def fetch_from_endpoint(url):
    print('Fetching visitor data from endpoint:', url)
    r = requests.get(url, timeout=20)
    r.raise_for_status()
    data = r.json()
    if isinstance(data, dict):
        # assume mapping
        return {k.upper(): int(v) for k,v in data.items() if isinstance(v, (int,float,str))}
    raise ValueError('Endpoint returned unexpected JSON type')

def extract_from_plausible_json(j):
    # Try multiple shapes to extract country->count
    # 1) direct mapping
    if isinstance(j, dict):
        # Look for keys that are country codes
        candidate = {k.upper(): int(v) for k,v in j.items() if re.fullmatch(r'[A-Za-z]{2}', k) and isinstance(v, (int,float,str))}
        if candidate:
            return candidate

    # 2) results as list of objects with label/value or country/visitors
    if isinstance(j, dict):
        for key in ('results','data','items'):
            v = j.get(key)
            if isinstance(v, list):
                mapping = {}
                for item in v:
                    if not isinstance(item, dict):
                        continue
                    # common shapes
                    for label_key in ('country','label','name','item'):
                        if label_key in item and ('visitors' in item or 'value' in item):
                            code = str(item[label_key]).upper()
                            val = item.get('visitors') or item.get('value')
                            try:
                                mapping[code] = int(val)
                            except Exception:
                                pass
                    # fallback: 'dimension' + 'metrics'
                    if 'dimension' in item and isinstance(item.get('metrics'), dict):
                        code = str(item['dimension']).upper()
                        # try to extract first numeric metric
                        for mv in item['metrics'].values():
                            try:
                                mapping[code] = int(mv)
                                break
                            except Exception:
                                continue
                if mapping:
                    return mapping

    # 3) If j contains 'results' and 'dimensions' like Plausible v1
    if isinstance(j, dict) and 'results' in j and isinstance(j['results'], dict):
        # results may contain arrays corresponding to dims
        # attempt to find arrays of equal length and a dimensions array
        results = j['results']
        dims = j.get('dimensions') or j.get('labels') or j.get('entities')
        if isinstance(dims, list):
            # find numeric array in results
            for k,v in results.items():
                if isinstance(v, list) and len(v) == len(dims):
                    mapping = {}
                    for label, val in zip(dims, v):
                        mapping[str(label).upper()] = int(val)
                    return mapping

    return {}

def fetch_from_plausible(api_key, site, period='30d'):
    url = f'https://plausible.io/api/v1/stats/aggregate?site_id={site}&period={period}&metrics=visitors&dimensions=country'
    print('Fetching Plausible:', url)
    headers = {'Authorization': f'Bearer {api_key}'}
    r = requests.get(url, headers=headers, timeout=20)
    r.raise_for_status()
    j = r.json()
    mapping = extract_from_plausible_json(j)
    if mapping:
        return mapping
    # As a fallback, search recursively for lists of objects
    def walk(obj):
        if isinstance(obj, dict):
            for v in obj.values():
                res = walk(v)
                if res: return res
        if isinstance(obj, list):
            # check if list of dicts with label/value
            mapping = {}
            for item in obj:
                if isinstance(item, dict):
                    label = item.get('label') or item.get('country') or item.get('name')
                    val = item.get('visitors') or item.get('value')
                    if label and val is not None:
                        try:
                            mapping[str(label).upper()] = int(val)
                        except Exception:
                            pass
            if mapping:
                return mapping
            for v in obj:
                res = walk(v)
                if res: return res
        return None

    res = walk(j)
    return res or {}

def main():
    endpoint = os.environ.get('VISITOR_DATA_ENDPOINT')
    if endpoint:
        try:
            mapping = fetch_from_endpoint(endpoint)
            if mapping:
                write_output(mapping)
                return 0
        except Exception as e:
            print('Error fetching from endpoint:', e)

    api_key = os.environ.get('PLAUSIBLE_API_KEY')
    site = os.environ.get('PLAUSIBLE_SITE')
    period = os.environ.get('PLAUSIBLE_PERIOD', '30d')
    if api_key and site:
        try:
            mapping = fetch_from_plausible(api_key, site, period)
            if mapping:
                write_output(mapping)
                return 0
        except Exception as e:
            print('Error fetching from Plausible:', e)

    print('No visitor data fetched. Exiting without changes.')
    return 0

if __name__ == '__main__':
    sys.exit(main())
