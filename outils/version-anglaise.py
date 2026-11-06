# Fabrique la version anglaise de l'accueil (en/index.html) à partir de la page française.
#
# À relancer après chaque modification de index.html :
#     python3 outils/version-anglaise.py
#
# Chaque texte français est remplacé par sa traduction. Si un texte français a changé
# et n'est plus trouvé, le script s'arrête et dit lequel : il suffit alors de mettre à
# jour la paire correspondante ci-dessous (à gauche le français, à droite l'anglais).
# Les textes de la démo et du formulaire qui changent en direct sont dans assets/js/main.js (objet T et STEPS).
import pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent

# Réglages de la page : langue, adresses et sélecteur de langue.
PAGE = [
    ('<html lang="fr">', '<html lang="en">'),
    ("<script>/* Langue : celle du navigateur au premier passage, puis celle choisie avec le sélecteur FR / EN. Les robots restent sur la page demandée. */",
     "<script>/* Language: the browser's on the first visit, then the one picked with the FR / EN switch. Bots stay on the page they asked for. */"),
    ("if((c||(b.indexOf('fr')===0?'fr':'en'))==='en')location.replace('/en'+location.search+location.hash)",
     "if((c||(b.indexOf('fr')===0?'fr':'en'))==='fr')location.replace('/'+location.search+location.hash)"),
    ('<!-- Partage sur les réseaux : adresses complètes, à changer si le site passe sur un nom de domaine -->',
     '<!-- Partage sur les réseaux : adresses complètes, à changer si le site passe sur un nom de domaine (page générée par outils/version-anglaise.py) -->'),
    ('<link rel="canonical" href="https://popote-duo.vercel.app/">', '<link rel="canonical" href="https://popote-duo.vercel.app/en">'),
    ('<meta property="og:url" content="https://popote-duo.vercel.app/">', '<meta property="og:url" content="https://popote-duo.vercel.app/en">'),
    ('<meta property="og:locale" content="fr_FR">', '<meta property="og:locale" content="en_GB">\n<meta property="og:locale:alternate" content="fr_FR">'),
    ('og-image.png', 'og-image-en.png'),
    ('<div class="lang" role="group" aria-label="Langue"><span class="on" aria-current="true">FR</span><a href="/en" hreflang="en" lang="en" data-lang="en" title="English version">EN</a></div>',
     '<div class="lang" role="group" aria-label="Language"><a href="/" hreflang="fr" lang="fr" data-lang="fr" title="Version française">FR</a><span class="on" aria-current="true">EN</span></div>'),
    ('href="politique-de-confidentialite.html"', 'href="/en/privacy.html"'),
    ('href="mentions-legales.html"', 'href="/en/legal-notice.html"'),
]

