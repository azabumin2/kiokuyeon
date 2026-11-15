"""Renders the registration / insurance PDFs as images with personal details covered.

    python tools/mask_docs.py <pdf-folder> <out-folder>

Covered: representative's date of birth / resident number, and the insurance agent's personal name and numbers.
Boxes are in PDF points (1/72 inch), measured on the 2026-11 versions of the documents. Check the output by eye
before publishing — a new version of a document may move the text.
"""
import sys
from pathlib import Path

import pymupdf

PT = 72 / 100  # boxes were measured on 100-dpi renders
DOCS = {
    'doc-registration': ('국제결 혼중개 업 등록증.pdf', [(108, 403, 292, 426)]),
    'doc-business': ('사업자등록증.pdf', [(556, 298, 758, 330)]),
    'doc-insurance': ('보험계약.pdf', [(238, 240, 368, 263), (210, 991, 428, 1007), (240, 1010, 428, 1028)]),
}


def main(src: Path, out: Path) -> None:
    out.mkdir(parents=True, exist_ok=True)
    for name, (pdf, boxes) in DOCS.items():
        doc = pymupdf.open(src / pdf)
        page = doc[0]
        for x0, y0, x1, y1 in boxes:
            page.draw_rect(pymupdf.Rect(x0 * PT, y0 * PT, x1 * PT, y1 * PT), color=(0.25, 0.25, 0.25), fill=(0.25, 0.25, 0.25))
        pix = page.get_pixmap(dpi=130)
        target = out / f'{name}.png'
        pix.save(target)
        print(target, pix.width, pix.height)


if __name__ == '__main__':
    main(Path(sys.argv[1]), Path(sys.argv[2]))
