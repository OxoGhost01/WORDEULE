## État du projet lors de la présentation orale
### Phase 1 : le jeu
- [x] Une page d'accueil présente le jeu : son nom, une phrase d'explication, un champ pour saisir le pseudo du joueur et un bouton pour lancer une partie
- [x] Le pseudo est mémorisé pour les visites suivantes
- [x] La partie a sa propre adresse, distincte de l'accueil
- [x] Une grille de 6 lignes de 5 cases
- [x] Le mot mystère est tiré au hasard dans la liste fournie (par l'API)
- [x] Les lettres se tapent au clavier, la touche Retour arrière efface, la touche Entrée valide une ligne complète
- [x] Après validation, chaque lettre prend la bonne couleur, y compris quand une lettre apparaît plusieurs fois dans la proposition ou dans le mot
- [x] La victoire et la défaite sont détectées ; en cas de défaite, le mot est révélé
- [x] À la fin de la partie, le joueur voit les points obtenus, et peut lancer une nouvelle partie ou revenir à l'accueil
- [x] La logique du jeu (comparaison d'une proposition avec le mot, état de la partie) est écrite dans des fonctions séparées des composants d'affichage

### Phase 2 : le dictionnaire
- [x] Avant d'être colorée, chaque proposition est vérifiée auprès de l'API : seuls les mots ~~français~~ anglais sont acceptés
- [x] Un mot refusé ne compte pas comme un essai ; le joueur en est averti et la ligne le montre visuellement
- [x] Pendant la vérification, le joueur voit que l'application travaille, et ne peut pas valider une seconde fois ; la vérification est instantanée, aucun besoin de donner à l'app du temps de travail
- [x] Si l'API ne répond pas, le joueur en est informé et la partie n'est pas bloquée : décidez d'un comportement raisonnable et justifiez-le dans le README
- [x] À la fin de la partie, le mot mystère est affiché avec ses accents et un lien vers sa page du Wiktionnaire

### Phase 3 : le confort de jeu
- [x] Un clavier à l'écran, utilisable à la souris ou au doigt, dont les touches prennent la couleur de ce qu'on sait déjà de chaque lettre
- [x] Les lettres se retournent une à une à la validation, et la ligne tremble quand un mot est refusé
- [x] Un tableau des scores : les dix meilleures parties, classées par points, avec pour chacune le pseudo, le mot trouvé, le nombre d'essais, les points et la date ; plusieurs joueurs peuvent se succéder sur le même ordinateur et apparaître dans le même tableau ; le tableau est conservé entre deux visites
- [x] Un écran de statistiques du joueur : parties jouées, pourcentage de victoires, série en cours, meilleure série, total des points, répartition des victoires selon le nombre d'essais
- [x] La page d'accueil donne accès à une nouvelle partie, au tableau des scores, aux statistiques et aux règles
- [x] Un écran de règles, avec un exemple illustré des trois couleurs
- [x] Chaque écran a sa propre adresse

### Phase 4 : le mot du jour
- [x] L'application est déployée sur Vercel, à partir du dépôt Git : chaque envoi sur la branche principale met automatiquement le site à jour
- [x] Toutes les adresses de l'application fonctionnent en ligne, y compris quand on rafraîchit une page ou qu'on ouvre directement un lien vers une partie ou vers le tableau des scores
- [x] Un mode « mot du jour » : le même mot pour tous les joueurs, sur tous les ordinateurs, qui change à minuit ; le mode « partie libre » reste disponible
- [x] Une partie du jour commencée reprend où elle en était si la page est rechargée ; une fois terminée, elle ne peut pas être rejouée
- [x] Un compte à rebours indique le temps restant avant le prochain mot
- [ ] Le tableau des scores distingue le classement du mot du jour (tous les joueurs de l'ordinateur sur le mot du jour, par points puis par temps de résolution) du classement général (le classement existe bien et est fonctionnel mais il manque le temps de résolution) 
- [ ] Le résultat se partage par un texte copié dans le presse-papiers, qui montre les couleurs sans révéler les lettres
- [ ] Au moins cinq tests automatisés, dont au moins deux sur la coloration des lettres en double

### Phase 5 : les variantes
- [x] Des mots de 6 et 7 lettres en partie libre, la grille et le nombre d'essais s'adaptant à la longueur. Pour ces longueurs, constituez vous-mêmes une liste de mots solutions, et expliquez dans le README comment vous l'avez obtenue (la partie est même custommisable à tous les paramètres)
- [x] Un mode difficile : toute lettre révélée en vert doit rester à sa place et toute lettre jaune doit être réutilisée dans les propositions suivantes ; une proposition qui ne respecte pas ces règles est refusée avec un message précis
- [ ] Les points tiennent compte de la difficulté : × 1,5 pour 6 lettres, × 2 pour 7 lettres, × 1,5 en mode difficile ; le tableau des scores indique la longueur et le mode de chaque partie, et peut être filtré selon ces critères
- [ ] Les réglages (longueur, mode custom) sont conservés entre deux visites, et la longueur fait partie de l'adresse de la partie

### Phase 6 : les quatre grilles
- [x] Quatre grilles affichées ensemble, et neuf essais au total
- [x] Chaque proposition est jouée dans les quatre grilles à la fois ; une grille résolue se fige
- [x] Le clavier à l'écran montre l'état de chaque lettre pour chacune des quatre grilles
- [x] Un écran de fin indique les grilles résolues, en combien d'essais, et révèle les mots manqués
- [ ] Les parties à quatre grilles ont leur propre règle de points, que vous définissez et expliquez dans les règles du jeu, et leur propre classement (règles de points non mais classement oui)

## Ajouts après l'oral

### Phase 4 : le mot du jour
- [x] Le tableau des scores distingue le classement du mot du jour (tous les joueurs de l'ordinateur sur le mot du jour, par points puis par temps de résolution) du classement général (le classement existe bien et est fonctionnel mais il manque le temps de résolution) 
- [x] Le résultat se partage par un texte copié dans le presse-papiers, qui montre les couleurs sans révéler les lettres
- [x] Au moins cinq tests automatisés, dont au moins deux sur la coloration des lettres en double

### Phase 5 : les variantes
- [x] Les points tiennent compte de la difficulté : × 1,5 pour 6 lettres, × 2 pour 7 lettres, × 1,5 en mode difficile ; le tableau des scores indique la longueur et le mode de chaque partie, et peut être filtré selon ces critères
- [x] Les réglages (longueur, mode custom) sont conservés entre deux visites, et la longueur fait partie de l'adresse de la partie

### Phase 6 : les quatre grilles
- [x] Les parties à quatre grilles ont leur propre règle de points, que vous définissez et expliquez dans les règles du jeu, et leur propre classement (règles de points non mais classement oui) 

### Bonus
- [x] Un compteur sur la page du mot du jour indique combien de joueurs ont trouvé le mot du jour ; il repart à zéro quand le mot change
- [x] Un classement global, partagé entre tous les joueurs, grâce à un petit serveur (Express, scores dans un fichier JSON) déployé avec Docker, avec un onglet par mode
- [x] Un écran de règles avec un onglet par mode
- [x] Le partage utilise la feuille de partage native sur téléphone (écran tactile), et sur ordinateur le texte et le lien sont copiés dans le presse-papiers
- [x] Les mots à trouver viennent d'une liste de mots courants (les 10 000 mots les plus fréquents), alors que les propositions sont vérifiées avec le dictionnaire complet ; valable pour tous les modes et toutes les longueurs
- [x] Toutes les valeurs de réglage (règles des modes, points, limites, adresses...) sont dans un fichier de configuration (`src/config.js` pour le site, `server/config.js` pour le serveur)
- [x] Des statistiques pour chaque mode, avec des onglets
- [x] Un README complet : règles, modes, score, installation, structure du projet, fonctionnement, API, tests, déploiement et limites connues
