# Popote Duo · landing page

La page d'accueil de Popote Duo, avec l'inscription à la bêta gratuite en familles (février 2027).
Un site statique hébergé sur Vercel (offre gratuite), avec une seule petite fonction : celle qui envoie chaque inscription par e-mail à l'équipe.

## Ce qu'il y a dans le dossier

```
index.html                         la page en français (textes, structure, logos en SVG)
en/index.html                      la page en anglais, fabriquée par outils/version-anglaise.py (ne pas la modifier à la main)
en/privacy.html, en/legal-notice.html  les traductions des deux pages légales
politique-de-confidentialite.html  la politique de confidentialité du site et de la liste d'attente
mentions-legales.html              les mentions légales (éditeur, hébergeur, crédits)
404.html                           la page affichée pour une adresse qui n'existe pas
api/inscription.js                 la fonction qui reçoit une inscription et l'envoie par e-mail à l'équipe
package.json                       déclare la bibliothèque d'envoi d'e-mails (nodemailer) utilisée par la fonction
vercel.json                        réglages Vercel : cache, sécurité, adresses sans .html, fonction en région Paris
.vercelignore                      ce qui n'est pas publié (cette documentation, outils/)
assets/
  css/style.css                    la mise en page, les couleurs et la typo
  js/main.js                       réglages (en haut), Popote animée, l'histoire au scroll, la démo,
                                   la liste d'attente et la mesure d'audience
  js/three.min.js                  Three.js r128 (licence MIT), chargé seulement pour refaire les ingrédients 3D (?rendus)
  audio/                           la voix de Popote dans la démo (MP3), en anglais dans audio/en/
  fonts/                           Archivo en WOFF2, limitée aux caractères latins (licence OFL)
  img/                             favicon, icône Apple, radis du logo, Popote (popote*.svg), images de partage (og-image.png, og-image-en.png)
  img/ingredients/                 les ingrédients 3D des cartes du hero et des recettes (WebP)
  img/photos/                      les photos d'illustration des plats et de la cuisine à deux (WebP)
outils/
  dessiner-popote.py               redessine Popote (images SVG et version animée de index.html)
  generer-voix.py                  régénère la voix de Popote quand les textes changent
  version-anglaise.py              refait en/index.html à partir de index.html et des traductions
```

Tout est hébergé dans le dossier : la page n'appelle ni Google Fonts ni un CDN.

L'audit UI/UX (tailles testées, corrections, points à décider) est dans `AUDIT-UX.md`.

## La direction visuelle

Elle reprend les deux références Dribbble de Kris Anfalova, « Kumo » et « WildCrumb », en version sobre.

