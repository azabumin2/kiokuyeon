"""Builds the static Kiokuyeon homepage: /index.html and /{ja,ko,en}/*.html.

    python site-src/build.py

Edit text in site-src/text_<lang>.py, structure in site-src/templates.py, then rebuild and commit the output.
"""
import importlib.util
import json
import sys
from datetime import date
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(HERE))
import templates  # noqa: E402

LANGS = ['ja', 'ko', 'en']
PAGES = list(templates.PAGES)
NAV = ['about', 'service', 'flow', 'stories', 'column', 'faq', 'company']
VERSION = '20261117a'
SITE = 'https://kiokuyeon.com'
FONTS = {
    'ja': 'family=Noto+Serif+JP:wght@500;600;700;800',
    'ko': 'family=Noto+Sans+KR:wght@400;500;700;800&family=Noto+Serif+KR:wght@500;600;700;800',
    'en': 'family=Inter:wght@400;500;600;700;800&family=Noto+Serif+JP:wght@500;600;700;800',
}
LANG_NAMES = [('ko', '한국어'), ('ja', '日本語'), ('en', 'English')]

# Google Search Console "HTML tag" verification: paste only the content="..." value here, then rebuild + push.
# Empty = no tag is written.
GOOGLE_SITE_VERIFICATION = ''
# Other names people search for. They go into the structured data so Google ties them to this site.
ALT_NAMES = ['기억・연', 'Kiokuyeon', 'キオクヨン', '記憶・縁', '未来結婚情報', '未来国際結婚情報', '日韓未来国際結婚情報',
             '未来結婚情報ソウル', '미래결혼정보', '미래결혼정보 서울']
# Public SNS profile URLs of this business (note, Instagram, TikTok, X, Threads). Add them when known.
SAME_AS: list = []


def structured_data(t: dict, lang: str) -> str:
    """schema.org Organization + WebSite for the home page of each language."""
    f = templates.FACTS
    org = {
        '@context': 'https://schema.org',
        '@type': 'ProfessionalService',
        '@id': f'{SITE}/#organization',
        'name': '기억・연 Kiokuyeon',
        'alternateName': ALT_NAMES,
        'url': f'{SITE}/{lang}/',
        'logo': f'{SITE}/site/img/logo.png',
        'image': f'{SITE}/site/img/ogp.jpg',
        'description': t['desc_index'],
        'legalName': f['company'],
        'founder': f['rep'],
        'address': {'@type': 'PostalAddress', 'streetAddress': '새문안로5가길 11, 501호(내수동)',
                    'addressLocality': '종로구', 'addressRegion': '서울특별시', 'addressCountry': 'KR'},
        'areaServed': [{'@type': 'Country', 'name': 'Japan'}, {'@type': 'Country', 'name': 'South Korea'}],
        'knowsLanguage': ['ja', 'ko'],
    }
    if SAME_AS:
        org['sameAs'] = SAME_AS
    site = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': '기억・연 Kiokuyeon',
        'alternateName': ALT_NAMES[1:6],
        'url': f'{SITE}/',
        'inLanguage': lang,
        'publisher': {'@id': f'{SITE}/#organization'},
    }
    return ''.join(f'<script type="application/ld+json">{json.dumps(x, ensure_ascii=False)}</script>\n' for x in (org, site))


def verification_tag() -> str:
    return f'<meta name="google-site-verification" content="{GOOGLE_SITE_VERIFICATION}">\n' if GOOGLE_SITE_VERIFICATION else ''


def load_text(lang: str) -> dict:
    spec = importlib.util.spec_from_file_location(f'text_{lang}', HERE / f'text_{lang}.py')
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.T


def url(lang: str, page: str) -> str:
    return f'/{lang}/' if page == 'index' else f'/{lang}/{page}.html'


