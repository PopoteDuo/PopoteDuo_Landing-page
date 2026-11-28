# Popote Duo · landing page

La page d'accueil de Popote Duo. Elle présente l'appli et mène à la création de compte sur https://popoteduo.app. Elle est en ligne sous https://popoteduo.app/bienvenue (POP-150).
Un site statique hébergé sur Vercel (offre gratuite), sans fonction serveur.

La liste d'attente de la bêta est fermée depuis le 20 novembre 2026, jour de l'ouverture de l'appli : le formulaire et la fonction `api/inscription.js` qui envoyait chaque inscription par e-mail ont été retirés (ils restent dans l'historique Git).

## Ce qu'il y a dans le dossier

```
index.html                         la page en français (textes, structure, icônes et Gari animée en SVG)
en/index.html                      la page en anglais, fabriquée par outils/version-anglaise.py (ne pas la modifier à la main)
en/privacy.html, en/legal-notice.html  les traductions des deux pages légales
politique-de-confidentialite.html  la politique de confidentialité du site (et de l'ancienne liste d'attente)
mentions-legales.html              les mentions légales (éditeur, hébergeur, crédits)
404.html                           la page affichée pour une adresse qui n'existe pas
package.json                       nom du projet et version de Node pour Vercel (aucune dépendance)
vercel.json                        réglages Vercel : cache, sécurité, adresses sans .html, région Paris
.vercelignore                      ce qui n'est pas publié (cette documentation, outils/)
assets/
  css/style.css                    la mise en page, les couleurs et la typo
  js/main.js                       réglages (en haut), Gari animée, repères de défilement, la démo
                                   et la mesure d'audience
  audio/                           la voix de Gari dans la démo (MP3), en anglais dans audio/en/
  fonts/                           Fredoka (titres) et Nunito (texte), les polices de l'appli, en WOFF2 (licence OFL)
  img/                             icône du site (favicon.svg, la tête de Gari, et apple-touch-icon.png), images de partage
  img/gari/                      les 8 attitudes de Gari, copiées de la DA de l'appli (coucou, hourra, chef…)
  img/appli/                       trois écrans de l'appli, tirés des maquettes (accueil, étape, bravo)
  img/copains/                     la carotte, copain de Léo dans la démo
  img/photos/                      la photo d'illustration de la cuisine à deux (WebP)
robots.txt, sitemap.xml            pour les moteurs de recherche (voir « Référencement »)
outils/
  dessiner-gari.py               redessine Gari (images SVG et version animée de index.html)
  generer-voix.py                  régénère la voix de Gari quand les textes changent
  version-anglaise.py              refait en/index.html à partir de index.html et des traductions
```

Tout est hébergé dans le dossier : la page n'appelle ni Google Fonts ni un CDN.

L'audit UI/UX (tailles testées, corrections, points à décider) est dans `AUDIT-UX.md`.

## La direction visuelle

Le site reprend la direction artistique de l'appli, « version pop » (planche « Le village de Gari », maquettes « pop complètes final ») : mêmes couleurs, mêmes polices, même mascotte, mêmes icônes. La mise en page s'inspire de Seego (seego.fr) : sections numérotées, repères dans les coins, points de navigation à droite, manifeste qui se colore au fil du scroll, cartes avec les écrans de l'appli, questions fréquentes et, pour finir, une fiche à détacher qui mène à l'appli.