- **Un seul univers de couleur** : le vert profond de la marque pour la scène de Popote et l'inscription, des cartes crème pour les ingrédients et les recettes (comme les cartes de fruits de Kumo), la menthe de la marque pour les boutons d'action. Le rouge est réservé à Popote et au radis du logo.
- **Popote** : la mascotte est une fraise dessinée à plat, d'après sa planche de personnage : trait vert profond, aplats rouges, ombre en croissant, graines jaunes, joues roses. Elle est toujours posée sur sa carte menthe, comme sur la planche : sur le vert profond, son trait et ses bras disparaîtraient. Elle reste un dessin plat, mais elle a du relief : sa carte s'incline en 3D vers ce qu'elle regarde, Popote flotte au-dessus, et son visage, ses feuilles et ses graines se décalent chacun à leur profondeur, comme une tête qui tourne. Elle regarde la souris (sur téléphone, son regard se promène seul ; dans « Comment ça marche », elle se tourne vers la bulle active), salue quand on s'approche, respire et cligne des yeux. Quand on la touche, elle réagit à chaque fois différemment, avec une bulle (saut de joie, pirouette, fou rire). On peut aussi la tirer (à l'horizontale sur téléphone, pour que la page défile toujours) : elle s'étire, l'air surpris, puis revient comme un ressort. Les textes des bulles sont dans `T` (`hello`, `hop`, `wee`, `giggle`, `boing`), dans `main.js`. Ses poses fixes : `popote.svg` (elle salue, au-dessus du formulaire), `popote-bravo.svg` (fin de la démo, inscription réussie), `popote-hmm.svg` (page 404) et `popote-avatar.svg` (profil enfant de la démo). Pour la modifier : `outils/dessiner-popote.py` (instructions en haut du fichier).
- **Le hero** : Popote au centre, quatre ingrédients sur des cartes crème inclinées autour d'elle, le titre en bas de l'écran. Quand l'histoire atteint la moitié de l'écran, Popote bondit vers elle en 0,9 s et les cartes s'envolent ; en remontant, tout revient. Chaque carte mène à sa recette (tomate → rougail, banane → verrines, cookie → cookie géant ; la carotte annonce les recettes à venir).
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

Le projet Vercel est relié au dépôt GitHub PopoteDuo/PopoteDuo_Landing-page : chaque envoi (push) sur la branche `main` met le site à jour tout seul, à l'adresse https://popote-duo.vercel.app.

Avant d'envoyer, augmenter le numéro de version (`?v=…`) de `style.css` et `main.js` dans `index.html` (et de `style.css` dans les pages légales et la 404), sinon les visiteurs gardent l'ancienne version en cache : ces fichiers sont gardés un an.

### Le reste

- **Champs jaunes** : compléter le responsable du traitement dans `politique-de-confidentialite.html`, et le responsable de la publication et l'école dans `mentions-legales.html`.
- **Usage commercial** : l'offre gratuite de Vercel est réservée aux projets non commerciaux. Elle convient pour la liste d'attente d'un projet d'école ; il faudra passer à l'offre Pro le jour où vous vendez.
- **Prix** : un bandeau rappelle que **la bêta est entièrement gratuite, Premium compris**. Le Premium affiche **5 € par mois**, soit 59,99 € par an divisés par 12, « facturé 59,99 € par an », avec la **première semaine offerte**. Le business plan prévoyait un pass découverte de 7 jours à 2,49 € : à aligner. La box affiche 39,90 € (page Kit de Notion, « proposé, à valider ») alors que le business plan parle de 30 € : à trancher. L'offre pro n'a pas de tarif pour l'instant.

## Voir la page en local

Avec MAMP lancé : http://localhost:8888/popote-duo-landing/. Sans MAMP, depuis ce dossier :

```bash
python3 -m http.server 8000
```

puis http://localhost:8000. En local, Popote et la voix marchent, mais pas le formulaire (la fonction n'existe que sur Vercel) ni la mesure d'audience.

## Modifier les textes

Tous les textes sont dans `index.html`, sauf ceux qui changent pendant l'utilisation, qui sont dans `assets/js/main.js` :

- `STEPS` : les 4 étapes de la démo du cookie géant (consigne enfant, consigne parent, geste appris) ;
- les messages de confirmation du formulaire.

## Le site en deux langues

Le site existe en français (`/`) et en anglais (`/en`). Le sélecteur FR / EN est dans la barre de navigation.

- **Au premier passage**, la page suit la langue du navigateur : un navigateur en français reste sur `/`, tous les autres vont sur `/en`.
- **Ensuite, le choix fait avec le sélecteur l'emporte** : il est retenu dans le navigateur du visiteur, et la page le respecte aux visites suivantes.
- Les robots des moteurs de recherche et des réseaux sociaux ne sont jamais redirigés : chacun voit la page demandée, et les liens `hreflang` leur indiquent l'autre langue.
- Les inscriptions venues de la page anglaise arrivent avec « (EN) » dans l'objet de l'e-mail, et la ligne « Langue du site : anglais » : il faut leur répondre en anglais.

**Pour modifier un texte**, changer d'abord la version française dans `index.html`, puis sa traduction dans `outils/version-anglaise.py` (chaque paire : le français à gauche, l'anglais à droite), et relancer :

```
python3 outils/version-anglaise.py
```

Si un texte français a changé sans que sa paire suive, le script s'arrête et indique lequel. Les textes de la démo et du formulaire qui changent en direct sont dans `assets/js/main.js` (`T` et `STEPS`, en français et en anglais). Les pages légales anglaises (`en/`) sont à tenir à jour à la main, en même temps que les françaises, y compris les champs jaunes à compléter.

L'image de partage anglaise (`og-image-en.png`) reprend la française avec le titre « Cook together, one task each ».

## Les recettes et les images

Les trois recettes et la démo du cookie géant viennent des fiches de l'équipe (Notion, carte « Landing page ») : verrines banane-spéculoos, cookie géant et rougail saucisses.

