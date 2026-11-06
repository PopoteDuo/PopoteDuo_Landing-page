"""Dessine Popote, la mascotte (une fraise), en SVG.

Le dessin reprend la planche de personnage de la fraise : trait vert profond, aplats rouges,
croissant d'ombre à droite, reflet rose, graines jaunes, joues roses, couronne de feuilles.
Les coordonnées sont celles de la planche (le corps est centré sur x = 336).

Le script écrit :
- assets/img/popote.svg (elle salue), popote-bravo.svg, popote-hmm.svg, popote-avatar.svg ;
- la Popote animée du haut de page, dans index.html (bloc id="mascotte"), dont main.js anime les parties.

Lancement, depuis le dossier du site (Python 3, rien à installer) :
    python3 outils/dessiner-popote.py
puis, pour reporter le dessin sur la page anglaise :
    python3 outils/version-anglaise.py
"""
import pathlib
import re

C = dict(trait='#173F2B', rouge='#ED4B5F', ombre='#C42E4C', reflet='#F38996', graine='#FFE48C',
         feuille='#5CAA6B', joue='#FDA9B8', langue='#FF91A2', blanc='#FFFFFF')
W = 12  # épaisseur du trait
WA = 9.5  # bras et mains


def f(v):
    s = f'{v:.1f}'.rstrip('0').rstrip('.')
    return '0' if s in ('-0', '') else s


def catmull(pts, closed=False, tension=1.0):
    """Courbe lisse passant par les points (Catmull-Rom convertie en Bézier cubiques)."""
    n = len(pts)
    out = [f'M{f(pts[0][0])} {f(pts[0][1])}']
    rng = range(n) if closed else range(n - 1)
    for i in rng:
        p0 = pts[(i - 1) % n] if (closed or i > 0) else pts[0]
        p1 = pts[i]
        p2 = pts[(i + 1) % n]
        p3 = pts[(i + 2) % n] if (closed or i + 2 < n) else pts[-1]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6 * tension, p1[1] + (p2[1] - p0[1]) / 6 * tension)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6 * tension, p2[1] - (p3[1] - p1[1]) / 6 * tension)
        out.append(f'C{f(c1[0])} {f(c1[1])} {f(c2[0])} {f(c2[1])} {f(p2[0])} {f(p2[1])}')
    if closed:
        out.append('Z')
    return ''.join(out)


CX = 336
# Profil droit du corps (milieu du trait), du haut au bas ; le côté gauche est symétrique.
RIGHT = [(392, 124), (434, 133), (470, 146), (493, 158), (511, 170), (535, 195), (550, 218), (560, 241),
         (565, 265), (566, 289), (565, 313), (562, 337), (557, 361), (551, 385), (543, 409), (533, 433),
         (520, 457), (505, 481), (488, 505), (466, 529), (440, 553), (408, 575), (374, 587)]
RIGHT = [(CX + (x - CX) * .989, 357 + (y - 357) * .992) for x, y in RIGHT]
BODY_PTS = [(CX, 124)] + RIGHT + [(CX, 593)] + [(2 * CX - x, y) for x, y in reversed(RIGHT)]
BODY = catmull(BODY_PTS, closed=True)

# Ombre (croissant à droite et en bas) : bord intérieur relevé sur la planche, fermé à l'extérieur du corps.
SHADE_IN = [(468, 150), (482, 180), (496, 210), (505, 240), (512, 270), (515, 300), (515, 330), (512, 360),
            (505, 390), (499, 420), (481, 450), (462, 480), (436, 510), (397, 540), (360, 557), (320, 566),
            (285, 573), (255, 582)]
SHADE = catmull(SHADE_IN) + 'L250 640L640 640L640 120Z'

SEEDS = [(223, 193.5, -29, .92), (449, 193.3, 29.5, .92), (162, 254, -20.6, 1), (510, 254, 19.5, 1),
         (175, 406.5, -26.2, 1), (497, 406.6, 25.5, 1), (336, 419.5, 0, 1), (249, 471.7, -15, 1),
         (423, 471.7, 14.1, 1), (336, 532.7, 0, 1)]


def seeds():
    return ''.join(f'<ellipse cx="{f(x)}" cy="{f(y)}" rx="{f(9.5*k)}" ry="{f(13.9*k)}" transform="rotate({f(a)} {f(x)} {f(y)})"/>'
                   for x, y, a, k in SEEDS)


