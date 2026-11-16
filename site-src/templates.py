"""Page bodies for the Kiokuyeon homepage. Text comes from text_<lang>.py (dict T).

Elements with data-setting="..." are filled or hidden by site/site.js from Firestore site/settings.
"""
from html import escape

# Facts from the registration documents (same in every language).
FACTS = {
    'company': '미래결혼정보 서울',
    'rep': '김동윤',
    'bizno': '434-04-03213',
    'regno': '서울-종로-국제-26-0001호',
    'regdate': '2026-11-02',
    'addr_ko': '서울특별시 종로구 새문안로5가길 11, 501호(내수동)',
    'insurer': '서울보증보험(주)',
    'ins_amount': '50,000,000',
    'ins_from': '2026-08-26',
    'ins_to': '2027-08-25',
}


def e(s: str) -> str:
    return escape(s, quote=True)


def para(text: str) -> str:
    """Text with blank-line separated paragraphs → <p> elements (text is trusted, may contain <br>)."""
    return ''.join(f'<p>{p.strip()}</p>' for p in text.split('\n\n') if p.strip())


def photo(src: str, alt: str, t: dict, cls: str = '') -> str:
    return (f'<figure class="photo {cls}"><img src="/site/img/{src}" alt="{e(alt)}" loading="lazy" decoding="async">'
            f'<figcaption>{e(t["img_note"])}</figcaption></figure>')


def section(cls: str, title: str, inner: str, sub: str = '', anchor: str = '') -> str:
    a = f' id="{anchor}"' if anchor else ''
    s = f'<p class="lead">{sub}</p>' if sub else ''
    return f'<section class="sec {cls}"{a}><div class="wrap"><h2>{title}</h2>{s}{inner}</div></section>'


def cards(items: list[tuple[str, str]], cls: str = 'cards') -> str:
    return f'<div class="{cls}">' + ''.join(f'<div class="card"><h3>{h}</h3><p>{b}</p></div>' for h, b in items) + '</div>'


def steps(t: dict) -> str:
    return '<ol class="steps">' + ''.join(
        f'<li><span class="num">{i}</span><div><h3>{t[f"step{i}_h"]}</h3><p>{t[f"step{i}_b"]}</p></div></li>' for i in range(1, 7)) + '</ol>'


def faq_items(t: dict, keys: list[int]) -> str:
    return '<div class="faq">' + ''.join(
        f'<details><summary>{t[f"faq{i}_q"]}</summary><div>{para(t[f"faq{i}_a"])}</div></details>' for i in keys) + '</div>'


def company_table(t: dict) -> str:
    rows = [
        (t['co_name'], FACTS['company']),
        (t['co_rep'], FACTS['rep']),
        (t['co_bizno'], FACTS['bizno']),
        (t['co_regno'], f'{FACTS["regno"]}<br><small>{t["co_regdate"]} {FACTS["regdate"]}</small>'),
        (t['co_addr'], f'{FACTS["addr_ko"]}<br><small>{t["co_addr_note"]}</small>'),
    ]
    trs = ''.join(f'<tr><th>{h}</th><td>{v}</td></tr>' for h, v in rows)
    return f'<table class="info">{trs}</table>'


def docs_gallery(t: dict) -> str:
    """Registration / business / insurance certificates (personal details covered by tools/mask_docs.py)."""
    items = [('doc-registration', 'doc_reg'), ('doc-business', 'doc_biz'), ('doc-insurance', 'doc_ins')]
    figs = ''.join(
        f'<figure class="doc"{" data-ins-doc" if k == "doc_ins" else ""}><a href="/site/img/{f}.webp" target="_blank" rel="noopener">'
        f'<img src="/site/img/{f}.webp" alt="{e(t[k])}" loading="lazy" decoding="async" width="990" height="1400"></a>'
        f'<figcaption>{t[k]}</figcaption></figure>' for f, k in items)
    return f'<div class="docs">{figs}</div><p class="note center">{t["docs_note"]}</p>'


