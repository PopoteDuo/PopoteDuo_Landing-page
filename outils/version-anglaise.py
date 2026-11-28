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

# Réglages de la page : langue, adresses, sélecteur de langue et données structurées (référencement).
PAGE = [
    ('<html lang="fr">', '<html lang="en">'),
    ("<script>/* Langue : celle du navigateur au premier passage, puis celle choisie avec le sélecteur FR / EN. Les robots restent sur la page demandée. */",
     "<script>/* Language: the browser's on the first visit, then the one picked with the FR / EN switch. Bots stay on the page they asked for. */"),
    ("if((c||(b.indexOf('fr')===0?'fr':'en'))==='en')location.replace('/bienvenue/en'+location.search+location.hash)",
     "if((c||(b.indexOf('fr')===0?'fr':'en'))==='fr')location.replace('/bienvenue'+location.search+location.hash)"),
    ('<!-- Partage et référencement : adresses complètes, à changer si le site passe sur un nom de domaine -->',
     '<!-- Partage et référencement : adresses complètes, à changer si le site passe sur un nom de domaine (page générée par outils/version-anglaise.py) -->'),
    ('<link rel="canonical" href="https://popoteduo.app/bienvenue">', '<link rel="canonical" href="https://popoteduo.app/bienvenue/en">'),
    ('<meta property="og:url" content="https://popoteduo.app/bienvenue">', '<meta property="og:url" content="https://popoteduo.app/bienvenue/en">'),
    ('<meta property="og:locale" content="fr_FR">', '<meta property="og:locale" content="en_GB">\n<meta property="og:locale:alternate" content="fr_FR">'),
    ('og-image.png', 'og-image-en.png'),
    ('"url":"https://popoteduo.app/bienvenue","name":"Popote Duo","inLanguage":"fr-FR"', '"url":"https://popoteduo.app/bienvenue/en","name":"Popote Duo","inLanguage":"en"'),
    ('"inLanguage":"fr-FR","description":"Fini l’enfant qui attend pendant que vous cuisinez : il casse l’œuf, pèse et mélange, vous gérez le feu. Recettes guidées à voix haute, dès 4 ans."',
     '"inLanguage":"en","description":"No more kids waiting while you cook: they crack the egg, weigh and mix, you handle the stove. Recipes guided out loud, from age 4."'),
    ('<div class="lang" role="group" aria-label="Langue"><span class="on" aria-current="true">FR</span><a href="/bienvenue/en" hreflang="en" lang="en" data-lang="en" title="English version">EN</a></div>',
     '<div class="lang" role="group" aria-label="Language"><a href="/bienvenue" hreflang="fr" lang="fr" data-lang="fr" title="Version française">FR</a><span class="on" aria-current="true">EN</span></div>'),
    ('href="/bienvenue/politique-de-confidentialite"', 'href="/bienvenue/en/privacy"'),
    ('href="/bienvenue/mentions-legales"', 'href="/bienvenue/en/legal-notice"'),
]