def body(uid, anime=False):
    """Corps : aplat, croissant d'ombre, reflet, graines, puis le trait par-dessus.
    Version animée : le reflet et les graines sont des calques mobiles, gardés dans le corps."""
    reflet = f'<ellipse cx="217.6" cy="217.4" rx="47.9" ry="22.6" transform="rotate(-31.1 217.6 217.4)" fill="{C["reflet"]}"/>'
    graines = f'<g fill="{C["graine"]}">{seeds()}</g>'
    if anime:
        reflet = f'<g clip-path="url(#{uid}c)"><g class="m-reflet">{reflet}</g></g>'
        graines = f'<g clip-path="url(#{uid}c)"><g class="m-graines">{graines}</g></g>'
    else:
        reflet = reflet.replace('/>', f' clip-path="url(#{uid}c)"/>')
    return (f'<clipPath id="{uid}c"><path d="{BODY}"/></clipPath>'
            f'<path d="{BODY}" fill="{C["rouge"]}"/>'
            f'<path d="{SHADE}" fill="{C["ombre"]}" clip-path="url(#{uid}c)"/>'
            + reflet + graines +
            f'<path d="{BODY}" fill="none" stroke="{C["trait"]}" stroke-width="{W}" stroke-linejoin="round"/>')


# Couronne : la tige en arrière, deux feuilles dressées, puis les deux lobes posés sur le haut du corps.
STEM = 'M337 130C334 100 340 68 365 40'
LEAF_L_PTS = [(300, 134), (288, 122), (278, 110), (271, 98), (267, 86), (266, 74), (268, 60), (285, 66), (300, 78), (312, 92), (322, 104), (330, 116), (337, 132)]
LEAF_L = catmull(LEAF_L_PTS)
LEAF_R = catmull([(2 * CX - x, y) for x, y in LEAF_L_PTS])
# Les deux lobes forment une seule pièce, avec une encoche au milieu du bord bas.
CALYX_R = [(372, 133), (410, 134), (444, 143), (474, 160), (446, 173), (414, 178), (382, 173), (354, 164)]
CALYX = catmull([(CX, 130)] + CALYX_R + [(CX, 158)] + [(2 * CX - x, y) for x, y in reversed(CALYX_R)], closed=True)


def crown():
    st = f'stroke="{C["trait"]}" stroke-width="{W}" stroke-linejoin="round"'
    return (f'<path d="{STEM}" fill="none" stroke="{C["trait"]}" stroke-width="{15 + 2 * W}" stroke-linecap="round"/>'
            f'<path d="{STEM}" fill="none" stroke="{C["feuille"]}" stroke-width="15" stroke-linecap="round"/>'
            f'<g fill="{C["feuille"]}" {st}><path d="{LEAF_L}Z"/><path d="{LEAF_R}Z"/>'
            f'<path d="{CALYX}"/></g>')


EYES = [(271, 284.5), (401, 284.5)]


def eye_open(x, y, cls=''):
    c = f' class="{cls}"' if cls else ''
    return (f'<g{c}><ellipse cx="{f(x)}" cy="{f(y)}" rx="23.2" ry="29.6" fill="{C["trait"]}"/>'
            f'<circle cx="{f(x - 8.3)}" cy="{f(y - 10.5)}" r="9.3" fill="#fff"/>'
            f'<circle cx="{f(x + 6.7)}" cy="{f(y + 8.8)}" r="4" fill="#fff"/></g>')


def eye_happy(x, y):
    return f'<path d="M{f(x - 21)} {f(y + 6)}Q{f(x)} {f(y - 22)} {f(x + 21)} {f(y + 6)}" fill="none" stroke="{C["trait"]}" stroke-width="{W}" stroke-linecap="round"/>'


def cheeks():
    return f'<g fill="{C["joue"]}"><ellipse cx="223" cy="332.4" rx="29.7" ry="16.9"/><ellipse cx="449" cy="332.4" rx="29.7" ry="16.9"/></g>'


def mouth(w=72, h=28, y=325):
    x0, x1 = CX - w / 2, CX + w / 2
    d = (f'M{f(x0 + 4)} {f(y)}H{f(x1 - 4)}Q{f(x1 + 1)} {f(y)} {f(x1 - 1.5)} {f(y + 4.5)}'
         f'C{f(x1 - 9)} {f(y + h * .78)} {f(CX + w * .2)} {f(y + h)} {f(CX)} {f(y + h)}'
         f'C{f(CX - w * .2)} {f(y + h)} {f(x0 + 9)} {f(y + h * .78)} {f(x0 + 1.5)} {f(y + 4.5)}Q{f(x0 - 1)} {f(y)} {f(x0 + 4)} {f(y)}Z')
    return (f'<path d="{d}" fill="{C["trait"]}"/>'
            f'<ellipse cx="{CX}" cy="{f(y + h * .6)}" rx="{f(w * .185)}" ry="{f(h * .27)}" fill="{C["langue"]}"/>')