- **Les couleurs** : fond presque blanc `#F5F7F0`, cartes blanches, vert foncé de la marque `#173F2E` pour le texte et les boutons, lime `#D7F08A` pour les flèches et les mises en avant. Comme dans l'appli, les couleurs pop (soleil, fraise, feuille, myrtille…) sont réservées aux illustrations, aux icônes et aux récompenses.
- **Les polices** : Fredoka, arrondie, pour les titres et les boutons ; Nunito pour le texte.
- **Les boutons** : la pilule vert foncé de l'appli, avec la flèche dans un rond lime.
- **L'icône du site** : la tête de Gari sur le soleil jaune (`favicon.svg`, dessinée par `outils/dessiner-gari.py`) ; `apple-touch-icon.png` en est la version carrée de 180 px.
- **Les icônes** : les 21 icônes de l'appli (tuile pastel et glyphe pop), réunies en haut de `index.html` (symboles `p-…`).
- **Gari** : la mascotte « pop » de l'appli, sans contour, devant le soleil de l'écran d'accueil. Elle a du relief : elle s'incline en 3D vers ce qu'elle regarde, et son visage, ses feuilles et ses graines se décalent chacun à leur profondeur, comme une tête qui tourne. Elle regarde la souris (sur téléphone, elle jette un coup d'œil ailleurs de temps en temps), salue quand on s'approche, respire et cligne des yeux. Quand on la touche, elle saute de joie ou part en fou rire, en alternance, avec une bulle. On peut aussi la tirer (à l'horizontale sur téléphone, pour que la page défile toujours) : elle s'étire, l'air surpris, puis revient comme un ressort. Les textes des bulles sont dans `T` (`hello`, `hop`, `giggle`, `boing`), dans `main.js`. Ailleurs, ses attitudes fixes : chef (démo), hourra (fin de la démo), réfléchit (questions, page 404), coucou (fiche « Je commence »). Pour modifier la Gari animée : `outils/dessiner-gari.py`.
- **Le haut de page** : le soleil jaune de l'écran d'accueil de l'appli, avec Gari seule au centre, et les boutons « Créer mon compte » et « J’ai déjà un compte ».
- **Les sections** : (01) le principe, (02) l'appli en trois écrans, (03) la démo, (04) la sécurité, (05) les tarifs, (06) les questions, puis la fiche « Je commence ». Sur mobile, les écrans de l'appli défilent à l'horizontale.
- **Les boutons vers l'appli** : « Créer mon compte » dans la barre, le haut de page, les deux offres et la fiche « Je commence » ; « Tester avec mon enfant » après la démo ; « J’ai déjà un compte » dans le haut de page et la fiche. La box n'est pas encore en vente : son bouton « Nous écrire » ouvre un e-mail à l'équipe.

## Le site en ligne (Vercel)

### La mesure d'audience (PostHog, POP-152)

La landing utilise PostHog, le même projet que l'appli (POP-124 du dépôt `popote-app`), avec les mêmes réglages : région UE (Francfort), sans cookie (donc sans consentement à demander), pas de profil de personne, seulement les pages vues (pas de capture automatique des clics, pas d'enregistrement de session), adresses sans paramètres, et rien si le navigateur demande à ne pas être pisté. Les réglages sont en haut de `assets/js/main.js` (`CONFIG.analytics`) ; le « project token » qui y figure est public, l'appli l'envoie aussi à chaque visiteur.

La mesure ne part que du site en ligne (`popoteduo.app`) : rien en local ni sur les préversions Vercel. C'est le navigateur qui envoie directement à PostHog, donc les pays sont justes. Vercel Web Analytics n'est plus utilisé : sous `popoteduo.app/bienvenue`, il ne se chargeait plus (Vercel ne le sert qu'à `/_vercel/insights`, et à travers le relais de l'appli les pays auraient été faux). Il peut être désactivé dans le projet Vercel (onglet **Analytics**).

Dans PostHog, les pages de la landing sont celles dont le chemin commence par `/bienvenue` ; on suit dans le même outil le passage de la landing à la création de compte.

### Le bandeau « pas de cookie » (POP-147)

La mesure se passe de cookie et de consentement (CNIL) : le bandeau ne demande donc pas d'accord. Ses objectifs :

