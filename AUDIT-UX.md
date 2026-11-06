# Audit UI/UX de la landing page · 3 novembre 2026

Tailles testées : 320×568 (iPhone SE), 360×740, 375×667, 375×812, 390×844 (iPhone récent), 844×390 (téléphone à l'horizontale), 768×1024 (iPad portrait), 1024×768 (iPad paysage), 1280×720, 1440×900, 1920×1080.
À chaque taille, un script mesurait : la largeur de la page, les éléments qui dépassent de l'écran, les zones tactiles, la taille des textes et les chevauchements entre blocs. Une revue à l'œil a suivi, section par section.

## Corrigé

### Bloquant

| Problème | Où | Correction |
|---|---|---|
| La page faisait 393 px de large sur un écran de 360 ou 375 px. Tout était décalé et coupé à droite, ce qui donnait les centrages faux. | Tous les téléphones | La colonne de la démo ne pouvait pas rétrécir (le pied de la tablette forçait sa largeur). Toutes les grilles peuvent maintenant rétrécir, et le pied de la tablette s'adapte. |
| Pépin n'était pas centré entre « CUISINER » et « À DEUX » quand le hero est plus court que l'écran : il glissait déjà vers la section suivante au chargement. | Tablettes, grands téléphones | La transition ne démarre qu'au scroll. |
| Le titre, Pépin et le panneau de « Une recette, deux chefs » se chevauchaient sur les écrans courts. | 320×568, 375×667, paysage | La scène se range en colonne : titre, Pépin dans l'espace restant, panneau. Mise en page dédiée au téléphone à l'horizontale. |
| Les liens de la navbar faisaient traverser la scène 3D en une fraction de seconde, avec Pépin qui tournoyait. | Partout | Saut juste avant la cible puis glissement d'environ 0,4 s. Les mouvements de Pépin sont amortis. |
| Le carrousel allait deux fois plus vite sur un écran 120 Hz (MacBook, iPhone Pro). | Écrans 120 Hz | Ressort basé sur le temps, inertie au lancer (deux recettes au plus) et un geste de trackpad = une recette. |

### Gênant

| Problème | Où | Correction |
|---|---|---|
| La note « Appuyez sur Écouter » pointait dans le vide quand la tablette passait sous le texte. | Tablette, petit desktop | La note est posée au-dessus de la tablette, et le bouton « Écouter » pulse jusqu'au premier appui. |
| « CONSIGNE » débordait sur la tablette. | 980 à 1300 px | Taille du titre calée sur la colonne. |
| La tomate et la carotte mordaient sur les titres des offres, et « Le kit Pro » se coupait en trois lignes. | Toutes tailles | Illustrations plus petites sur mobile, placées au-dessus du titre. |
| Le Pépin du formulaire recouvrait le titre « Rejoindre la liste d'attente » et la frise. | Toutes tailles | Pépin assis sur le bord de la carte, plus d'espace au-dessus. |
| La note « Salut, moi c'est Pépin » chevauchait les lettres du titre (mobile) ou la carotte (desktop). | Mobile, tablette, desktop | Repositionnée à chaque taille. |
| Le titre du hero dépassait la hauteur de l'écran. | 1280×720, paysage | Taille limitée aussi par la hauteur d'écran. |
| Sur tablette, les cartes du bout de l'arc descendaient dans le nom de la recette. | 768 à 1100 px | Seules les cartes qui tiennent restent visibles. |
| L'inventaire des kits en deux colonnes cassait les libellés sur 3 ou 4 lignes. | Téléphones | Une colonne sous 480 px. |
| « 250 G » en capitales dans la démo. | Partout | Unités en minuscules (250 g, 50 cl). |
| En-tête des recettes aligné à gauche au-dessus d'un carrousel centré. | Mobile, tablette | En-tête centré sous 900 px. |
| Zones tactiles un peu justes (logo, bouton « Écouter »). | Mobile | 44 px et 40 px de haut. |

### 3D

Nouvel éclairage de studio et rendu filmique. Les matières sont retravaillées :
- dégradé du radis jusqu'à la racine blanche, micro-relief de peau et lumière qui traverse les bords ;
- feuilles nervurées et ondulées ;
- reflets dans les yeux, et pupilles qui suivent le curseur ;
- joues diffuses, légère respiration ;
- brume de profondeur et poussières lumineuses ;
- légumes retravaillés : sillons de la carotte, pores du citron, coquille de l'œuf.

## Deuxième passe : vitesse, voix, conformité

- **Affichage** : le texte s'affiche avant la 3D. Three.js se charge après la page, et les vignettes des légumes sont rendues une par une quand on approche des sections concernées. Le plus long blocage du fil principal passe de 332 ms à 87 ms (mesuré en local).
- **Fluidité** : la résolution de la 3D baisse toute seule sur les appareils lents. Les sections du bas ne sont calculées qu'à l'approche (`content-visibility`), et Netlify met les fichiers en cache un an (`_headers`).
- **Voix** : des consignes pré-enregistrées avec une synthèse neuronale (Piper, voix « siwis ») sur un ton chaleureux, au lieu de la voix robotique du téléphone. Si un fichier ne se lit pas, la page prend la voix la plus naturelle de l'appareil.
- **Conformité** : « Les allergies dans le profil » contredisait votre checklist RGPD (une allergie est une donnée de santé). C'est remplacé par « Des goûts, pas de données de santé ». La liste d'attente passe sur Supabase en région Paris. La mesure d'audience est sans cookie. La page de politique de confidentialité est en ligne.

## Troisième passe : une direction plus épurée

- **Visuel** : fond crème, un seul vert profond et des panneaux sauge, comme les fiches recettes de l'équipe. Titres en minuscules et plus petits, plus de police manuscrite, plus de grands aplats verts ou roses. Pépin passe sur fond clair, devant un disque sauge, avec quatre ingrédients au lieu de six. Une seule section sombre : l'inscription.
- **Contenu réel** : les trois recettes de Notion (verrines banane-spéculoos, cookie géant, rougail saucisses) remplacent le carrousel d'exemples. Chaque carte montre « qui fait quoi » sur une étape. La démo suit maintenant le cookie géant, avec sa voix régénérée.
- **Tarifs** : l'appli d'abord (Gratuit à 0 €, Premium à 5 € par mois avec la première semaine offerte), puis la box à part, présentée comme « achat unique, sans abonnement » et facultative.
- **Inscription** : un bouton vers le formulaire dans la navbar, le hero, la démo, les recettes, chaque offre et la box. Sur mobile, le formulaire arrive juste sous le titre de la section : il est visible dès l'arrivée.
- **Texte de la bêta** : « Devenez famille testeuse », avec ce que la famille y gagne (gratuit, sans engagement, sur iPhone, iPad ou Android, inscrits contactés en premier).
- **Autres tailles** : sur un téléphone à l'horizontale, le hero passe en deux colonnes pour garder le titre et le bouton visibles ; sur tablette, Pépin est plus grand. Les pointillés de l'histoire n'apparaissent qu'une fois Pépin arrivé.
- **Hébergement** : prêt pour GitHub Pages (`.nojekyll`) ou Netlify ; la mesure d'audience passe par défaut sur Umami Cloud, gratuit.

## Quatrième passe : retour aux références

- **Couleurs et rythme** : la base crème et vert sauge faisait trop « modèle par défaut ». La page est maintenant blanche, découpée en blocs arrondis encadrés, avec un seul univers de couleur tiré de Kumo : vert profond, crème, menthe de la marque.
- **Hero** : composition Kumo, avec Pépin au centre, les ingrédients sur des cartes crème inclinées autour de lui et le titre en bas. Les cartes s'écartent quand Pépin part vers l'histoire.
- **Ingrédients** : l'œuf, illisible, est retiré. La carotte est refaite (plus épaisse, orange franc, sillons irréguliers, fanes fournies). La banane et le cookie ont des teintes plus franches, et chaque ingrédient remplit mieux sa carte.
- **Tarifs** : le Premium passe sur une carte vert profond, l'offre gratuite et la box restent sur blanc. La différence saute aux yeux.
- **Corrigé au passage** : sur mobile, les cartes qui s'écartaient élargissaient la page à 420 px pendant le scroll. Elles sont maintenant contenues dans le hero.

## Cinquième passe : contenu réel, parcours plus court, finitions

- **Contenu réel** : photos libres de droits des trois plats (licence Unsplash), une photo d'une mère et sa fille en cuisine dans la partie sécurité, une ligne « Qui on est » près du formulaire. Les photos sont signalées comme photos d'illustration.
- **Parcours plus court** : l'histoire au scroll passe de quatre à deux messages (sans couteau, carnet de gestes), soit environ 1,8 écran sur mobile au lieu de 2,4. Le concept « deux consignes » n'est plus répété avant la démo.
- **Cartes du hero utiles** : chacune mène à sa recette, avec une info-bulle au survol et une petite flèche pour signaler qu'on peut toucher. Sur mobile, la bonne carte de recette est ramenée à l'écran et s'illumine.
- **Contrastes** : les petits textes vert clair (« Enfant », « En option ») passent dans un vert plus foncé, au-dessus du seuil AA.
- **Images fixes** : les ingrédients et Pépin en 3D sont servis en WebP de 7 à 13 Ko. Ils apparaissent tout de suite, sans calcul sur le téléphone.
- **Tarifs** : bandeau « Pendant la bêta, tout est gratuit, Premium compris », et « facturé 59,99 € par an » en clair sous le prix mensuel.
- **Mentions légales** : nouvelle page (éditeur, hébergeur, propriété des contenus, crédits), liée en pied de page.
- **Finitions** : arrondis ramenés à trois valeurs, démo sans cadre de tablette sur mobile, titre de l'inscription plus grand, un point rouge radis dans les pastilles « bêta », image de partage refaite.

## Sixième passe : Pépin fluide sur mobile

- **Cause principale** : le canvas 3D était fixe et recalé en JavaScript à chaque image. Sur mobile, la page défile sans attendre le JavaScript, donc Pépin prenait une image de retard sur le reste et semblait saccader. Le canvas vit maintenant dans le bloc collant de l'histoire et défile avec la page.
- **Moins de pixels** : le canvas ne couvre plus que Pépin (327 × 499 px au lieu de 375 × 812 sur un téléphone), avec une résolution plafonnée à 1,75 sur écran tactile.
- **Plus de recalculs forcés** : la boucle lisait et modifiait la page en alternance (jusqu'à cinq recalculs de mise en page par image dans l'histoire). Elle lit maintenant une seule fois, puis écrit.
- **Effets allégés** : plus de flou d'arrière-plan sur les éléments posés sur le vert uni, navigation opaque et sans grain sur mobile.
- **Au passage** : la ligne de démarcation visible entre le haut de page et l'histoire a disparu.
- **Deuxième correction, après un test sur téléphone** : le passage du hero à l'histoire suivait encore le scroll pixel par pixel (et dès le premier pixel sur mobile), avec un amorti qui faisait traîner Pépin d'environ 0,2 s. Il devient un bond animé de 0,9 s, déclenché quand l'histoire atteint la moitié de l'écran. Les cartes s'envolent en transition CSS, la qualité 3D s'allège par paliers si le téléphone peine, et la boucle n'écrit plus dans la page que ce qui change.
- **À vérifier sur un vrai téléphone** : les tests ont été faits dans un navigateur d'ordinateur en format mobile, pas sur un appareil réel.

## À décider ou à faire

1. **Prix du Premium** : la page affiche 5 € par mois (59,99 € par an divisés par 12) et la première semaine offerte. Le business plan prévoyait un pass de 7 jours à 2,49 €, et la page « Dimensionner le marché » propose de tester 29,99 ou 39,99 € par an : à aligner.
2. **Prix de la box** : 39,90 € TTC est affiché, mais Notion le marque encore « prix proposé, à valider ». Le business plan parle de 30 € pour le kit classique : à trancher avant la mise en ligne.
3. **Champs jaunes** : la politique de confidentialité (responsable, e-mail, hébergeur) et les mentions légales (responsable de la publication, école, contact, hébergeur).
4. **Mise en service** : créer le projet Supabase (Paris) et le compte Umami, puis remplir `CONFIG`.
5. **Vos propres photos** : remplacer les photos d'illustration par celles de vos plats dès qu'elles existent (même nom de fichier, 760 × 608 px). Pendant la bêta, ajouter une ou deux phrases de parents testeurs.
6. **Pas de menu sur mobile** : sous 860 px, la navbar ne garde que le logo et « Rejoindre la bêta ». C'est un choix volontaire pour pousser l'inscription.