**Photos** : en attendant les photos de vos propres plats, les cartes utilisent des photos d'illustration libres de droits (licence Unsplash : usage gratuit, même commercial, sans obligation de crédit). Leurs auteurs sont cités dans les mentions légales. Il n'existe pas de photo libre de rougail : celle du rougail montre des rondelles de saucisse sur du riz. Pour la remplacer, déposer une image 760 × 608 px en WebP dans `assets/img/photos/` sous le même nom.

| Fichier | Photo | Auteur |
|---|---|---|
| `verrines-banane-speculoos.webp` | verrines en couches | Nicole Winchel Brayton |
| `cookie-geant.webp` | cookie géant aux pépites | Juan Carlos Frias Brito |
| `rougail-saucisses.webp` | saucisses en sauce sur riz | Nigel Seah |
| `famille-cuisine.webp` | une mère et sa fille en cuisine | Vitaly Gariev |

**Ingrédients en 3D** : ce sont des images fixes (`assets/img/ingredients/`), rendues une fois pour toutes à partir des modèles 3D de `main.js`. Pour les refaire après une modification d'un modèle, ouvrir la page en local avec `?rendus` à la fin de l'adresse (dans Chrome), puis enregistrer chaque image proposée au même endroit.

Pour ajouter une recette, copier un bloc `<article class="rc" id="r-…">` dans `index.html`, avec sa photo et son ingrédient en pastille.

## La voix de Popote

Les consignes de la démo sont pré-enregistrées avec Piper, une synthèse vocale neuronale qui tourne sur votre ordinateur, et la voix française « siwis » (licence CC-BY 4.0, d'où la mention en bas de page). Le résultat est bien plus naturel que les voix du téléphone, et identique sur tous les appareils. Chaque fichier pèse 40 Ko environ et ne se charge qu'au premier appui sur « Écouter ».

En anglais, Popote parle avec la voix « LJ Speech » de Piper (domaine public), et ses fichiers sont dans `assets/audio/en/`.

Si les textes changent, modifier `CLIPS` (français) ou `CLIPS_EN` (anglais) dans `outils/generer-voix.py` (en écrivant les nombres en lettres), puis suivre les instructions en haut du fichier. Le texte affiché à l'écran est dans `STEPS`, dans `main.js`.

Pour l'appli, une voix encore plus expressive est possible avec un service payant (ElevenLabs, Azure) ou en enregistrant une vraie voix pour Popote.

## Performances

- Le texte et Popote s'affichent tout de suite : Popote est un dessin SVG d'une dizaine de Ko, écrit dans la page. Three.js (600 Ko) n'est plus chargé pour les visiteurs, seulement pour refaire les images des ingrédients.
- Les ingrédients 3D et les photos sont des images WebP légères (7 à 60 Ko), affichées tout de suite : rien n'est calculé en 3D sur le téléphone du visiteur.
- Les gestes de Popote changent seulement quelques attributs du dessin à chaque image, et uniquement ceux qui ont bougé.
- Sa carte est placée dans le bloc collant de l'histoire. Elle défile donc avec la page, comme le texte, au lieu d'être recalée en JavaScript à chaque image : c'est ce qui évite toute saccade pendant le scroll sur mobile.
- La boucle d'animation ne mesure la page qu'une fois par image, avant toute modification, pour ne jamais forcer le navigateur à recalculer la mise en page en cours d'image. Les positions de Popote et des bulles sont mises en cache et recalculées seulement quand la mise en page change.
- Pas de flou d'arrière-plan sur les éléments posés sur le vert uni (bulles, panneau, boutons) ni sur la navigation mobile, et pas de grain sur mobile : ces effets seraient recalculés à chaque image de l'animation.
- Le passage du hero à l'histoire est une animation dans le temps, déclenchée par un seuil, et non plus liée pixel par pixel au scroll : sur mobile, la page défile sans attendre le JavaScript, et tout mouvement calé sur le scroll y prend du retard. Les cartes d'ingrédients s'envolent par une transition CSS, jouée par la carte graphique.
- L'anneau qui invite à toucher « Écouter » est animé en transform et opacité, sans redessiner la page à chaque image.
- Pour mesurer la fluidité sur un téléphone, ajouter `?fps` à l'adresse du site : un compteur affiche les images par seconde.
- L'animation de Popote s'arrête dès qu'on a dépassé le haut de page, et quand l'onglet est en arrière-plan.
- Avec le réglage « Réduire les animations » du téléphone, Popote reste immobile et les transitions sont coupées.
