#!/usr/bin/env python3
import re
import os
import sys
import ssl
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

ROOT = os.path.dirname(os.path.abspath(__file__))
SITE_ROOT = os.path.dirname(ROOT)

html_files = [f for f in os.listdir(SITE_ROOT) if f.endswith('.html')]
if not html_files:
    print('No HTML files found in site root.')
    sys.exit(0)

link_re = re.compile(r'(?:href|src)=["\'](.*?)["\']', re.IGNORECASE)

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

external = {}
missing_local = set()

for html in html_files:
    path = os.path.join(SITE_ROOT, html)
    with open(path, 'r', encoding='utf-8') as fh:
        txt = fh.read()
    for m in link_re.findall(txt):
        if m.startswith('#') or m.startswith('mailto:'):
            continue
        if m.startswith('http://') or m.startswith('https://'):
            external.setdefault(m, []).append(html)
        else:
            # local path
            # remove query/hash
            p = urlparse(m).path
            local_path = os.path.join(SITE_ROOT, p.lstrip('/'))
            if not os.path.exists(local_path):
                missing_local.add((m, html))

print('Checking local asset references...')
if missing_local:
    for m, html in sorted(missing_local):
        print(f'  MISSING: {m} referenced in {html}')
else:
    print('  All local assets referenced exist.')

print('\nChecking external links (this may take a moment)...')

def check_url(url):
    req = Request(url, method='HEAD', headers={'User-Agent':'link-checker/1.0'})
    try:
        with urlopen(req, timeout=8, context=ctx) as resp:
            return resp.getcode()
    except HTTPError as e:
        return e.code
    except URLError as e:
        return str(e.reason)
    except Exception as e:
        return str(e)

for url, refs in sorted(external.items()):
    status = check_url(url)
    refs_display = ', '.join(refs[:3]) + (',...' if len(refs)>3 else '')
    print(f'  {url} -> {status}  (found in: {refs_display})')

print('\nDone.')
