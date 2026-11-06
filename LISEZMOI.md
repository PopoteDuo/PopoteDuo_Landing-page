# Popote Duo · landing page

La page d'accueil de Popote Duo, avec l'inscription à la bêta gratuite en familles (février 2027).
Un site statique hébergé sur Vercel (offre gratuite), avec une seule petite fonction : celle qui envoie chaque inscription par e-mail à l'équipe.

## Ce qu'il y a dans le dossier

```
index.html                         la page (textes, structure, logos en SVG)
politique-de-confidentialite.html  la politique de confidentialité du site et de la liste d'attente
mentions-legales.html              les mentions légales (éditeur, hébergeur, crédits)
404.html                           la page affichée pour une adresse qui n'existe pas
api/inscription.js                 la fonction qui reçoit une inscription et l'envoie par e-mail à l'équipe
package.json                       déclare la bibliothèque d'envoi d'e-mails (nodemailer) utilisée par la fonction
vercel.json                        réglages Vercel : cache, sécurité, adresses sans .html, fonction en région Paris
.vercelignore                      ce qui n'est pas publié (cette documentation, outils/)
assets/
  css/style.css                    la mise en page, les couleurs et la typo
  js/main.js                       réglages (en haut), Pépin en 3D, l'histoire au scroll, la démo,
                                   la liste d'attente et la mesure d'audience
  js/three.min.js                  Three.js r128 (licence MIT), chargé après l'affichage de la page
  audio/                           la voix de Pépin dans la démo (MP3)
  fonts/                           Archivo en WOFF2, limitée aux caractères latins (licence OFL)
  img/                             favicon, icône Apple, Pépin (plat et en 3D), image de partage (og-image.png)
  img/ingredients/                 les ingrédients 3D des cartes du hero et des recettes (WebP)
  img/photos/                      les photos d'illustration des plats et de la cuisine à deux (WebP)
outils/
  generer-voix.py                  régénère la voix de Pépin quand les textes changent
```

Tout est hébergé dans le dossier : la page n'appelle ni Google Fonts ni un CDN.

L'audit UI/UX (tailles testées, corrections, points à décider) est dans `AUDIT-UX.md`.

## La direction visuelle

Elle reprend les deux références Dribbble de Kris Anfalova, « Kumo » et « WildCrumb », en version sobre.

- **Un seul univers de couleur** : le vert profond de la marque pour la scène de Pépin et l'inscription, des cartes crème pour les ingrédients et les recettes (comme les cartes de fruits de Kumo), la menthe de la marque pour les boutons d'action. Le rouge radis est réservé à Pépin.
- **Le hero** : Pépin en 3D au centre, quatre ingrédients sur des cartes crème inclinées autour de lui, le titre en bas de l'écran. Quand l'histoire atteint la moitié de l'écran, Pépin bondit vers elle en 0,9 s et les cartes s'envolent ; en remontant, tout revient. Chaque carte mène à sa recette (tomate → rougail, banane → verrines, cookie → cookie géant ; la carotte annonce les recettes à venir).
- **Les recettes** : la photo du plat, avec l'ingrédient 3D en pastille dans le coin, pour faire le lien avec le hero.
- **L'histoire au scroll** : deux messages seulement (le filtre « sans couteau » et le carnet de gestes), ce que la démo ne montre pas. Des bulles en verre dépoli avec une icône dans un petit carré, comme les infobulles de WildCrumb.
- **Les arrondis** : trois valeurs, 14 px (petits éléments), 24 px (cartes) et celui des grands blocs.
- **La mise en page** : une page blanche découpée en grands blocs arrondis, avec une petite marge autour, comme un écran dans un cadre. La navigation tient dans une pilule sombre, lisible sur tous les fonds.
- **La typo** : Archivo seule, un peu élargie et serrée pour les titres, en minuscules et à taille mesurée.
- **Les boutons vers l'inscription** : dans la navbar, le hero, la démo, les recettes, les deux offres et la box. Sur mobile, le formulaire arrive juste sous le titre de sa section.

## Le site en ligne (Vercel)

### Les inscriptions arrivent par e-mail

Chaque inscription au formulaire est envoyée par la fonction `api/inscription.js` à **contact.popoteduo@gmail.com** : e-mail, profil (parent ou pro), âge des enfants ou nom de la structure, accord pour la bêta et date. Répondre au message écrit directement à la personne inscrite. Rien n'est stocké ailleurs.

La fonction envoie depuis la boîte Gmail de l'équipe vers elle-même. Il faut lui donner un **mot de passe d'application** Google (pas le mot de passe du compte), une seule fois :

