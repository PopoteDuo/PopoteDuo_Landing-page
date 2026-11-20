# Popote Duo · landing page

La page d'accueil de Popote Duo, avec l'inscription à la bêta gratuite en familles (février 2027).
Un site statique hébergé sur Vercel (offre gratuite), avec une seule petite fonction : celle qui envoie chaque inscription par e-mail à l'équipe.

## Ce qu'il y a dans le dossier

```
index.html                         la page en français (textes, structure, icônes et Popote animée en SVG)
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
  js/main.js                       réglages (en haut), Popote animée, repères de défilement, la démo,
                                   la liste d'attente et la mesure d'audience
  audio/                           la voix de Popote dans la démo (MP3), en anglais dans audio/en/
  fonts/                           Fredoka (titres) et Nunito (texte), les polices de l'appli, en WOFF2 (licence OFL)
  img/                             icône du site (favicon.svg, la tête de Popote, et apple-touch-icon.png), images de partage
  img/popote/                      les 8 attitudes de Popote, copiées de la DA de l'appli (coucou, hourra, chef…)
  img/appli/                       trois écrans de l'appli, tirés des maquettes (accueil, étape, bravo)
  img/copains/                     la carotte, copain de Léo dans la démo
  img/photos/                      la photo d'illustration de la cuisine à deux (WebP)
robots.txt, sitemap.xml            pour les moteurs de recherche (voir « Référencement »)
outils/
  dessiner-popote.py               redessine Popote (images SVG et version animée de index.html)
  generer-voix.py                  régénère la voix de Popote quand les textes changent
  version-anglaise.py              refait en/index.html à partir de index.html et des traductions
```

Tout est hébergé dans le dossier : la page n'appelle ni Google Fonts ni un CDN.

L'audit UI/UX (tailles testées, corrections, points à décider) est dans `AUDIT-UX.md`.

## La direction visuelle

Le site reprend la direction artistique de l'appli, « version pop » (planche « Le village de Gari », maquettes « pop complètes final ») : mêmes couleurs, mêmes polices, même mascotte, mêmes icônes. La mise en page s'inspire de Seego (seego.fr) : sections numérotées, repères dans les coins, points de navigation à droite, manifeste qui se colore au fil du scroll, cartes avec les écrans de l'appli, questions fréquentes et inscription en forme de fiche à détacher.

