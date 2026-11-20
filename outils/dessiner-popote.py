"""Dessine la Popote animée du haut de page, en SVG, dans index.html.

Le dessin est celui de la mascotte « version pop » de l'appli (planche « Gari, icônes et profils »
de la DA de l'appli) : pas de contour, aplats francs et une seule ombre, yeux ronds noirs avec un reflet.
Ses huit attitudes fixes (coucou, hourra, chef, réfléchit, oups, bien joué, dodo, miam) sont des copies
de cette planche, dans assets/img/popote/.

Ici, chaque partie mobile reçoit une classe (m-corps, m-bras-d, m-yeux…) que main.js anime :
respiration, salut, clignement, regard, saut, pirouette, étirement quand on la tire.
Le script dessine aussi l'icône du site (assets/img/favicon.svg) : la tête de Popote sur le soleil jaune.

Lancement, depuis le dossier du site (Python 3, rien à installer) :
    python3 outils/dessiner-popote.py
puis, pour reporter le dessin sur la page anglaise :
    python3 outils/version-anglaise.py
"""
import pathlib
import re

FRAISE, OMBRE, JOUE, LANGUE, OEIL, GRAINE = '#FF2E54', '#D6123A', '#FF8FB0', '#FF7A93', '#25132B', '#FFC414'
FEUILLE, FEUILLE_OMBRE = '#2BC85A', '#139A3E'

# Repère : les pieds sont en (0, 0), Popote mesure 150 unités de haut, tige comprise.
CORPS = 'M0 -6C-38 -6 -62 -40 -62 -76C-62 -110 -34 -124 0 -122C34 -124 62 -110 62 -76C62 -40 38 -6 0 -6Z'
OMBRE_CORPS = ('M30.8 -118.8C52.8 -110.8 62 -96 62 -76C62 -40 38 -6 0 -6C-16 -6 -27.2 -11.4 -37.2 -19.4'
               'C4.8 -17.4 40 -44 40 -86C40 -100 36.8 -110.8 30.8 -118.8Z')
GRAINES = [(-36, -32, -12), (-14, -20, -4.7), (16, -20, 5.3), (38, -32, 12.7), (-50, -88, -16.7), (48, -88, 16), (0, -16, 0)]


def bras(d, x, y):
    return (f'<path d="{d}" fill="none" stroke="{OMBRE}" stroke-width="11" stroke-linecap="round"/>'
            f'<circle cx="{x}" cy="{y}" r="10" fill="{FRAISE}"/>')


def bouche(k=1):
    """Le sourire ouvert de la planche ; k l'agrandit autour de son centre (grand sourire de joie)."""
    t = '' if k == 1 else f' transform="translate(0 -48) scale({k}) translate(0 48)"'
    return (f'<g{t}><path d="M-13 -56Q0 -53 13 -56Q11 -39 0 -39Q-11 -39 -13 -56Z" fill="{OEIL}"/>'
            f'<path d="M-7 -44Q0 -50 7 -44Q4 -39 0 -39Q-4 -39 -7 -44Z" fill="{LANGUE}"/></g>')