1. Sur le compte Google contact.popoteduo@gmail.com, activer la **validation en deux étapes** (Compte Google → Sécurité).
2. Créer un **mot de passe d'application** (Compte Google → Sécurité → Mots de passe des applications), nommé par exemple « Site Popote Duo ». Google affiche 16 lettres : les copier.
3. Dans Vercel, projet popote-duo → **Settings → Environment Variables**, ajouter `GMAIL_APP_PASSWORD` avec ces 16 lettres, pour Production et Preview, en type « Sensitive ».
4. Vérifier que `GMAIL_USER` vaut bien `contact.popoteduo@gmail.com`.
5. Redéployer (Deployments → les trois points du dernier déploiement → Redeploy), puis faire une inscription de test.

Tant que le mot de passe n'est pas réglé, le formulaire affiche « L'inscription n'a pas abouti » : **ne pas partager le lien du site avant d'avoir fait le test**.

La fonction refuse les envois qui ne viennent pas du site, ignore les robots qui remplissent le champ piège, et le pare-feu Vercel limite les envois à 5 par minute et par adresse IP.

### La mesure d'audience (Vercel Web Analytics)

Sans cookie, donc sans bandeau. À activer une fois dans le projet Vercel : onglet **Analytics → Enable**. On y voit les visiteurs, les pages vues, les pays, les appareils et les sites d'où viennent les visiteurs (instagram.com, tiktok.com…).

L'offre gratuite compte 50 000 événements par mois. Elle ne suit pas les actions (clics sur « Rejoindre la bêta », écoute de la démo…) ni les paramètres `utm_` des liens : il faut pour cela l'offre Pro avec l'option Web Analytics Plus. Le code envoie déjà ces actions : elles apparaîtront d'elles-mêmes si vous passez à l'offre Pro. Le nombre d'inscriptions, lui, se lit directement dans la boîte e-mail.

### Le pare-feu (Vercel Firewall)

- Une règle limite `/api/inscription` à 5 envois par minute et par adresse IP.
- La protection contre les robots (Firewall → Bot Management) est en mode « observer » : elle note le trafic suspect sans bloquer, pour ne pas gêner les aperçus de lien de WhatsApp ou Instagram. En cas d'abus, la passer en « Challenge ».
- En cas d'attaque, **Firewall → Attack Challenge Mode** fait passer un test à tous les visiteurs, d'un clic.

### Mettre à jour le site

Depuis ce dossier, avec l'outil Vercel connecté au compte contact.popoteduo@gmail.com :

```bash
vercel deploy --prod
```

Avant, augmenter le numéro de version (`?v=…`) de `style.css` et `main.js` dans `index.html` (et de `style.css` dans les pages légales et la 404), sinon les visiteurs gardent l'ancienne version en cache : ces fichiers sont gardés un an.

### Le reste

- **Champs jaunes** : compléter le responsable du traitement dans `politique-de-confidentialite.html`, et le responsable de la publication et l'école dans `mentions-legales.html`.
- **Usage commercial** : l'offre gratuite de Vercel est réservée aux projets non commerciaux. Elle convient pour la liste d'attente d'un projet d'école ; il faudra passer à l'offre Pro le jour où vous vendez.
- **Prix** : un bandeau rappelle que **la bêta est entièrement gratuite, Premium compris**. Le Premium affiche **5 € par mois**, soit 59,99 € par an divisés par 12, « facturé 59,99 € par an », avec la **première semaine offerte**. Le business plan prévoyait un pass découverte de 7 jours à 2,49 € : à aligner. La box affiche 39,90 € (page Kit de Notion, « proposé, à valider ») alors que le business plan parle de 30 € : à trancher. L'offre pro n'a pas de tarif pour l'instant.

## Voir la page en local

Avec MAMP lancé : http://localhost:8888/popote-duo-landing/. Sans MAMP, depuis ce dossier :

```bash
python3 -m http.server 8000
```

puis http://localhost:8000. En local, la 3D et la voix marchent, mais pas le formulaire (la fonction n'existe que sur Vercel) ni la mesure d'audience.

## Modifier les textes

Tous les textes sont dans `index.html`, sauf ceux qui changent pendant l'utilisation, qui sont dans `assets/js/main.js` :

- `STEPS` : les 4 étapes de la démo du cookie géant (consigne enfant, consigne parent, geste appris) ;
- les messages de confirmation du formulaire.

## Les recettes et les images

Les trois recettes et la démo du cookie géant viennent des fiches de l'équipe (Notion, carte « Landing page ») : verrines banane-spéculoos, cookie géant et rougail saucisses.