def head(t: dict, lang: str, page: str) -> str:
    title = t['site_title'] if page == 'index' else f'{t["nav_" + page]} | {t["site_name"]}'
    desc = t['desc_' + page]
    alts = ''.join(f'<link rel="alternate" hreflang="{l}" href="{SITE}{url(l, page)}">' for l in LANGS)
    alts += f'<link rel="alternate" hreflang="x-default" href="{SITE}/">'
    e = templates.e
    return f'''<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{SITE}{url(lang, page)}">
{alts}
<meta property="og:type" content="website">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{SITE}{url(lang, page)}">
<meta property="og:image" content="{SITE}/site/img/ogp.jpg">
<meta property="og:locale" content="{ {'ja': 'ja_JP', 'ko': 'ko_KR', 'en': 'en_US'}[lang] }">
<meta name="twitter:card" content="summary_large_image">
{verification_tag()}{structured_data(t, lang) if page == 'index' else ''}<link rel="icon" href="/site/img/icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?{FONTS[lang]}&display=swap">
<link rel="stylesheet" href="/site/site.css?v={VERSION}">
</head>'''


def header(t: dict, lang: str, page: str) -> str:
    nav = ''.join(f'<li><a href="{url(lang, p)}"{" aria-current=\"page\"" if p == page else ""}>{t["nav_" + p]}</a></li>' for p in NAV)
    langs = '｜'.join(
        f'<a href="{url(l, page)}" lang="{l}" hreflang="{l}" data-lang="{l}"{" aria-current=\"true\"" if l == lang else ""}>{n}</a>'
        for l, n in LANG_NAMES)
    return f'''<header class="top">
<div class="wrap bar">
<a class="logo" href="{url(lang, 'index')}" aria-label="{templates.e(t['site_name'])}"><img src="/site/img/logo-soft.png" alt="{templates.e(t['logo_alt'])}" width="232" height="59"></a>
<nav class="langs" aria-label="Language">{langs}</nav>
<a class="member" href="/join/">{t['member_btn']}</a>
<button class="menu-btn" type="button" aria-expanded="false" aria-controls="gnav">{t['menu']}</button>
</div>
<nav id="gnav" class="gnav" aria-label="{templates.e(t['menu'])}"><ul class="wrap">{nav}<li class="cta-li"><a class="btn primary small" href="/{lang}/contact.html#form">{t['cta_book']}</a></li></ul></nav>
</header>'''


def footer(t: dict, lang: str) -> str:
    f = templates.FACTS
    links = ''.join(f'<a href="{url(lang, p)}">{t["nav_" + p]}</a>' for p in NAV + ['contact', 'privacy'])
    return f'''<footer class="foot">
<div class="wrap">
<p class="foot-brand">{t['site_name']}</p>
<p class="foot-links">{links}</p>
<p class="foot-co">{t['co_name']}：{f['company']} ／ {t['co_rep']}：{f['rep']} ／ {t['co_bizno']}：{f['bizno']}<br>
{t['co_regno']}：{f['regno']} ／ {f['addr_ko']}</p>
<p class="copy">© {t['site_name']}</p>
</div>
</footer>
<a class="sticky-cta" href="/{lang}/contact.html#form">{t['cta_book']}</a>
<script src="/site/site.js?v={VERSION}" defer></script>'''


def render(lang: str, page: str, t: dict) -> str:
    body = templates.PAGES[page](t, lang)
    if page != 'index':
        body = f'<div class="page-head"><div class="wrap"><p class="eyebrow">{t["site_name"]}</p><h1>{t["nav_" + page]}</h1></div></div>' + body
    return f'{head(t, lang, page)}\n<body data-lang="{lang}" data-page="{page}">\n{header(t, lang, page)}\n<main>{body}</main>\n{footer(t, lang)}\n</body>\n</html>\n'