TEXT = [
    # En-tête
    ('<title>Popote Duo · L’appli pour cuisiner à deux, parent et enfant</title>', '<title>Popote Duo · The app for cooking together, parent and child</title>'),
    ('content="Popote Duo · Cuisiner ensemble, chacun sa mission"', 'content="Popote Duo · Cook together, one mission each"'),
    ('content="Gari, la fraise mascotte, devant un soleil jaune : Cuisiner ensemble, chacun sa mission."', 'content="Gari the strawberry mascot in front of a yellow sun: Cook together, one mission each."'),
    # Navigation et repères
    ('<a class="skip" href="#principe">Aller au contenu</a>', '<a class="skip" href="#principe">Skip to content</a>'),
    ('aria-label="Popote Duo, retour en haut"', 'aria-label="Popote Duo, back to top"'),
    ('<li><a href="#appli">L’appli</a></li>', '<li><a href="#appli">The app</a></li>'),
    ('<li><a href="#mode-cuisine">Démo</a></li>', '<li><a href="#mode-cuisine">Demo</a></li>'),
    ('<li><a href="#tarifs">Tarifs</a></li>', '<li><a href="#tarifs">Pricing</a></li>'),
    ('>Se connecter</a>', '>Log in</a>'),
    ('>Créer mon compte<', '>Create my account<'),
    ('>S’inscrire<', '>Sign up<'),
    ('>J’ai déjà un compte<', '>I already have an account<'),
    ('<nav class="dots" aria-label="Sections de la page">', '<nav class="dots" aria-label="Page sections">'),
    ('aria-label="Accueil"><span>Accueil</span>', 'aria-label="Home"><span>Home</span>'),
    ('aria-label="Le principe"><span>Le principe</span>', 'aria-label="The idea"><span>The idea</span>'),
    ('aria-label="L’appli"><span>L’appli</span>', 'aria-label="The app"><span>The app</span>'),
    ('aria-label="La démo"><span>La démo</span>', 'aria-label="The demo"><span>The demo</span>'),
    ('aria-label="La sécurité"><span>La sécurité</span>', 'aria-label="Safety"><span>Safety</span>'),
    ('aria-label="Les tarifs"><span>Les tarifs</span>', 'aria-label="Pricing"><span>Pricing</span>'),
    ('aria-label="Les questions"><span>Les questions</span>', 'aria-label="Questions"><span>Questions</span>'),
    # Haut de page
    ('Popote Duo // Carnet de cuisine', 'Popote Duo // Cooking notebook'),
    ('<h1 class="h1">Cuisiner ensemble, chacun sa mission</h1>', '<h1 class="h1">Cook together, one mission each</h1>'),
    ('Une mission pour l’enfant, une pour le parent, sur le même écran. Vous gardez le feu et les couteaux. Dès 4&nbsp;ans.',
     'One mission for the child, one for the parent, on the same screen. You keep the hob and the knives. From age 4.'),
    ('title="Gari aime les câlins"', 'title="Gari loves cuddles"'),
    ('>Faites défiler<svg>', '>Scroll down<svg>'),
    # (01) Le principe
    ('(01) Le principe', '(01) The idea'),
    ('Le soir, l’enfant attend pendant qu’on cuisine. Avec Popote Duo, il a <em>une vraie mission</em>&nbsp;: casser l’œuf, peser, mélanger. Et le dîner se fait à deux.',
     'In the evening, the child waits while we cook. With Popote Duo, they get <em>a real mission</em>: cracking the egg, weighing, mixing. And dinner gets made together.'),
    # (02) L'appli
    ('(02) L’appli', '(02) The app'),
    ('<h2 class="h2">Trois étapes, une recette</h2>', '<h2 class="h2">Three steps, one recipe</h2>'),
    ('alt="L’écran d’accueil de l’appli : la mission du jour, Casse ton premier œuf, et trois recettes au choix"',
     'alt="The app’s home screen, in French: today’s mission, Crack your first egg, and three recipes to choose from"'),
    ('</span>Étape 0', '</span>Step 0'),
    ('<h3>L’enfant choisit sa mission</h3>', '<h3>The child picks a mission</h3>'),
    ('Chaque mission apprend un geste. L’enfant choisit sa recette parmi trois.',
     'Each mission teaches one skill. The child picks a recipe out of three.'),
    ('alt="Une étape en cuisine : « À toi, Léo », casse les trois œufs dans le bol, en trois gestes illustrés"',
     'alt="A cooking step, in French: “Your turn, Léo”, crack the three eggs into the bowl, in three illustrated moves"'),
    ('<h3>Chacun son tour</h3>', '<h3>Taking turns</h3>'),
    ('L’écran dit qui fait quoi, et Gari lit chaque consigne à voix haute.',
     'The screen says who does what, and Gari reads every instruction out loud.'),
    ('alt="Mission réussie : Tu sais casser un œuf ! Le badge Casse-œuf rejoint le carnet"',
     'alt="Mission complete, in French: You can crack an egg! The Egg-cracker badge goes into the skills book"'),
    ('<h3>Le carnet se remplit</h3>', '<h3>The skills book fills up</h3>'),
    ('Chaque geste validé par le parent gagne un badge.',
     'Every skill the parent signs off earns a badge.'),
    # (03) La démo
    ('(03) Essayez', '(03) Try it'),
    ('<h2 class="h2">Chacun sa mission, sur le même écran</h2>', '<h2 class="h2">One mission each, on the same screen</h2>'),
    ('Essayez avec le cookie géant&nbsp;: passez les étapes et écoutez Gari.',
     'Try it with the giant cookie: go through the steps and listen to Gari.'),
    ('aria-label="Démonstration du mode cuisine"', 'aria-label="Cooking mode demo"'),
    ('Cookie géant<small id="tsStep" aria-live="polite">Étape 1 sur 4</small>', 'Giant cookie<small id="tsStep" aria-live="polite">Step 1 of 4</small>'),
    ('À toi, Léo</span>', 'Your turn, Léo</span>'),
    ('<span>Geste&nbsp;: peser</span>', '<span>Skill: weighing</span>'),
    ('Aide à peser les ingrédients&nbsp;: 180 g de sucre roux, puis 180 g de farine.', 'Help weigh the ingredients: 180 g of brown sugar, then 180 g of flour.'),
    ('<span>Écouter</span>', '<span>Listen</span>'),
    ('Pour l’adulte, pendant ce temps', 'For the grown-up, meanwhile'),
    ('Préchauffer le four à 180 °C et tapisser le moule de papier cuisson.', 'Preheat the oven to 180 °C and line the tin with baking paper.'),
    ('Four, réservé à l’adulte', 'Oven: grown-ups only'),
    ('Bravo Léo&nbsp;!', 'Well done, Léo!'),
    ('<span>Écouter Gari</span>', '<span>Listen to Gari</span>'),
    ('Le cookie est prêt. Validez les gestes réussis pour remplir le carnet&nbsp;:', 'The cookie is ready. Sign off the skills they nailed to fill the skills book:'),
    ('</span>Peser</button>', '</span>Weighing</button>'),
    ('</span>Mélanger</button>', '</span>Mixing</button>'),
    ('</span>Incorporer</button>', '</span>Folding in</button>'),
    ('</span>Mettre la table</button>', '</span>Setting the table</button>'),
    ('Recommencer la recette', 'Start the recipe again'),
    ('aria-label="Étape précédente"', 'aria-label="Previous step"'),
    ('Étape suivante<span class="arr">', 'Next step<span class="arr">'),
    # (04) La sécurité
    ('(04) La sécurité', '(04) Safety'),
    ('<h2 class="h2" id="trust-title">Pensé pour les parents prudents</h2>', '<h2 class="h2" id="trust-title">Built for careful parents</h2>'),
    ('Vous gardez la main sur tout.', 'You stay in control of everything.'),
    ('alt="Une mère et sa fille découpent des biscuits ensemble dans la cuisine"', 'alt="A mother and her daughter cutting out biscuits together in the kitchen"'),
    ('<figcaption>À hauteur d’enfant, sans lame ni flamme</figcaption>', '<figcaption>At a child’s height, with no blades and no flames</figcaption>'),
    ('<b>Un code parent</b><span>Réglages et validations restent derrière un code que l’enfant ne connaît pas.</span>',
     '<b>A parent code</b><span>Settings and signing off skills sit behind a code your child doesn’t know.</span>'),
    ('<b>Des recettes relues</b><span>Chaque recette est vérifiée pour l’âge et la sécurité.</span>',
     '<b>Checked recipes</b><span>Every recipe is checked for age and safety.</span>'),
    ('<b>Des goûts, pas de données de santé</b><span>Le profil retient ce que l’enfant aime. Aucune allergie n’est enregistrée&nbsp;: vérifiez les allergènes.</span>',
     '<b>Tastes, not health data</b><span>The profile remembers what your child likes. No allergies are stored: check the allergens.</span>'),
    ('<b>Vos données, votre choix</b><span>Export et suppression depuis les réglages. Ni pub ni pistage côté enfant, données hébergées dans l’UE.</span>',
     '<b>Your data, your choice</b><span>Export and delete from the settings. No ads, no tracking on the child’s side, data hosted in the EU.</span>'),
    # (05) Les tarifs
    ('(05) Les tarifs', '(05) Pricing'),
    ('<h2 class="h2">Gratuit pour commencer</h2>', '<h2 class="h2">Free to start</h2>'),
    ('Une recette par mois en gratuit, et le Premium pour tout le reste.',
     'One free recipe a month, and Premium for everything else.'),
    ('<h3 class="plan-name">Gratuit</h3>', '<h3 class="plan-name">Free</h3>'),
    ('<p class="amount"><b>0&nbsp;€</b></p>', '<p class="amount"><b>€0</b></p>'),
    ('<p class="plan-note">Pour découvrir l’appli à votre rythme.</p>', '<p class="plan-note">To discover the app at your own pace.</p>'),
    ('</svg>1 recette par mois, parmi 6</li>', '</svg>1 recipe a month, out of 6</li>'),
    ('</svg>La voix de Gari sur 1 ou 2 étapes</li>', '</svg>Gari’s voice on 1 or 2 steps</li>'),
    ('</svg>Un profil enfant</li>', '</svg>One child profile</li>'),
    ('<span class="badge">Première semaine offerte</span>', '<span class="badge">First week free</span>'),
    ('<p class="amount"><b>4,99&nbsp;€</b><span>par mois</span></p>', '<p class="amount"><b>€4.99</b><span>per month</span></p>'),
    ('<p class="plan-note"><b>Ou 49,99&nbsp;€ par an</b>, après 7&nbsp;jours d’essai gratuit.</p>', '<p class="plan-note"><b>Or €49.99 a year</b>, after a 7-day free trial.</p>'),
    ('</svg>Toutes les recettes, sans limite</li>', '</svg>Every recipe, no limits</li>'),
    ('</svg>La voix de Gari à chaque étape</li>', '</svg>Gari’s voice at every step</li>'),
    ('</svg>Le suivi détaillé des progrès</li>', '</svg>Detailed progress tracking</li>'),
    ('</svg>Plusieurs profils d’enfants</li>\n          <li><svg><use href="#i-check"/></svg>Les recettes à télécharger</li>\n          <li><svg><use href="#i-check"/></svg>10&nbsp;€ de réduction sur la box</li>', '</svg>Several child profiles</li>\n          <li><svg><use href="#i-check"/></svg>Recipes to download</li>\n          <li><svg><use href="#i-check"/></svg>€10 off the box</li>'),
    ('<p class="addon-tag">En option · achat unique, sans abonnement</p>', '<p class="addon-tag">Optional · one-off purchase, no subscription</p>'),
    ('<h3>La box Popote Duo</h3>', '<h3>The Popote Duo box</h3>'),
    ('Tablier, petit fouet, spatule, saladier et verre doseur, à la taille des enfants. L’appli marche très bien sans.',
     'Child-sized apron, whisk, spatula, mixing bowl and measuring jug. The app works fine without it.'),
    ('<p class="addon-price"><b>39,90&nbsp;€</b><small>une fois, livraison incluse</small></p>\n        <p class="badge">29,90&nbsp;€ avec le Premium</p>', '<p class="addon-price"><b>€39.90</b><small>one-off, delivery included</small></p>\n        <p class="badge">€29.90 with Premium</p>'),
    ('<p class="soon"><i></i>Précommande au printemps 2027</p>', '<p class="soon"><i></i>Pre-orders in spring 2027</p>'),
    # (06) Les questions (aussi dans les données structurées en tête de page : même texte, remplacé aux deux endroits)
    ('(06) Vos questions', '(06) Your questions'),
    ('<h2 class="h2">Avant de passer en cuisine</h2>', '<h2 class="h2">Before you head to the kitchen</h2>'),
    ('Une autre question&nbsp;? Écrivez-nous à ', 'Another question? Email us at '),
    ('Quand sort l’appli ?', 'When does the app come out?'),
    ('Combien coûte Popote Duo ?', 'How much does Popote Duo cost?'),
    ('Dès quel âge ?', 'From what age?'),
    ('De 4 à 10 ans. Les plus petits ont des missions sans lame ni flamme.',
     'From 4 to 10. The youngest get missions with no blade and no flame.'),
    ('Mon enfant touche-t-il au couteau ou au four ?', 'Will my child handle knives or the oven?'),
    ('Non. Tout ce qui coupe ou chauffe est réservé à l’adulte, et l’écran le rappelle à chaque étape.',
     'No. Anything sharp or hot is for the grown-up, and the screen says so at every step.'),
    ('Faut-il savoir cuisiner ?', 'Do I need to know how to cook?'),
    ('Non. Des recettes simples, guidées pas à pas, à voix haute.',
     'No. Simple recipes, guided step by step, out loud.'),
    ('Sur quels appareils ?', 'Which devices?'),
    ('C’est une appli web : elle s’ouvre dans le navigateur du téléphone, de la tablette ou de l’ordinateur, sans rien installer.',
     'It’s a web app: it opens in the browser on your phone, tablet or computer, with nothing to install.'),
    # (08) L'inscription
    ('<b>Parent</b><small>le feu et les couteaux</small>', '<b>Parent</b><small>the hob and the knives</small>'),
    ('<b>Enfant</b><small>une mission à sa taille</small>', '<b>Child</b><small>a mission their size</small>'),
    ('</span>Sur téléphone, tablette ou ordinateur</li>', '</span>On phone, tablet or computer</li>'),
    # Pied de page
    ('<nav aria-label="Pied de page">', '<nav aria-label="Footer">'),
    ('<p>© 2026 Popote Duo · Photo&nbsp;: Unsplash. Voix de Gari&nbsp;: Piper, «&nbsp;siwis&nbsp;» (CC&nbsp;BY&nbsp;4.0) et «&nbsp;LJ&nbsp;Speech&nbsp;» (domaine public).</p>',
     '<p>© 2026 Popote Duo · Photo: Unsplash. Gari’s voice: Piper, “siwis” (CC&nbsp;BY&nbsp;4.0) and “LJ&nbsp;Speech” (public domain).</p>'),
    ('aria-label="Retour en haut"', 'aria-label="Back to top"'),
    # Sans bêta (20 novembre 2026) : boutons vers l’appli, fiche « Je commence »
    ('content="Fini l’enfant qui attend pendant que vous cuisinez : il casse l’œuf, pèse et mélange, vous gérez le feu. Recettes guidées à voix haute, dès 4 ans."', 'content="No more kids waiting while you cook: they crack the egg, weigh and mix, you handle the stove. Recipes guided out loud, from age 4."'),
    ('aria-label="Commencer"><span>Commencer</span>', 'aria-label="Get started"><span>Get started</span>'),
    ('Gratuit · dans le navigateur', 'Free · in your browser'),
    ('/compte">Tester avec mon enfant', '/compte">Try it with my child'),
    ('<b>Pour l’instant, tout est gratuit, Premium compris.</b> Ces tarifs s’appliqueront plus tard.', '<b>For now, everything is free, Premium included.</b> These prices will apply later.'),
    ('<p class="plan-fine">Aujourd’hui compris gratuitement, sans carte bancaire.</p>', '<p class="plan-fine">Included for free for now, no card needed.</p>'),
    ('>Nous écrire<svg>', '>Write to us<svg>'),
    ('Elle est déjà ouverte, dans le navigateur : créez votre compte sur popoteduo.app.', 'It’s already open, in your browser: create your account on popoteduo.app.'),
    ('Elle est déjà ouverte, dans le navigateur&nbsp;: <a href="https://popoteduo.app/compte">créez votre compte</a>.', 'It’s already open, in your browser: <a href="https://popoteduo.app/compte">create your account</a>.'),
    ('En gratuit, 1 recette par mois parmi 6. Le Premium coûte 4,99 € par mois ou 49,99 € par an, première semaine offerte. Pour l’instant, tout est gratuit.', 'Free: 1 recipe a month, out of 6. Premium costs €4.99 a month or €49.99 a year, first week free. For now, everything is free.'),
    ('Que faites-vous de mes données ?', 'What do you do with my data?'),
    ('Le strict nécessaire pour votre compte. Rien n’est revendu, et vous pouvez tout exporter ou supprimer depuis l’appli.', 'Only what your account needs. Nothing is ever sold, and you can export or delete everything from the app.'),
    ('>Lire la politique de confidentialité de l’appli</a>', '>Read the app’s privacy policy (in French)</a>'),
    ('<span>Fiche recette · Première mission</span><span>N°&nbsp;001</span>', '<span>Recipe card · First mission</span><span>No.&nbsp;001</span>'),
    ('<h2 class="h2">Votre première mission vous attend</h2>', '<h2 class="h2">Your first mission is waiting</h2>'),
    ('Créez votre compte, ajoutez votre enfant, et Gari vous guide pour la première recette.', 'Create your account, add your child, and Gari guides you through the first recipe.'),
    ('</span>Gratuit, sans rien installer</li>', '</span>Free, nothing to install</li>'),
    ('<b>Qui on est&nbsp;?</b> Cinq étudiants qui construisent Popote Duo avec les familles.', '<b>Who are we?</b> Five students building Popote Duo with families.'),
    ('En route<br>pour la cuisine', 'Off to<br>the kitchen'),
    ('<h3>Je commence</h3>', '<h3>Let’s start</h3>'),
    ('Un compte pour le parent, puis un profil par enfant.', 'One account for the parent, then a profile for each child.'),
    ('<p class="fine">Gratuit. <a href="https://popoteduo.app/confidentialite">Politique de confidentialité de l’appli</a></p>', '<p class="fine">Free. <a href="https://popoteduo.app/confidentialite">The app’s privacy policy (in French)</a></p>'),
    ('<a href="#appli">L’appli</a><a href="#mode-cuisine">Démo</a><a href="#tarifs">Tarifs</a><a href="#faq">FAQ</a><a href="#liste">Commencer</a><a href="/bienvenue/en/privacy">Confidentialité</a><a href="/bienvenue/en/legal-notice">Mentions légales</a>', '<a href="#appli">The app</a><a href="#mode-cuisine">Demo</a><a href="#tarifs">Pricing</a><a href="#faq">FAQ</a><a href="#liste">Get started</a><a href="/bienvenue/en/privacy">Privacy</a><a href="/bienvenue/en/legal-notice">Legal notice</a>'),
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