def acteur():
    graines = ''.join(f'<ellipse cx="{x}" cy="{y}" rx="3" ry="4.4" transform="rotate({a} {x} {y})"/>' for x, y, a in GRAINES)
    yeux = ''.join(f'<ellipse cx="{x}" cy="-78" rx="9.5" ry="12" fill="{OEIL}"/><circle cx="{x + 3}" cy="-82" r="3.6" fill="#fff"/>' for x in (-24, 24))
    joie = ''.join(f'<path d="M{x - 9} -76Q{x} -87 {x + 9} -76" fill="none" stroke="{OEIL}" stroke-width="5" stroke-linecap="round"/>' for x in (-24, 24))
    couronne = (f'<g transform="translate(0 -116) scale(1.22) translate(0 112)">'
                f'<path d="M-50 -112C-40 -134 -22 -126 -14 -120C-10 -140 10 -140 14 -120C22 -126 40 -134 50 -112C30 -104 -30 -104 -50 -112Z" fill="{FEUILLE}"/>'
                f'<path d="M14 -120C22 -126 40 -134 50 -112C38 -108 24 -106 10 -106Z" fill="{FEUILLE_OMBRE}" opacity=".7"/>'
                f'<rect x="-3" y="-146" width="7" height="22" rx="3.5" fill="{FEUILLE_OMBRE}" transform="rotate(8 .5 -135)"/></g>')
    inner = (f'<clipPath id="mc"><path d="{CORPS}"/></clipPath>'
             f'<ellipse class="m-ombre" cx="0" cy="0" rx="48" ry="9.6" fill="{OEIL}" opacity=".14"/>'
             '<g class="m-corps">'
             f'<ellipse cx="-20" cy="-6" rx="13" ry="8" fill="{OMBRE}"/><ellipse cx="20" cy="-6" rx="13" ry="8" fill="{OMBRE}"/>'
             f'<g class="m-bras-g">{bras("M-50 -58Q-66 -46 -62 -30", -62, -30)}</g>'
             f'<g class="m-bras-d">{bras("M48 -70Q70 -90 70 -118", 70, -118)}</g>'
             f'<path d="{CORPS}" fill="{FRAISE}"/><path d="{OMBRE_CORPS}" fill="{OMBRE}" opacity=".55"/>'
             '<g clip-path="url(#mc)">'
             '<g class="m-reflet"><ellipse cx="-36" cy="-84" rx="11" ry="6.5" fill="#fff" opacity=".45" transform="rotate(-35 -36 -84)"/></g>'
             f'<g class="m-graines" fill="{GRAINE}">{graines}</g></g>'
             f'<g class="m-visage"><g fill="{JOUE}" opacity=".9"><ellipse cx="-42" cy="-54" rx="8" ry="5"/><ellipse cx="42" cy="-54" rx="8" ry="5"/></g>'
             f'<g class="m-yeux">{yeux}</g><g class="m-joie" visibility="hidden">{joie}</g>'
             f'<g class="m-bouche">{bouche()}</g><g class="m-bouche-joie" visibility="hidden">{bouche(1.35)}</g>'
             f'<g class="m-bouche-o" visibility="hidden"><ellipse cx="0" cy="-50" rx="6" ry="7.5" fill="{OEIL}"/></g></g>'
             f'<g class="m-couronne">{couronne}</g></g>')
    return f'<svg class="m-svg" viewBox="-110 -178 220 196" aria-hidden="true" focusable="false">{inner}</svg>'


def icone(arrondi=True):
    """La tête de Popote (corps, couronne, visage, sans bras ni pieds) sur le soleil jaune, dans un carré de 64."""
    graines = ''.join(f'<ellipse cx="{x}" cy="{y}" rx="3" ry="4.4" transform="rotate({a} {x} {y})"/>' for x, y, a in GRAINES if y < -20)
    yeux = ''.join(f'<ellipse cx="{x}" cy="-78" rx="10.5" ry="13" fill="{OEIL}"/><circle cx="{x + 3}" cy="-82" r="4" fill="#fff"/>' for x in (-24, 24))
    couronne = (f'<g transform="translate(0 -116) scale(1.22) translate(0 112)">'
                f'<path d="M-50 -112C-40 -134 -22 -126 -14 -120C-10 -140 10 -140 14 -120C22 -126 40 -134 50 -112C30 -104 -30 -104 -50 -112Z" fill="{FEUILLE}"/>'
                f'<path d="M14 -120C22 -126 40 -134 50 -112C38 -108 24 -106 10 -106Z" fill="{FEUILLE_OMBRE}" opacity=".7"/></g>')
    fond = f'<rect width="64" height="64" rx="{14 if arrondi else 0}" fill="#F7C04A"/>'
    tete = (f'<g transform="translate(32 61) scale(.4)"><clipPath id="ic"><path d="{CORPS}"/></clipPath>'
            f'<path d="{CORPS}" fill="{FRAISE}"/><path d="{OMBRE_CORPS}" fill="{OMBRE}" opacity=".55"/>'
            f'<g clip-path="url(#ic)"><ellipse cx="-36" cy="-84" rx="11" ry="6.5" fill="#fff" opacity=".45" transform="rotate(-35 -36 -84)"/>'
            f'<g fill="{GRAINE}">{graines}</g></g>'
            f'<g fill="{JOUE}"><ellipse cx="-42" cy="-54" rx="8" ry="5"/><ellipse cx="42" cy="-54" rx="8" ry="5"/></g>{yeux}{bouche()}{couronne}</g>')
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><title>Popote Duo</title>{fond}{tete}</svg>\n'


def main():
    (pathlib.Path(__file__).resolve().parent.parent / 'assets' / 'img' / 'favicon.svg').write_text(icone())
    page = pathlib.Path(__file__).resolve().parent.parent / 'index.html'
    html, n = re.subn(r'<svg class="m-svg".*?</svg>', lambda m: acteur(), page.read_text(), count=1, flags=re.S)
    if not n:
        raise SystemExit('Dessin de Popote (svg class="m-svg") introuvable dans index.html.')
    page.write_text(html)
    print('Icône et Popote animée écrites. Relancez outils/version-anglaise.py pour la page anglaise.')


if __name__ == '__main__':
    main()