def arm(d, hx, hy):
    return (f'<path d="{d}" fill="none" stroke="{C["trait"]}" stroke-width="{WA}" stroke-linecap="round"/>'
            f'<circle cx="{f(hx)}" cy="{f(hy)}" r="19.7" fill="{C["rouge"]}" stroke="{C["trait"]}" stroke-width="{WA}"/>')


ARM_L = ('M110 374Q76 390 64 426', 59.7, 445.6)          # bras gauche le long du corps
ARM_R = ('M561 322Q597 300 610 260', 616.6, 241.1)       # bras droit qui salue
ARM_L_UP = ('M104 300Q66 294 57 247', 54, 228)           # bras levés (Bravo)
ARM_R_UP = ('M568 300Q606 294 615 247', 618, 228)


def feet():
    st = f'fill="{C["ombre"]}" stroke="{C["trait"]}" stroke-width="{W}"'
    return f'<ellipse cx="293" cy="600" rx="42" ry="20" {st}/><ellipse cx="379" cy="600" rx="42" ry="20" {st}/>'


def sparkle(x, y, r):
    k = r * .28
    d = (f'M{f(x)} {f(y - r)}Q{f(x + k)} {f(y - k)} {f(x + r)} {f(y)}Q{f(x + k)} {f(y + k)} {f(x)} {f(y + r)}'
         f'Q{f(x - k)} {f(y + k)} {f(x - r)} {f(y)}Q{f(x - k)} {f(y - k)} {f(x)} {f(y - r)}Z')
    return f'<path d="{d}" fill="{C["graine"]}" stroke="{C["trait"]}" stroke-width="5" stroke-linejoin="round"/>'


SHADOW = '<ellipse cx="336" cy="634.5" rx="176" ry="17.2" fill="#173F2B" opacity=".11"/>'


def pose(name, uid='p', shadow=False):
    """Poses fixes : salut (la planche), bravo, hmm."""
    if name == 'salut':
        arms, face = arm(*ARM_L) + arm(*ARM_R), ''.join(eye_open(x, y) for x, y in EYES) + mouth()
        extra = ''
    elif name == 'bravo':
        arms = arm(*ARM_L_UP) + arm(*ARM_R_UP)
        face = ''.join(eye_happy(x, y) for x, y in EYES) + mouth(98, 40, 318)
        extra = sparkle(153, 131, 21) + sparkle(537, 95, 19)
    elif name == 'hmm':
        arms = arm(*ARM_L) + arm(*ARM_R)
        st = f'fill="none" stroke="{C["trait"]}" stroke-width="{W}" stroke-linecap="round"'
        face = ''.join(f'<ellipse cx="{x}" cy="{f(y + 4)}" rx="22" ry="27" fill="{C["trait"]}"/><circle cx="{f(x + 8)}" cy="{f(y - 9)}" r="7.5" fill="#fff"/>' for x, y in EYES)
        face += f'<path d="M239 230Q267 206 296 226" {st}/><path d="M375 239Q402 229 430 242" {st}/>'
        face += f'<ellipse cx="346" cy="345" rx="10.5" ry="13" fill="{C["trait"]}"/>'
        extra = ''
    return ((SHADOW if shadow else '') + feet() + arms + body(uid) + cheeks() + face + crown() + extra)


