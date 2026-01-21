#!/usr/bin/env python3
"""Add Wayback archival fallback links next to broken external URLs listed in BROKEN_EXTERNAL_LINKS.md

Usage: python3 scripts/add_wayback_fallbacks.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / 'BROKEN_EXTERNAL_LINKS.md'


def parse_report(path: Path):
    text = path.read_text(encoding='utf-8')
    # find lines with '- https://...'
    urls = re.findall(r"- (https?://\S+)", text)
    return list(dict.fromkeys(urls))


def make_archive_link(url: str) -> str:
    return f"https://web.archive.org/web/*/{url}"


def insert_fallbacks(urls):
    html_files = list(ROOT.glob('**/*.html'))
    changed = []
    for html in html_files:
        content = html.read_text(encoding='utf-8')
        orig = content
        for url in urls:
            # build regex to find anchor tags with this exact href
            href_rx = re.compile(rf'(<a[^>]+href=["\']{re.escape(url)}["\'][^>]*>.*?</a>)', re.IGNORECASE | re.DOTALL)
            def repl(m):
                anchor = m.group(1)
                # don't duplicate if an archived link already present immediately after
                if 'archived' in anchor.lower():
                    return anchor
                archive = make_archive_link(url)
                snippet = f"{anchor} <a class=\"archived-link\" href=\"{archive}\" target=\"_blank\" rel=\"noopener noreferrer\">(archived)</a>"
                return snippet
            content = href_rx.sub(repl, content)
        if content != orig:
            html.write_text(content, encoding='utf-8')
            changed.append(str(html.relative_to(ROOT)))
    return changed


def main():
    if not REPORT.exists():
        print('BROKEN_EXTERNAL_LINKS.md not found')
        return
    urls = parse_report(REPORT)
    if not urls:
        print('No URLs found in report')
        return
    changed = insert_fallbacks(urls)
    if changed:
        print('Updated files:')
        for p in changed:
            print('-', p)
    else:
        print('No HTML files required updates.')


if __name__ == '__main__':
    main()