def root_index(texts: dict) -> str:
    links = ''.join(f'<li><a href="/{l}/" hreflang="{l}" lang="{l}">{n}</a></li>' for l, n in LANG_NAMES)
    alts = ''.join(f'<link rel="alternate" hreflang="{l}" href="{SITE}/{l}/">' for l in LANGS)
    return f'''<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{templates.e(texts['ja']['site_title'])}</title>
<meta name="description" content="{templates.e(texts['ja']['desc_index'])}">
{verification_tag()}<link rel="canonical" href="{SITE}/">
{alts}<link rel="alternate" hreflang="x-default" href="{SITE}/">
<link rel="icon" href="/site/img/icon.png">
<link rel="stylesheet" href="/site/site.css?v={VERSION}">
<script>
(function () {{
  // Old member-page links (/#mine, /#ask, /#intros, e-mail links with ?mode=…) belong to the member app.
  if (/^#(mine|ask|intros)$/.test(location.hash) || /[?&](mode|oobCode)=/.test(location.search)) {{
    location.replace('/join/' + location.search + location.hash);
    return;
  }}
  var ok = ['ja', 'ko', 'en'], l = null;
  try {{ l = localStorage.getItem('kiokuyeon-site-lang') || localStorage.getItem('kiokuyeon-lang'); }} catch (e) {{}}
  if (ok.indexOf(l) < 0) {{
    var n = (navigator.language || '').toLowerCase();
    l = n.indexOf('ko') === 0 ? 'ko' : n.indexOf('ja') === 0 ? 'ja' : n.indexOf('en') === 0 ? 'en' : 'ja';
  }}
  location.replace('/' + l + '/' + location.hash);
}})();
</script>
</head>
<body class="chooser">
<main class="wrap"><img src="/site/img/logo-soft.png" alt="기억・연 Kiokuyeon" width="300" height="76"><ul>{links}</ul>
<p><a href="/join/">会員ページ / 회원 페이지 / Members</a></p></main>
</body>
</html>
'''


def build(out_dir: Path = ROOT) -> list:
    texts = {l: load_text(l) for l in LANGS}
    keys = set(texts['ja'])
    for l in LANGS[1:]:
        miss, extra = keys - set(texts[l]), set(texts[l]) - keys
        if miss or extra:
            raise SystemExit(f'text_{l}.py key mismatch: missing {sorted(miss)} extra {sorted(extra)}')
    written = []
    for l in LANGS:
        (out_dir / l).mkdir(exist_ok=True)
        for p in PAGES:
            f = out_dir / l / f'{p}.html'
            f.write_text(render(l, p, texts[l]), encoding='utf-8', newline='\n')
            written.append(f)
    f = out_dir / 'index.html'
    f.write_text(root_index(texts), encoding='utf-8', newline='\n')
    written.append(f)
    f = out_dir / 'sitemap.xml'
    f.write_text(sitemap(), encoding='utf-8', newline='\n')
    written.append(f)
    f = out_dir / 'robots.txt'
    f.write_text(f'User-agent: *\nDisallow: /admin.html\n\nSitemap: {SITE}/sitemap.xml\n', encoding='utf-8', newline='\n')
    written.append(f)
    return written


def sitemap() -> str:
    """Every language page, with hreflang links to its other-language versions."""
    today = date.today().isoformat()
    rows = []
    for l in LANGS:
        for p in PAGES:
            alts = ''.join(f'<xhtml:link rel="alternate" hreflang="{a}" href="{SITE}{url(a, p)}"/>' for a in LANGS)
            prio = '1.0' if p == 'index' else '0.8' if p in ('contact', 'service', 'flow', 'faq') else '0.6'
            rows.append(f'<url><loc>{SITE}{url(l, p)}</loc><lastmod>{today}</lastmod><priority>{prio}</priority>{alts}</url>')
    return ('<?xml version="1.0" encoding="UTF-8"?>\n'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
            + '\n'.join(rows) + '\n</urlset>\n')


if __name__ == '__main__':
    files = build()
    print(f'built {len(files)} files')
