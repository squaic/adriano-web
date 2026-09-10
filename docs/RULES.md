# ADRIANO — Règles officielles V1 Web

> Ce document est la référence officielle pour toute évolution du jeu.

## Objectif et format

ADRIANO est un jeu de mémoire et de stratégie à **1 humain et 3 bots**. Une partie dure exactement **7 manches**. Le total le plus faible gagne ; les égalités produisent plusieurs gagnants.

## 1. Paquet

Le paquet contient 60 cartes : les valeurs 1 à 15 dans chacune des couleurs rouge, bleu, vert et noir. Une carte vaut sa valeur, sauf le 15 rouge qui vaut 0 (les autres 15 valent 15).

## 2. Distribution et mémoire

Chaque joueur reçoit quatre cartes cachées en carré. Le reste forme la pioche et **la fosse commence vide**. Au début d'une manche, chacun mémorise uniquement ses cartes 3 et 4 (la rangée basse). L'humain les voit jusqu'à « J'ai mémorisé ». Ensuite, une carte ne peut être revue que via le 7. Chaque bot possède une mémoire distincte de la réalité et ne consulte jamais une carte inconnue.

## 3. Ordre

Humain → Bot 1 → Bot 2 → Bot 3, en boucle.

## 4–6. Tour normal

Le joueur prend soit le dessus visible de la fosse, soit une carte cachée de la pioche.

Avec la fosse, il choisit sans la regarder une de ses cartes : la carte de la fosse la remplace face cachée et l'ancienne est révélée dans la fosse. Aucun pouvoir ne s'active.

Après une pioche, il voit la carte puis peut l'échanger avec une de ses cartes (choisie sans la regarder), la jeter dans la fosse, ou tenter une combinaison. Une carte remplacée va face visible dans la fosse. Dans l'interface, **« Échanger »** conserve la carte piochée et remplace une carte ; **« Jeter dans la fosse »** ne la conserve pas.

## 7. Cartes spéciales

Un pouvoir s'active uniquement lorsqu'une carte fraîchement piochée est directement défaussée. Une carte spéciale prise ou révélée par échange est normale.

- **3** : deux tours supplémentaires immédiats. Un 3 joué pendant ces bonus ne les cumule pas.
- **7** : regarder une de ses cartes, puis la recacher et actualiser sa mémoire.
- **8** : échanger à l'aveugle une de ses cartes avec celle d'un adversaire.
- **9** : regarder une carte adverse, la recacher et actualiser sa mémoire.

## 8–9. Combinaisons

Après une pioche, le joueur peut sélectionner à l'aveugle 2, 3 ou 4 de ses cartes : paire, brelan ou carré. La couleur ne compte pas.

Si leurs valeurs sont identiques, elles sont simultanément défaussées et la carte piochée remplace l'ensemble dans une seule position. Une paire laisse donc 3 cartes, un brelan 2 et un carré 1. Un carré donne en plus **+40 points à chacun des trois adversaires**.

En cas d'échec, les cartes sont recachées à leur place, le joueur reçoit une pénalité cumulative de **+30**, puis doit encore échanger ou défausser la carte piochée.

## 10–14. ADRIANO et score

À la fin de son tour, un joueur peut annoncer ADRIANO. Il ne rejoue plus ; chacun des trois autres dispose exactement d'un dernier tour, sans pouvoir annoncer. La manche se termine juste avant le retour à l'annonceur.

- **Strictement le plus petit** : annonceur +0 ; chaque adversaire reçoit la valeur de ses cartes +30.
- **Au moins un score strictement inférieur** : annonceur reçoit ses cartes +30 ; les autres la valeur de leurs cartes.
- **À égalité au minimum** : annonceur et joueurs à égalité reçoivent leurs cartes ; les joueurs au-dessus reçoivent leurs cartes +30.

Les pénalités de combinaison (+30) et de carré adverse (+40) sont indépendantes et cumulatives avec ADRIANO.

## 15. Pioche épuisée

À la première panne, la fosse entière est retournée et mélangée pour recréer la pioche. À la seconde panne sans ADRIANO, la manche se termine : chacun reçoit la valeur de ses cartes et ses pénalités déjà accumulées, sans pénalité ADRIANO.

## 16. Fin de partie

Les scores s'accumulent pendant 7 manches. Le ou les joueurs ayant le plus petit total gagnent.

## 17. Bots

Les bots utilisent exclusivement leur mémoire légitime. Ils remplacent de préférence une valeur élevée connue par une carte plus faible, conservent les cartes faibles, utilisent les pouvoirs, tentent une combinaison lorsqu'elle est connue, estiment leur main pour annoncer ADRIANO, et conservent une part d'aléatoire.

## 18–21. Interface et design

La table affiche les quatre joueurs, leurs cartes, la pioche, la fosse, la manche, les scores cumulés, le joueur actif, les actions contextuelles et un journal sans information secrète. Toute sélection se fait en cliquant les cartes. Les actions impossibles sont masquées. Une carte piochée par un bot reste toujours face cachée pour l'humain jusqu'à son arrivée éventuelle dans la fosse.

Au début, les deux cartes basses de l'humain sont visibles jusqu'au bouton « J'ai mémorisé ». Les pouvoirs affichent leurs instructions : choisir sa carte (7), sa carte puis une adverse (8), ou une adverse (9).

Direction : bleu marine, jaune chaud, blanc, grands chiffres et sobriété. Le dos porte quatre carrés jaunes et ADRIANO ; le recto clair montre un grand chiffre coloré. L'interface est responsive.

Des animations légères matérialisent les trajets pioche → joueur, carte remplacée → fosse, fosse → joueur et les échanges à l'aveugle du pouvoir 8, sans jamais révéler une information secrète. À la fin d'une manche, les quatre jeux sont d'abord retournés sur la table pendant environ 1,5 seconde. Le récapitulatif apparaît ensuite avec les mains finales et annonce explicitement « ADRIANO RÉUSSI », « ADRIANO RATÉ » ou « ADRIANO — ÉGALITÉ », avec l'annonceur et les valeurs pertinentes.

Le journal présente les événements du plus ancien au plus récent et défile automatiquement vers la dernière action. Le sommet affiché de la fosse correspond toujours à son dernier élément, donc à la carte publiquement déposée le plus récemment.

## 22. Architecture

Le moteur, l'état, le score, la mémoire, les bots et l'interface React restent séparés sous `src/game` et `src/components`.

## 23. Couverture de tests minimale

Paquet et valeurs, 15 rouge, distribution, échange, paire/brelan/carré et leurs pénalités, trois résultats ADRIANO et cumul, pouvoirs 3/7/8/9, recyclage, fin de manche, 7 manches, gagnants et absence de triche des bots.