**Photos** : en attendant les photos de vos propres plats, les cartes utilisent des photos d'illustration libres de droits (licence Unsplash : usage gratuit, même commercial, sans obligation de crédit). Leurs auteurs sont cités dans les mentions légales. Il n'existe pas de photo libre de rougail : celle du rougail montre des rondelles de saucisse sur du riz. Pour la remplacer, déposer une image 760 × 608 px en WebP dans `assets/img/photos/` sous le même nom.

| Fichier | Photo | Auteur |
|---|---|---|
| `verrines-banane-speculoos.webp` | verrines en couches | Nicole Winchel Brayton |
| `cookie-geant.webp` | cookie géant aux pépites | Juan Carlos Frias Brito |
| `rougail-saucisses.webp` | saucisses en sauce sur riz | Nigel Seah |
| `famille-cuisine.webp` | une mère et sa fille en cuisine | Vitaly Gariev |

**Ingrédients et Pépin en 3D** : ce sont des images fixes (`assets/img/ingredients/`, `assets/img/pepin-3d.webp`), rendues une fois pour toutes à partir des modèles 3D de `main.js`. Pour les refaire après une modification d'un modèle, ouvrir la page en local avec `?rendus` à la fin de l'adresse (dans Chrome), puis enregistrer chaque image proposée au même endroit.

Pour ajouter une recette, copier un bloc `<article class="rc" id="r-…">` dans `index.html`, avec sa photo et son ingrédient en pastille.

## La voix de Pépin

Les consignes de la démo sont pré-enregistrées avec Piper, une synthèse vocale neuronale qui tourne sur votre ordinateur, et la voix française « siwis » (licence CC-BY 4.0, d'où la mention en bas de page). Le résultat est bien plus naturel que les voix du téléphone, et identique sur tous les appareils. Chaque fichier pèse 40 Ko environ et ne se charge qu'au premier appui sur « Écouter ».

Si les textes changent, modifier `CLIPS` dans `outils/generer-voix.py` (en écrivant les nombres en lettres), puis suivre les instructions en haut du fichier. Le texte affiché à l'écran est dans `STEPS`, dans `main.js`.

Pour l'appli, une voix encore plus expressive est possible avec un service payant (ElevenLabs, Azure) ou en enregistrant une vraie voix pour Pépin.

## Performances

- Le texte s'affiche tout de suite. Three.js (600 Ko, environ 150 Ko compressé) se charge ensuite, et Pépin arrive en sautillant.
- Les ingrédients 3D et les photos sont des images WebP légères (7 à 60 Ko), affichées tout de suite : rien n'est plus calculé sur le téléphone du visiteur, à part Pépin.
- Le canvas 3D ne couvre que Pépin et son ombre, pas tout l'écran : 2,4 fois moins de pixels à dessiner sur mobile, 3 fois moins sur ordinateur.
- Ce canvas est placé dans le bloc collant de l'histoire. Il défile donc avec la page, comme le texte, au lieu d'être recalé en JavaScript à chaque image : c'est ce qui supprime la saccade de Pépin pendant le scroll sur mobile.
- La boucle d'animation ne mesure la page qu'une fois par image, avant toute modification, pour ne jamais forcer le navigateur à recalculer la mise en page en cours d'image. Les positions de Pépin et des bulles sont mises en cache et recalculées seulement quand la mise en page change.
- Pas de flou d'arrière-plan sur les éléments posés sur le vert uni (bulles, panneau, boutons) ni sur la navigation mobile, et pas de grain sur mobile : ces effets seraient recalculés à chaque image de la 3D.
- Le passage du hero à l'histoire est une animation dans le temps, déclenchée par un seuil, et non plus liée pixel par pixel au scroll : sur mobile, la page défile sans attendre le JavaScript, et tout mouvement calé sur le scroll y prend du retard. Les cartes d'ingrédients s'envolent par une transition CSS, jouée par la carte graphique.
- Sur écran tactile, la résolution de la 3D est plafonnée à 1,5. Si l'appareil peine encore (moins de 52 images par seconde), la page allège par paliers : matières sans vernis, puis résolution 1,25, puis 1.
- L'anneau qui invite à toucher « Écouter » est animé en transform et opacité, sans redessiner la page à chaque image.
- Pour mesurer la fluidité sur un téléphone, ajouter `?fps` à l'adresse du site : un compteur affiche les images par seconde, le palier de qualité atteint (0 = pleine qualité) et la résolution du rendu.
- La 3D s'arrête dès qu'on a dépassé le haut de page, et quand l'onglet est en arrière-plan.
- Si le téléphone ne gère pas la 3D, la page affiche le Pépin plat du logo à la place.
- Avec le réglage « Réduire les animations » du téléphone, Pépin reste immobile et les transitions sont coupées.