- **la confiance des parents** : sur un site pour les familles, dire tout de suite qu'il n'y a pas de cookie, avec Gari et son cookie (`assets/img/gari/cookie.svg`) ;
- **la transparence** : ce qui est compté, en une phrase, et un lien vers la politique de confidentialité ;
- **un refus en un geste** : « Refuser » arrête la mesure sur cet appareil, PostHog compris s'il est déjà chargé ;
- **ne pas gêner la lecture** : une petite carte en bas de l'écran, sans voile ni prise du focus, affichée une seule fois.

Le choix (« oui » ou « non ») est gardé dans le stockage local (`popote-mesure`), comme la langue : ce n'est pas un traceur. Le lien « Mesure d'audience » du pied de page rouvre le bandeau. Le code est dans `initMesure` (`assets/js/main.js`), le style sous « Bandeau « pas de cookie » » dans `style.css`.

### Le pare-feu (Vercel Firewall)

- La règle qui limitait `/api/inscription` à 5 envois par minute ne sert plus : elle peut être supprimée (Firewall → Rules).
- La protection contre les robots (Firewall → Bot Management) est en mode « observer » : elle note le trafic suspect sans bloquer, pour ne pas gêner les aperçus de lien de WhatsApp ou Instagram. En cas d'abus, la passer en « Challenge ».
- En cas d'attaque, **Firewall → Attack Challenge Mode** fait passer un test à tous les visiteurs, d'un clic.

### Mettre à jour le site

Le projet Vercel est relié au dépôt GitHub PopoteDuo/PopoteDuo_Landing-page : chaque envoi (push) sur la branche `main` met le site à jour tout seul. Il répond sur https://popote-duo.vercel.app.

**Le site est servi sous `/bienvenue` (POP-150)** : depuis POP-148, `popoteduo.app` est l'adresse de l'appli, et l'appli relaie ce site sous https://popoteduo.app/bienvenue. Pour que tout marche sous ce chemin :

- les fichiers restent à la racine du dépôt, et `vercel.json` les sert aussi sous `/bienvenue` (réécriture de `/bienvenue/:path*` vers `/:path*`) ;
- toutes les adresses internes des pages sont absolues et commencent par `/bienvenue/` (styles, polices, images, script, pages légales, version anglaise), en adresses propres, sans `.html` : une redirection de Vercel vers une adresse en `.html` sortirait du chemin ;
- le choix de la langue mène à `/bienvenue/en` et `/bienvenue` ;
- la mesure d'audience passe par `/bienvenue/_vercel/insights` ;
- les adresses complètes (canonique, partage, `hreflang`, données structurées, `sitemap.xml`) sont en `https://popoteduo.app/bienvenue…`.

Le projet Vercel n'a plus besoin du domaine `popoteduo.app`. Pour vérifier une préversion, ouvrir son adresse suivie de `/bienvenue`.

Les boutons « Se connecter », « Créer mon compte » et « J’ai déjà un compte » mènent à l’appli, https://popoteduo.app (`/connexion` et `/compte`). Depuis la bascule de POP-148, ces adresses sont servies par l'appli : elles n'arrivent plus chez Vercel (les redirections temporaires de POP-151 ont été retirées, POP-177). Ils sont en dur dans `index.html` ; la version anglaise les reprend par `outils/version-anglaise.py`.

Avant d'envoyer, augmenter le numéro de version (`?v=…`) de `style.css` et `main.js` dans `index.html` (et de `style.css` dans les pages légales et la 404), sinon les visiteurs gardent l'ancienne version en cache : ces fichiers sont gardés un an.

### Le reste

