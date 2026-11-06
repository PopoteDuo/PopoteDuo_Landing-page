"""Génère les consignes parlées de Pépin (démo du mode cuisine) en MP3.

Voix : « siwis » de Piper (synthèse vocale neuronale, locale), licence CC-BY 4.0.
À relancer quand les textes changent, par exemple avec les vraies recettes.

Installation (une fois) :
    python3 -m venv .venv-voix
    .venv-voix/bin/pip install piper-tts
    curl -LO https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/siwis/medium/fr_FR-siwis-medium.onnx
    curl -LO https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/siwis/medium/fr_FR-siwis-medium.onnx.json
Il faut aussi ffmpeg (brew install ffmpeg).

Lancement, depuis le dossier du site :
    .venv-voix/bin/python outils/generer-voix.py chemin/vers/fr_FR-siwis-medium.onnx
"""
import subprocess, sys, tempfile, wave
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


def main(model: str) -> None:
    fix_espeak_data()
    out = Path(__file__).resolve().parent.parent / "assets" / "audio"
    out.mkdir(parents=True, exist_ok=True)
    voice = PiperVoice.load(model)
    for name, text in CLIPS.items():
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
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
