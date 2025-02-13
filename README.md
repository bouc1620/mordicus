# 🐵 mordicus 🍌

### Reproduction en JavaScript du jeu Mordicus 2

Ce projet est une reproduction la plus fidèle possible de Mordicus 2, un jeu développé par Loto-Québec paru au courant des années 1990 sur le terminal de [Vidéoway](https://fr.wikipedia.org/wiki/Vid%C3%A9oway). Aujourd'hui introuvable dans sa version originale, Mordicus est un jeu de logique du type Sokoban.

Je tiens à remercier et à féliciter Maxime de la chaîne YouTube [Des Jeux pis d'la Bière](https://youtube.com/@jeuxbiere?feature=shared) pour ses recherches qui ont permis de déduire les règles du jeu ainsi que de retrouver plusieurs des niveaux originaux.

Les 240 niveaux du jeu "frère" [Mozaic](https://youtu.be/YygmFM3qP8w?feature=shared) que Maxime a [répertoriés et archivés](https://archive.org/details/mozaic-240-levels/001.png) sont inclus dans ce projet. Les premiers niveaux connus de Mordicus 2 sont présents dans le jeu Mozaic aux positions [148](https://archive.org/details/mozaic-240-levels/148.png), [142](https://archive.org/details/mozaic-240-levels/142.png) et [143](https://archive.org/details/mozaic-240-levels/143.png). Dans cette version JavaScript, les 3 niveaux ont été déplacés au début alors que tous les autres sont demeurés dans leur ordre relatif excepté le niveau 89 qui a été replacé à la position 89.

Les niveaux ont été copiés à l'aide d'un éditeur que vous pourrez aussi retrouver sur mon GitHub. Ce fut une tâche longue et abrutissante et il est très probable que j'ai fait des erreurs. Si vous en décelez, veuillez m'en informer en créant une "Issue" ou en proposant une "Pull request" avec la correction.

## Installation

Le projet fonctionne à l'aide de Vite qui nécessite l'installation de [Node.js](https://nodejs.org/). Il a comme dépendances TypeScript et rxjs.

```sh
npm install
npm run dev
```

## Contrôles

Mordicus se dirige avec les flèches du clavier,

Appuyez sur _Espace_ ou _Entrée_ pour le caractère « ✓ »,

Faites la touche _Échapper_ à tout moment pour abandonner et recommencer le niveau.

---

Vous débutez avec 1000 points "BONI" et en perdez 5 par déplacement. Les meilleurs pointages pour chacun des niveaux sont conservés en localStorage, ils persistent donc après avoir fermé la page.

Le code d'accès du dernier niveau atteint sera automatiquement entré dans le champ de l'écran de saisie du code d'accès, mais il ne sera pas sauvegardé si vous fermez le navigateur. Vous devrez le prendre en note, comme dans le temps!

## Captures

Écran titre du jeu original:

<p align="center"><img src="captures/original/titre.png" alt="écran titre original"></img></p>

Captures de la reproduction:

<p align="center"><img src="captures/reproduction/titre.png" alt="écran titre reproduit"></img></p>

<p align="center"><img src="captures/reproduction/097.png" alt="niveau 97"></img></p>

<p align="center"><img src="captures/reproduction/041.png" alt="niveau 41"></img></p>