- **Les couleurs** : fond presque blanc `#F5F7F0`, cartes blanches, vert foncé de la marque `#173F2E` pour le texte et les boutons, lime `#D7F08A` pour les flèches et les mises en avant. Comme dans l'appli, les couleurs pop (soleil, fraise, feuille, myrtille…) sont réservées aux illustrations, aux icônes et aux récompenses.
- **Les polices** : Fredoka, arrondie, pour les titres et les boutons ; Nunito pour le texte.
- **Les boutons** : la pilule vert foncé de l'appli, avec la flèche dans un rond lime.
- **L'icône du site** : la tête de Popote sur le soleil jaune (`favicon.svg`, dessinée par `outils/dessiner-popote.py`) ; `apple-touch-icon.png` en est la version carrée de 180 px.
- **Les icônes** : les 21 icônes de l'appli (tuile pastel et glyphe pop), réunies en haut de `index.html` (symboles `p-…`).
- **Popote** : la mascotte « pop » de l'appli, sans contour, devant le soleil de l'écran d'accueil. Elle a du relief : elle s'incline en 3D vers ce qu'elle regarde, et son visage, ses feuilles et ses graines se décalent chacun à leur profondeur, comme une tête qui tourne. Elle regarde la souris (sur téléphone, son regard se promène seul), salue quand on s'approche, respire et cligne des yeux. Quand on la touche, elle réagit à chaque fois différemment, avec une bulle (saut de joie, pirouette, fou rire). On peut aussi la tirer (à l'horizontale sur téléphone, pour que la page défile toujours) : elle s'étire, l'air surpris, puis revient comme un ressort. Les textes des bulles sont dans `T` (`hello`, `hop`, `wee`, `giggle`, `boing`), dans `main.js`. Ailleurs, ses attitudes fixes : chef (démo), hourra (fin de la démo, inscription réussie), réfléchit (questions, page 404), coucou (formulaire). Pour modifier la Popote animée : `outils/dessiner-popote.py`.
- **Le haut de page** : le soleil jaune de l'écran d'accueil de l'appli, avec Popote seule au centre. L'inscription commence dès le haut de page : l'e-mail tapé là passe dans le formulaire complet, qui n'a plus que deux questions.
- **Les sections** : (01) le principe, (02) l'appli en trois écrans, (03) la démo, (04) la sécurité, (05) les tarifs, (06) les questions, puis l'inscription. Sur mobile, les écrans de l'appli défilent à l'horizontale.
- **Les boutons vers l'inscription** : dans la barre, le haut de page, la démo, les deux offres et la box.

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

Les images de partage (`og-image.png`, `og-image-en.png`) reprennent le haut de page : Popote devant son soleil, avec le titre de chaque langue.

## Les images

La démo du cookie géant vient de la fiche de l'équipe (Notion, carte « Landing page »). La section des recettes a été retirée le 20 novembre 2026 : elle pourra revenir quand les recettes auront leurs propres visuels.

**Illustrations** : Popote, les icônes, la carotte et les écrans de l'appli viennent de la DA de l'appli. Les écrans (`assets/img/appli/`) sont des captures des maquettes, en français, avec « Popote » à la place de « Gari ».

**Photo** : la photo de la mère et sa fille en cuisine (`famille-cuisine.webp`, Vitaly Gariev, licence Unsplash), en attendant les photos des familles testeuses.

## La voix de Popote

Les consignes de la démo sont pré-enregistrées avec Piper, une synthèse vocale neuronale qui tourne sur votre ordinateur, et la voix française « siwis » (licence CC-BY 4.0, d'où la mention en bas de page). Le résultat est bien plus naturel que les voix du téléphone, et identique sur tous les appareils. Chaque fichier pèse 40 Ko environ et ne se charge qu'au premier appui sur « Écouter ».

En anglais, Popote parle avec la voix « LJ Speech » de Piper (domaine public), et ses fichiers sont dans `assets/audio/en/`.

Si les textes changent, modifier `CLIPS` (français) ou `CLIPS_EN` (anglais) dans `outils/generer-voix.py` (en écrivant les nombres en lettres), puis suivre les instructions en haut du fichier. Le texte affiché à l'écran est dans `STEPS`, dans `main.js`.

Pour l'appli, une voix encore plus expressive est possible avec un service payant (ElevenLabs, Azure) ou en enregistrant une vraie voix pour Popote.

## Performances

- Plus de 3D ni de Three.js : Popote est un dessin SVG de quelques Ko, écrit dans la page, et s'affiche tout de suite. La page entière (HTML, CSS, JS, polices) pèse moins de 200 Ko.
- Les deux polices sont hébergées sur le site, limitées aux caractères latins (30 et 39 Ko), et préchargées.
- L'animation de Popote ne tourne que lorsque le haut de page est à l'écran et que l'onglet est visible. Elle ne change que les attributs du dessin qui ont bougé ; les rayons du soleil tournent en CSS (carte graphique) et s'arrêtent aussi hors de l'écran.
- Aucun mouvement n'est calé sur le scroll en JavaScript. Le manifeste se colore mot à mot grâce au navigateur lui-même (CSS `animation-timeline`) ; les navigateurs qui ne le savent pas l'affichent simplement en entier.
- Les apparitions au scroll (fondu et montée légère) ne jouent qu'une fois, en transform et opacité.
- Les écrans de l'appli et la photo se chargent seulement en approchant (`loading="lazy"`), avec leur taille réservée pour que la page ne saute pas.
- Avec le réglage « Réduire les animations » du téléphone, Popote ne bouge plus et change seulement d'expression, et les transitions sont coupées.
- Pour mesurer la fluidité sur un téléphone, ajouter `?fps` à l'adresse du site : un compteur affiche les images par seconde.

## Référencement

- **Ce qui est en place** : titre et description par langue, adresse canonique, liens `hreflang` entre `/` et `/en`, `robots.txt`, `sitemap.xml` (les deux langues), images de partage, et des données structurées (`application/ld+json` en tête de page) qui décrivent l'organisation, le site, l'appli et les questions fréquentes. Les pages légales et la 404 sont exclues (`noindex`).
- **Les questions fréquentes** sont écrites deux fois : dans la page et dans les données structurées. Le texte doit rester identique aux deux endroits (le script de traduction les remplace ensemble).
- **Google** : créer une propriété dans Google Search Console (search.google.com/search-console) pour `https://popote-duo.vercel.app/`, la valider par la balise HTML proposée (à ajouter dans le `<head>` de `index.html`), puis envoyer le sitemap `https://popote-duo.vercel.app/sitemap.xml`.
- **Bing (et les moteurs qui s'en servent : DuckDuckGo, Ecosia, Qwant…)** : le site est signalé par IndexNow, avec la clé du fichier `*.txt` à la racine. Bing Webmaster Tools peut aussi importer la propriété depuis Google Search Console.
- **Pour aller plus loin** : un nom de domaine à vous (popoteduo.fr, par exemple) se référence mieux qu'une adresse en vercel.app. Il faudra alors changer les adresses complètes en tête des pages, dans `sitemap.xml`, `robots.txt` et `outils/version-anglaise.py`. Les liens venant d'autres sites (école, réseaux, articles) aident beaucoup.