- **Champs jaunes** : compléter le responsable du traitement dans `politique-de-confidentialite.html`, et le responsable de la publication et l'école dans `mentions-legales.html`.
- **Usage commercial** : l'offre gratuite de Vercel est réservée aux projets non commerciaux. Elle convient pour la vitrine d'un projet d'école ; il faudra passer à l'offre Pro le jour où vous vendez.
- **Prix** : un bandeau rappelle que **pour l'instant, tout est gratuit, Premium compris** ; les tarifs s'appliqueront plus tard. Le Premium affiche **4,99 € par mois** (« ou 49,99 € par an »), avec la **première semaine offerte**. Les deux offres suivent le tableau gratuit / payant de l'équipe : en gratuit, 1 recette par mois parmi 6, la voix de Gari sur 1 ou 2 étapes, un profil enfant ; en Premium, toutes les recettes, la voix à chaque étape, plusieurs profils, le suivi détaillé, les recettes à télécharger et 10 € de réduction sur la box (29,90 € au lieu de 39,90 €). Le business plan prévoyait un pass découverte de 7 jours à 2,49 € : à aligner. La box affiche 39,90 € (page Kit de Notion, « proposé, à valider ») alors que le business plan parle de 30 € : à trancher. L'offre pro n'a pas de tarif pour l'instant.

## Voir la page en local

Les adresses de la page commencent toutes par `/bienvenue/` (POP-150) : il faut donc la servir sous ce chemin. Depuis le dossier qui contient ce dépôt :

```bash
mkdir -p /tmp/landing && ln -sfn "$PWD/PopoteDuo_Landing-page" /tmp/landing/bienvenue
cd /tmp/landing && python3 -m http.server 8000
```

puis http://localhost:8000/bienvenue (et http://localhost:8000/bienvenue/en). En local, Gari et la voix marchent, mais pas la mesure d'audience.

## Modifier les textes

Tous les textes sont dans `index.html`, sauf ceux qui changent pendant l'utilisation, qui sont dans `assets/js/main.js` :

- `STEPS` : les 4 étapes de la démo du cookie géant (consigne enfant, consigne parent, geste appris) ;
- `T` : les bulles de Gari et les textes de la démo.

## Le site en deux langues

Le site existe en français (`/`) et en anglais (`/en`). Le sélecteur FR / EN est dans la barre de navigation.

- **Au premier passage**, la page suit la langue du navigateur : un navigateur en français reste sur `/`, tous les autres vont sur `/en`.
- **Ensuite, le choix fait avec le sélecteur l'emporte** : il est retenu dans le navigateur du visiteur, et la page le respecte aux visites suivantes.
- Les robots des moteurs de recherche et des réseaux sociaux ne sont jamais redirigés : chacun voit la page demandée, et les liens `hreflang` leur indiquent l'autre langue.

**Pour modifier un texte**, changer d'abord la version française dans `index.html`, puis sa traduction dans `outils/version-anglaise.py` (chaque paire : le français à gauche, l'anglais à droite), et relancer :

```
python3 outils/version-anglaise.py
```

Si un texte français a changé sans que sa paire suive, le script s'arrête et indique lequel. Les textes de la démo qui changent en direct sont dans `assets/js/main.js` (`T` et `STEPS`, en français et en anglais). Les pages légales anglaises (`en/`) sont à tenir à jour à la main, en même temps que les françaises, y compris les champs jaunes à compléter.

Les images de partage (`og-image.png`, `og-image-en.png`) reprennent le haut de page : Gari devant son soleil, avec le titre de chaque langue.

## Les images

La démo du cookie géant vient de la fiche de l'équipe (Notion, carte « Landing page »). La section des recettes a été retirée le 20 novembre 2026 : elle pourra revenir quand les recettes auront leurs propres visuels.

**Illustrations** : Gari, les icônes, la carotte et les écrans de l'appli viennent de la DA de l'appli. Les écrans (`assets/img/appli/`) sont des captures des maquettes, en français.

**Photo** : la photo de la mère et sa fille en cuisine (`famille-cuisine.webp`, Vitaly Gariev, licence Unsplash), en attendant les photos des familles testeuses.

## La voix de Gari