def avatar(uid='a'):
    """Tête ronde pour les petits formats (avatar), dans un carré de 240."""
    r = 110
    seeds_av = [(64, 62, -24), (34.5, 93, -14), (172.5, 62, 24), (202, 93, 14), (41, 168, -16), (117.6, 174, 0),
                (196, 168, 16), (77, 198, -10), (158, 198, 10), (117.6, 224, 0)]
    out = f'<clipPath id="{uid}c"><circle cx="120" cy="120" r="{r}"/></clipPath>'
    out += f'<circle cx="120" cy="120" r="{r}" fill="{C["ombre"]}"/>'
    out += f'<g clip-path="url(#{uid}c)">'
    out += f'<circle cx="104" cy="112" r="{r}" fill="{C["rouge"]}"/>'
    out += f'<ellipse cx="64" cy="76" rx="21" ry="11" transform="rotate(-31 64 76)" fill="{C["reflet"]}"/>'
    out += '<g fill="%s">' % C['graine'] + ''.join(f'<ellipse cx="{x}" cy="{y}" rx="5" ry="7.4" transform="rotate({a} {x} {y})"/>' for x, y, a in seeds_av) + '</g>'
    # la couronne de la grande pose, réduite et coupée par le cercle
    out += f'<g transform="translate(-34.6 -32) scale(.46)">{crown()}</g>'
    out += '</g>'
    out += f'<circle cx="120" cy="120" r="{r}" fill="none" stroke="{C["trait"]}" stroke-width="6"/>'
    for ex in (87, 153):
        out += (f'<ellipse cx="{ex}" cy="108" rx="11.5" ry="14.6" fill="{C["trait"]}"/>'
                f'<circle cx="{ex - 4.1}" cy="102.8" r="4.6" fill="#fff"/><circle cx="{ex + 3.3}" cy="112.4" r="2" fill="#fff"/>')
    out += f'<g fill="{C["joue"]}"><ellipse cx="65" cy="131" rx="15" ry="8.4"/><ellipse cx="175" cy="131" rx="15" ry="8.4"/></g>'
    out += (f'<path d="M104 126H136Q139 126 137.5 129C134 137 127 141 120 141C113 141 106 137 102.5 129Q101 126 104 126Z" fill="{C["trait"]}"/>'
            f'<ellipse cx="120" cy="135.5" rx="6.6" ry="3.6" fill="{C["langue"]}"/>')
    return out


def svg(inner, vb, title=None, w=None, h=None):
    t = f'<title>{title}</title>' if title else ''
    size = f' width="{w}" height="{h}"' if w else ''
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}"{size}>{t}{inner}</svg>'


VB = '26 12 620 632'      # pose sans ombre


def acteur():
    """Popote animée du haut de page : chaque partie mobile a sa classe (voir main.js).
    Expressions : yeux ouverts ou plissés de joie ; bouche souriante, grand sourire ou « o » de surprise."""
    yeux = ''.join(eye_open(x, y) for x, y in EYES)
    joie = ''.join(eye_happy(x, y) for x, y in EYES)
    inner = (f'<ellipse class="m-ombre" cx="336" cy="634.5" rx="176" ry="17.2" fill="{C["trait"]}" opacity=".11"/>'
             '<g class="m-corps">' + f'<g>{feet()}</g>'
             f'<g class="m-bras-g">{arm(*ARM_L)}</g><g class="m-bras-d">{arm(*ARM_R)}</g>'
             + body('m', anime=True) +
             f'<g class="m-visage">{cheeks()}<g class="m-yeux">{yeux}</g><g class="m-joie" visibility="hidden">{joie}</g>'
             f'<g class="m-bouche">{mouth()}</g><g class="m-bouche-joie" visibility="hidden">{mouth(98, 40, 318)}</g>'
             f'<g class="m-bouche-o" visibility="hidden"><ellipse cx="336" cy="342" rx="15" ry="18" fill="{C["trait"]}"/></g></g>'
             f'<g class="m-couronne">{crown()}</g></g>')
    return f'<svg class="m-svg" viewBox="-24 -40 720 780" aria-hidden="true" focusable="false">{inner}</svg>'


def main():
    site = pathlib.Path(__file__).resolve().parent.parent
    img = site / 'assets' / 'img'
    (img / 'popote.svg').write_text(svg(pose('salut'), VB, 'Popote', 620, 632) + '\n')
    (img / 'popote-bravo.svg').write_text(svg(pose('bravo'), VB, 'Popote', 620, 632) + '\n')
    (img / 'popote-hmm.svg').write_text(svg(pose('hmm'), VB, 'Popote', 620, 632) + '\n')
    (img / 'popote-avatar.svg').write_text(svg(avatar(), '0 0 240 240', 'Popote', 240, 240) + '\n')
    page = site / 'index.html'
    html, n = re.subn(r'<svg class="m-svg".*?</svg>', lambda m: acteur(), page.read_text(), count=1, flags=re.S)
    if not n:
        raise SystemExit('Dessin de Popote (svg class="m-svg") introuvable dans index.html.')
    page.write_text(html)
    print('Images de Popote et index.html écrits. Relancez outils/version-anglaise.py pour la page anglaise.')


if __name__ == '__main__':
    main()