def insurance_card(t: dict) -> str:
    # Shown only while the period in settings (or the default below) has not ended — see site.js.
    return (f'<div class="card insurance" data-setting="insurance" data-to="{FACTS["ins_to"]}">'
            f'<h3>{t["ins_h"]}</h3>'
            f'<p>{t["ins_b"]}</p>'
            f'<table class="info"><tr><th>{t["ins_amount"]}</th><td><span data-ins="amount">{FACTS["ins_amount"]}</span> {t["won"]}</td></tr>'
            f'<tr><th>{t["ins_period"]}</th><td><span data-ins="from">{FACTS["ins_from"]}</span> – <span data-ins="to">{FACTS["ins_to"]}</span></td></tr>'
            f'<tr><th>{t["ins_insurer"]}</th><td>{FACTS["insurer"]}</td></tr></table>'
            f'<p class="note">{t["ins_note"]}</p></div>')


def contact_buttons(t: dict, lang: str) -> str:
    line = (f'<a class="btn line" data-setting="lineUrl" hidden target="_blank" rel="noopener">{t["btn_line"]}</a>' if lang == 'ja' else '')
    kakao = (f'<a class="btn kakao" data-setting="kakaoUrl" hidden target="_blank" rel="noopener">{t["btn_kakao"]}</a>' if lang == 'ko' else '')
    return f'<div class="btns">{line}{kakao}<a class="btn" href="/{lang}/contact.html#form">{t["btn_form"]}</a></div>'


def video_block(t: dict, limit: int) -> str:
    return (f'<div class="videos" data-videos data-limit="{limit}" data-play="{e(t["video_play"])}" data-country="{e(t["video_country"])}" hidden></div>'
            f'<div class="card empty" data-videos-empty>{para(t["videos_empty"])}</div>')


def japan_block(t: dict) -> str:
    return (f'<div class="card" data-setting="japanOffice">'
            f'<h3>{t["jp_h"]}</h3>'
            f'<p data-jp="none">{t["jp_none"]}</p>'
            f'<p data-jp="preparing" hidden>{t["jp_preparing"]}</p>'
            f'<p data-jp="open" hidden>{t["jp_open"]} <span data-jp-addr></span></p></div>')


# ---------------------------------------------------------------- pages

def page_index(t: dict, lang: str) -> str:
    hero = (f'<section class="hero"><div class="hero-img"><img src="/site/img/hero.webp" alt="{e(t["hero_alt"])}" fetchpriority="high"></div>'
            f'<div class="hero-text wrap"><p class="eyebrow">{t["brand_line"]}</p><h1>{t["hero_h"]}</h1><p class="sub">{t["hero_sub"]}</p>'
            f'<p class="women-free"><strong>{t["women_free"]}</strong><span>{t["women_free_sub"]}</span></p>'
            f'<p class="free" data-setting="freeConsult" hidden>{t["free_badge"]}</p>'
            f'<div class="btns"><a class="btn primary" href="/{lang}/contact.html#form">{t["cta_book"]}</a>'
            f'<a class="btn ghost" href="/{lang}/stories.html">{t["cta_stories"]}</a></div>'
            f'<p class="img-note">{t["img_note"]}</p></div></section>')
    videos = section('videos', t['videos_h'], video_block(t, 4), t['videos_sub'])
    trust = section('trust', t['trust_h'], cards([
        (t['trust1_h'], t['trust1_b']), (t['trust2_h'], t['trust2_b']), (t['trust3_h'], t['trust3_b']), (t['trust4_h'], t['trust4_b'])])
        + f'<div class="cert-head"><p class="cert-badge">KOREA CERTIFIED</p><h3>{t["docs_h"]}</h3></div>' + docs_gallery(t),
        t['trust_sub'])
    support = section('support', t['sup_h'],
                      f'<div class="split">{photo("walk.webp", t["walk_alt"], t)}<div>{para(t["sup_body"])}'
                      f'<ul class="ticks"><li>{t["sup_li1"]}</li><li>{t["sup_li2"]}</li><li>{t["sup_li3"]}</li><li>{t["sup_li4"]}</li></ul>'
                      f'<a class="more" href="/{lang}/service.html">{t["more_service"]}</a></div></div>', t['sup_sub'])
    flow = section('flow', t['flow_h'], steps(t) + f'<a class="more" href="/{lang}/flow.html">{t["more_flow"]}</a>', t['flow_sub'])
    base = section('base', t['base_h'],
                   f'<div class="split">{photo("seoul.webp", t["seoul_alt"], t)}<div><div class="card"><h3>{t["hq_h"]}</h3><p>{t["hq_b"]}</p></div>{japan_block(t)}</div></div>')
    faq = section('faqs', t['faq_h'], faq_items(t, [1, 2, 3, 4]) + f'<a class="more" href="/{lang}/faq.html">{t["more_faq"]}</a>')
    cta = section('cta', t['cta_h'], f'<p>{t["cta_b"]}</p>' + contact_buttons(t, lang))
    co = section('company', t['co_h'], f'<div class="split2">{company_table(t)}{insurance_card(t)}</div>'
                 f'<a class="more" href="/{lang}/company.html">{t["more_company"]}</a>')
    return hero + videos + trust + support + flow + base + faq + cta + co