Les consignes de la démo sont pré-enregistrées avec Piper, une synthèse vocale neuronale qui tourne sur votre ordinateur, et la voix française « siwis » (licence CC-BY 4.0, d'où la mention en bas de page). Le résultat est bien plus naturel que les voix du téléphone, et identique sur tous les appareils. Chaque fichier pèse 40 Ko environ et ne se charge qu'au premier appui sur « Écouter ».

En anglais, Gari parle avec la voix « LJ Speech » de Piper (domaine public), et ses fichiers sont dans `assets/audio/en/`.

Si les textes changent, modifier `CLIPS` (français) ou `CLIPS_EN` (anglais) dans `outils/generer-voix.py` (en écrivant les nombres en lettres), puis suivre les instructions en haut du fichier. Le texte affiché à l'écran est dans `STEPS`, dans `main.js`.

Pour l'appli, une voix encore plus expressive est possible avec un service payant (ElevenLabs, Azure) ou en enregistrant une vraie voix pour Gari.

## Performances

- Plus de 3D ni de Three.js : Gari est un dessin SVG de quelques Ko, écrit dans la page, et s'affiche tout de suite. La page entière (HTML, CSS, JS, polices) pèse moins de 200 Ko.
- Les deux polices sont hébergées sur le site, limitées aux caractères latins (30 et 39 Ko), et préchargées.
- Au repos, Gari respire en CSS (joué par la carte graphique) et le script dort : il ne se réveille que pour un clignement, un salut, un coup d'œil, ou quand on la touche, la tire ou bouge la souris. Le dessin n'est redessiné que pendant ces gestes, ce qui garde la page fluide, y compris sur Firefox. Les rayons du soleil sont fixes. Rien ne bouge quand le haut de page n'est pas à l'écran.
- Aucun mouvement n'est calé sur le scroll en JavaScript. Le manifeste se colore mot à mot grâce au navigateur lui-même (CSS `animation-timeline`) ; les navigateurs qui ne le savent pas l'affichent simplement en entier.
- Les apparitions au scroll (fondu et montée légère) ne jouent qu'une fois, en transform et opacité.
- Les écrans de l'appli et la photo se chargent seulement en approchant (`loading="lazy"`), avec leur taille réservée pour que la page ne saute pas.
- Avec le réglage « Réduire les animations » du téléphone, Gari ne bouge plus et change seulement d'expression, et les transitions sont coupées.
- Pour mesurer la fluidité sur un téléphone, ajouter `?fps` à l'adresse du site : un compteur affiche les images par seconde.

## Référencement

- **Ce qui est en place** : titre et description par langue, adresse canonique, liens `hreflang` entre `/bienvenue` et `/bienvenue/en`, `robots.txt`, `sitemap.xml` (les deux langues), images de partage, et des données structurées (`application/ld+json` en tête de page) qui décrivent l'organisation, le site, l'appli et les questions fréquentes. Les pages légales et la 404 sont exclues (`noindex`).
- **Les questions fréquentes** sont écrites deux fois : dans la page et dans les données structurées. Le texte doit rester identique aux deux endroits (le script de traduction les remplace ensemble).
- **Google** : créer une propriété dans Google Search Console (search.google.com/search-console) pour `https://popoteduo.app/` (une propriété « domaine » couvre aussi `/bienvenue`), puis envoyer le sitemap `https://popoteduo.app/bienvenue/sitemap.xml`.
- **Bing (et les moteurs qui s'en servent : DuckDuckGo, Ecosia, Qwant…)** : le site est signalé par IndexNow, avec la clé du fichier `*.txt` à la racine. Sous `/bienvenue`, cette clé doit aussi être servie à la racine de `popoteduo.app`, par l'appli (POP-148), tout comme `robots.txt` : les robots ne lisent que ceux de la racine du domaine. Bing Webmaster Tools peut aussi importer la propriété depuis Google Search Console.
- **Le nom de domaine** : le site est sur `popoteduo.app/bienvenue`. Si l’adresse change, il faut changer les adresses complètes en tête des pages, dans `sitemap.xml`, `robots.txt` et `outils/version-anglaise.py`. Les liens venant d'autres sites (école, réseaux, articles) aident beaucoup.

