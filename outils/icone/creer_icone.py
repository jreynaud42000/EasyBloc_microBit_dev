"""EasyBloc micro:bit — fabrication de l'icone de l'exe (icone.ico), variante B choisie par l'utilisateur (nov. 2026).

Carte micro:bit dessinee (matrice 5 x 5 avec un coeur rouge, boutons A et B, connecteur dore) sur un carre violet
arrondi, le violet du bandeau (#6a2c91). Dessin vectoriel refait avec Pillow : chaque taille est dessinee a 1024 px
puis reduite, pour un trait net de 16 a 256 px. Aucune photo, aucun element sous droits.

Lancement (depuis le dossier du logiciel) :  python outils/icone/creer_icone.py   ->  icone.ico (+ icone.png)
"""
import os
from PIL import Image, ImageDraw

ICI = os.path.dirname(os.path.abspath(__file__))
LOGICIEL = os.path.normpath(os.path.join(ICI, '..', '..'))
G = 1024 / 100.0          # le dessin est decrit sur une grille de 100 x 100


def r(d, x, y, w, h, rayon, couleur):
    d.rounded_rectangle([x * G, y * G, (x + w) * G, (y + h) * G], radius=rayon * G, fill=couleur)


def cercle(d, cx, cy, rayon, couleur):
    d.ellipse([(cx - rayon) * G, (cy - rayon) * G, (cx + rayon) * G, (cy + rayon) * G], fill=couleur)


def dessiner():
    im = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    r(d, 2, 2, 96, 96, 22, '#6a2c91')                      # fond violet du bandeau
    # Carte (grille 100 x 80 du dessin), placee en (10, 19), echelle 0,8
    ox, oy, k = 10, 19, 0.8
    R = lambda x, y, w, h, ray, c: r(d, ox + x * k, oy + y * k, w * k, h * k, ray * k, c)
    C = lambda cx, cy, ray, c: cercle(d, ox + cx * k, oy + cy * k, ray * k, c)
    R(2, 62, 96, 16, 3, '#c9a227')                         # connecteur dore
    for x in (8, 45.5, 83):
        R(x, 64, 9, 12, 1, '#3a3a40')
    R(2, 2, 96, 66, 9, '#1f1f24')                          # carte
    for cx in (15, 85):                                    # boutons A et B
        C(cx, 33, 7, '#4a4a52')
        C(cx, 33, 4, '#111111')
    coeur = {(1, 1), (3, 1), (0, 2), (1, 2), (2, 2), (3, 2), (4, 2), (1, 3), (2, 3), (3, 3), (2, 4)}
    for ligne in range(5):
        for col in range(5):
            R(31 + col * 9, 11 + ligne * 9, 6, 6, 1, '#ff3b30' if (col, ligne) in coeur else '#3a1418')
    return im


def main():
    grand = dessiner()
    tailles = [256, 128, 64, 48, 32, 24, 16]
    images = [grand.resize((t, t), Image.LANCZOS) for t in tailles]
    images[0].save(os.path.join(LOGICIEL, 'icone.ico'), format='ICO', sizes=[(t, t) for t in tailles],
                   append_images=images[1:])
    images[0].save(os.path.join(LOGICIEL, 'icone.png'))
    print('icone.ico et icone.png ecrits dans', LOGICIEL)


if __name__ == '__main__':
    main()