TEXT = [
    # En-tête
    ('<title>Popote Duo · L’appli pour cuisiner à deux, parent et enfant</title>', '<title>Popote Duo · The app for cooking together, parent and child</title>'),
    ('content="Popote Duo, l’appli de cuisine où l’enfant et le parent ont chacun leur consigne sur le même écran, dès 4 ans. Rejoignez la bêta gratuite de février 2027."',
     'content="Popote Duo is the cooking app where the child and the parent each get their own instructions on the same screen, from age 4. Join the free beta in February 2027."'),
    ('content="Popote Duo · Cuisiner à deux"', 'content="Popote Duo · Cooking together"'),
    ('content="Une consigne pour l’enfant, une autre pour le parent, sur le même écran. Rejoignez la bêta gratuite en famille."',
     'content="One set of instructions for the child, another for the parent, on the same screen. Join the free family beta."'),
    # Navigation
    ('aria-label="Popote Duo, retour en haut"', 'aria-label="Popote Duo, back to top"'),
    ('<li><a href="#story">L’appli</a></li>', '<li><a href="#story">The app</a></li>'),
    ('<li><a href="#mode-cuisine">Démo</a></li>', '<li><a href="#mode-cuisine">Demo</a></li>'),
    ('<li><a href="#recettes">Recettes</a></li>', '<li><a href="#recettes">Recipes</a></li>'),
    ('<li><a href="#tarifs">Tarifs</a></li>', '<li><a href="#tarifs">Pricing</a></li>'),
    ('data-track="nav">Rejoindre la bêta</a>', 'data-track="nav">Join the beta</a>'),
    # Accueil
    ('title="Popote aime les câlins"', 'title="Popote loves cuddles"'),
    ('aria-label="Les recettes de la bêta"', 'aria-label="The beta recipes"'),
    ('<b>Rougail saucisses</b>Plat · 1 h', '<b>Sausage rougail</b>Main · 1 hr'),
    ('<span class="sr">Voir la recette du rougail saucisses</span>', '<span class="sr">See the sausage rougail recipe</span>'),
    ('<b>D’autres recettes arrivent</b>6 à 8 pour la bêta', '<b>More recipes on the way</b>6 to 8 for the beta'),
    ('<span class="sr">Voir les recettes</span>', '<span class="sr">See the recipes</span>'),
    ('<b>Verrines banane-spéculoos</b>Sans cuisson · 10 min', '<b>Banana and Biscoff pots</b>No bake · 10 min'),
    ('<span class="sr">Voir la recette des verrines banane-spéculoos</span>', '<span class="sr">See the banana and Biscoff pots recipe</span>'),
    ('<b>Cookie géant</b>Goûter · 35 min', '<b>Giant cookie</b>Snack · 35 min'),
    ('<span class="sr">Voir la recette du cookie géant</span>', '<span class="sr">See the giant cookie recipe</span>'),
    ('<span class="dot"></span>Bêta gratuite en février 2027</p>', '<span class="dot"></span>Free beta in February 2027</p>'),
    ('<h1 class="h1">Cuisiner à deux, chacun sa consigne</h1>', '<h1 class="h1">Cook together, one task each</h1>'),
    ('Popote Duo partage l’écran en deux&nbsp;: une mission pour l’enfant, une pour le parent. Vous cuisinez ensemble, chacun à sa place, dès 4&nbsp;ans.',
     'Popote Duo splits the screen in two: one task for the child, one for the parent. You cook together, each in your own role, from age&nbsp;4.'),
    ('data-track="hero">Rejoindre la bêta', 'data-track="hero">Join the beta'),
    ('<a class="btn btn-glass" href="#mode-cuisine">Voir la démo</a>', '<a class="btn btn-glass" href="#mode-cuisine">See the demo</a>'),
    # Comment ça marche
    ('aria-label="Comment ça marche"', 'aria-label="How it works"'),
    ('<p class="kicker">Comment ça marche</p>', '<p class="kicker">How it works</p>'),
    ('<h2 class="h2 story-title">Des gestes à leur taille</h2>', '<h2 class="h2 story-title">Skills sized for small hands</h2>'),
    ('</span>Sans couteau</button>', '</span>No knives</button>'),
    ('</span>Carnet de gestes</button>', '</span>Skills book</button>'),
    ('<h3>Un filtre « sans couteau »</h3><p>Dès 4 ans, des recettes et des missions sans lame ni flamme. Les gestes plus délicats arrivent avec l’âge.</p>',
     '<h3>A “no knives” filter</h3><p>From age 4, recipes and tasks with no blades and no flames. Trickier skills come with age.</p>'),
    ('<h3>Un carnet de gestes</h3><p>Peser, casser un œuf, fouetter&nbsp;: chaque geste validé par le parent rejoint le carnet et gagne un badge.</p>',
     '<h3>A skills book</h3><p>Weighing, cracking an egg, whisking: every skill the parent signs off goes into the book and earns a badge.</p>'),
    # Démo
    ('<h2 class="h2">Chacun sa consigne, sur le même écran</h2>', '<h2 class="h2">Each their own task, on the same screen</h2>'),
    ('À chaque étape, l’enfant reçoit une mission à sa taille pendant que le parent s’occupe du four, du feu et du couteau. Essayez avec le cookie géant&nbsp;: passez les étapes et écoutez Popote.',
     'At every step, the child gets a task their size while the parent handles the oven, the hob and the knife. Try it with the giant cookie: go through the steps and listen to Popote.'),
    ('<b>Gestes appris&nbsp;:</b> peser, mélanger, incorporer, mettre la table.', '<b>Skills learned:</b> weighing, mixing, folding in, setting the table.'),
    ('data-track="demo">Tester avec mon enfant', 'data-track="demo">Try it with my child'),
    ('Touchez « Écouter » pour entendre Popote', 'Tap “Listen” to hear Popote'),
    ('aria-label="Démonstration du mode cuisine"', 'aria-label="Cooking mode demo"'),
    ('Cookie géant<small>8 parts · 10 min + 25 min de cuisson</small>', 'Giant cookie<small>Serves 8 · 10 min + 25 min baking</small>'),
    ('aria-live="polite">Étape 1 sur 4</div>', 'aria-live="polite">Step 1 of 4</div>'),
    ('</span>Pour Lou, 6 ans</div>', '</span>For Lou, age 6</div>'),
    ('id="tsKidText">Aide à peser les ingrédients&nbsp;: 180 g de sucre roux, puis 180 g de farine.</p>',
     'id="tsKidText">Help weigh the ingredients: 180 g of brown sugar, then 180 g of flour.</p>'),
    ('<span>Geste&nbsp;: peser</span>', '<span>Skill: weighing</span>'),
    ('<span>Écouter</span></button>', '<span>Listen</span></button>'),
    ('</svg>Pendant ce temps, côté parent</span>', '</svg>Meanwhile, for the parent</span>'),
    ('<p id="tsParent">Préchauffer le four à 180 °C et tapisser le moule de papier cuisson.</p>', '<p id="tsParent">Preheat the oven to 180 °C and line the tin with baking paper.</p>'),
    ('</svg>Four, réservé à l’adulte</span>', '</svg>Oven, grown-ups only</span>'),
    ('<span class="done-title">Bravo Lou&nbsp;!</span>', '<span class="done-title">Well done, Lou!</span>'),
    ('<span>Écouter Popote</span>', '<span>Listen to Popote</span>'),
    ('<p>Le cookie est prêt. Validez les gestes réussis pour remplir le carnet&nbsp;:</p>', '<p>The cookie is ready. Tick the skills your child managed to fill in the book:</p>'),
    ('</span>Peser</button>', '</span>Weighing</button>'),
    ('</span>Mélanger</button>', '</span>Mixing</button>'),
    ('</span>Incorporer</button>', '</span>Folding in</button>'),
    ('</span>Mettre la table</button>', '</span>Setting the table</button>'),
    ('id="tsRestart">Recommencer la recette</button>', 'id="tsRestart">Start the recipe again</button>'),
    ('aria-label="Étape précédente"', 'aria-label="Previous step"'),
    ('id="tsNext">Étape suivante<svg>', 'id="tsNext">Next step<svg>'),
    # Recettes
    ('<h2 class="h2">Des recettes de tous les jours</h2>', '<h2 class="h2">Everyday recipes</h2>'),
    ('Chaque fiche dit qui fait quoi&nbsp;: les gestes sûrs pour l’enfant, le four, le feu et le couteau pour le parent. Voici les trois premières.',
     'Each recipe card says who does what: safe skills for the child, the oven, the hob and the knife for the parent. Here are the first three.'),
    ('alt="Des verrines en couches, crème et miettes de biscuit"', 'alt="Layered dessert pots with cream and biscuit crumbs"'),
    ('<span class="rc-tag">Sans cuisson</span>', '<span class="rc-tag">No bake</span>'),
    ('<h3>Verrines banane-spéculoos</h3>', '<h3>Banana and Biscoff pots</h3>'),
    ('<p class="rc-meta">2 verrines · 10 min</p>', '<p class="rc-meta">Makes 2 · 10 min</p>'),
    ('aria-label="Première étape">\n            <li><span class="who kid">Enfant</span>écrase les spéculoos avec les mains</li>\n            <li><span class="who">Parent</span>les glisse d’abord dans un sachet fermé</li>',
     'aria-label="First step">\n            <li><span class="who kid">Child</span>crushes the Biscoff biscuits by hand</li>\n            <li><span class="who">Parent</span>puts them in a sealed bag first</li>'),
    ('alt="Un cookie géant aux pépites de chocolat, cuit dans un plat rond"', 'alt="A giant chocolate chip cookie baked in a round dish"'),
    ('<span class="rc-tag">Goûter</span>', '<span class="rc-tag">Snack</span>'),
    ('<h3>Cookie géant</h3>', '<h3>Giant cookie</h3>'),
    ('<p class="rc-meta">8 parts · 10 min + 25 min de cuisson</p>', '<p class="rc-meta">Serves 8 · 10 min + 25 min baking</p>'),
    ('aria-label="Deuxième étape">\n            <li><span class="who kid">Enfant</span>mélange le beurre mou et le sucre</li>\n            <li><span class="who">Parent</span>casse l’œuf et ajoute la vanille</li>',
     'aria-label="Second step">\n            <li><span class="who kid">Child</span>mixes the soft butter and the sugar</li>\n            <li><span class="who">Parent</span>cracks the egg and adds the vanilla</li>'),
    ('alt="Des rondelles de saucisse en sauce, servies sur du riz"', 'alt="Sliced sausages in sauce, served over rice"'),
    ('<span class="rc-tag">Plat</span>', '<span class="rc-tag">Main</span>'),
    ('<h3>Rougail saucisses</h3>', '<h3>Sausage rougail</h3>'),
    ('<p class="rc-meta">4 personnes · 20 min + 40 min de cuisson</p>', '<p class="rc-meta">Serves 4 · 20 min + 40 min cooking</p>'),
    ('aria-label="Première étape">\n            <li><span class="who kid">Enfant</span>lave les tomates et compte les ingrédients</li>\n            <li><span class="who">Parent</span>émince les oignons et coupe les tomates</li>',
     'aria-label="First step">\n            <li><span class="who kid">Child</span>washes the tomatoes and counts the ingredients</li>\n            <li><span class="who">Parent</span>slices the onions and chops the tomatoes</li>'),
    ('<p>Six à huit recettes pour la bêta, une quinzaine à la sortie de l’appli.<br><small>Photos d’illustration, en attendant celles de nos propres plats.</small></p>',
     '<p>Six to eight recipes for the beta, around fifteen when the app launches.<br><small>Stock photos, until we have pictures of our own dishes.</small></p>'),
    ('data-track="recettes">Les cuisiner en avant-première', 'data-track="recettes">Cook them before anyone else'),
    # Confiance
    ('<h2 class="h2" id="trust-title">Pensé pour les parents prudents</h2>', '<h2 class="h2" id="trust-title">Built for careful parents</h2>'),
    ('Un code parent, des recettes relues, aucune donnée de santé&nbsp;: vous gardez la main sur tout.', 'A parent code, checked recipes, no health data: you stay in control of everything.'),
    ('alt="Une mère et sa fille découpent des biscuits ensemble dans la cuisine"', 'alt="A mother and her daughter cutting out biscuits together in the kitchen"'),
    ('<figcaption>À hauteur d’enfant, sans lame ni flamme</figcaption>', '<figcaption>At a child’s height, with no blades and no flames</figcaption>'),
    ('<b>Un code parent</b><span>Les réglages et la validation des gestes passent par un code que l’enfant ne connaît pas.</span>',
     '<b>A parent code</b><span>Settings and signing off skills sit behind a code your child doesn’t know.</span>'),
    ('<b>Des recettes relues</b><span>Chaque recette est relue pour l’âge et la sécurité avant d’entrer dans l’appli.</span>',
     '<b>Checked recipes</b><span>Every recipe is checked for age and safety before it goes into the app.</span>'),
    ('<b>Des goûts, pas de données de santé</b><span>Le profil retient les aliments que l’enfant aime, goûte ou refuse. Aucune allergie n’est enregistrée&nbsp;: vérifiez les allergènes de chaque recette.</span>',
     '<b>Tastes, not health data</b><span>The profile remembers the foods your child likes, tries or refuses. No allergies are stored: check the allergens in each recipe.</span>'),
    ('<b>Vos données, votre choix</b><span>Export et suppression depuis les réglages. Ni pub ni outil de mesure côté enfant, et des données hébergées dans l’Union européenne.</span>',
     '<b>Your data, your choice</b><span>Export and delete it from the settings. No ads and no tracking on the child’s side, and data hosted in the European Union.</span>'),
    # Tarifs
    ('<h2 class="h2">Gratuit pour commencer</h2>', '<h2 class="h2">Free to start</h2>'),
    ('L’appli est gratuite avec six recettes, et le Premium ouvre tout le reste. La box est à part&nbsp;: un achat unique, si vous voulez le matériel.',
     'The app is free with six recipes, and Premium unlocks everything else. The box is separate: a one-off purchase, if you want the kit.'),
    ('<b>Pendant la bêta, tout est gratuit, Premium compris.</b> Les tarifs ci-dessous s’appliqueront à la sortie de l’appli.',
     '<b>During the beta, everything is free, Premium included.</b> The prices below will apply once the app launches.'),
    ('<h3 class="plan-name">Gratuit</h3>', '<h3 class="plan-name">Free</h3>'),
    ('<p class="amount"><b>0&nbsp;€</b></p>', '<p class="amount"><b>€0</b></p>'),
    ('<p class="plan-note">Pour découvrir l’appli à votre rythme.</p>', '<p class="plan-note">To discover the app at your own pace.</p>'),
    ('</svg>6 recettes en double consigne</li>', '</svg>6 recipes with two sets of instructions</li>'),
    ('</svg>Le mode cuisine avec la voix de Popote</li>', '</svg>Cooking mode with Popote’s voice</li>'),
    ('</svg>Un profil enfant</li>', '</svg>One child profile</li>'),
    ('data-track="tarif-gratuit">Rejoindre la bêta', 'data-track="tarif-gratuit">Join the beta'),
    ('<span class="badge">Première semaine offerte</span>', '<span class="badge">First week free</span>'),
    ('<p class="amount"><b>5&nbsp;€</b><span>par mois</span></p>', '<p class="amount"><b>€5</b><span>per month</span></p>'),
    ('<p class="plan-note"><b>Facturé 59,99&nbsp;€ par an</b>, après 7&nbsp;jours d’essai gratuit.</p>', '<p class="plan-note"><b>Billed €59.99 a year</b>, after a 7-day free trial.</p>'),
    ('</svg>Toutes les recettes</li>', '</svg>Every recipe</li>'),
    ('</svg>Le parcours de progression et le carnet de gestes</li>', '</svg>The progress path and the skills book</li>'),
    ('</svg>Les défis de saison</li>', '</svg>Seasonal challenges</li>'),
    ('</svg>Plusieurs profils d’enfants</li>', '</svg>Several child profiles</li>'),
    ('data-track="tarif-premium">Tester le Premium gratuitement', 'data-track="tarif-premium">Try Premium for free'),
    ('<p class="plan-fine">Gratuit pendant toute la bêta. À la sortie, annulez pendant l’essai et vous ne payez rien.</p>',
     '<p class="plan-fine">Free for the whole beta. After launch, cancel during the trial and you pay nothing.</p>'),
    ('<p class="addon-tag">En option · achat unique, sans abonnement</p>', '<p class="addon-tag">Optional · one-off purchase, no subscription</p>'),
    ('<h3>La box Popote Duo</h3>', '<h3>The Popote Duo box</h3>'),
    ('Le matériel à la taille des enfants&nbsp;: tablier, petit fouet, spatule souple, saladier, verre doseur et fiches d’activités. L’appli fonctionne très bien sans.',
     'Child-sized kitchen kit: apron, small whisk, soft spatula, mixing bowl, measuring jug and activity cards. The app works perfectly well without it.'),
    ('<p class="addon-price"><b>39,90&nbsp;€</b><small>une fois, livraison incluse</small></p>', '<p class="addon-price"><b>€39.90</b><small>one-off, delivery included</small></p>'),
    ('<p class="soon"><i></i>Précommande au printemps 2027</p>', '<p class="soon"><i></i>Pre-orders in spring 2027</p>'),
    ('data-track="box">Être prévenu', 'data-track="box">Let me know'),
    # Liste d'attente
    ('<span class="dot"></span>Bêta gratuite · février 2027</p>', '<span class="dot"></span>Free beta · February 2027</p>'),
    ('<h2 class="h2">Devenez famille testeuse</h2>', '<h2 class="h2">Become a tester family</h2>'),
    ('En février, une vingtaine de familles vont tester l’appli chez elles pendant trois semaines. C’est gratuit, et vos retours décident de ce qu’on améliore avant la sortie.',
     'In February, around twenty families will test the app at home for three weeks. It’s free, and your feedback decides what we improve before launch.'),
    ('</span>Gratuit et sans engagement</li>', '</span>Free, no strings attached</li>'),
    ('</span>Sur iPhone, iPad ou Android</li>', '</span>On iPhone, iPad or Android</li>'),
    ('</span>Les inscrits sont contactés en premier</li>', '</span>People on the list hear from us first</li>'),
    ('<b>Qui on est&nbsp;?</b> Une équipe de cinq étudiants qui construit Popote Duo dans le cadre de ses études, avec l’aide des familles testeuses.',
     '<b>Who are we?</b> A team of five students building Popote Duo as part of our studies, with help from tester families.'),
    ('<p class="join-note">Sortie prévue sur l’App Store et Google Play en juin 2027.</p>', '<p class="join-note">Launching on the App Store and Google Play in June 2027.</p>'),
    ('<label>Ne pas remplir <input', '<label>Leave empty <input'),
    ('<h3>Je m’inscris</h3>', '<h3>Sign me up</h3>'),
    ('<p class="sub">Trois questions, une minute.</p>', '<p class="sub">Three questions, one minute.</p>'),
    ('<label for="email">Votre e-mail</label>', '<label for="email">Your email</label>'),
    ('placeholder="prenom@exemple.fr"', 'placeholder="name@example.com"'),
    ('Ajoutez une adresse e-mail valide, par exemple prenom@exemple.fr.', 'Please enter a valid email address, for example name@example.com.'),
    ('<legend>Vous êtes</legend>', '<legend>You are</legend>'),
    ('<label for="role-parent">Parent</label>', '<label for="role-parent">A parent</label>'),
    ('<label for="role-pro">Pro de l’animation</label>', '<label for="role-pro">A childcare or youth worker</label>'),
    ('<legend>Âge des enfants</legend>', '<legend>Children’s ages</legend>'),
    ('<label for="age-4">4–5 ans</label>', '<label for="age-4">4–5</label>'),
    ('<label for="age-6">6–7 ans</label>', '<label for="age-6">6–7</label>'),
    ('<label for="age-8">8–10 ans</label>', '<label for="age-8">8–10</label>'),
    ('<label for="org">Nom de la structure</label>', '<label for="org">Organisation name</label>'),
    ('placeholder="Centre de loisirs des Tilleuls"', 'placeholder="Oak Tree Holiday Club"'),
    ('</span>Je veux bien tester la bêta en février 2027</label>', '</span>I’d like to test the beta in February 2027</label>'),
    ('type="submit">M’inscrire<svg>', 'type="submit">Sign me up<svg>'),
    ('L’inscription n’a pas abouti. Vérifiez votre connexion puis réessayez.', 'Sign-up didn’t go through. Check your connection and try again.'),
    ('On vous écrit uniquement au sujet de Popote Duo. Désinscription en un clic. <a href="/en/privacy.html">Politique de confidentialité</a>',
     'We only email you about Popote Duo. Unsubscribe in one click. <a href="/en/privacy.html">Privacy policy</a>'),
    ('<span class="done-title">C’est noté&nbsp;!</span>', '<span class="done-title">Got it!</span>'),
    ('<p id="joinOkText">Vous êtes sur la liste. On vous écrit dès que la bêta ouvre, en février.</p>', '<p id="joinOkText">You’re on the list. We’ll email you as soon as the beta opens in February.</p>'),
    ('id="joinAgain">Inscrire une autre adresse</button>', 'id="joinAgain">Add another address</button>'),
    # Pied de page
    ('<nav aria-label="Pied de page">', '<nav aria-label="Footer">'),
    ('<a href="#story">L’appli</a><a href="#mode-cuisine">Démo</a><a href="#recettes">Recettes</a><a href="#tarifs">Tarifs</a><a href="#liste">Bêta</a><a href="/en/privacy.html">Confidentialité</a><a href="/en/legal-notice.html">Mentions légales</a>',
     '<a href="#story">The app</a><a href="#mode-cuisine">Demo</a><a href="#recettes">Recipes</a><a href="#tarifs">Pricing</a><a href="#liste">Beta</a><a href="/en/privacy.html">Privacy</a><a href="/en/legal-notice.html">Legal notice</a>'),
    ('<p>© 2026 Popote Duo · L’appli pour cuisiner en duo, parent et enfant. Photos d’illustration&nbsp;: Unsplash. Voix de Popote&nbsp;: synthèse Piper, voix «&nbsp;siwis&nbsp;» en français (CC&nbsp;BY&nbsp;4.0) et «&nbsp;LJ&nbsp;Speech&nbsp;» en anglais (domaine public).</p>',
     '<p>© 2026 Popote Duo · The app for cooking together, parent and child. Stock photos: Unsplash. Popote’s voice: Piper speech synthesis, “siwis” voice in French (CC&nbsp;BY&nbsp;4.0) and “LJ&nbsp;Speech” voice in English (public domain).</p>'),
]


def main():
    s = (ROOT / 'index.html').read_text(encoding='utf-8')
    missing = []
    for fr, en in PAGE + TEXT:
        n = s.count(fr)
        if n == 0:
            missing.append(fr)
        s = s.replace(fr, en)
    # La page anglaise vit dans /en : on vise les fichiers depuis la racine du site.
    s = s.replace('="assets/', '="/assets/')
    if missing:
        sys.exit('Textes introuvables dans index.html, à mettre à jour dans ce script :\n- ' + '\n- '.join(m[:100] for m in missing))
    out = ROOT / 'en' / 'index.html'
    out.parent.mkdir(exist_ok=True)
    out.write_text(s, encoding='utf-8')
    print('en/index.html écrit.')


if __name__ == '__main__':
    main()
