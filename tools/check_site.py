"""Checks the generated homepage (run after `python site-src/build.py`).

    python tools/check_site.py
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LANGS = ['ja', 'ko', 'en']
PAGES = ['index', 'about', 'service', 'flow', 'stories', 'column', 'faq', 'company', 'contact', 'privacy']
FORBIDDEN = ['必ず成婚', '政府が保証', 'すべての損害を補償', '반드시 성혼', '정부가 보증', '모든 손해를 보상',
             'guaranteed marriage', 'government guarantee', '970410', '1997年', '1997년', 'TODO', 'lorem']


def main() -> int:
    errors = []
    files = [ROOT / 'index.html'] + [ROOT / l / f'{p}.html' for l in LANGS for p in PAGES]
    for f in files:
        if not f.exists():
            errors.append(f'missing {f.relative_to(ROOT)}')
            continue
        html = f.read_text(encoding='utf-8')
        rel = f.relative_to(ROOT).as_posix()
        if not re.search(r'<title>[^<]+</title>', html):
            errors.append(f'{rel}: empty title')
        if f.parent != ROOT:
            for l in LANGS + ['x-default']:
                if f'hreflang="{l}"' not in html:
                    errors.append(f'{rel}: no hreflang {l}')
            if 'name="description"' not in html:
                errors.append(f'{rel}: no description')
        for w in FORBIDDEN:
            if w.lower() in html.lower():
                errors.append(f'{rel}: forbidden text "{w}"')
        if 'firebase-auth' in html or 'firebase-app' in html:
            errors.append(f'{rel}: loads Firebase SDK')
        for img in re.findall(r'<img\b[^>]*>', html):
            if not re.search(r'\balt="[^"]*"', img):
                errors.append(f'{rel}: <img> without alt')
        for src in re.findall(r'(?:src|href)="(/[^"#?]*)', html):
            if src.startswith('//'):
                continue
            target = ROOT / src.lstrip('/')
            if src.endswith('/'):
                target = target / 'index.html'
            if not target.exists():
                errors.append(f'{rel}: broken link {src}')
    for e in errors:
        print('FAIL', e)
    print(f'{len(files)} files checked, {len(errors)} problems')
    return 1 if errors else 0


if __name__ == '__main__':
    sys.exit(main())