def page_about(t: dict, lang: str) -> str:
    return (section('about', t['about_h'],
                    f'<div class="split">{photo("cook.webp", t["cook_alt"], t)}<div class="prose">{para(t["about_body"])}</div></div>', t['about_sub'])
            + section('values', t['values_h'], cards([(t['val1_h'], t['val1_b']), (t['val2_h'], t['val2_b']), (t['val3_h'], t['val3_b'])])))


def page_service(t: dict, lang: str) -> str:
    items = [(t[f'svc{i}_h'], t[f'svc{i}_b']) for i in range(1, 8)]
    staff = f'<div class="card" data-setting="staffInfo" hidden><h3>{t["staff_h"]}</h3><p data-text></p></div>'
    return (section('service', t['svc_h'], cards(items), t['svc_sub'])
            + section('culture', t['culture_h'],
                      f'<div class="split">{photo("consult.webp", t["consult_alt"], t)}<div class="prose">{para(t["culture_body"])}</div></div>{staff}'))


def page_flow(t: dict, lang: str) -> str:
    fees = (f'<div class="card fees"><h3>{t["fees_h"]}</h3><p data-setting="fees" data-empty="{e(t["fees_empty"])}">{t["fees_empty"]}</p>'
            f'<p class="free" data-setting="freeConsult" hidden>{t["free_badge"]}</p></div>')
    parties = (f'<table class="info"><tr><th>{t["party_contract"]}</th><td>{FACTS["company"]}</td></tr>'
               f'<tr><th>{t["party_pay"]}</th><td>{t["party_pay_v"]}</td></tr>'
               f'<tr><th>{t["party_privacy"]}</th><td>{FACTS["company"]}（{t["co_rep"]} {FACTS["rep"]}）</td></tr>'
               f'<tr><th>{t["party_contact"]}</th><td><a href="/{lang}/contact.html">{t["party_contact_v"]}</a></td></tr></table>')
    return (section('flow', t['flow_h'], steps(t), t['flow_sub'])
            + section('fees', t['fees_sec_h'], fees + f'<h3 class="mt">{t["party_h"]}</h3>' + parties))


def page_stories(t: dict, lang: str) -> str:
    return section('videos', t['stories_h'], video_block(t, 12) + f'<p class="note">{t["stories_note"]}</p>', t['stories_sub'])


def page_column(t: dict, lang: str) -> str:
    toc = '<ul class="toc">' + ''.join(f'<li><a href="#c{i}">{t[f"col{i}_h"]}</a></li>' for i in range(1, 4)) + '</ul>'
    arts = ''.join(f'<article class="column" id="c{i}"><h3>{t[f"col{i}_h"]}</h3>{para(t[f"col{i}_b"])}</article>' for i in range(1, 4))
    return section('columns', t['col_h'], toc + arts, t['col_sub'])


