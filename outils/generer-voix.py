"""Génère les consignes parlées de Pépin (démo du mode cuisine) en MP3.

Voix : « siwis » de Piper (synthèse vocale neuronale, locale), licence CC-BY 4.0.
Version anglaise : voix « ljspeech » de Piper, domaine public, rangée dans assets/audio/en.
À relancer quand les textes changent, par exemple avec les vraies recettes.

Installation (une fois) :
    python3 -m venv .venv-voix
    .venv-voix/bin/pip install piper-tts
    curl -LO https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/siwis/medium/fr_FR-siwis-medium.onnx
    curl -LO https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/siwis/medium/fr_FR-siwis-medium.onnx.json
    curl -LO https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ljspeech/medium/en_US-ljspeech-medium.onnx
    curl -LO https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ljspeech/medium/en_US-ljspeech-medium.onnx.json
Il faut aussi ffmpeg (brew install ffmpeg).

Lancement, depuis le dossier du site :
    .venv-voix/bin/python outils/generer-voix.py chemin/vers/fr_FR-siwis-medium.onnx
    .venv-voix/bin/python outils/generer-voix.py chemin/vers/en_US-ljspeech-medium.onnx en
"""
import os, subprocess, sys, tempfile, wave
from pathlib import Path

import piper
from piper import PiperVoice, SynthesisConfig

# Ce que Pépin dit à voix haute. Les nombres sont écrits en lettres pour être bien prononcés.
# Recette de la démo : le cookie géant (fiche de l'équipe dans Notion).
CLIPS = {
    "etape-1": "À toi de jouer ! Aide à peser les ingrédients : cent quatre-vingts grammes de sucre roux, puis cent quatre-vingts grammes de farine.",
    "etape-2": "Maintenant, mélange le beurre mou et le sucre, jusqu'à ce que ce soit tout crémeux. Tu te débrouilles super bien !",
    "etape-3": "Ajoute la farine et la levure, puis les pépites de chocolat. Mélange sans trop insister, et répartis la pâte dans le moule.",
    "etape-4": "Le cookie cuit pendant vingt-cinq minutes. Pendant ce temps, prépare les petites assiettes. Ça sent drôlement bon !",
    "bravo": "Bravo ! Le cookie géant est prêt. Attends un peu qu'il refroidisse avant de le découper. Je suis trop fier de toi !",
}

# La même chose en anglais, pour la page /en.
CLIPS_EN = {
    "etape-1": "Your turn! Help weigh the ingredients: one hundred and eighty grams of brown sugar, then one hundred and eighty grams of flour.",
    "etape-2": "Now mix the soft butter and the sugar, until it's nice and creamy. You're doing a great job!",
    "etape-3": "Add the flour and the baking powder, then the chocolate chips. Mix gently, and spread the dough in the tin.",
    "etape-4": "The cookie bakes for twenty-five minutes. Meanwhile, set out the little plates. It smells so good!",
    "bravo": "Well done! The giant cookie is ready. Wait a little while for it to cool before cutting it. I'm so proud of you!",
}

# Un débit un peu plus lent et une intonation plus vivante que les réglages par défaut.
STYLE = SynthesisConfig(length_scale=1.08, noise_scale=0.72, noise_w_scale=0.9)


def fix_espeak_data() -> None:
    """piper-tts 1.8 cherche les données d'espeak à côté du module : on les y relie si besoin."""
    pkg = Path(piper.__file__).parent
    data = pkg / "espeak-ng-data"
    if data.is_dir() and not (pkg / "phontab").exists():
        for f in data.iterdir():
            if not (pkg / f.name).exists():
                (pkg / f.name).symlink_to(f)


def short_espeak_dir() -> Path:
    """espeak ignore un chemin de données trop long (plus de 160 caractères environ) : on passe alors par un lien court."""
    data = Path(piper.__file__).parent / "espeak-ng-data"
    if len(str(data)) < 140:
        return data
    link = Path(tempfile.mkdtemp()) / "espeak-ng-data"
    os.symlink(data, link)
    return link


def main(model: str, lang: str = "fr") -> None:
    fix_espeak_data()
    out = Path(__file__).resolve().parent.parent / "assets" / "audio"
    clips = CLIPS
    if lang == "en":
        out, clips = out / "en", CLIPS_EN
    out.mkdir(parents=True, exist_ok=True)
    voice = PiperVoice.load(model, espeak_data_dir=short_espeak_dir())
    for name, text in clips.items():
        with tempfile.NamedTemporaryFile(suffix=".wav") as tmp:
            with wave.open(tmp.name, "wb") as w:
                voice.synthesize_wav(text, w, syn_config=STYLE)
            # Volume homogène, petit fondu, MP3 mono léger.
            subprocess.run(
                ["ffmpeg", "-y", "-loglevel", "error", "-i", tmp.name,
                 "-af", "loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=in:d=0.04,apad=pad_dur=0.15",
                 "-ac", "1", "-ar", "22050", "-b:a", "48k", str(out / f"{name}.mp3")],
                check=True,
            )
        print("ok", name)


if __name__ == "__main__":
    if len(sys.argv) not in (2, 3):
        sys.exit(__doc__)
    main(*sys.argv[1:])
