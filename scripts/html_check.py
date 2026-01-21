#!/usr/bin/env python3
import re
import sys
from pathlib import Path

VOID_TAGS = set("area base br col embed hr img input keygen link meta param source track wbr".split())
TAG_RE = re.compile(r'<\s*(/?)\s*([a-zA-Z0-9:-]+)([^>]*)>', re.I)
NAV_RE = re.compile(r'<\s*nav\b', re.I)
FOOTER_RE = re.compile(r'<\s*footer\b', re.I)

root = Path('.')
files = sorted(root.glob('*.html'))

reports = {}

for f in files:
    text = f.read_text(encoding='utf-8')
    stack = []
    issues = []
    # simple tag matching
    for m in TAG_RE.finditer(text):
        closing, tag, rest = m.group(1), m.group(2).lower(), m.group(3)
        if tag == '!doctype' or tag.startswith('!--'):
            continue
        # self-closing if ends with /
        self_close = rest.strip().endswith('/')
        if closing:
            if not stack:
                issues.append(f"Unexpected closing tag </{tag}> at pos {m.start()}")
            else:
                top = stack.pop()
                if top != tag:
                    issues.append(f"Mismatched closing tag </{tag}> at pos {m.start()} (expected </{top}>)")
        else:
            if tag in VOID_TAGS or self_close:
                continue
            stack.append(tag)
    if stack:
        issues.append(f"Unclosed tags at EOF: {', '.join(stack[-8:])}")

    # check footer inside nav
    for nav_m in NAV_RE.finditer(text):
        nav_start = nav_m.start()
        # find closing </nav> after this
        nav_close = re.search(r'<\s*/\s*nav\s*>', text[nav_start:], re.I)
        if nav_close:
            nav_end = nav_start + nav_close.end()
            if FOOTER_RE.search(text[nav_start:nav_end]):
                issues.append("<footer> found inside <nav> — footer should be after navigation")

    # basic count checks
    if text.lower().count('<html') != 1:
        issues.append(f"Found {text.lower().count('<html')} <html> tags")
    if text.lower().count('<head') != 1:
        issues.append(f"Found {text.lower().count('<head')} <head> tags")
    if text.lower().count('<body') != 1:
        issues.append(f"Found {text.lower().count('<body')} <body> tags")

    reports[str(f)] = issues

# print summary
any_issues = False
for fn, issues in reports.items():
    if issues:
        any_issues = True
        print(f"== {fn} ({len(issues)} issue(s)) ==")
        for it in issues:
            print(" - ", it)
        print()

if not any_issues:
    print("No issues found by lightweight checker.")

# exit code 0 even if issues, just reporting
sys.exit(0)