def page_faq(t: dict, lang: str) -> str:
    return section('faqs', t['faq_h'], faq_items(t, list(range(1, 9))))


def page_company(t: dict, lang: str) -> str:
    return (section('company', t['co_h'], company_table(t) + f'<p class="note">{t["co_note"]}</p>')
            + section('certs', t['docs_h'], docs_gallery(t), t['docs_sub'])
            + section('insurance', t['ins_sec_h'], insurance_card(t))
            + section('base', t['base_h'], f'<div class="card"><h3>{t["hq_h"]}</h3><p>{t["hq_b"]}</p></div>{japan_block(t)}'))


def page_contact(t: dict, lang: str) -> str:
    opt = lambda name, pairs: ''.join(f'<option value="{v}">{t[k]}</option>' for v, k in pairs)
    methods = [('email', 'm_email'), ('phone', 'm_phone')]
    methods = ([('line', 'm_line')] if lang == 'ja' else [('kakao', 'm_kakao')] if lang == 'ko' else []) + methods
    form = (f'<form class="consult card" id="form" novalidate data-lang="{lang}">'
            f'<label><span>{t["f_nick"]}<em>{t["req"]}</em></span><input name="nickname" maxlength="40" required autocomplete="nickname"></label>'
            f'<label><span>{t["f_region"]}<em>{t["req"]}</em></span><input name="region" maxlength="60" required placeholder="{e(t["f_region_ph"])}"></label>'
            f'<label><span>{t["f_age"]}<em>{t["req"]}</em></span><select name="age" required><option value=""></option>'
            + opt('age', [('20s', 'age20'), ('30s', 'age30'), ('40s', 'age40'), ('50s', 'age50'), ('60s+', 'age60')]) + '</select></label>'
            f'<label><span>{t["f_method"]}<em>{t["req"]}</em></span><select name="method" required><option value=""></option>' + opt('m', methods) + '</select></label>'
            f'<label><span>{t["f_contact"]}<em>{t["req"]}</em></span><input name="contact" maxlength="120" required placeholder="{e(t["f_contact_ph"])}"></label>'
            f'<label class="wide"><span>{t["f_body"]}<em>{t["req"]}</em></span><textarea name="body" rows="6" maxlength="2000" required placeholder="{e(t["f_body_ph"])}"></textarea></label>'
            f'<label class="hp" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label>'
            f'<label class="check wide"><input type="checkbox" name="consent" required> <span>{t["f_consent"]} <a href="/{lang}/privacy.html" target="_blank">{t["privacy_link"]}</a></span></label>'
            f'<p class="note wide">{t["f_note"]}</p>'
            f'<div class="wide"><button class="btn primary" type="submit">{t["f_submit"]}</button></div>'
            f'<p class="result wide" role="status" hidden></p></form>')
    msgs = (f'<div hidden data-msg-sent="{e(t["f_sent"])}" data-msg-missing="{e(t["f_missing"])}" '
            f'data-msg-wait="{e(t["f_wait"])}" data-msg-error="{e(t["f_error"])}"></div>')
    return section('contact', t['contact_h'], f'<p>{t["contact_b"]}</p>' + contact_buttons(t, lang).replace(
        f'<a class="btn" href="/{lang}/contact.html#form">{t["btn_form"]}</a>', '') + form + msgs, t['contact_sub'])


def page_privacy(t: dict, lang: str) -> str:
    return section('privacy prose', t['pp_h'], para(t['pp_body']) + f'<h2 class="mt">{t["tos_h"]}</h2>' + para(t['tos_body']))


PAGES = {
    'index': page_index, 'about': page_about, 'service': page_service, 'flow': page_flow, 'stories': page_stories,
    'column': page_column, 'faq': page_faq, 'company': page_company, 'contact': page_contact, 'privacy': page_privacy,
}
