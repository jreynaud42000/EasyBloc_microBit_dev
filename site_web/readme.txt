=========================================================
  PROJET : PROGRAMMATION MICRO:BIT V2 (INTERFACE BLOCKLY)
=========================================================

Application web locale : on assemble des blocs, on lit la transcription
MicroPython, on essaie le programme dans le simulateur, puis on telecharge
un fichier .hex a glisser sur le lecteur MICROBIT.

VARIANTE easybloc_ts_microbit (oct. 2026) : copie de easybloc_ts_adacraft_minimal
SANS le mode seance (menu Fichier > Seance, seances.js) et SANS les robots
(categorie Robots : Maqueen Plus, Maqueen Lite, Kitrobot v2, LiDAR ; panneau
Piste du simulateur, telecommande infrarouge simulee). Les sections 15 a 18
et 42 ci-dessous le rappellent ; leur numero est garde pour les renvois.

---------------------------------------------------------
1. STRUCTURE DU DOSSIER DU PROJET
---------------------------------------------------------
Tous ces fichiers doivent rester ensemble dans le meme dossier :

- index.html        (Interface, simulateur en Brython)
- un.js             (Blocs, generateurs MicroPython, boite a outils)
- deux.js           (Ecriture du programme dans le systeme de fichiers embarque)
- trois.js          (Emballage au format Universal Hex)
- ia.js             (Panneau IA : reconnaissance d'images et de sons, voir §19)
- tuto.js           (Visite guidee de l'application, menu Aide, voir §20)
- firmware.hex      (Image MicroPython officielle de la micro:bit)
- readme.txt        (Ce fichier : affiche dans l'onglet Aide du panneau administrateur, §13)
- lancer_projet.bat (Demarrage du serveur local)
- app.py / app.spec (Version empaquetee en .exe avec PyInstaller)

- lib/              (Bibliotheques embarquees : Blockly, Brython, microbit-fs,
                     microbit-universal-hex, TensorFlow.js et Teachable Machine
                     dans lib/tm ; voir §12 et §19)

Rien a installer et aucune connexion Internet necessaire : depuis la V1.2, toutes
les bibliotheques sont dans lib/ (avant, elles etaient chargees depuis des CDN).

---------------------------------------------------------
2. COMMENT LANCER LE SERVEUR WEB LOCAL
---------------------------------------------------------
Les navigateurs interdisent aux modules JavaScript de lire des fichiers locaux
par un simple double-clic sur index.html. Il faut passer par un serveur web.

Le plus simple : double-cliquer sur lancer_projet.bat. Il se place tout seul
dans le bon dossier, verifie les fichiers, demarre app.py et ouvre le navigateur.

A la main :
   1. Ouvrir un terminal.
   2. cd C:\chemin\vers\votre\dossier      <-- indispensable
   3. python app.py
   4. Laisser la fenetre ouverte, puis ouvrir http://localhost:8000

IMPORTANT : passer par app.py, et non par "python -m http.server". Ce dernier
n'envoie aucun en-tete de cache : le navigateur ressert alors un ancien
index.html ou un.js apres modification, et on regarde la version precedente sans
s'en apercevoir. app.py envoie Cache-Control: no-store, ce qui supprime le
probleme.

Si un.js / deux.js / trois.js apparaissent en erreur 404 dans la console du
navigateur, c'est que le serveur a ete lance depuis un autre dossier.

---------------------------------------------------------
3. UTILISATION
---------------------------------------------------------
- Panneau de gauche : les blocs. Le zoom se commande avec les trois boutons ronds de Blockly
  (recentrer, +, -) dessines dans le coin bas-droit de la zone de blocs, au-dessus de la corbeille
  (leurs icones, gris fonce, sont inversees en clair dans les themes sombres - regle CSS .blocklyZoom /
  .blocklyTrash dans index.html ; ils sont dessines dans le canevas, donc rognes si la fenetre est
  vraiment trop basse), et avec la molette. Le groupe "- 100 % + Ajuster" de la barre d'outils a ete
  retire a la demande de l'utilisateur (le code qui le pilotait reste, inoffensif : il ne trouve plus
  ses boutons ; l'ancienne fonction "Ajuster" = cadrer tous les blocs n'est donc plus accessible). La MOLETTE seule zoome (vers le haut = agrandir,
  vers le bas = reduire, autour du curseur ; Ctrl + molette aussi) ; on fait defiler en
  glissant le fond de l'espace ou avec les barres de defilement. Sur un pave tactile,
  le defilement a deux doigts zoome donc aussi. Le pincement fonctionne sur ecran tactile. Echelle de 0,3 a 3.
  "Ajuster" cadre les blocs presents, ou revient a 100 % si l'espace est vide.

  Les boutons "Code" et "Simulateur" de la barre du haut replient les deux
  panneaux de droite. C'est utile sur les categories aux blocs longs, comme
  Grove : le tiroir de la boite a outils est aussi large que son bloc le plus
  long, et peut ne laisser presque aucune place pour deposer les blocs. Replier
  un panneau rend cette largeur au canevas ; le zoom, lui, n'agit que sur les
  blocs deja poses, pas sur le tiroir.

  Bouton lune/soleil (a cote de "Simulateur") : bascule entre theme sombre
  (par defaut) et theme clair - barre d'outils, panneaux lateraux, panneau de
  code et panneau administrateur. Choix mémorisé d'une session a l'autre. Les
  couleurs "d'appareil" (carte micro:bit, DEL) ne changent
  pas avec le theme : elles representent quelque chose de reel, comme les
  couleurs des boutons d'action.

  Bouton contraste (◐, juste a cote) : contraste normal ou eleve, independant
  du theme clair/sombre - les deux se combinent (sombre eleve = fond noir pur
  et texte blanc, clair eleve = fond blanc pur et texte noir, bordures plus
  epaisses). En contraste eleve, les blocs eux-memes passent aussi en noir a
  simple contour blanc, plutot que remplis de la couleur de leur categorie.
  Egalement memorise d'une session a l'autre.
- Panneau du milieu : le code MicroPython correspondant, mis a jour en direct.

  Les pilotes des modules Grove et des servomoteurs y sont REPLIES derriere une
  ligne du genre "pilote lcd1602 - 39 lignes", depliable d'un clic. Sur un
  programme LCD, cela ramene la transcription de 1470 a 144 caracteres : l'eleve
  voit son programme, pas la plomberie. Ce qui est deplie le reste quand on
  modifie les blocs.

  Le repli ne concerne QUE l'affichage : le .hex et le .py contiennent toujours
  les pilotes en entier. D'autres editeurs ecrivent leurs pilotes dans des
  modules separes sur la carte (from lcd_i2c import LCD1602) : leur
  transcription est courte parce que le pilote est ailleurs, pas parce
  qu'il est plus petit. Notre choix garde un main.py autonome, donc un .py
  telechargeable qui fonctionne seul.
- Panneau de droite : le simulateur. Les boutons A, B, le logo et les broches
  sont cliquables ; "Lancer la simulation" enchaine des passages de 5 tours de
  boucle en continu (comme la vraie carte, qui ne s'arrete jamais toute
  seule), jusqu'a "Reinitialiser la simulation" ou un nouveau "Lancer".
  La carte s'adapte a la largeur de la colonne : elle retrecit quand la fenetre
  est etroite, grandit quand elle est large, et reste dessinee a 75 % de la
  place disponible pour laisser respirer les sections placees au-dessous.
  Les proportions sont conservees et les zones cliquables suivent.

  A noter : replier le panneau du code n'agrandit PAS la carte. Les deux
  panneaux de droite ont chacun une largeur fixe de 24 % ; la place liberee va
  a la zone de blocs, ce qui est bien le but recherche. Seule la taille de la
  fenetre change l'echelle de la carte.
  "Secouer la carte" declenche le geste et lance la simulation dans la foulee.
  Comme sur la carte, was_gesture("shake") ne repond vrai qu'une seule fois par
  secousse, tandis que is_gesture("shake") reste vrai pendant l'execution.

  Le son est audible : les blocs [Music] et [Audio] sont joues par le navigateur
  en onde carree, timbre proche du buzzer de la carte, et [Speech] passe par la
  synthese vocale du systeme. Les melodies de music suivent le decoupage
  officiel (1 tic = 125 ms) ; les sons de audio sont des approximations, la
  vraie carte lisant des echantillons. Relancer la simulation coupe le son en
  cours. Si rien ne sort, verifier que l'onglet n'est pas muet : le navigateur
  n'autorise le son qu'apres un premier clic dans la page.

  "Reinitialiser la simulation" remet tout a zero : file d'attente videe, son et
  parole coupes, LED eteintes, ecran de texte efface, boutons, logo, broches et
  geste relaches. Rien de l'execution interrompue ne peut reprendre la main.
  Le bloc "[Micro:bit] reinitialiser la carte" produit reset(), qui declenche la
  meme remise a zero pendant l'execution : l'ecran s'eteint et la suite du
  programme n'est pas jouee, comme lors d'un redemarrage de la carte.
- Bouton engrenage : ordre des categories. On y fait glisser les categories pour
  les reordonner ; le tiroir se reconstruit aussitot. "Ordre par defaut" retablit
  l'ordre d'origine. L'ordre choisi est conserve d'une session a l'autre, dans le
  navigateur (localStorage) : il suit le poste, pas le projet. Une categorie
  ajoutee plus tard a l'application reprend sa place a la fin de la liste plutot
  que de disparaitre.
- Bouton .hex : le programme pret a copier sur la carte.
- Bouton .py  : le seul script Python, pour l'editeur officiel ou un cours.
- Bouton "Envoyer sur la carte" : ecrit directement le .hex sur le lecteur
  MICROBIT, ce qui revient exactement a un glisser-deposer.

  Au premier envoi, le navigateur demande de designer le lecteur : choisir le
  volume MICROBIT. L'application verifie qu'il porte bien DETAILS.TXT ou
  MICROBIT.HTM et refuse tout autre dossier. Le choix est ensuite conserve pour
  la session.

  Apres un transfert, la carte se reinitialise et son lecteur se demonte puis se
  remonte : le lecteur designe n'est alors plus valide. Le message invite a
  recliquer pour le redesigner. C'est normal, pas une panne.

  Cette fonction demande Chrome ou Edge. Firefox et Safari n'ont pas l'API
  d'acces aux fichiers : le bouton y est desactive, avec l'explication en
  infobulle. Le bouton .hex reste disponible partout.

  A noter : le lecteur MICROBIT n'accepte QUE des .hex. Y deposer un .py ne fait
  rien, c'est pourquoi ce bouton envoie le .hex et non le script.

En cas de probleme, le message exact s'affiche en haut a droite de la barre.
Le detail complet est dans la console du navigateur (touche F12).

---------------------------------------------------------
4. LE .HEX PRODUIT N'EST PAS IMPORTABLE DANS MAKECODE
---------------------------------------------------------
C'est normal, les deux formats n'ont rien de commun.

Un .hex MakeCode contient du code ARM compile depuis TypeScript, plus le projet
lui-meme compresse en LZMA derriere un en-tete JSON du genre :
  {"compression":"LZMA", ..., "pxtTarget":"microbit"}
C'est cet en-tete que MakeCode relit pour reconstruire les blocs.

Le .hex produit ici est une image MicroPython, avec le programme ecrit en clair
sous main.py dans le systeme de fichiers embarque. Il n'a pas d'en-tete PXT :
MakeCode ne le reconnait pas. L'inverse est vrai aussi, un .hex MakeCode n'a pas
de main.py.

Ce qui fonctionne :
- Menu "Fichier" > "Nouveau projet" : efface les blocs actuels et repart de
  "Au demarrage" + "Repeter indefiniment", apres confirmation (rien n'est
  jamais sauvegarde automatiquement, telechargez le programme actuel avant
  si besoin).
- Fermer l'onglet, recharger la page (F5) ou naviguer ailleurs declenche
  la confirmation de fermeture du navigateur, pour la meme raison (rien
  n'est sauvegarde automatiquement). Le texte exact de cette confirmation
  est impose par le navigateur, pas par l'appli.
- Sur la carte : glisser le .hex sur le lecteur MICROBIT. C'est l'essentiel.
- Pour rouvrir un programme : menu "Fichier" > "Importer un fichier .hex" (ou
  ".py"). Meme bibliotheque microbit-fs que pour l'ecriture, utilisee cette
  fois pour relire la zone systeme de fichiers du .hex et en ressortir
  main.py. https://python.microbit.org fait la meme chose (et fonctionne
  donc aussi), mais n'est plus necessaire.

  Depuis peu, un fichier .hex ou .py EXPORTE PAR CETTE APPLI (il porte une
  signature invisible en premiere ligne) est reconstruit en blocs plutot que
  de basculer directement en edition manuelle. Tout ce que l'appli sait
  reconnaitre redevient un vrai bloc ; ce qu'elle ne reconnait pas encore
  redevient un bloc gris "code" qui garde le texte Python d'origine tel
  quel (rien n'est jamais perdu, juste pas encore transforme en bloc) - sauf
  le pur passe-partout (les lignes "import ..." en tete de fichier), reinjecte
  tout seul par l'appli des qu'un bloc en a besoin et donc simplement omis,
  pas affiche comme un bloc "code" de plus. Un fichier qui ne vient pas de
  cette appli (telecharge ailleurs, ou tape a la main) n'a pas cette
  signature et bascule en edition manuelle comme avant - Blockly ne sait pas
  transformer du Python quelconque en blocs, seul du Python que cette appli
  a elle-meme produit peut etre reconstruit avec confiance.
- Le bouton "Telecharger le script .py" donne le fichier directement ouvrable
  dans l'editeur Python officiel ou dans Mu.
- Bouton "Capture d'ecran des blocs (.png)", dans la barre d'outils entre
  "Fichier" et "Envoyer sur la carte" : telecharge une image PNG de tous les
  blocs poses, telle qu'affiches a l'ecran a l'instant du clic (couleurs et
  texte fideles au theme clair/sombre et au contraste normal/eleve en cours -
  voir section theme plus haut).
- Boutons "Annuler"/"Refaire", a droite de "Envoyer sur la carte" : annulent
  ou refont la derniere action sur les blocs (equivalent des raccourcis
  Ctrl+Z / Ctrl+Maj+Z, deja actifs par defaut). Grises tant qu'il n'y a rien
  a annuler ou a refaire.
- Quand le bouton "Code" est desactive (transcription masquee), une poignee
  apparait entre la zone de blocs et le simulateur : glisser vers la gauche
  agrandit le simulateur, vers la droite le reduit. La carte micro:bit, les
  boutons et le panneau des peripheriques gardent toujours la
  meme taille : agrandir le panneau les reorganise plutot que de les etirer
  - la carte et les 3 boutons se placent cote a cote si la largeur le permet,
  et les panneaux peuvent se ranger a deux par ligne.
- La colonne de categories (Temps, Affichage, Capteurs...) se masque le temps
  de glisser un bloc - qu'il vienne d'etre pris dans le tiroir ou qu'il soit
  deja pose sur l'espace de travail - et reapparait des que le bloc est
  lache, pour laisser toute la place a la zone de blocs pendant le geste.

Attention : la "Python" de MakeCode n'est pas MicroPython mais une variante de
TypeScript a syntaxe Python. Le .py n'y est pas exploitable non plus.

---------------------------------------------------------
5. LES SERVOMOTEURS
---------------------------------------------------------
Categorie "Servos", sur les broches P0, P1 et P2 comme dans MakeCode.

Conventions reprises de MakeCode (pxt-common-packages, libs/servo) :
- angle de 0 a 180 degres, correspondant a une impulsion de 500 a 2500 us
  dans une periode de 20 ms (50 Hz) ;
- l'intervalle borne l'angle. Le mini est ramene entre 0 et 90, le maxi entre
  90 et 180 ;
- la rotation continue transpose une vitesse de -100 a 100 % sur l'intervalle ;
- avec "arret au neutre" actif, une vitesse ramenant au neutre arrete le
  servomoteur au lieu de le maintenir. MakeCode calcule ce neutre (maxi - mini)/2,
  formule reprise telle quelle : avec l'intervalle 0-180 par defaut cela donne
  bien 90, mais avec un intervalle decale le resultat surprend ;
- "arreter" cesse d'envoyer des impulsions : le servomoteur reste ou il est ;
- la largeur d'impulsion est bornee entre 500 et 2500 us, 1500 us etant le centre.

Le simulateur dessine un cadran par broche utilisee, dans la section
"Servomoteurs" du panneau de droite :

- servo positionnel : le bras pivote jusqu'a l'angle demande, avec une
  transition. Le bras pointe vers le haut a 90 degres, a gauche a 0, a droite
  a 180 ;
- rotation continue : le bras tourne sans fin. Deux secondes par tour a 100 %,
  proportionnellement plus lent en dessous, et dans l'autre sens si la vitesse
  est negative. Une vitesse nulle immobilise le bras ;
- arret : le cadran passe en gris et le bras reste ou il est ;
- largeur d'impulsion : le bras se place a l'angle correspondant, 500 us
  valant 0 degre et 2500 us valant 180.

---------------------------------------------------------
6. CARTE D'EXTENSION BITMAKER V2
---------------------------------------------------------
La BitMaker V2 (Seeed, ref 114992653) est un simple repartiteur : elle amene des
broches de la micro:bit sur six connecteurs Grove. Il suffit de choisir la broche
correspondant au port utilise.
Categorie « Cartes d'extension » (nov. 2026) : sous-categories « Grove Shield V2.0 » et
« BitMaker V2 ». Le bloc « carte d'extension : ... » (carte_grove_shield,
carte_bitmaker) ne produit qu'un commentaire ; il impose la carte du montage,
comme les blocs DFR0548 et Motor:bit (qui l'emportent), a la place du menu du
montage. La BitMaker a aussi trois blocs pour ses 4 LED RGB : « LED n° 1 a 4 de
la carte en couleur », « toutes les LED de la carte en couleur », « eteindre les
LED de la carte » (bitmaker_led, bitmaker_leds, bitmaker_leds_eteindre) :
neopixel.NeoPixel(pin13, 4), cles « leds_bitmaker » du registre ; ils imposent
aussi la BitMaker. Simulateur : les 4 LED dans « Peripheriques » (section du
ruban RGB) et sur la carte dessinee. Broche P13 d'apres le blog Seeed
(« Getting Started with Bitmaker », 2019) ; NON verifie sur une vraie carte V2.
Pas de bloc buzzer : la presence d'un buzzer sur la V2 n'est pas confirmee
(wiki Seeed : oui, fiche RobotShop de la V2 : non).

Correspondance des six ports Grove :

   Port          Broches         Modules a y brancher
   ------------  --------------  ----------------------------------------
   1             P0 / P1         joystick (deux axes analogiques)
   2             P1 / P2         afficheur 4 digits (CLK / DIO)
   3             P2 / P12        ultrason, ruban RGB, servomoteur
   4             P8 / P14        ruban RGB, ultrason
   5             P15 / P16       usage general
   6             I2C             AHT20/DHT20, LCD 16x2, VEML6040, DRV8830,
                                 SCD30, SCD41, capteur de gestes PAJ7620

Le premier fil d'un connecteur Grove correspond a la premiere broche indiquee.
Pour le joystick sur le port 1 : X sur P0, Y sur P1 — exactement ce que suppose
le simulateur par defaut.

Tous les modules I2C partagent le meme port : ils peuvent cohabiter sur un
concentrateur, leurs adresses etant differentes (0x38, 0x3E, 0x10, 0x65, 0x61,
0x62, 0x73).

Autres connexions de la carte : pastilles P0, P1, P2, 3V3 et GND compatibles
bananes et pinces crocodiles, alimentation USB micro 5 V, batterie LiPo sur
connecteur JST, selecteur de niveau logique 3,3 V ou 5 V, protection contre les
surintensites a 1,5 A.

Deux points a savoir :
- P13 figure dans les menus de broches de l'application mais n'est PAS sorti sur
  la BitMaker V2. Les huit autres choix correspondent bien a des ports.
- La carte porte quatre LED RGB adressables, sur P13 (voir les blocs
  « BitMaker » ci-dessus) : P13 ne sort donc sur aucun port.

---------------------------------------------------------
7. LES MODULES GROVE
---------------------------------------------------------
La categorie "Grove" se deplie en dix sous-menus, un par module. Ses blocs
tenaient auparavant dans un seul tiroir de plus de deux ecrans de haut, ou les
derniers etaient introuvables en pratique.

Elle couvre douze modules Seeed :

- LED simple sur une broche. Deux blocs : "controler la LED a HAUT/BAS" ecrit
  tout ou rien (write_digital), "regler la luminosite a 0-1023" module la
  broche (write_analog). C'est le seul module SANS pilote : une LED se commande
  directement par la broche, et le code produit est celui qu'on ecrirait a la
  main. La valeur est bornee a 0-1023 dans le code genere, car write_analog
  leve une exception hors de cette plage et arreterait le programme sur la
  carte, sans rien afficher.
  A savoir : c'est le tiroir le plus large de l'application (452 px). Replier
  le panneau du code rend cette place a la zone de blocs.
- Ruban RGB WS2813 : s'appuie sur le module neopixel, integre au firmware.
  Le module n'a pas de reglage de luminosite : le bloc "luminosite" attenue
  les couleurs avant envoi.
- Afficheur 4 digits (TM1637), protocole 2 fils, CLK et DIO au choix.
  Le simulateur le dessine en vrais sept segments : il n'affiche pas un texte
  mais allume les segments d'apres le motif exact que le pilote envoie a la
  puce. Aspect proche du module du commerce : boitier noir a bord arrondi,
  chiffres cyan penches de 8 degres, halo lumineux sur les segments allumes.
  Les segments eteints restent faiblement visibles, comme sur le module.
  Les deux points sont entre le 2e et le 3e chiffre, et la luminosite 0 a 7
  agit sur l'intensite. Consequence a connaitre : "afficher le nombre 92"
  montre 0092, et -5 montre -005, parce que le pilote remplit les quatre
  chiffres. C'est bien ce que ferait la carte.
- Ultrason : un seul fil, declenchement puis mesure de l'echo.
- Joystick : deux axes analogiques. L'appui sur le manche tire l'axe X presque
  a zero, c'est ce que teste le bloc "bouton du joystick".
- Capteur de gestes PAJ7620 en I2C (adresse 0x73). Table d'initialisation reprise
  de la bibliotheque Seeed Gesture_PAJ7620.
- Temperature & humidite : quatre jeux de blocs dans le meme sous-menu.
  - AHT20 / DHT20 (0x38, I2C) : meme puce, un seul jeu de blocs. Chaque
    mesure est controlee par son CRC ; -1 est renvoye si elle est fausse.
    Fiable sur V1 et V2.
  - DHT11 et DHT22 (protocole 1 fil) : voir l'encadre juste apres cette
    liste, ce sont les deux seuls blocs Grove qui NE fonctionnent QUE sur le
    V1.
- Ecran LCD 16x2 v1, puce JHD1802 (0x3E) : texte a une position, effacer,
  allumer et eteindre l'affichage.
- Capteur de couleur VEML6040 (0x10) : canaux rouge, vert, bleu et blanc, en
  valeur brute sur 16 bits.
- Pilote moteur DRV8830 (canal 1 : 0x65, canal 2 : 0x60) : vitesse de -63 a 63,
  arret, frein, lecture et effacement du defaut.
- CO2 SCD30 (0x61) et SCD41 (0x62) : CO2, temperature et humidite. Le SCD30 rend
  des flottants au format IEEE, le SCD41 un entier pour le CO2.

Adresses, trames et formules reprises des bibliotheques Seeed pxt-grove
(sensors/AHT20.ts, blocks/GroveLCD1602v1.ts, sensors/VEML6040.ts,
sensors/DRV8830.ts, sensors/SCD30.ts, sensors/SCD41.ts).

DHT11 / DHT22, visibles comme les autres blocs (pas masques) : protocole 1 fil
aux impulsions de quelques dizaines de microsecondes, qu'une boucle MicroPython
interpretee ne peut pas mesurer, d'ou un pilote commun en assembleur ARM Thumb
(repris de rhubarbdog/microbit-dht11, MIT) ; seul le decodage des 5 octets
recus differe entre les deux capteurs. Ce code ne vaut que pour le V1 (16 MHz) :
sur le V2 (64 MHz), il echantillonne trop vite. Sur V2, une autre lecture prend
donc le relais (oct. 2026, EXPERIMENTALE) : machine.time_pulse_us mesure la
duree de chaque impulsion haute (bit 0 ~27 us, bit 1 ~70 us), sans assembleur ;
la somme de controle ecarte une lecture fausse et la mesure est tentee 3 fois.
En cas d'echec, temperature() et humidite() renvoient -1, jamais une valeur
fausse. A valider sur de vraies cartes : branchement sur P0, P1 ou P2, module
Grove (resistance de tirage incluse) ou resistance de 10 kOhm vers 3,3 V,
1 s (DHT11) ou 2 s (DHT22) au moins entre deux mesures. L'AHT20/DHT20 (I2C)
reste le choix le plus sur sur V2 — le tooltip de chaque bloc le rappelle.

Ne sont PAS fournis, et pourquoi :
- Vision AI V2 : pile SSCMA complete (JSON transporte par blocs sur I2C), hors
  de portee d'un pilote embarque dans le programme genere.
- UartWiFi : faisable, mais initialiser l'UART sur des broches externes coupe la
  liaison serie USB, et le dialogue en commandes AT demande des temporisations a
  regler avec le module en main.

Les blocs "definir ..." et "initialiser ..." sont FACULTATIFS. Chaque module est
cree tout seul a sa premiere utilisation, avec ces reglages par defaut :

- Ruban RGB      : broche P1, 16 LED
- Afficheur 4 digits : CLK sur P0, DIO sur P1
- Les modules I2C n'ont rien a regler (adresse fixe)

Le bloc "definir ..." ne sert donc qu'a choisir d'autres broches ou un autre
nombre de LED. Le poser en tete du programme si besoin ; sans lui, rien ne
casse.

Les pilotes de ces modules ne sont pas dans le firmware : ils sont ecrits dans
le programme genere, encadres par les marqueurs "# >>> pilote grove" et
"# <<< pilote grove". Le simulateur repere ces marqueurs, retire le pilote et le
remplace par ses propres objets - sur la carte on pilote des broches, dans le
navigateur on dessine. Ne pas modifier ces marqueurs.

Cote simulateur, le panneau "Peripheriques Grove" affiche le ruban et
l'afficheur, et fournit les entrees : curseur de distance, deux curseurs pour le
joystick avec sa case "bouton enfonce", et un menu de gestes avec son bouton
"Declencher". Comme le capteur reel, le geste est consomme a la lecture.
S'y ajoutent l'ecran LCD 16x2, l'etat des deux canaux moteur, trois curseurs
(temperature, humidite, CO2) et un selecteur de couleur pour le VEML6040.

La section "LED sur broche" montre une pastille par broche effectivement
pilotee, avec la valeur ecrite. Rien n'est affiche tant que le programme n'a
rien ecrit : on ne sait pas d'avance ou la LED est cablee. L'eclat suit la
racine carree du rapport cyclique, ce qui rapproche l'affichage de ce que voit
l'oeil. A noter : toute ecriture sur une broche y figure, servomoteur compris —
c'est ce qui se passerait avec une LED reellement cablee sur cette broche.

L'ecran LCD est dessine comme le vrai module 1602 : cadre noir, retro-eclairage
bleu, caracteres clairs. Chaque caractere occupe sa propre cellule de 5x8 points
(10 x 16 px), et une trame sombre au pas du point est posee par-dessus le texte
pour donner l'aspect matriciel. Le texte s'aligne donc en colonnes, exactement
comme sur le composant : ecrire a la colonne 4 laisse quatre cellules vides,
visibles. Eteindre le retro-eclairage fait virer l'ecran au gris-vert et laisse
le texte faiblement lisible, comme sur le vrai module.

Ce panneau n'affiche que les modules effectivement utilises : chaque section
apparait des qu'un bloc du module correspondant est pose dans le programme, et
disparait quand on le retire. Sans aucun bloc Grove, le panneau entier est
masque. Les curseurs temperature et humidite servent aussi bien a l'AHT20/DHT20
qu'aux SCD30 et SCD41, qui mesurent les trois grandeurs.

---------------------------------------------------------
8. LA RADIO
---------------------------------------------------------
La categorie "Communication" regroupe la radio en quatre sous-categories :
Groupe (activer, desactiver, choisir le groupe), Envoi (envoyer un nombre, un
texte, un couple nom/valeur), Reception (le bloc "lorsque un nombre / un texte /
une valeur est recu" et le bloc de lecture) et Plus (puissance d'emission,
longueur d'onde).

Le bloc de lecture donne, au choix : le nombre recu, le nom recu, la valeur
recue, le texte recu, la force du signal. Il n'a de sens qu'a l'interieur d'un
bloc "lorsque ... recu" : ailleurs il lira le dernier message arrive, ou du vide.

La convention de transport est textuelle, la meme que celle de MicroPython :
un nombre part comme "42", un couple part comme "nom=valeur", un texte part tel
quel. A la reception, le dispatcher classe le message : s'il contient "=", c'est
un couple ; sinon s'il se convertit en nombre, c'est un nombre ; sinon c'est un
texte. Deux micro:bit programmes avec cette application se comprennent donc
parfaitement.

Ce qu'il faut savoir : cette radio n'est PAS compatible en l'air avec MakeCode.
MakeCode utilise un format binaire propre a lui, avec un en-tete et un numero de
serie. Un micro:bit sous MakeCode et un micro:bit sous cette application ne
s'entendront pas, meme sur le meme groupe. C'est une limite de MicroPython, pas
de l'application.

Deux blocs MakeCode n'ont volontairement pas ete repris, faute d'equivalent
MicroPython : "regler le numero de serie de transmission" et "radio declencher
l'evenement".

Cote simulateur, la section "Radio : message a recevoir" apparait des qu'un bloc
"lorsque ... recu" est pose. On y saisit le message et on clique "Simuler la
reception" : le dispatcher le classe et appelle le bon gestionnaire, exactement
comme sur la carte. La force du signal simulee vaut -42.

Extensions (nov. 2026, variante B choisie par l'utilisateur) : Fichier > Blocs > "Extensions..." ouvre une
fenetre de cartes (Radio, Servos, Cartes d'extension, Grove, Graphique, IA). Un clic sur une carte ajoute ou retire
la categorie de la colonne des categories (effet immediat). Tout est affiche au depart ; le choix est retenu sur le
PC (localStorage, cle easybloc_ts_extensions_retirees), a part du panneau administrateur (une categorie masquee par
l'administrateur reste masquee). Retirer une extension n'efface pas ses blocs poses ; un programme qui en utilise
une (fichier ouvert, exemple, exercice, Annuler, programme restaure) la remet toute seule (un.js, "EXTENSIONS").
Puis (meme jour, demande de l'utilisateur) : la liste EXTENSIONS est VIDE pour l'instant ; la fenetre affiche
"Aucune extension pour l'instant" et servira a proposer des fonctionnalites futures. Le mecanisme reste en
place : ajouter une entree { nom, desc } a EXTENSIONS (les six categories testees sont en commentaire dans un.js).

Proposition du multi-editeur radio (oct. 2026) : quand l'eleve glisse un bloc
Radio dans la zone de programmation, un bandeau propose d'ouvrir le
multi-editeur radio (Fichier > Multi-editeur radio : deux editeurs vierges cote
a cote, dans un nouvel onglet ; le programme en cours reste dans l'onglet
d'origine). Boutons : "Ouvrir le multi-editeur", "Plus tard", "Ne plus
proposer" (memorise dans le navigateur). Une seule proposition par onglet ;
rien au chargement d'un fichier, d'un exercice ou d'un exemple (seul un
glisser la declenche), ni dans le multi-editeur lui-meme (bandeau.js).
Pour annuler "Ne plus proposer" : menu Aide > "Reactiver la proposition du
multi-editeur" (grisee tant qu'il n'y a rien a annuler, absente du
multi-editeur). Attention, en ligne (jreynaud42000.github.io), tous les
editeurs partagent la meme memoire du navigateur : ce reglage vaut pour tous
ceux qui ont cette proposition.

---------------------------------------------------------
9. LES FONCTIONS
---------------------------------------------------------
La categorie "Fonctions" est dynamique : elle fournit la definition, la
definition avec retour, le retour conditionnel, et un bloc d'appel pour chaque
fonction creee. Les parametres s'ajoutent par le bouton + du bloc.

A savoir : tant qu'aucune fonction n'existe, la categorie ne montre que les
trois premiers blocs. Le bloc d'appel apparait des qu'on a pose une definition
et nomme la fonction — un par fonction, portant son nom. Contrairement a
d'autres editeurs, aucun bloc d'appel generique n'est affiche d'emblee. Un bloc
d'appel ne peut pas exister sans fonction cible.

Les fonctions sont ecrites en tete du programme, avant tout code executable,
comme les gestionnaires "lorsque ...". On peut donc poser les blocs n'importe
ou dans l'espace de travail.

---------------------------------------------------------
10. LES BLOCS "LORSQUE ..."
---------------------------------------------------------
MicroPython n'a pas de systeme d'evenements. Chaque bloc "lorsque ..." produit
une fonction, et l'application ajoute automatiquement une boucle qui les
appelle. S'il existe deja une boucle "Repeter indefiniment", la scrutation y est
inseree ; sinon une boucle dediee est ajoutee a la fin du programme.

Consequence pratique : un bloc "lorsque ..." pose seul suffit, le programme
tournera. Inutile de l'entourer d'une boucle.

Au demarrage de l'application, l'espace de travail contient deja deux blocs
emboites l'un dans l'autre : "Au demarrage" au-dessus de "Repeter
indefiniment", comme dans MakeCode.

"Au demarrage" s'execute une seule fois, avant tout le reste. Il n'a pas
d'encoche du dessus (rien ne s'accroche AU-DESSUS : il reste toujours le bloc
le plus haut, et un seul exemplaire est autorise — deux rendraient l'ordre
d'execution ambigu), mais a une encoche du bas pour s'emboiter avec le bloc
suivant, comme "Repeter indefiniment" par defaut. Son contenu est genere a
plat, en tete du programme.

L'ordre des blocs de premier niveau suit leur position verticale dans l'espace
de travail : garder "Au demarrage" au-dessus des boucles. L'emboitement les
lie physiquement pour garantir cet ordre, mais reste facultatif : les
detacher et les laisser juste l'un au-dessus de l'autre produit le meme code.

Les fonctions produites par les blocs "lorsque ..." font exception : elles sont
placees d'office en tete du programme, avant tout code executable. Sans cela, un
bloc "lorsque ..." pose a droite ou en dessous d'une boucle aurait ete defini
apres l'appel qui l'utilise, et le programme se serait arrete sur un NameError.
On peut donc les disposer librement dans l'espace de travail.

Un bloc pose sur l'espace de travail mais pas accroche a "Au demarrage", a
"Repeter indefiniment", a un bloc "lorsque ..." (ou a l'interieur de l'un
d'eux) s'affiche automatiquement griffe/grise (rendu Blockly standard) : il
n'est pas actif, et n'apparait pas dans le code genere. Le reconnecter le
reactive aussitot. Avant cette regle, un tel bloc isole n'etait pas grise
alors qu'il ne faisait deja rien la plupart du temps - pire, un bloc
d'instruction pose seul (pas un conteneur) etait bien execute une fois, tout
en haut du programme, ce qui pouvait surprendre.

"nombre de clics du bouton" (categorie Entrees/Sorties) : sur la vraie carte,
l'API MicroPython sous-jacente (get_presses()) remet son compteur a 0 des
qu'on la LIT - un simple "si nombre de clics = 10 alors ..." ne se
declencherait donc quasiment jamais tel quel. Le bloc genere pour cette
raison son propre compteur cumulatif a cote (une petite fonction Python,
invisible dans les blocs), qui lui ne se remet jamais a 0 tout seul :
correct aussi bien sur la vraie carte que dans le simulateur, puisque c'est
le meme code qui tourne dans les deux cas.

Le simulateur garde desormais cette session (variables Python globales,
objets Grove deja crees, etat des servos...) d'un declenchement a l'autre
tant que le code n'a pas change : un bouton virtuel presse pendant que rien
n'est en cours poursuit l'environnement existant au lieu de tout relancer
depuis "Au demarrage". Des clics espaces de plusieurs secondes s'additionnent
donc correctement dans "nombre de clics du bouton", comme sur la vraie
carte. Seul le bouton "Lancer la simulation" continue a tout redemarrer a
zero (son role naturel), et "Reinitialiser la simulation" efface cette
session au passage.

"attendre jusqu'à" (categorie Temps) : sur la vraie carte, "sleep()" met
vraiment en pause, le temps que la condition attendue (bouton, capteur...)
puisse changer. Dans le simulateur, "sleep()" ne met rien en pause pour de
vrai - la boucle d'attente ne peut donc jamais voir la condition changer
tant qu'elle tourne, et bouclerait indefiniment. Une limite interne coupe
court a cette boucle sans figer l'onglet : si la condition n'est toujours
pas vraie a la fin d'un tour, ce tour n'affiche simplement rien (comme la
vraie carte, qui attendrait juste le prochain declenchement) - pas de
message d'erreur pour ce cas normal, seulement pour une vraie erreur de
programme. Pour tester ce genre d'attente dans le simulateur, on peut aussi
remplacer "attendre jusqu'à" par un "si ... alors" verifie a chaque tour de
"Repeter indefiniment".

"lorsque la broche P0/P1/P2 est activée" et "broche ... est pressée"
(categories Communication/Entrees-Sorties) : sur une vraie carte, detecter
un "touche" sur ces broches necessite normalement de toucher la broche ET
une broche GND en meme temps (detection resistive, mesuree entre les deux) -
un simple doigt sur P0 seul ne suffirait pas. Le code genere active
automatiquement le mode tactile capacitif de la carte V2
(set_touch_mode(CAPACITIVE)) : un seul doigt sur la broche suffit donc,
comme dans le simulateur (qui, lui, n'a jamais eu besoin de circuit GND).

"LCD : allumer / eteindre l'affichage" (Grove LCD 16x2 v1, JHD1802,
monochrome) : le retro-eclairage de ce module est cable en permanence, il
n'existe aucune commande I2C pour le couper. Le bloc agit seulement sur
l'affichage des caracteres (bit "display on/off" du controleur HD44780) : le
texte disparait puis revient a l'allumage, le fond bleu reste allume - sur la
vraie carte comme dans le simulateur (aligne depuis : il grisait auparavant
tout l'ecran, ce que la carte ne fait pas). Pour un "vrai" ecran eteint, il
faudrait couper l'alimentation du module. Apres "eteindre", ne pas oublier
"allumer" : "LCD : effacer" ne rallume pas l'affichage.

Grove LCD RGB Backlight V4.0 (JHD1313M3) - blocs "LCD RGB : ..." (categorie
Grove) : deux circuits I2C sur le meme module, texte a l'adresse 0x3E (memes
commandes que le LCD v1) et retro-eclairage RGB a 0x62 (puce PCA9633).
Initialisation du fond selon la fiche Seeed : MODE1=0, MODE2=0, LEDOUT=0xAA,
puis PWM registre 4 = rouge, 3 = vert, 2 = bleu. Blocs : initialiser,
afficher (x, y), effacer, allumer/eteindre l'affichage (caracteres seulement),
retro-eclairage couleur (palette), retro-eclairage rouge/vert/bleu (0 a 255)
et allumer/eteindre le retro-eclairage (eteindre le coupe, allumer remet la
derniere couleur). Au demarrage le fond est blanc. Alimentation 5 V : la
V4.0 n'accepte pas le 3,3 V. La V5.0 (adresse 0x30, puce SGM31323) n'est PAS
geree. Le simulateur reutilise le meme panneau d'ecran que le LCD v1, avec la
couleur du fond et des caracteres adaptes a sa luminosite. Les blocs LCD ne
sont pas reconstruits en blocs a l'import d'un .py (comme les autres blocs
Grove) : ils deviennent des blocs "code".

Console (barre en bas de l'application, sous les trois panneaux) : un seul
espace pour deux sources. Elle est MASQUEE au depart ; le bouton >_ de la
barre d'outils l'affiche ou la masque (la croix de sa barre aussi), et la
zone de blocs se redimensionne en consequence. Elle s'ouvre toute seule a la
premiere sortie (print du simulateur ou de la carte), sauf si l'utilisateur
l'a fermee lui-meme. Sa hauteur se regle en glissant son bord haut (trait orange
au survol ; souris ou doigt) ; elle est retenue dans le navigateur, et un double-clic sur ce
bord rend la hauteur de depart. L'espace de blocs garde toujours au moins 150 px. Le bouton "?" de sa barre ouvre l'aide d'utilisation de la
console (meme fenetre que l'aide d'un bloc ; texte dans TEXTE_AIDE_CONSOLE,
un.js : a tenir a jour si la console change). Le bouton 📊 exporte toutes les
lignes affichees dans un fichier Excel .xlsx (console-microbit-AAAAMMJJ-
HHMMSS.xlsx) : colonnes N°, Heure (hh:mm:ss.mmm de la reception), Source
(Simulateur / Carte / Information), Texte et Valeur numerique (remplie quand
la ligne est un nombre, pour tracer une courbe). Format .xlsx et non .xls (le
.xls binaire est obsolete ; Excel et LibreOffice lisent le .xlsx). Le fichier
est fabrique dans le navigateur sans bibliotheque (archive ZIP non compressee
de cinq fichiers XML : creerZip / creerXlsxConsole dans un.js), donc il marche
aussi hors ligne. Valide en relisant un export avec openpyxl et LibreOffice.
Onglet "Graphique" (a cote de "Texte", dans l'en-tete de la console) : trace en
courbes les valeurs NUMERIQUES des lignes deja affichees, au fil du temps (axe
horizontal en secondes depuis la premiere mesure), sur un canevas dessine a la
main (pas de bibliotheque, marche hors ligne). Formats reconnus, un par ligne :
"21.5" (une courbe "Valeur"), "(12, 40, 7)" ou "12 40 7" (courbes "Serie 1",
"Serie 2"... comme le traceur de Mu), "temp:21 lum:40" ou "nom=valeur" (une
courbe par nom). Une virgule entre deux chiffres est decimale ("21,5") quand la
ligne ne contient qu'un nombre ; "1,2,3" est une liste. Les lignes non
numeriques sont ignorees. Si simulateur et carte envoient des valeurs, leurs
courbes sont separees (prefixe "Simulateur ·" / "Carte ·"). 600 derniers points
par courbe, echelle verticale automatique, couleurs du theme en cours (sombre,
clair, contraste eleve), mise a jour automatique (regroupee par pas de 100 ms).
Fonctions : extraireMesures, collecterSeries, dessinerGraphique (un.js).
Blocs de la categorie Graphique (nov. 2026, repris de l'editeur R4 : graph_tracer, graph_point, graph_axes,
graph_effacer, graph_arreter, graph_reprendre) : chaque bloc genere un print() d'une ligne de commande, la meme
dans le simulateur et sur la carte (port USB) :
  #G|P|<courbe>|<x>|<y>   point ; "tracer" prend x = running_time() / 1000 (secondes depuis le demarrage)
  #G|A|<nom X>|<nom Y>    noms des axes (ecrits sous l'axe X et le long de l'axe Y)
  #G|E                    effacer le graphique (les noms des axes restent)
  #G|S  /  #G|R           arreter / reprendre la mesure (points ignores entre les deux ; pas de trait
                          entre le dernier point avant l'arret et le premier apres la reprise)
Ces lignes sont MASQUEES dans la console (classe console-commande, index.html). Des qu'il y en a une, l'onglet
Graphique ne trace QUE les courbes de ces blocs (axe X choisi par le programme, sans « s ») ; sinon il trace les
nombres de "afficher dans la console" comme avant. Le separateur "|" est remplace par "/" dans les noms saisis.
Export Excel : seuls les points sont exportes (« Courbe 1 : X = 2 ; Y = 21 », Y dans la colonne Valeur
numerique), sans ceux envoyes pendant un arret. Fonction : collecterCommandesGraphique (un.js). Verifie dans le
navigateur en envoyant les lignes a la console (lecture, masquage, arret/reprise, export) ; le dessin du
graphique et l'envoi sur une vraie carte micro:bit ne sont PAS verifies a l'ecran.
1) SIMULATEUR : le bloc "afficher dans la console" (categorie
Affichage, genere print(x)) ecrit dans la console, dans l'ordre du programme
par rapport aux affichages et aux pauses (file d'actions du simulateur, voir
print_console dans index.html). "Lancer la simulation" et "Reinitialiser"
effacent les lignes du simulateur ; 1000 lignes maximum sont gardees (une
boucle sans pause inonderait la page). 2) VRAIE CARTE : bouton "Connecter" =
Web Serial (Chrome ou Edge uniquement), port USB de la carte (constructeur
0x0D28, DAPLink), 115200 bauds ; la sortie de la carte s'affiche en vert. Le
champ du bas envoie du texte a la carte (termine par \r\n) et l'affiche en
gris ("> texte"). Apres "Envoyer sur la carte", la carte redemarre, son port
disparait puis revient : la console se reconnecte toute seule (sauf si on a
clique "Deconnecter" soi-meme). Si la connexion echoue, un autre onglet ou
programme (editeur de code, terminal serie) utilise probablement deja le port.
Non teste avec une vraie carte : la logique (lecture en morceaux, envoi,
debranchement, reconnexion) a ete validee avec un faux port serie.

Aide sur un bloc : clic droit sur un bloc de l'espace de travail >
"Aide sur ce bloc" ouvre une fenetre (avec le logo de l'application, logo.png,
dans son en-tete) avec le nom du bloc, son texte d'aide et
le code MicroPython qu'il genere (le bloc seul, pas les suivants). Le texte
vient, par priorite : de la table AIDE_BLOCS (un.js, une ligne par bloc, avec
son identifiant technique), puis de l'infobulle du bloc (setTooltip, blocs
natifs de Blockly compris), sinon un message "aucune aide detaillee". Tous
les blocs personnalises ont aujourd'hui un texte (105 entrees dans AIDE_BLOCS
en plus des infobulles existantes) ; un bloc cree plus tard n'en aura pas tant
qu'on n'y ajoute pas sa ligne. Pour
rediger l'aide d'un bloc, ajouter sa ligne dans AIDE_BLOCS. Fermeture : bouton
Fermer, touche Echap ou clic hors de la fenetre.

Programmes d'exemple : sous le texte d'aide, la fenetre propose un petit
programme d'exemple (titre, explication, le programme EN BLOCS dans un petit
espace Blockly en lecture seule, reduit si besoin pour tenir en entier ; le
code MicroPython est replie sous "Voir le code MicroPython") et un bouton
"Insérer cet exemple dans mon espace de travail". L'exemple est ajoute SOUS
les blocs existants, sans rien effacer, en un seul pas d'annulation (un
Ctrl+Z le retire entierement). Attention : si le programme contient deja un
"Au demarrage" ou un "Repeter indefiniment", l'exemple en ajoute un second ;
c'est a l'utilisateur de fusionner ou de supprimer. 131 exemples couvrent 174
blocs (les familles partagent un exemple : LCD, LCD RGB, ruban, etc.). Ils
sont declares dans EXEMPLES_BLOCS (un.js), avec la fonction exemple(ids,
titre, texte, blocs) ; les blocs racines doivent etre des conteneurs
(exStart, exLoop, exWhen), un bloc pose seul etant grise. Blocs sans exemple : les blocs
natifs de Blockly et les deux blocs de secours (code_brut, expression_brute).

Les blocs de la boite a
outils (volet de gauche) n'ont pas de menu contextuel : Blockly n'en propose
que pour les blocs deja poses.

"Envoyer sur la carte" : une fenetre modale s'affiche au premier plan
pendant tout le transfert (generation, choix du lecteur, ecriture,
finalisation) avec une barre de 0 a 100 %. Le pourcentage compte de vrais
octets ecrits, par morceaux de 32 Ko ; il reste a 99 % ("Finalisation...")
tant que le lecteur n'a pas valide la fin de l'ecriture. La reprogrammation
de la carte elle-meme, ensuite, n'est pas mesurable depuis le navigateur. En
cas d'erreur ou d'annulation la fenetre se ferme et le message reste dans la
barre d'etat. Balisage : #voile-envoi (index.html) ; logique : fenetreEnvoi
(un.js).

---------------------------------------------------------
11. LE FICHIER FIRMWARE.HEX
---------------------------------------------------------
C'est l'image MicroPython dans laquelle le programme vient s'ecrire. Celui
fourni ici est un hex universel (V1 + V2) exporte depuis python.microbit.org.

Les deux formats sont acceptes, Intel et universel. Un .hex exporte depuis
l'editeur convient meme s'il contient deja un programme : deux.js efface la zone
du systeme de fichiers avant d'y ecrire le nouveau main.py.

Attention aux copies incompletes : un firmware tronque est refuse avec le
message "firmware.hex est incomplet", qui indique le nombre d'octets recus.

Ce message peut aussi apparaitre alors que le fichier sur le disque est
parfaitement valide : si un autre projet a ete servi auparavant sur le meme
http://localhost:8000, le navigateur a garde SON firmware.hex en cache, a la
meme adresse, et le ressert. deux.js demande desormais la lecture avec
cache: "no-store" pour eviter cela ; en cas de doute, comparer la taille
annoncee dans le message avec celle du fichier sur le disque.

---------------------------------------------------------
12. REGENERER L'EXECUTABLE
---------------------------------------------------------
Apres toute modification des fichiers du projet :

   python -m PyInstaller app.spec --noconfirm

Le resultat est le DOSSIER dist/MicrobitEasybloc_V2.0E/ (MicrobitEasybloc_V2.0E.exe et _internal/,
~50 Mo, sans installation). Depuis nov. 2026, mode dossier ("onedir") et non plus exe unique : l'exe unique
(~26 Mo) etait supprime de dist/ par l'antivirus de Windows, faux positif courant avec PyInstaller. Distribuer
le dossier ENTIER (par exemple zippe : Compress-Archive dist\MicrobitEasybloc_V2.0E
dist\MicrobitEasybloc_V2.0E.zip), jamais l'exe seul : sans _internal/ il ne demarre pas. UPX n'est pas
utilise (upx=False ; il n'etait de toute facon pas installe). Pour supprimer l'avertissement SmartScreen ou
une detection persistante : signer l'exe (certificat de signature de code) ou signaler le faux positif a
Microsoft (portail Microsoft Security Intelligence). NUMERO DE VERSION (actuellement V2.0E) : a changer aux
QUATRE endroits suivants, sinon ils divergent : VERSION dans app.py (affichee
dans la fenetre console de l'exe), version_info.txt (proprietes du fichier,
onglet Details : filevers/prodvers en nombres + FileVersion/ProductVersion/
OriginalFilename en texte), name= dans app.spec (nom du fichier .exe) et le
texte de #copyright-toolbar dans index.html (barre d'outils de l'application).
Supprimer ensuite l'ancien dossier de dist/ pour ne pas garder deux versions. Il embarque index.html, un.js, deux.js, trois.js, firmware.hex,
logo.png et readme.txt : tout NOUVEAU fichier utilise par l'application doit
etre ajoute a la liste datas de app.spec, sinon il manquera dans l'exe (logo.png
avait ete oublie). Double-clic : AUCUNE fenetre ne s'ouvre (l'exe
est construit sans console : console=False dans app.spec) ; l'application
s'ouvre directement dans UNE SEULE FENETRE, sans onglets ni barre d'adresse
(Microsoft Edge en mode application : msedge.exe --app=http://localhost:8000
--start-maximized, nov. 2026). Meme profil Edge que le navigateur habituel, donc
memes donnees enregistrees ; port serie (envoi sur la carte) et camera
inchanges ; F12 ouvre toujours les outils de developpement. Sans Edge, retour a
un onglet du navigateur par defaut. Le serveur tourne cache et
s'ARRETE TOUT SEUL quand la derniere page de l'application est fermee (voir
"Cycle de vie" ci-dessous). Si le port 8000 est occupe par un autre programme,
le suivant libre est pris (8001, 8002...). Si l'application tourne deja
(double-clic repete), une fenetre est simplement rouverte dessus, sans lancer
de seconde copie. Une erreur (aucun port libre) s'affiche dans une boite de
dialogue Windows.
Cycle de vie (app.py, exe uniquement ; `python app.py` garde sa console et ne
s'arrete jamais seul) : chaque page ouverte envoie un signe de vie toutes les
5 s (/_vie, script en bas de index.html) et un signal de fermeture quand le
navigateur la quitte (/_ferme, navigator.sendBeacon sur l'evenement pagehide).
Le serveur s'arrete 5 s apres la fermeture de la derniere page (delai de grace :
un rechargement F5 ne l'arrete pas) ; 150 s apres le dernier signe de vie si le
navigateur a plante ; 90 s apres le demarrage si aucune page ne s'est connectee.
Les delais se surchargent pour les tests par les variables d'environnement
MICROBIT_DELAI_GRACE, MICROBIT_DELAI_SILENCE et MICROBIT_DELAI_DEMARRAGE.
Plusieurs onglets/fenetres : le serveur reste tant qu'il en reste un d'ouvert.
Pour VOIR les messages du serveur (diagnostic), lancer `python app.py` dans un
terminal ou lancer_projet.bat. HORS LIGNE (depuis
V1.2) : plus aucune ressource n'est chargee depuis Internet, l'application et
l'exe fonctionnent sans connexion. Toutes les bibliotheques sont dans lib/ (a
embarquer dans app.spec : ('lib', 'lib')) :
  lib/blockly/        Blockly 10.4.3 (blockly_compressed, blocks_compressed,
                      python_compressed, msg/fr.js) + media/ (images et sons,
                      option media: 'lib/blockly/media/' dans les deux inject)
  lib/brython/        Brython 3.11.2 (brython.min.js, brython_stdlib.min.js)
  lib/microbit/       microbit-fs 0.10.1 et microbit-universal-hex 0.2.2, fichiers
                      autonomes tires d'esm.sh (?bundle), lus par deux.js et
                      trois.js. Extension .js et non .mjs : le serveur Python
                      de Windows sert .mjs en text/plain, que le navigateur
                      refuse pour un module.
Pour mettre a jour une bibliotheque : telecharger la nouvelle version au meme
emplacement (unpkg.com/blockly@X/..., cdnjs brython X, esm.sh/@microbit/...?bundle)
puis retester simulation, generation du .hex et envoi sur la carte. Ne pas
remettre de lien vers un CDN : aucune requete externe ne doit rester (verifiable
dans la console du navigateur, onglet Reseau). Licences d'origine conservees dans
les en-tetes des fichiers (Blockly : Apache 2.0 ; Brython : BSD ; microbit-fs et
microbit-universal-hex : MIT). Windows peut afficher un avertissement SmartScreen
au premier lancement (executable non signe).
Piege Windows corrige dans app.py : allow_reuse_address=True y laisse deux
serveurs ecouter le meme port, la detection de port occupe ne marchait donc pas.

---------------------------------------------------------
13. LE PANNEAU ADMINISTRATEUR
---------------------------------------------------------
Raccourci Ctrl+Alt+Maj+A : active ou desactive le mode administrateur. Le
bouton ⚙ est invisible tant que ce raccourci n'a pas ete utilise. Ce n'est pas
une vraie protection (l'app est 100% cliente, sans compte ni serveur) : ca
evite juste qu'un eleve tombe dessus par hasard.

Le panneau a quatre onglets :

- CATEGORIES : glisser pour reordonner, l'oeil masque une categorie aux
  eleves, le crayon la renomme, la pastille de couleur en tete de ligne
  change sa couleur (selecteur natif du navigateur). "Tout reinitialiser"
  revient a l'etat d'origine (ordre, noms et couleurs compris).
- SOUS-MENUS : on choisit une categorie dans la liste deroulante.
  - Communication et Grove ont deja des sous-menus (un par module) : ils se
    reordonnent/masquent/renomment/recolorent comme les categories.
  - Les autres categories sont a plat : on peut regrouper des blocs choisis
    dans un nouveau sous-menu (utile si une categorie s'allonge trop), avec
    lui aussi sa propre pastille de couleur. Un sous-menu supprime rend ses
    blocs au niveau superieur.
- LIBELLES : cherche un bloc par son nom technique ou par un mot de son
  texte affiche, puis modifie ce texte. Ca ne touche qu'a l'affichage, jamais
  au code Python genere ni au comportement du bloc.
- AIDE : le contenu de ce readme.txt, charge depuis le serveur local au
  premier clic sur l'onglet. Un lien l'ouvre aussi dans un nouvel onglet du
  navigateur.

Tout est memorise en localStorage, donc propre a chaque navigateur/poste :
pas de fichier de config partageable entre les postes d'une salle pour
l'instant. Reglages perdus si le cache du navigateur est vide.

---------------------------------------------------------
14. ÉDITION MANUELLE DU CODE
---------------------------------------------------------
Bouton "✎ Éditer" au-dessus de la transcription MicroPython : bascule le
panneau en zone de texte modifiable.

Blockly sait transformer des blocs en Python, jamais l'inverse de façon
fiable : du code tape a la main ne peut donc pas revenir en blocs. Les deux
ne peuvent pas rester synchronises, alors ce mode est exclusif plutot que de
laisser deriver l'un des deux sans le dire :

- Entrer en edition manuelle GELE le canevas Blockly (voile visible dessus,
  qui bloque aussi les clics) : impossible de modifier les blocs tant qu'on
  est en train de taper du code.
- Ce qui est tape remplace en direct le code utilise par le simulateur, le
  bouton .hex, le bouton .py et "Envoyer sur la carte".
- "↩ Revenir aux blocs" ABANDONNE la saisie manuelle et restaure le code tel
  que les blocs le decrivent a cet instant (pas celui d'avant l'edition, s'ils
  ont continue d'exister en arriere-plan).

Rien n'est sauvegarde d'une session a l'autre : recharger la page perd la
saisie manuelle, exactement comme elle perd deja l'espace de travail Blockly
lui-meme. Telecharger le .py avant de recharger si le texte tape doit etre
garde.

---------------------------------------------------------
15 a 18. ROBOTS (retires de cette variante)
---------------------------------------------------------
Maqueen Plus (et V3), Maqueen Lite, Kitrobot v2, telecommande infrarouge et
LiDAR ne font pas partie de cette variante : ni blocs, ni panneau Piste dans
le simulateur. Ils restent dans easybloc_ts_adacraft_minimal.

---------------------------------------------------------
19. IA : VISION (CAMERA) ET SON (MICRO)
---------------------------------------------------------
Reconnaissance d'images et de sons avec des modeles crees sur Teachable
Machine (teachablemachine.withgoogle.com, projet "Image" ou "Son"). Le
resultat pilote le programme : simulateur ou vraie carte, avec les memes blocs.

Principe : la reconnaissance tourne dans le NAVIGATEUR (la carte n'a ni
camera ni micro, et le modele est bien trop gros pour elle). La carte recoit
seulement le RESULTAT, une ligne de texte par le cable USB :
    IA:<vision|son>:<classe>:<confiance 0-100>
La classe y est ecrite sans accents ni majuscules ("Chat noir" -> chat_noir).
La ligne part a chaque changement de classe (classe vide quand la confiance
retombe sous le seuil), et un peu plus souvent pour mettre a jour la confiance
quand elle varie d'au moins 10 points. Le navigateur doit donc rester ouvert.

Blocs (categorie "IA", rose) :
- lorsque l'IA [vision|son] reconnait [classe]  : gestionnaire, ne se redeclenche
  pas tant que la classe reste la meme ;
- l'IA [vision|son] reconnait [classe]          : condition (vrai/faux) ;
- derniere classe reconnue par l'IA [type]      : texte (ex. "chat_noir") ;
- confiance de l'IA [type] (%)                  : nombre de 0 a 100.
Un programme qui en contient recoit un petit pilote (section "pilote ia",
replie dans la transcription) qui lit le port serie de la carte (uart.init a
115200 bauds, lecture dans la boucle d'evenements ; le tampon de reception de
la carte ne contient que 64 octets : eviter les longues pauses dans la boucle).
Ce pilote fait un uart.init(115200) : la liaison USB reste celle de print() et
de la console.

Panneau IA (bouton 🧠 de la barre d'outils, barre en bas) :
1. Coller l'adresse du modele (lien de partage Teachable Machine, "Charger" -
   necessite Internet) OU "Fichiers..." et selectionner d'un coup model.json,
   metadata.json et weights.bin du modele exporte (fonctionne hors connexion).
2. "Demarrer" : le navigateur demande la camera ou le micro. Les classes
   s'affichent avec une barre de probabilite ; la classe retenue passe en orange.
3. "Seuil de confiance" (30 a 99 %, 80 par defaut) : en dessous, aucune classe.
Fenetre IA (oct. 2026, sur le modele de la version Arduino R4) : le bouton IA ouvre une fenetre centree. Bandeau titre
(« Entrainer l'IA a reconnaitre des objets ou des images »...), onglets Apprentissage immediat / Modele Teachable Machine
(camera) / Modele Teachable Machine (micro) / QR codes et codes-barres (point bleu : pret, vert : en marche), pied :
Tout effacer, seuil de confiance, interrupteur « Envoyer a la carte », Termine. Apprentissage immediat : pastilles
« L'IA doit reconnaitre » ; une carte par classe a gauche (nom modifiable, nombre d'exemples, 🧹 vider, ✕ supprimer,
« Une photo », « Plusieurs photos » jusqu'a « Arreter », « Ajouter des images » ; sons : « Enregistrer »), « + Ajouter une
classe » ; a droite la camera (allumee a l'ouverture, eteinte a la fermeture), le test (Demarrer et barres), l'aide et la
note de confidentialite. Termine, Echap ou un clic sur le voile ferment la fenetre ; une reconnaissance en cours continue
(bouton IA souligne en vert).
4. Simulateur : lancer la simulation (sans elle, rien n'est transmis).
   Vraie carte : la connecter par le bouton Connecter de la console, envoyer le
   programme, cocher "Envoyer a la carte".
L'image et le son restent dans le navigateur ; seuls les noms de classe sont
transmis. Camera et micro sont coupes quand on arrete ou ferme la page.

Creer son modele dans l'application (sans Internet, comme sur Teachable Machine) :
dans chaque colonne, section "Creer un modele (entrainement)".
- Vision : bouton "Camera", puis maintenir "Maintenir" en face de chaque classe
  pour capturer des images en rafale. Son : "● 1 s" enregistre 1 seconde de son
  (prevoir une classe "Bruit de fond" pour le silence).
- Au moins 2 classes et 5 exemples par classe (30 ou plus, varies, est bien mieux).
- "Entrainer" : apprentissage par transfert. Un reseau de base (MobileNet v2 pour
  l'image, speech-commands pour le son, dans lib/tm/base/, ~7,5 Mo) extrait les
  caracteristiques ; seule une petite couche finale est entrainee (50 epoques en
  vision, 25 en son). Le modele devient aussitot le modele actif de la colonne.
- "Enregistrer" telecharge model.json, metadata.json et weights.bin (meme format
  que Teachable Machine : rechargeables avec "Fichiers..." ou sur leur site).
- Les exemples restent dans le navigateur et sont perdus si la page est rechargee.
- Sur un ordinateur sans accelerateur graphique (WebGL), la capture d'images et
  l'entrainement sont nettement plus lents (environ 1 s par image mesuree en
  CPU dans le navigateur integre ; beaucoup plus rapide avec WebGL).
- Garder l'onglet visible pendant l'entrainement : le navigateur met en pause les
  onglets caches et l'entrainement s'arrete avec eux.
- La capture sonore est suspendue pendant que le micro de reconnaissance tourne.

Hors connexion : TensorFlow.js 1.3.1 et les bibliotheques Teachable Machine
sont dans lib/tm (embarquees dans l'exe), chargees au premier "Charger".
Seule l'adresse en https:// d'un modele demande Internet.

Verifie : generation des blocs, simulateur (classes, seuil, redeclenchement,
ligne coupee en deux morceaux), chargement de modeles image ET son au format
Teachable Machine depuis des fichiers (modeles synthetiques), prediction sur
une image, boucle de reconnaissance avec une camera simulee, envoi sur un port
serie simule, entrainement vision (2 classes de couleur) et son (silence/bip),
enregistrement puis rechargement des 3 fichiers, avec les resultats justes.
NON verifie : camera et micro reels, modeles Teachable Machine reels, vraie
carte (reception par l'uart du pilote), chargement par adresse https://.
Le micro de la reconnaissance sonore demande un modele "Son" de Teachable
Machine (reconnaissance sur environ 1 seconde ; la classe "Background Noise"
est le bruit de fond).

---------------------------------------------------------
20. VISITES GUIDEES (MENU AIDE)
---------------------------------------------------------
L'entree "Visite guidee (tuto)" du menu Aide (elle relance toujours depuis
le debut) lance une visite en 14 etapes (section 55) : une bulle
explicative se place a cote de l'element presente (mis en evidence, le reste de
l'ecran est assombri). Le voile ne bloque pas les clics : on manipule les vrais
outils pendant la visite. Boutons Precedent / Suivant / Quitter, touche Echap
pour arreter ; relancer la visite par le meme menu.
Parcours : categories de blocs, premier programme, code MicroPython, simulateur,
lancer la simulation, boutons/gestes/capteurs, console, menu Fichier, envoi sur
la carte, panneau IA, blocs IA, aides.
Certaines etapes attendent une action (ouvrir une categorie, poser "Au demarrage"
avec "afficher icone" dedans, cliquer "Lancer la simulation", ouvrir la console) et
affichent "Bien joue" ; "Suivant" reste toujours utilisable pour ne jamais coincer.
Message d'accueil : au demarrage (1,2 s apres le chargement), une bulle sous le bouton
Aide propose de "visiter" le menu Aide ou se trouvent les visites. "Ouvrir le menu
Aide" l'ouvre et fait clignoter les deux entrees de visite ; "Plus tard" ferme le
message (il reviendra au prochain demarrage) ; la case "Ne plus afficher ce message"
le supprime definitivement (localStorage, cle tuto-accueil-masque, propre a chaque
adresse/port : pour le reafficher, vider les donnees du site). Ouvrir soi-meme le menu
ou appuyer sur Echap ferme aussi le message.
Deuxieme visite, consacree a l'IA : menu Aide > "Visite guidee IA" (15 etapes) :
ouvrir le panneau, les deux colonnes vision/son, creer un modele (camera, capture
d'exemples, entrainement), le tester, le seuil de confiance, charger un modele
Teachable Machine, le son et sa classe "Bruit de fond", enregistrer, les blocs IA,
reagir a une classe, essai dans le simulateur, vraie carte, aide. Les etapes
d'action attendent : camera allumee, 5 images par classe, "Modele entraine",
reconnaissance demarree, categorie IA choisie, bloc pose, simulation lancee.
Verifie dans le navigateur integre : positionnement des 15 etapes, detection de
chaque action (camera, captures, entrainement et reconnaissance simules par un flux
synthetique). Non verifie : avec une vraie camera.
Troisieme et quatrieme visites : menu Aide > "Visite guidee Console" (11 etapes : ouvrir la console,
le bloc "afficher dans la console", le poser, lancer la simulation, la zone de texte, l'onglet Graphique,
effacer, exporter Excel, lire la vraie carte, envoyer du texte, aide et fermeture) et "Visite guidee
clic droit" (8 etapes : menu d'un bloc, "Aide sur ce bloc", Dupliquer, Ajouter un commentaire, Reduire,
Desactiver, menu du fond - Nettoyer / Reduire / Developper / Supprimer -, annuler). Les etapes d'action
detectent un vrai clic droit (menu contextuel Blockly affiche), la fenetre d'aide ouverte, un bloc copie,
un commentaire, un bloc replie ou desactive. Echap ferme d'abord le menu contextuel ou la fenetre d'aide
(sans arreter la visite) ; un second Echap arrete la visite. Le message d'accueil cite les quatre visites.
Le cadre orange de mise en evidence a une marge de 8 px, reduite a 3 px pour les elements de moins de 40 px de
haut (lignes de categories, boutons) : sinon il debordait sur les lignes voisines et semblait les entourer aussi.
La bulle ne doit jamais recouvrir l'element presente : si la cible est collee au bord droit de l'ecran (boutons de la
console), elle s'aligne sur son bord droit, au-dessus ou en dessous. Verifie dans le navigateur integre : positionnement des etapes de chaque visite (1280x720), chaque detection
d'action (clic droit reel sur un bloc et sur le fond, le reste simule), Echap. Pas verifie : vraie carte.
Modifier ou ajouter une etape : une entree dans les tableaux ETAPES_GENERAL, ETAPES_IA, ETAPES_CONSOLE ou
ETAPES_CLIC_DROIT de tuto.js
(titre, texte, cible = selecteur CSS ou fonction, avant(), attendre() ou
attendreClic, consigne). Si un identifiant du HTML change, adapter la cible.
Verifie dans le navigateur integre : positionnement de la bulle sur les 12
etapes (dans l'ecran 1280x720), detection des actions, navigation, Echap. Pas
verifie : petits ecrans (bulle de 340 px de large) ni lecteurs d'ecran.
Fichier a ajouter a la liste datas de app.spec (fait) pour l'exe.

---------------------------------------------------------
21. COULEURS DES CATEGORIES
---------------------------------------------------------
Une seule table, PALETTE_CATEGORIES (un.js, juste avant Blockly.inject), donne la
couleur de chaque categorie : la bande de la colonne de categories (large de 16 px,
regle CSS dans index.html) ET tous les blocs de la categorie la suivent
(appliquerPaletteToolbox les recolore a leur creation). Les sous-categories
(Communication, Grove) heritent de leur parent.
Palette volontairement reduite a 7 couleurs TRANCHEES (orange, bleu, or, violet,
turquoise, rouge, magenta), sans vert, choisies pour rester distinguables en cas de
daltonisme. Graphique (nov. 2026) : bordeaux #8E1B3A (variante A choisie par l'utilisateur, distincte de
Variables #A10D6E). Une couleur sert a plusieurs categories mais jamais a deux categories
voisines de la colonne ; les quatre robots (Maqueen Plus/Lite, Kitrobot, LiDAR)
partagent le violet. Texte blanc des blocs lisible (contraste >= 3,9). Pour changer
une couleur : modifier la ligne de la table (constantes C_ORANGE, C_BLEU...). Les
couleurs choisies dans le panneau administrateur (§13) remplacent la bande
seulement, pas les blocs. Non verifie avec une personne daltonienne ni un simulateur
de daltonisme : choix fait d'apres la theorie (palette dite d'Okabe-Ito adaptee).

---------------------------------------------------------
22. CHARTE GRAPHIQUE (COULEURS TECHNOLOGIE SERVICES)
---------------------------------------------------------
Les couleurs de l'interface reprennent celles de Technologie Services
(technologieservices.fr), relevees sur leur site et leur logo : ORANGE (accent du
site #ff5501 ; le logo va du rouge #e02010 a l'orange #e87000), ANTHRACITE / NOIR
(#303030 en pied de page, #0f171f) et BLANC. Il n'y avait plus de bleu-ardoise.
- Fonds (variables CSS en tete de index.html, themes sombre / clair / contraste) :
  anthracite #303030 (barre d'outils, colonne de categories, panneaux), #1c1c1c
  (zones profondes), #202020 (champs de saisie) ; theme clair : gris neutres.
- Boutons d'action principaux (Fichier, Envoyer, Lancer la simulation, .hex) : orange
  fonce #cf4400, survol #b33a00 (texte blanc, contraste 4,8:1 ; le #ff5501 pur, trop clair
  pour du texte blanc, est reserve aux bandes, titres et contours).
- Boutons secondaires : gris anthracite #4a4a4a (survol #5e5e5e).
- Titres de panneaux : orange clair #ff7a33 (lisible sur fond sombre).
- Conserves : couleurs des categories de blocs (§21, hors charte, pour leur lisibilite),
  vert des etats "ok" (carte connectee, classe reconnue), rouge des erreurs, couleurs
  "d'appareil" (carte micro:bit, DEL).
- Le logo logo.png (barre d'outils) n'a PAS ete change.
Pour modifier la charte : remplacer ces codes hexadecimaux dans le bloc <style> de
index.html et dans les themes Blockly de un.js (THEME_SOMBRE_*).
- Barre d'outils et menu Fichier : plus aucune icone, les boutons portent un libelle
  texte (Fichier, Capture, Envoyer, Annuler, Refaire, Code, Simulateur, Console, IA,
  Theme, Contraste). Les boutons ne se coupent jamais sur deux lignes ; la barre passe
  a la ligne quand la fenetre est trop etroite (moins de ~1250 px). Les boutons a
  l'interieur des panneaux Console et IA (Connecter, Camera, Entrainer...) gardent
  pour l'instant leurs petits symboles.

---------------------------------------------------------
23. BARRE D'OUTILS : ORGANISATION
---------------------------------------------------------
De gauche a droite : logo | Affichage (menu : Theme, Contraste eleve) | Fichier (menu :
Nouveau projet, telecharger .hex/.py, importer .hex/.py) | champ "Nom du fichier" |
Annuler | Refaire | Capture | Envoyer | Console | Simulation | Code | IA | version |
Aide (menu : Visite guidee, IA, Console, clic droit), tout a droite ; son menu s'ouvre vers la gauche.
- Message d'etat (ex. "Fichier telecharge.", erreurs en rouge) : petit bandeau sous le bord droit de la
  barre, par-dessus le contenu, sans effet sur les clics ; il ne decale plus aucun bouton et n'est plus tronque.
- Champ "Nom du fichier" : nomme les fichiers telecharges (.hex, .py) et la capture
  d'ecran (.png) ; vide = noms d'origine (programme-microbit.hex, script_microbit.py,
  programme-microbit.png). Les caracteres interdits par Windows (\ / : * ? " < > |) et
  l'extension saisie sont retires. Importer un .hex ou .py reprend le nom du fichier
  dans le champ ; "Nouveau projet" le vide. Le nom n'est pas memorise au rechargement.
  Le fichier ecrit directement sur la carte ("Envoyer") garde son nom (sans importance
  pour la carte). Le fichier xlsx de la console garde son nom date.
- Icones (SVG, couleur du texte, grisees avec le bouton quand il est inactif) : ◐ Affichage,
  ☰ Fichier, fleches Annuler / Refaire, appareil photo Capture, fleche vers le haut Envoyer,
  terminal Console, panneau a deux colonnes Simulation, chevrons < > Code, etincelles IA.
  Seuls Aide et les menus Affichage / Fichier / Aide (hors leur bouton) n'ont pas d'autre icone.
  Police des boutons ramenee a 12 px et marges resserrees (dont le groupe de zoom) pour que tout
  tienne sur une ligne a 1280 px (marge restante faible : sous ~1280 px la barre passe a la ligne).
- Couleur : tous les boutons de la barre sont du meme orange (#cf4400, survol #b33a00). Les boutons
  qui ouvrent un panneau (Code, Simulation, Console, IA) montrent leur etat par un lisere BLANC sous
  le bouton quand le panneau est ouvert. Annuler / Refaire sans rien a annuler sont attenues (opacite
  45 %). Les boutons des menus deroulants et du groupe de zoom restent gris anthracite.
- Les trois menus s'ouvrent au clic, un seul a la fois ; un clic ailleurs les ferme.
- "Envoyer" (vers la carte) et "IA" ne figuraient pas dans la liste demandee : ils ont ete
  conserves, Envoyer apres Capture et IA apres Code.

---------------------------------------------------------
24. BANDEAU IDENTIQUE A LA VERSION ARDUINO R4 (copie d'essai easybloc_ts_adacraft_vilain)
---------------------------------------------------------
Le bandeau du haut reprend l'apparence de la version Arduino R4 (modele fourni par le collegue) : memes boutons,
memes menus, meme ordre, memes couleurs. Seul l'habillage change (index.html + bandeau.js, nouveau) : les id et les
fonctions de ce logiciel sont conserves. Ordre, de gauche a droite :
 logo | Affichage (icone ronde : Theme Clair/Sombre, Contraste Normal/Eleve, avec ✓) | Fichier (Nouveau projet,
 Charger .hex, Charger .py, Telecharger .xml [grise], Telecharger .hex, Telecharger .py) | nom du fichier (encadre
 blanc, champ de saisie) | Defaire | Refaire | Capture | Console | Simulation |
 Code | IA | selecteur de carte [grise] | Televerser | Lancer la simulation /
 Arreter | version | Aide (Visite guidee, IA, Mon premier programme [grise], clic droit, Console), tout a droite.
Correspondances (modele -> ce logiciel) : Le "Moniteur serie" du modele est FUSIONNE dans "Console" (la console est le moniteur) : le bouton Console
affiche / masque le panneau (depuis nov. 2026 : Capture, Console, Simulation et Code en icones seules, panneau
ouvert = pastille claire, plus de voyant de connexion sur le bouton Console) ; la connexion se fait avec "Connecter" dans
l'en-tete de la console (#btn-console-carte, code existant, vert quand la carte est connectee) ; Televerser = "Envoyer sur la carte" (#btn-envoyer) ; Lancer = #run-sim, Arreter = #btn-reset ; Theme / Contraste =
boutons d'origine #btn-theme / #btn-contraste, caches dans le menu et pilotes par les nouvelles entrees ; Telecharger
.ino = .hex et .py. Absents de ce logiciel, donc GRISES : Telecharger .xml, Mon premier programme.
Selecteur de carte ACTIF : le menu liste les micro:bit deja autorisees (Web Serial, navigator.serial.getPorts, filtre
fabricant 0x0D28 ; nommees micro:bit 1, 2... car le navigateur ne donne pas leur nom) ; ⟳ ouvre la fenetre de choix du
navigateur pour en autoriser une nouvelle ; le bouton Connecter de la console utilise la carte choisie SANS rouvrir la
fenetre (bandeau.js enveloppe navigator.serial.requestPort, un.js n'est pas modifie). Sans carte autorisee, ou hors
Chrome/Edge, comportement d'origine. Ne concerne que la connexion serie : Televerser garde son choix de lecteur.
Specifiques a ce logiciel (absents du modele) : bouton IA (apres Code), Charger .hex / .py, visite Console, version.
Couleurs (charte Technologie Services, qui remplace le turquoise du modele Arduino) : fond ANTHRACITE #303030 (theme
clair) / #262626 (sombre) / noir (contraste eleve), filet ORANGE #ff5501 de 3 px sous le bandeau, coche des menus orange ; Televerser bleu #1c7ed6, Lancer vert
#4caa3c, Arreter rouge. Tient sur une ligne a 1920 px, passe sur deux lignes en dessous (verifie a 1366 px).
bandeau.js (ne modifie aucune fonction existante) : relais des nouveaux boutons, libelles Afficher/Masquer, coches ✓,
bascule Lancer/Arreter. A embarquer dans app.spec (fait).

---------------------------------------------------------
25. PUCES RONDES DE LA COLONNE DE CATEGORIES (copie d'essai)
---------------------------------------------------------
Les bandes rectangulaires de couleur sont remplacees par des puces rondes (12 px, cerclees de blanc ; de noir en
theme clair, pour rester visibles sur la ligne selectionnee qui prend la couleur de la categorie). Blockly pose la
couleur de la categorie en bordure gauche de la ligne : bandeau.js la recopie dans la variable CSS --puce
(colorerPuces, relancee quand la boite a outils est reconstruite), et index.html supprime la bordure et dessine la
puce (.blocklyTreeRow::before). Les couleurs elles-memes (§21) ne changent pas.

---------------------------------------------------------
26. ORDRE DES CATEGORIES (copie d'essai)
---------------------------------------------------------
Ordre par defaut de la colonne (table ORDRE_CATEGORIES, un.js, appliquee par reordonnerToolbox avant la couleur) :
Boucles, Temps, Affichage, Entrees/Sorties, Capteurs, Actionneurs (Audio), Servos, Radio, IA, Grove, Logique, Variables, Maths, Texte, Fonctions, Listes (pas de categorie
"Robots" dans cette variante).
- "Communication" est renommee "Radio" (le nom est change dans la boite a outils ; le panneau administrateur la
  designe donc "Radio" ; une configuration administrateur deja enregistree dans le navigateur prime sur cet ordre :
  la reinitialiser dans le panneau administrateur pour retrouver l'ordre par defaut).
- "Listes" (nouvelle) : blocs de listes standards de Blockly - creer une liste (3 elements, vide), repeter, longueur, est
  vide, position de, obtenir / definir un element, sous-liste. Le code MicroPython genere (listes, len, tranches, une
  fonction first_index) a ete execute dans le simulateur (resultats justes) ; PAS verifie sur une vraie carte.
- "Graphique" (nov. 2026, entre Listes et IA, bordeaux #8E1B3A) : les six blocs de l'editeur R4 - tracer, ajouter le
  point X Y, nommer les axes, effacer le graphique, arreter / reprendre la mesure. Fonctionnement : voir la console (§3,
  « Blocs de la categorie Graphique »).
- Couleurs (§21) : Maths passe au rouge, Listes au turquoise, pour que deux categories voisines restent differentes.
Sous-categories (Radio, Grove) : leur puce et leur texte sont decales de 14 px vers la droite par rapport aux
categories de premier niveau (regle .blocklyToolboxCategory .blocklyToolboxCategory, index.html).

---------------------------------------------------------
27. RECHERCHE DE BLOCS (copie d'essai)
---------------------------------------------------------
Une zone « Rechercher un bloc… » est collee en haut de la colonne de categories (au-dessus de Boucles ; elle reste
visible quand la colonne defile). Taper un ou plusieurs mots affiche les blocs correspondants dans le tiroir, comme une
categorie : ils se prennent et se deposent normalement. Le tiroir de resultats RESTE OUVERT apres un depot (flyout.autoClose = false pendant la
recherche : on peut prendre plusieurs blocs d'affilee) ; Echap ou effacer le texte le ferme ; choisir une categorie vide la
recherche et rend aux categories leur comportement normal (le tiroir se referme apres un depot).
- Texte cherche : ce qui s'affiche sur le bloc (« attendre ... secondes »), le nom de sa categorie (Radio, Grove...) puis,
  en second rang, son texte d'aide. Sans accents ni majuscules ; tous les mots doivent etre presents ; 40 resultats au plus.
- Portee : les 211 blocs de la boite a outils d'origine, sous-categories comprises (meme ceux d'une categorie masquee par le
  panneau administrateur) + les tiroirs VARIABLES et FONCTIONS, generes a la volee par Blockly et donc interroges a chaque
  recherche (blocsDynamiques) : le bouton « Creer une variable… », les blocs mettre / changer / valeur d'une variable, les
  definitions de fonctions et l'appel de chaque fonction deja creee. Comme dans le tiroir normal, les blocs de variable
  n'existent qu'apres la creation d'une premiere variable. Des synonymes sont ajoutes a ces blocs (mettre, definir, changer,
  ajouter, appeler, lancer, creer, retourner...) car leur libelle francais ne les contient pas.
- Code : bandeau.js (index construit au premier usage, ~50 ms ; utilise toolbox.getFlyout().show) et style #recherche-blocs
  dans index.html. Aucune fonction existante n'est modifiee.
Puces « pechues » : la puce n'a plus la couleur sombre des blocs mais une variante plus vive (meme teinte ; saturation +25 points,
luminosite relevee a 52-62 %), de 18 px, avec un reflet (degrade radial), un cercle blanc et une legere lueur coloree, pour
ressortir sur le fond anthracite. Calcul dans bandeau.js (variantePuce -> variables --puce et --puce-reflet) ; les couleurs
des BLOCS (§21) ne changent pas.
Police de la colonne de categories : 'Segoe UI', Arial, sans-serif (variable --font), comme le reste de l'interface ; elle etait auparavant la police sans empattement par defaut du navigateur (16 px, inchange).

---------------------------------------------------------
28. POLICES (copie d'essai)
---------------------------------------------------------
Segoe UI (repli Arial) partout : page (body), bandeau, colonne de categories, recherche, titres de panneaux, console (etat),
boutons / champs / listes (font-family: inherit), bandeau d'etat, visites guidees, aide, panneau administrateur, et TEXTE DES
BLOCS (reglee dans les themes Blockly : constante POLICE_BLOCS, 11 pt, un.js ; Blockly mesure le texte avec cette police pour
dimensionner les blocs, d'ou le reglage par le theme et non par le CSS). Le theme « clair normal » est maintenant derive de
Classic (THEME_CLAIR_NORMAL) pour porter cette police.
Gardent leur police propre : le CODE (Consolas, repli monospace : transcription, editeur de code, aide technique) et la CONSOLE
(Consolas, DejaVu Sans Mono), ainsi que les dessins de la carte micro:bit. Les petits espaces de travail d'exemple
de la fenetre d'aide gardent la police par defaut de Blockly.

---------------------------------------------------------
29. COULEURS : UNE PAR CATEGORIE (copie d'essai ; remplace la palette a 7 couleurs du §21)
---------------------------------------------------------
Demande : aucune couleur identique entre deux categories. PALETTE_CATEGORIES (un.js) contient maintenant 17 couleurs toutes
differentes (une par categorie de premier niveau), choisies par echantillonnage du point le plus eloigne dans l'espace CIE Lab :
ecart minimal de 26 entre deux couleurs, mesure sur les blocs ET sur les puces vives ; assez sombres pour le texte blanc des blocs ;
attribuees pour que deux categories voisines dans la colonne soient tres differentes (ecart >= 97). Les sous-categories (Radio,
Grove, Robots) heritent de leur parent (les entrees propres aux 4 robots ont ete retirees de la table). La puce vive (bandeau.js,
variantePuce) conserve desormais l'ecart de luminosite entre categories (L = 0,36 + 0,62 x L du bloc) pour que les puces restent
distinctes. Valeurs : Boucles #1f5c52, Temps #d50bd5, Affichage #5c521f, Entrees/Sorties #0909b3, Capteurs #915808, Actionneurs
(Audio) #2270bf, Servos #910808, Radio #1c8aa0, IA #d50b70, Grove #178255, Logique #a83896, Variables #678217, Maths #6738a8, Texte
#d53e0b, Fonctions #123668, Listes #089108, Robots #74062b. Limite : l'ecart Lab ne garantit pas la distinction pour un daltonisme.

30. APPARENCE ALIGNEE SUR LA VERSION ARDUINO R4 (copie d'essai ; « Prompt police et couleurs pour un collegue »)
Purement esthetique : aucun nom/ordre de categorie, aucun bloc, aucune fonction modifie. Fichiers touches : index.html (bloc CSS
« APPARENCE ALIGNEE SUR LA VERSION ARDUINO R4 » en fin de <style> ; chaque mode est un jeu de variables --ec-* : sombre = :root,
clair = [data-theme="light"], contraste eleve = [data-contrast="high"] (= sombre + eleve), clair + eleve = les deux), un.js (themes
Blockly : fonds de la zone de programmation / colonne de categories / tiroir, police des blocs = sans-serif par defaut de Blockly,
grille 20/3 #e8e8e8 avec aimantation snap:true) et bandeau.js (table PASTILLES : couleur EXACTE de chaque pastille).
Pastilles (les sous-categories prennent la couleur de leur categorie) : Boucles #FD7E14, Temps #15AABF, Affichage #F03E3E,
Entrees/Sorties #343A40, Radio #1864AB, IA #9C6644, Grove #2B8A3E, Logique #FCC419, Variables #E64980, Maths #82C91E, Texte #7048E8,
Fonctions #CC5DE8, Listes #A61E4D ; sans equivalent Arduino (couleurs proposees) : Capteurs #D2CC79, Actionneurs (Audio) #622D86,
Servos #25F478, Robots #25F4CA. Les COULEURS DES BLOCS ne changent pas (PALETTE_CATEGORIES du §29 les pilote encore seule) : les puces
ne leur sont plus liees. Categories : 12,5 px (sous-categories 11,5 px), gras 600 en contraste eleve, fleche ▸/▾ a la couleur du texte
(le sprite noir de Blockly n'etait pas visible sur fond noir), categorie choisie avec filet gauche #e8a020 (sauf contraste eleve).
Blocs en contraste eleve : clair = fond blanc, bord noir 3 px, texte noir ; sombre = l'inverse. Non aligne : barre d'onglets et
#carte-pane (absents) ; l'accent turquoise du modele n'est pas repris (charte orange du bandeau conservee, survol du separateur compris).

Bandeau du haut : fond ORANGE (clair #ff5501 = charte Technologie Services, sombre #d94700 un peu plus profond), filet bas orange fonce #b33a00 ; en contraste eleve il reste noir. Variables --bandeau / --bandeau-sombre / --accent-fonce (index.html).

Logo (barre d'outils et fenetre d'aide des blocs) et mention « RAJ Editions » retires de index.html ; le numero de version est affiche en derniere ligne du menu Aide (« Version V2.0E »). logo.png n'est plus utilise par la page (il reste dans app.spec, sans effet). Les proprietes du fichier .exe (version_info.txt, CompanyName) gardent « RAJ Editions » : a changer separement si besoin.

31. EXERCICES PAS A PAS ET MODE EVALUATION (copie d'essai)
Fichiers : exercices.js (moteur, charge apres bandeau.js) et exercices.json (44 exercices en 8 niveaux depuis nov. 2026 : premiers pas, temps, boutons, decider, capteurs, Grove, cartes d'extension, aller plus loin ; modifiable a la main : voir le champ « aide_enseignant »).
Entrees : menu Aide > « Exercices pas a pas » et « Mode evaluation ». Entrainement : panneau « Mission » deplacable, 3 indices progressifs, solution, validation AUTOMATIQUE
(les blocs sont lus, rien n'est execute), 1 a 3 etoiles (3 = sans indice), exercice suivant verrouille tant que le precedent n'est pas fait ou passe (case « Acces libre »
pour tout deverrouiller). Evaluation : sans indice ni solution, bouton Valider, 3 essais (100 % / 75 % / 50 % des points), duree maximale facultative, note sur 20,
rapport imprimable + export CSV / JSON. Progression : localStorage du navigateur (cle exercices_progression_v1), un profil par nom d'eleve ; export / import JSON
pour regrouper une classe, tableau de classe imprimable et export CSV. Les ids d'exercice (1.1, 2.3...) ne doivent plus changer une fois utilises (la progression s'y rattache).
app.spec embarque exercices.js et exercices.json ; l'exe V2.0E les embarque.

32. IA : APPRENTISSAGE IMMEDIAT, GESTES, POSITIONS, QR CODES (copie d'essai, oct. 2026)
Reprend les points forts de l'IA d'EasyBloc TS (Arduino R4), recrits ici (aucun code d'EasyBloc copie ; seules les bibliotheques
libres MediaPipe et ZXing, licence Apache 2.0, sont reprises dans lib/mediapipe et lib/zxing, 27 Mo et 0,3 Mo).
Fichiers : ia-immediat.js (nouveau, charge apres ia.js), ia.js (renvoi periodique, noyau partage window.iaNoyau), un.js (pilote
MicroPython, blocs, aide, .py), index.html (deux colonnes du panneau IA), app.py (types .mjs et .wasm), app.spec (ia-immediat.js).
- Colonne « Apprentissage immediat » : objets et images (MobileNet v3), gestes de la main (21 points), positions des bras
  (epaules, coudes, poignets). Pas d'entrainement : k plus proches voisins (K = 5, votes moyennes sur 3 images). Exemples par la
  camera (« Maintenir ») ou par des images (🖼). 8 classes, 150 exemples par classe au plus. Les resultats pilotent les blocs
  « vision » ; demarrer l'un arrete l'autre (Teachable Machine ou immediat). Renommer une classe met a jour les blocs.
- Sauvegarde : l'apprentissage (empreintes, jamais d'images) est ajoute a la fin du .py telecharge, en commentaires
  « # >>> apprentissage-ia » ignores par la carte, et relu a l'ouverture du .py. « Exporter » / « Importer » : fichier .json.
  PAS dans le .hex (place limitee, inutile a la carte). Environ 1,4 Ko par exemple d'image, 0,3 Ko par geste.
- Colonne « QR codes » : lecture (QR, EAN, UPC, Code 128/39, Data Matrix) et creation d'un QR code a imprimer (.png).
  Blocs : « lorsqu'un code QR est lu », « un code QR est visible », « texte du dernier code QR lu » (sans accents, 60 car.).
- Plus de doublon : la colonne Vision ne fait plus que CHARGER un modele Teachable Machine (adresse ou 3 fichiers) ;
  toute creation de classes d'images passe par l'apprentissage immediat. Le son garde sa creation (entrainement).
  La visite guidee IA (menu Aide) suit ce nouveau parcours.
- Blocs « l'IA reconnait » : la classe se choisit dans une liste (classes du panneau IA) ou « ✎ autre nom… ».
- Fiabilite : le navigateur renvoie le dernier resultat toutes les 500 ms ; la carte oublie un resultat de plus de 1,5 s.
  Ligne envoyee : IA:<vision|son|qr>:<classe ou texte>:<confiance>.
- Limites : gestes et positions non testes avec une vraie camera dans la session de developpement (modeles charges et
  verifies sur images de synthese) ; la carte peut perdre des lignes si le programme attend longtemps (sleep) avec
  plusieurs IA en marche, sans risque de faux declenchement (ligne illisible = ignoree).
- Evolutions (oct. 2026) :
  * SONS EN APPRENTISSAGE IMMEDIAT : type « sons et mots (micro) ». Sans modele ni entrainement (ia-son-immediat.js) :
    le micro est decoupe en sons (volume au-dessus du bruit de fond), chaque son devient 30 instants x 12 coefficients
    de timbre (MFCC), compares par alignement dans le temps (DTW). Un son reconnu le reste 1 s ; il pilote les blocs
    « son ». Pas de classe « bruit de fond » : le silence ne declenche rien ; un bruit continu de plus de 1,5 s est ignore.
    La colonne Son ne fait plus que charger un modele Teachable Machine (entrainement du son retire, ainsi que
    lib/tm/base, 7,3 Mo, devenu inutile).
  * VIGNETTES : chaque exemple apparait sous sa classe (photo pour les objets, en memoire seulement ; squelette pour les
    gestes et positions ; dessin du timbre pour les sons). CLIQUER sur une vignette supprime cet exemple seul.
    Apres reouverture d'un .py, squelettes et timbres se redessinent, les photos sont remplacees par ▣.
  * RECONSTRUCTION EN BLOCS a l'import d'un .py : « lorsque l'IA reconnait » (vrai nom de classe retrouve parmi les
    classes connues, sinon l'identifiant), « lorsqu'un code QR est lu », et les expressions IA (l'IA reconnait,
    derniere classe, confiance, code QR visible, texte du QR). Les lignes de scrutation (_ia_traiter(), _radio_traiter(),
    _ir_traiter()) et les « pass » des corps vides ne deviennent plus des blocs « code ».

33. BANDEAU SUR UNE LIGNE (oct. 2026)
Le bandeau tient sur une seule ligne des 1536 px de large (ecran 1920 px avec affichage Windows a 125 %, zoom du
navigateur 100 %), y compris dans le cas le plus long (console, simulation et code affiches : 39 px de reserve).
Reglages (index.html) : boutons 5 x 6 px de marge interieure, ecart 2 px, separateurs 2 px, nom du programme 84 px,
Televerser et Lancer la simulation un peu moins larges. En dessous (1366, 1280 px), il passe sur deux lignes sans
couper de bouton. Aucun bouton ni libelle retire.

34. LOGO TECHNOLOGIE SERVICES (oct. 2026)
Le logo de Technologie Services (logo_ts.png, 360 x 100 px, telecharge de technologieservices.fr) est affiche en haut a
gauche du bandeau, sur une pastille blanche (texte noir et icone orange illisibles directement sur l'orange), 24 px de
haut. Pour lui laisser la place sans repasser sur deux lignes a 1536 px, Defaire et Refaire n'ont plus que leur icone
(fleches ; le libelle reste dans l'info-bulle et pour les lecteurs d'ecran). logo_ts.png est dans app.spec et site_web.

35. UN SEUL BOUTON « LANCER LA SIMULATION » (oct. 2026)
Le bouton orange du panneau de simulation (#run-sim) faisait doublon avec le bouton vert du bandeau (#tb-lancer) : il est
masque (display: none), pas supprime, car c'est lui que le bandeau clique (bandeau.js) et que le simulateur Brython ecoute.
Restent sous la carte : « Secouer la carte » et « Reinitialiser la simulation ». Les visites guidees visent le bouton vert.

36. DISPOSITION AU LANCEMENT (oct. 2026)
L'application s'ouvre avec : simulation affichee, code MicroPython MASQUE (bouton « Code »), console et IA
masquees. Code masque, le simulateur occupe 37 % de la largeur (au lieu de 24 %) : les boutons « Secouer la carte » et
« Reinitialiser la simulation » se placent a droite de la carte, et la poignee de redimensionnement est active d'emblee.
Reglage : classes inactif / replie dans index.html (#btn-vue-code, #code-container), regle CSS
#code-container.replie ~ #simulator-container, et synchroniserResizerSimulateur() appele au demarrage (un.js).

37. DESSIN DES SERVOMOTEURS (oct. 2026)
Le cadran rond du panneau « Servomoteurs » est remplace par un servo vu de dessus (modele A, choisi parmi 4 propositions) :
boitier bleu type SG90 a deux oreilles, palonnier blanc qui tourne autour de l'axe (90 deg = palonnier vers le haut,
0 deg a gauche, 180 deg a droite). Rotation continue : le palonnier tourne sans fin (sens et vitesse selon la vitesse).
Arret : boitier et palonnier gris. Dessin SVG cree par cadranServo() (un.js), styles .servo-* (index.html) ; le rotor
tourne avec transform-box: view-box et transform-origin: 42px 52px (unites du dessin).

38. GROVE : POTENTIOMETRE (oct. 2026)
Nouvelle sous-categorie Grove « Potentiometre » (Grove Rotary Angle Sensor), apres « Joystick ». Un bloc :
« potentiometre sur [broche] en [valeur 0 a 1023 / angle 0 a 300 deg / pourcentage 0 a 100 %] ». A brancher sur P0, P1
ou P2 (entrees analogiques). Code : pilote « potentiometre » (_grove_potentiometre(broche, unite), read_analog() puis
conversion). Simulateur : module Grove dessine (modele A, choisi parmi 4 propositions : carte bleue, bouton gris a repere
blanc) dont on tourne le bouton a la souris (butees a 0 et 300 deg), plus un curseur dessous (clavier, reglage fin) ;
valeur et angle affiches ; substitut
_grove_potentiometre dans index.html. Aide du bloc, exemple « Angle du potentiometre », reconstruction a l'import d'un .py.

39. GROVE : PREMIER LOT DE MODULES (oct. 2026)
Six modules ajoutes au menu Grove, chacun dans sa sous-categorie, avec aide (clic droit), exemple, section du panneau
Grove du simulateur et reconstruction en blocs a l'import d'un .py :
- Bouton poussoir (numerique) : « bouton poussoir sur Px appuye » et « lorsque le bouton poussoir sur Px est appuye »
  (une fois par appui, front montant : _grove_bouton_front, scrute a chaque tour comme les autres « lorsque »).
  Simulateur : bouton rouge « Appuyer » (enfonce tant qu'on le maintient) et case « maintenu enfonce ».
- Capteur de lumiere (analogique, P0/P1/P2) : valeur 0 a 1023 ou pourcentage. Simulateur : curseur.
- Detecteur de mouvement PIR (numerique) : « mouvement detecte sur Px ». Simulateur : module Grove dessine (dome blanc,
  voyant rouge), un clic ou Entree simule un mouvement ; la case « mouvement detecte » reste dessous.
- Buzzer (actif, numerique) : marche / arret, et « bip pendant ... ms ». Simulateur : pastille orange qui vibre et bip
  de 2,3 kHz a faible volume ; le buzzer se tait a l'arret de la simulation.
- Lecteur MP3 v3.0 (nov. 2026, sous-categorie « Lecteur MP3 » ; puce WT2003S, liaison serie 9600 bauds) : jouer la
  piste n°, Lecture / Pause, Stop, Suivant, Precedent, Volume + / -, regler le volume (0 a 31), mode de lecture (une
  fois, repeter la piste, tout repeter, aleatoire). Fichiers MP3 a la RACINE de la carte microSD (FAT16/FAT32), numerotes
  dans l'ordre de copie. Trames de la bibliotheque Seeed (Seeed_Serial_MP3_Player) : 7E, longueur (octets + 2), commande
  et parametres, somme (longueur + octets, sur 8 bits), EF ; codes A2 (piste), AA, AB, AC, AD, AE (volume), AF (mode).
  Port Grove : fil jaune = TX du module (rx de la carte), fil blanc = RX du module ; « P1 / P15 » donne
  uart.init(9600, tx=pin15, rx=pin1). La micro:bit n'a qu'un uart, partage avec l'USB : il est prete au module le temps
  d'une trame (15 ms) puis rendu a l'USB (uart.init(115200)) ; reponses du module ignorees (etat et volume non lus),
  100 ms au moins entre deux ordres. Volume + / - partent de 20 tant qu'aucun volume n'a ete regle. Simulateur : les
  pistes 1 a 6 sont six courtes melodies libres de droits (musiques-mp3.js : Au clair de la lune, Frere Jacques, Ode a
  la joie, Ah ! vous dirai-je maman, Vive le vent, Fanfare EasyBloc ecrite pour le logiciel), jouees par le navigateur
  (Web Audio, un.js : jouerPisteMp3) avec pause, reprise, volume et les quatre modes ; Suivant / Precedent tournent en
  boucle sur ces six pistes ; une piste au-dela de 6 est « absente ». Etat dans « Peripheriques » (piste et titre,
  lecture / pause / arret, volume, mode) ; montage : module dessine (40 x 20 mm,
  prise Grove a gauche, prise casque, connecteur haut-parleur). Trames verifiees en executant le pilote avec un faux uart ;
  NON verifie sur une vraie carte avec le module.
- Relais (numerique) : ferme (marche) / ouvert (arret). Simulateur : un module Grove dessine par broche (boitier
  RELAY bleu, bornier vert), voyant rouge allume quand le contact est ferme.
- Ecran OLED 0,96" 128 x 64 (I2C 0x3C, SSD1315 / SSD1306) : initialiser, afficher un texte en colonne (0 a 20) et ligne
  (0 a 7), effacer. Mode texte sans memoire d'image (compatible V1) : police 5 x 7 (ASCII 32 a 126) envoyee caractere
  par caractere ; accents ramenes a la lettre simple. Le simulateur dessine l'ecran avec la meme police (POLICE_OLED).
A verifier avec le materiel : niveaux logiques des modules reels (bouton et PIR actifs a l'etat haut, buzzer actif),
et l'ecran OLED (sequence d'initialisation SSD1306 ; la version SSD1308 plus ancienne n'a pas ete testee).

40. GROVE : DEUXIEME LOT DE MODULES (oct. 2026)
Cinq modules, meme organisation que le premier lot (sous-categorie, aide, exemple, panneau Grove, reconstruction .py) :
- Barre de LED (Grove LED Bar v2.0, MY9221) : niveau 0 a 10, LED n allumee / eteinte. Branchee sur un port Grove a deux
  broches (P0/P14, P1/P15, P2/P16, P8/P12) : broche jaune = donnees, blanche = horloge (bibliotheque Seeed).
  Simulateur : barre dessinee (LED 1 rouge, 2 orange, 3 a 10 vertes).
- Pression BMP280 (I2C 0x77) : pression (hPa), temperature (C), altitude (m, par rapport a 1013,25 hPa). Formules de
  compensation Bosch en virgule flottante. Simulateur : curseur « Pression » (+ curseur de temperature existant).
- Qualite de l'air SGP30 (I2C 0x58) : eCO2 (ppm), COV totaux (ppb) ; 400 ppm / 0 ppb pendant les 15 premieres secondes.
  Simulateur : curseur « COV totaux » (+ curseur CO2 existant pour l'eCO2).
- Horloge temps reel DS1307 / DS3231 (I2C 0x68) : regler date et heure, lire heure / minute / seconde / jour / mois /
  annee, heure en texte « hh:mm:ss ». Simulateur : heure du PC decalee de ce que le programme a regle, afficheur
  qui avance chaque seconde.
- Pilote 16 servos PCA9685 (I2C 0x7F pour le module Grove, 0x40 pour les autres cartes) : angle (0 a 180) ou rotation
  continue (-100 a 100 %) du servo de la voie 0 a 15, a 50 Hz. Simulateur : servos S0 a S15 dans la zone « Servomoteurs ».
DHT20 : deja pris en charge par « Temperature & humidite » (meme puce que l'AHT20, adresse 0x38).
A verifier avec le materiel : sens des broches de la barre de LED, adresses I2C reelles des modules, et chaque pilote
(aucun n'a pu etre essaye sur une carte).

41. CAPTEURS A CURSEUR : MODULES ET AFFICHEURS (oct. 2026)
Modele C (choisi parmi 3 propositions) pour tous les capteurs reglables du panneau Grove : ultrason, temperature et
humidite, CO2, lumiere, pression, COV. Chaque section montre un petit module Grove dessine (composant propre a chaque
capteur), un afficheur numerique vert sur fond noir avec la valeur et son unite, et le curseur dessous. Les id des
curseurs et des valeurs (grove-temp, grove-temp-val...) sont inchanges : un.js n'a pas eu a changer.

42. SEANCES POUR GROUPES D'ELEVES (retirees de cette variante)
Le mode seance (ouvrir une seance, rendre son travail, espace enseignant ; seances.js) ne fait pas partie de cette
variante. Les exercices pas a pas et le mode evaluation (§31) restent disponibles, avec la progression enregistree
dans le navigateur, exportable et importable.

43. CARTE MOTEURS DFRobot DFR0548 (oct. 2026)
Sous-categorie "DFR0548" de "Cartes d'extension" (apres Servos), pour la carte d'extension DFRobot micro:bit Driver Expansion
Board (DFR0548) : une puce PCA9685 a l'adresse I2C 0x40, a 50 Hz. Quatre blocs :
- "servo S1 a S8 a ... degres" (0 a 180 degres, impulsion de 600 a 2400 us) ;
- "moteur M1 a M4 sens horaire / antihoraire vitesse ... (0 a 255)" : le moteur tourne jusqu'a un autre ordre ;
- "arreter le moteur M1 a M4 / tous les moteurs" ;
- "moteur pas a pas 28BYJ-48 ou 42BYGH sur M1-M2 ou M3-M4, sens, de ... degres / tours" : le programme attend la fin.
Canaux, impulsions, sequences des pas a pas et durees sont repris tels quels de la bibliotheque MakeCode officielle
(DFRobot/pxt-motor, main.ts) : servo Sn sur le canal 16 - n, moteur Mn sur les canaux (4 - n) x 2 et (4 - n) x 2 + 1.
Pour les pas a pas, la PCA9685 produit elle-meme la sequence ; l'angle n'est obtenu que par une duree avant l'arret
(28BYJ-48 : 1 s par tour ; 42BYGH : 1,39 s par tour). Ces durees viennent de la bibliotheque DFRobot et n'ont pas ete
mesurees : un tour demande peut ne pas faire exactement un tour.
Simulateur : les servos apparaissent dans "Servomoteurs" (DFR S1 a DFR S8), les moteurs et les pas a pas dans la section
"Carte moteurs DFR0548" du panneau : un motoreducteur jaune "TT" par moteur pilote, dont la roue tourne dans le
bon sens et d'autant plus vite que la vitesse est grande (jauge 0 a 255 dessous, grise a l'arret) ; un dessin par
moteur pas a pas selon son modele (28BYJ-48 rond argente, 42BYGH carre noir), repere qui tourne sur l'axe, et la
position cumulee depuis la derniere reinitialisation en tours + degres (ex. "1 tour + 90"). Le pas a pas occupe le programme le meme temps que sur la carte.
Pas verifie sur une vraie carte. Pas de reconstruction des blocs a l'import d'un .py (ils deviennent des blocs "code").

44. VUE MONTAGE : LA CARTE D'EXTENSION ET SES CABLES (oct. 2026)
Des qu'un bloc Grove, Servos ou d'une carte d'extension (DFR0548, Motor:bit) est pose, le montage remplace la carte seule dans la colonne
du simulateur (oct. 2026), si elle fait au moins 480 px de large ; les boutons Secouer et Reinitialiser passent en
ligne dessous, et "Agrandir" ouvre le meme montage par-dessus la zone de blocs. Colonne plus etroite (modules et
etiquettes illisibles) : la carte seule reste, avec le bouton "Voir le montage" sous "Reinitialiser la simulation".
Le passage de l'un a l'autre se fait tout seul quand on redimensionne la colonne. Le montage montre :
- la micro:bit enfichee dans sa carte d'extension : carte Grove (Grove Shield for micro:bit v2.0 de Seeed : comme
  sur la vraie carte, 4 ports Grove alignes en bas, I2C, P0/P14, P1/P15, P2/P16, et 8 pastilles pour pinces
  crocodile, GND, P8, P12, P13 a gauche ; 3V3, P0, P1, P2 a droite), ou carte DFR0548 des qu'un bloc DFR0548 est
  present (on ne peut pas enficher la micro:bit dans les deux a la fois) ;
- chaque module du programme autour de la carte, relie par son cable : cable Grove a 4 fils (jaune, blanc, rouge,
  noir), module sous son port ; pour P8, P12 et P13, fils a pinces crocodile depuis les pastilles (3V3 a droite,
  son fil passe sous la carte), avec la mention "hors port Grove" (le port "P8 / P12" de la barre de LED n'existe
  pas sur la carte v2.0) ; borniers M1 a M4
  pour les moteurs, deux borniers pour un pas a pas, connecteurs S1 a S8 pour les servos de la DFR0548.
"port partage" signale deux modules branches au meme endroit (possible dans le programme, pas sur la table) ;
"bus I2C partage" rappelle que plusieurs modules I2C se suivent sur le meme bus (un hub I2C sur la table).
La carte micro:bit est deplacee dans le montage (pas copiee) : boutons, broches, logo et LED y fonctionnent comme
d'habitude, et la simulation continue.
Montage en direct (oct. 2026) : les modules dessines suivent la simulation, avec leur valeur sous le nom et le port
(alertes dessous). Actionneurs : roue du moteur C.C. qui tourne (sens et vitesse), axe du pas a pas, palonnier du
servo a l'angle demande (ou qui tourne en continu), LED allumee, ruban RGB et barre de LED dans leurs couleurs,
ondes du buzzer, voyant du relais, texte de l'OLED, du LCD et de l'afficheur 4 digits. Capteurs : distance, lumiere,
potentiometre (son repere tourne), PIR, temperature et humidite, CO2, pression, COV, couleur, geste, heure. Le
bouton poussoir et le joystick se manipulent directement dans le montage (maintenir le clic, ou Espace / Entree) ;
les curseurs et cases pour regler les capteurs restent dans "Peripheriques", dont le montage recopie l'affichage
(lecture toutes les 200 ms) : les deux ne peuvent pas diverger. Avec "reduire les animations" demande par le
systeme, roues et servos ne tournent plus, la valeur reste ecrite.
Pas de doublon (oct. 2026) : quand le montage est dans la colonne, la liste "Peripheriques" ne garde que les reglages
des capteurs (distance, joystick, potentiometre, case "maintenu enfonce" du bouton, lumiere, PIR, pression, COV,
gestes, temperature et humidite, CO2, couleur, radio) sous le titre "Reglages des capteurs", qui la replie ou la
deplie d'un clic (choix memorise, depliee par defaut). Ecrans, LED, moteurs, servos, buzzer et relais ne s'affichent
plus que dans le montage ; sans capteur a regler, la liste disparait. Carte seule ou montage agrandi : liste
complete, comme avant. L'ecran LCD du montage reprend les couleurs de celui de la liste (fond bleu, texte blanc). Fermer : bouton "Fermer", "Fermer le montage" ou touche Echap.
La carte Grove est dessinee d'apres les photos du fabricant (72 x 72 mm, echancrure, ports, pastilles, prise micro
USB, voyant PWR, connecteur plat) ; les noms des fils (GND, 3V3, SDA, SCL...) imprimes au-dessus des ports sont omis,
trop petits a cette echelle, et le nom des ports est place au-dessus d'eux pour ne pas etre cache par les cables.
DFR0548 dessinee d'apres le schema "Board Overview" du wiki DFRobot (oct. 2026), tournee d'un demi-tour pour que la
micro:bit reste a l'endroit (sur la carte, son connecteur est en bas) : bornier vert de 8 vis en bas (M1 : 1A+ 1A- ;
M2 : 1B+ 1B- ; M3 : 2A+ 2A- ; M4 : 2B+ 2B-), bornier d'alimentation - + (3,5 a 5,5 V), prise jack, interrupteur
ON/OFF et voyant PWR a gauche ; a droite, les servos S1 a S8 (colonnes S, VIN, GND), les broches P0, P1, P2, P8,
P12 a P16 (colonnes P, 3V3, GND) et le connecteur IIC (D, C, G, V). Plastique des broches vert, rouge et noir comme
sur la carte, avec le nom de chaque colonne. Moteurs : 2 fils vers le bas depuis leurs vis ; pas a pas : 4 fils sur
deux moteurs voisins ; servos et modules : 3 fils vers la droite depuis leur rangee ; module I2C : C = SCL, D = SDA.
Choix de la carte (oct. 2026) : en tete du montage, "Carte d'extension" propose Grove Shield v2.0 ou BitMaker V2
(boutons radio, choix memorise dans le navigateur, Grove par defaut). Avec des blocs DFR0548, le choix disparait :
"Carte DFR0548 : choisie car le programme utilise ses blocs".
BitMaker V2 (Seeed, 57 x 70 mm), dessinee d'apres la photo de dessus du fabricant : 3 ports Grove a gauche (P8 :
P8 et P14 ; I2C ; P15 : P15 et P16) et 3 a droite (~P0 : P0 et P1 ; ~P1 : P1 et P2 ; ~P2 : P2 et P12), avec les
noms des fils comme sur la carte ; 4 LED RGB (Pixel 0 a 3) sur P13 ; 5 pastilles 0, 1, 2, VCC, GND ; en haut, prise
batterie JST, micro USB et selecteur 5 V / 3,3 V (en partie sous la micro:bit). Une broche seule va sur le port ou
elle est le signal 1 (fil jaune) ; un module a deux broches va sur le port qui les porte toutes les deux (joystick
X = P0, Y = P1 sur ~P0). P1 et P2 sortant chacune sur deux ports, "port partage" signale aussi deux modules qui
utilisent la meme broche par deux ports differents. P13 n'a pas de port : "P13 reservee aux LED de la carte".
Ruban RGB sur P13 avec la BitMaker : ce sont les 4 LED de la carte. Pas de module ni de cable ; la legende
"Ruban RGB · LED de la carte (P13)" s'affiche sous la carte et les 4 LED dessinees prennent en direct les couleurs du
ruban de "Peripheriques" (LED n° 0 a 3 = Pixel 0 a 3), eteintes a la reinitialisation. Au-dela de 4 LED dans le bloc,
la legende ajoute "la carte n'a que 4 LED". Pour un autre module, choisir une broche qui a un port (P8, P14, P15, P16
sont les plus sures pour un module numerique ; P0, P1, P2 pour un capteur analogique).

45. CARTE MOTEURS ELECFREAKS MOTOR:BIT V1.6 (oct. 2026)
Sous-categorie "Motor:bit" de "Cartes d'extension", apres "DFR0548", pour la carte ELECFREAKS Motor:bit
(EF03406, puce TB6612, deux moteurs a courant continu, 1,2 A par voie). Deux blocs :
- "Motor:bit : moteur M1 / M2 sens horaire / antihoraire vitesse ... (0 a 255)" : le moteur tourne jusqu'a un autre ordre ;
- "Motor:bit : arreter le moteur M1 / M2 / les deux moteurs".
Brochage de la documentation ELECFREAKS et du paquet MakeCode pxt-motorbit : M1 vitesse sur P1 (MLI) et sens sur P8,
M2 vitesse sur P2 et sens sur P12 (niveau haut = sens horaire). Ces quatre broches sont donc prises par les moteurs.
Le buzzer passif de la carte est sur P0. Broches G-3V3-S : P3 a P7, P9 a P11 ; broches G-VCC-S (3,3 V ou 5 V selon le
selecteur VCC) : P13 a P16, P19 et P20 (I2C : P19 = SCL, P20 = SDA). Alimentation 6 a 12 V, interrupteur OFF/ON.
Simulateur : les moteurs apparaissent dans la section "Carte moteurs Motor:bit" (meme motoreducteur "TT" que la
DFR0548). Vue montage : "Motor:bit V1.6" s'ajoute au choix de la carte, et des blocs Motor:bit l'imposent ; carte
blanche de 60 x 47,5 mm dessinee d'apres le dessin cote du wiki ELECFREAKS (bornier bleu M1+ M1- M2- M2+ a gauche,
buzzer, broches et alimentation a droite) ; moteurs branches par 2 fils, modules par 3 fils depuis leur broche, modules
I2C sur P19 / P20. Un module sur P1, P2, P8 ou P12 affiche "P8 : moteur M1" (par exemple), un module sur P0
"P0 : buzzer de la carte". Les menus de broches des blocs Grove ne proposent pas P3 a P7, P9 a P11, P19 et P20 : ces
broches de la carte servent aux blocs Entrees/Sorties.
Pas verifie sur une vraie carte (sens des moteurs, rapport cyclique a vitesse 255).
Categorie "Cartes d'extension" (oct. 2026, choix de l'utilisateur) : les anciennes categories "Carte moteurs DFR0548"
et "Carte moteurs Motor:bit" sont reunies dans une seule categorie, apres Servos, qui s'ouvre sur une sous-categorie par
carte (DFR0548, Motor:bit), comme Grove, Radio et Robots. Les blocs, leur couleur, la simulation et le montage ne
changent pas. Un reglage du panneau administrateur fait sur une ancienne categorie (masquee, renommee, recoloree) ne
s'applique plus : a refaire sur "Cartes d'extension" ou ses sous-categories.

46. AFFICHAGE : CHARTE EDUCATECH, LOGO, ZOOM ET CASE "AGRANDIR" (oct. 2026)
Demandes de l'utilisateur :
- Theme sombre par defaut aux couleurs du theme Educatech (celui du salon) : bandeau en degrade vert d'eau vers violet,
  filet magenta, fonds bleu nuit, zone de blocs et colonne des categories assorties. Sans les decors du salon (badge du
  stand, banniere, pistes), qui restent reserves au theme de saison "Salon Educatech Expo". Theme clair, contraste eleve,
  Halloween et Noel inchanges.
- Logo Technologie Services directement sur le bandeau, sans pastille blanche, dans ses couleurs d'origine. En contraste
  eleve (bandeau noir), la pastille blanche reste : le texte noir du logo y disparaitrait. En theme clair, l'icone
  orange du logo se voit peu sur le bandeau orange.
- Montage dans la colonne : "Agrandir" est une case a cocher discrete (cocher = montage par-dessus les blocs, Echap ou
  "Fermer" pour revenir, la case se decoche).
- Zoom de la simulation : Ctrl + molette sur la carte micro:bit ou le montage (de 50 % a 300 %), comme la molette dans la
  zone de blocs ; la molette seule fait toujours defiler la colonne. Le bouton "Zoom ... % - revenir a 100 %" apparait
  des que le zoom n'est plus a 100 %. Un pave tactile (pincement) zoome de la meme facon.
  Montage dans la colonne (variante 3 choisie par l'utilisateur, nov. 2026) : ce bouton devient une pastille toujours
  visible a gauche d'"Agrandir". A 100 % elle indique "Ctrl + molette pour zoomer" (bordure en pointilles, hors de
  l'ordre de tabulation, aria-disabled) ; une fois zoome elle affiche "Zoom ... % - revenir a 100 %" et remet l'echelle
  d'origine au clic. Carte seule et montage agrandi : comportement inchange (bouton en haut de la colonne, visible
  seulement une fois zoome). montage.js : placerZoom().
- Theme clair (essai B choisi par l'utilisateur) : meme bandeau Educatech qu'en sombre, et fonds gris doux au lieu
  du blanc (zone de blocs #f2f2ef, colonne du simulateur #ececea, cadre du montage #dadad5).

47. EXTENSION KITRONIK STOP:BIT (nov. 2026)
Premiere extension de la fenetre Fichier > Blocs > "Extensions..." (voir §8, fin). Feu tricolore Kitronik STOP:bit
(ref. 5642) : rouge = P0, orange = P1, vert = P2, LED allumee au niveau haut (brochage de la bibliotheque officielle
pxt-kitronik-stopbit). Contrairement aux categories ordinaires, la categorie "STOP:bit" est ABSENTE au depart
(parDefaut: false dans EXTENSIONS, un.js) : un clic sur sa carte l'ajoute a la colonne ; ce choix est retenu sur le PC
(localStorage, cle easybloc_ts_extensions_ajoutees). Un programme qui contient un bloc STOP:bit la remet toute seule.
Blocs (couleur #6B7280) :
- "STOP:bit : mettre le feu sur" Stop (rouge) / Pret a demarrer (rouge et orange) / Passez (vert) / Pret a s'arreter
  (orange) - les quatre etats de Kitronik ; les autres feux s'eteignent. Code : _stopbit_feu(r, o, v).
- "STOP:bit : feu" rouge / orange / vert, allume / eteint : un seul feu, les autres inchanges. Code : _stopbit_led(pinX, 0|1).
- "STOP:bit : eteindre les trois feux" : _stopbit_feu(0, 0, 0).
Le pilote "stopbit" est du Python pur (write_digital sur P0, P1, P2) : le simulateur le GARDE, comme le pilote "ia".
Simulateur : section "Feu STOP:bit" de "Peripheriques" (feu dessine, legende rouge / orange / vert allume ou eteint),
allumee d'apres l'etat des broches P0, P1, P2 (un.js : dessinerStopbit, appele par dessinerLeds) ; un bloc "ecrire sur
la broche" allume donc le feu aussi, comme sur la vraie carte. Aide (clic droit), deux exemples (feu de circulation,
orange clignotant) et reconstruction en blocs a l'import d'un .py. Non verifie sur une vraie carte STOP:bit.

48. EXTENSIONS KITRONIK LAMP:BIT ET ACCESS:BIT (nov. 2026)
Deux extensions de plus dans Fichier > Blocs > "Extensions...", absentes de la colonne au depart comme la STOP:bit
(§47). Brochages des bibliotheques officielles pxt-kitronik-lampbit et pxt-kitronik-accessbit.
LAMP:bit (lampadaire, ref. 5643) : lampe = P0 (allumee au niveau haut), capteur de lumiere = P1 en analogique,
0 a 1023, valeur BASSE = sombre. Blocs : "LAMP:bit : lampe allumee / eteinte" (_lampbit_lampe), "niveau de lumiere"
(_lampbit_lumiere), "il fait sombre (lumiere sous 350)" (seuil de l'exemple Kitronik). Les blocs "deadband" de
Kitronik ne sont pas repris : aucune fonction de leur bibliotheque ne s'en sert.
ACCESS:bit (barriere, ref. 5646) : servomoteur 180 deg = P0 (levee = 0 deg, baissee = 90 deg ; 1 s de mouvement puis
P0 a 0, comme Kitronik), buzzer = P1, 1025 Hz. Blocs : "ACCESS:bit : lever / baisser la barriere"
(_accessbit_barriere), "ACCESS:bit : bip court (200 ms) / long (800 ms) N fois", 1 a 10, silence de meme duree apres
chaque bip (_accessbit_bip, music.pitch(..., pin=pin1)).
Simulateur : le pilote est remplace (index.html : _lampbit_lampe -> simu_led('0'), _lampbit_lumiere -> curseur,
_accessbit_barriere -> action "accessbit" de la file, _accessbit_bip -> simu_jouerNote). Sections "Lampadaire
LAMP:bit" (lampadaire dessine, eclaire d'apres P0, curseur "Lumiere ambiante (P1)", 600 au depart) et "Barriere
ACCESS:bit" (bras rouge et blanc qui pivote en 1 s ; baissee au depart et a la reinitialisation). Aide, exemples
(lampadaire automatique, barriere de parking sur le bouton A), textes anglais, reconstruction depuis un .py.
Non verifie sur les vraies cartes.
Correctif (nov. 2026) : quand le montage est dans la colonne, les sections "Feu STOP:bit", "Lampadaire LAMP:bit" et
"Barriere ACCESS:bit" ne sont plus rangees sous "Reglages des capteurs" (replier ce volet les faisait disparaitre).
Le montage ne les dessine pas : elles s'affichent toujours, dans leur propre rangee AU-DESSUS du volet (montage.js,
rangerTableau : rangee .tab-extensions ; SECTIONS_EXTENSIONS). Sans capteur a regler, le volet disparait et elles restent.

49. CARTES KITRONIK CABLEES PAR FILS : LES TROIS ENSEMBLE, AVEC LA MOTOR:BIT (nov. 2026)
Vissees sur la micro:bit, STOP:bit, LAMP:bit et ACCESS:bit prennent toutes P0 a P2 : impossible de les utiliser
ensemble, ni avec la Motor:bit (P0 = son buzzer, P1 et P8 = moteur M1, P2 et P12 = moteur M2). Reliees par des fils
(pinces crocodile ou cavaliers depuis les broches G-V-S de la Motor:bit vers les pastilles 0, 1, 2, 3V et GND de la
carte Kitronik), elles peuvent prendre d'autres broches. Un bloc par carte, a la fin de sa categorie, facultatif :
- "STOP:bit : cabler rouge sur P.. orange sur P.. vert sur P.." (pastilles 0, 1, 2) ;
- "LAMP:bit : cabler lampe sur P.. capteur de lumiere sur P.." (capteur : entree analogique P0, P1, P2, P3, P4, P10) ;
- "ACCESS:bit : cabler servomoteur sur P.. buzzer sur P..".
Sans ce bloc : brochage de Kitronik. Broches proposees : P0 a P4, P6 a P10, P12 a P16 (P5 et P11 = boutons A et B).
Le code est ecrit avec les broches choisies (un.js : cablageKitronik, lu en generant le code ; _STOPBIT = (...)),
le bloc lui-meme ne produit qu'un commentaire ("pass  # STOP:bit : rouge sur P4, ..."). Une broche de la matrice de
LED (P3, P4, P6, P7, P9, P10) ajoute display.off() en tete du programme : la matrice est eteinte.
Simulateur : le feu et la lampe suivent les broches cablees (window.simu_kitronikBroche), les legendes les
indiquent ; broches P3, P4, P6, P7, P9, P10 ajoutees au simulateur, display.off() / on() sans effet.
Montage : un bloc "cabler" fait apparaitre la carte Kitronik (carte noire, pastilles 0 1 2 3V GND, feu, lampadaire ou
barriere en petit) reliee par ses fils a la carte d'extension choisie (Motor:bit imposee par ses blocs, ou choisie
dans le menu) ; feu, lampe et barriere suivent la simulation. Conflits signales comme pour les autres modules
("P8 : moteur M1", "P0 : buzzer de la carte", "broche partagee").
Exemple (aide du bloc "cabler") : "Trois cartes Kitronik sur la Motor:bit", moteurs libres : barriere P13 et buzzer
P14 (G-VCC-S, 5 V possible pour le servo), lampe P15, capteur de lumiere P3, feu P4, P6, P7.
Non verifie sur les vraies cartes. A l'import d'un .py, le cablage n'est pas reconstruit (broches de Kitronik).
Cablage automatique (nov. 2026, demande de l'utilisateur) : des que deux ou trois cartes Kitronik sont utilisees, ou
une seule avec la Motor:bit (blocs Motor:bit, ou "Motor:bit V1.6" choisie dans le menu du montage), chaque carte SANS
bloc "cabler" recoit des broches libres, sans rien poser. Broches evitees : celles des autres blocs du programme
(Grove, servos, entrees/sorties : tout champ "pinN"), celles des blocs "cabler", P0 / P1 / P2 / P8 / P12 avec la
Motor:bit (buzzer, moteurs), P5 / P11 (boutons). Preference : P13 a P16, P8, P12, P0 a P2, puis la matrice de LED en
dernier (P3, P4, P10, P6, P7, P9 ; display.off()). Capteur du LAMP:bit sur une entree analogique (P0, P1, P2, puis
P3, P4, P10). Ordre fixe LAMP:bit, ACCESS:bit, STOP:bit : le meme programme donne toujours le meme cablage, mais
ajouter un bloc qui prend une broche peut le deplacer ; poser un bloc "cabler" fige le cablage d'une carte.
Une carte seule, sans Motor:bit : broches de Kitronik (carte vissee). Le code l'indique ("# Servomoteur P14, buzzer
P15 (cablage automatique)"), les legendes de "Peripheriques" donnent les broches, et le montage dessine les cartes
avec leurs fils et la mention "cablage automatique" (un.js : calculerCablageKitronik, window.kitronikCables).
Exemple, trois cartes + moteur Motor:bit : LAMP:bit lampe P13, capteur P3 ; ACCESS:bit servo P14, buzzer P15 ;
STOP:bit P16, P4, P10 (matrice eteinte).
"Cabler automatiquement" (nov. 2026) : un bloc "cabler" l'emporte sur le cablage automatique ; laisse sur ses broches
par defaut (P0, P1, P2), il cree des conflits (meme broche, moteurs ou buzzer de la Motor:bit). Le bandeau rouge du
montage propose alors le bouton "Cabler automatiquement", et le clic droit sur un bloc "cabler" l'entree "Cabler
automatiquement (broches libres)" : tous les blocs "cabler" recoivent les broches que choisirait le cablage
automatique (memes regles, sans tenir compte de leurs anciennes broches), en une seule action annulable (un.js :
cablerKitronikAuto). Exemple : trois blocs "cabler" sur P0 a P2 avec la Motor:bit -> STOP:bit P16, P4, P10 ;
LAMP:bit P13, P3 ; ACCESS:bit P14, P15.
Fils sur les pastilles (nov. 2026, demande de l'utilisateur) : dans le montage, les pastilles 0, 1, 2, 3V et GND d'une
carte Kitronik cablee sont dessinees sur le bord tourne vers la carte d'extension (colonne a gauche ou a droite, rangee
en haut sinon) et chaque fil s'y termine, avec un point de sa couleur : signal de la 1re broche sur 0, puis 1 et 2,
fil rouge sur 3V, fil noir sur GND (montage.js : pastillesKitronik, pastilleDuFil). Sur la vraie carte, ces pastilles
sont le long du bord ou se visse la micro:bit.

50. CABLAGE AUTOMATIQUE DE TOUT LE PROGRAMME (nov. 2026)
Generalisation du "Cabler automatiquement" des cartes Kitronik (§49) a tous les modules a broches au choix : modules
Grove, servomoteurs, cartes Kitronik cablees par un bloc "cabler". Deux acces :
- le bouton "Cabler automatiquement" du bandeau rouge du montage, des qu'il y a un conflit (meme broche ou meme port)
  ou un module mal place pour la carte d'extension (broche des moteurs ou du buzzer de la Motor:bit, P13 des LED de
  la BitMaker, broche sans port...) ;
- le clic droit sur un bloc qui a des broches : "Cabler automatiquement (tout le programme)".
Fonctionnement (montage.js : cablerTout) : on lit le montage (memes regles que le dessin, fonctions branchement* de
la carte choisie : Grove Shield, BitMaker, Motor:bit, DFR0548). Les modules bien places gardent leurs broches, dans
l'ordre du programme (de deux modules en conflit, le premier reste). Les autres recoivent la combinaison de broches
la moins couteuse parmi les choix des menus de LEURS blocs (un capteur analogique reste sur une entree analogique, un
module a deux broches sur un port qui les porte), sans conflit ni alerte. Couts : pince crocodile hors port Grove +50,
broche de la matrice de LED +100, sur la Motor:bit P13 a P16 d'abord, ordre des menus sinon. Tous les blocs d'un meme
module changent ensemble (LED etat + luminosite sur la meme broche). Restent en place : modules I2C, moteurs, servos
de la DFR0548, cartes Kitronik en cablage automatique, broches des autres blocs (entrees/sorties...), P5 et P11.
Une seule action annulable. Module sans solution : bandeau "Pas de broche libre pour : ..." (exemple : servomoteur sur
la Motor:bit, son menu ne propose que P0 a P2, prises par la carte).
Verifie : Grove (LED, relais, capteur de lumiere sur P0 -> P0, P1, P2), BitMaker (LED sur P13 -> P0), Motor:bit
(LED sur P1 et trois cartes Kitronik sur P0 a P2 -> broches libres).

51. DESSIN FIDELE DES CARTES KITRONIK DANS LE MONTAGE (nov. 2026, variante A choisie par l'utilisateur)
Les cartes Kitronik cablees sont dessinees d'apres les photos du fabricant (icones des depots pxt-kitronik-* sur
GitHub ; le site kitronik.co.uk impose une verification anti-robots) : silhouette en hauteur (204 unites reservees au
lieu de 74, montage.js : HAUTEUR_KITRONIK, hauteurModule), carte noire a inscriptions blanches, pied en croix
"Kitronik".
- STOP:bit : tete cerclee de blanc, trois LED bombees (rouge, jaune, verte) avec reflet, poteau ; pastilles
  "0 RED", "1 YLW", "2 GRN", "3V", "GND".
- LAMP:bit : poteau, capteur de lumiere transparent en haut, crosse cerclee de blanc, LED blanche diffusante au bout
  (laiteuse eteinte, eclairee avec un halo allumee) ; pastilles "0 LAMP", "1 DETECT", "2", "3V", "0V".
- ACCESS:bit : buzzer rond noir, servomoteur bleu, barriere rouge "KITRONIK" qui pivote (baissee a l'horizontale,
  levee a la verticale) ; pastilles "0 SERVO", "1 BUZZ", "2", "3V", "GND".
Pastilles le long du bord tourne vers la carte d'extension ; module a gauche de la carte : dessin retourne (crosse et
barriere vers l'exterieur, data-s), inscriptions toujours lisibles. Les fils finissent sur les pastilles (verifie :
13 fils sur 13 avec la Motor:bit, 7 sur 7 a gauche de la Grove Shield).
Fils qui contournent les cartes Kitronik (nov. 2026, demande de l'utilisateur) : une carte placee sous la carte
d'extension recevait ses fils par le haut, a travers la tete du feu ou la carte de l'ACCESS:bit. Ses fils descendent
maintenant dans un couloir du cote des pastilles, hors du dessin (montage.js : cxK - k * (52 + 5 i)), a des hauteurs
decalees de 5 unites, puis entrent dans leur pastille a l'horizontale. Les cartes placees a gauche ou a droite gardent
leur arrivee laterale directe. Verifie (Motor:bit, trois cartes) : aucun des 13 fils ne traverse une forme pleine
d'une carte Kitronik (test isPointInFill sur le trace, hors les 16 dernieres unites qui entrent dans la pastille).
Repli du tableau retabli (nov. 2026, demande de l'utilisateur) : le montage dessinant en direct les cartes Kitronik
cablees, le bouton en tete du tableau sous le montage replie de nouveau TOUT le tableau, feu, lampadaire et barriere
compris (choix memorise, cle montageReglagesReplies). Il apparait des qu'il y a une section a montrer, avec un titre
selon le contenu : "Peripheriques" (cartes Kitronik seules), "Reglages des capteurs" (capteurs seuls), "Peripheriques
et reglages des capteurs" (les deux). La rangee des cartes Kitronik est placee juste sous le bouton.
Menu "Carte d'extension" et cablage automatique (nov. 2026, correctif) : le choix du menu du montage (memorise dans
le navigateur, cle montageCarte) ne regle que l'affichage. Il ne declenche plus le cablage automatique : une carte
Kitronik seule, sans bloc Motor:bit, reste vissee sur la micro:bit (P0 a P2, pas de fils ni de montage), meme si
"Motor:bit V1.6" est choisi dans le menu. Le cablage automatique se declenche avec deux ou trois cartes Kitronik, ou
une carte avec des blocs Motor:bit ; dans le premier cas, "Motor:bit V1.6" choisi dans le menu fait eviter les
broches de ses moteurs et de son buzzer. (Remplace "ou une seule avec la Motor:bit (blocs Motor:bit, ou carte choisie
dans le menu du montage)" plus haut.)

52. CARTE KITRONIK VISSEE SUR LA MICRO:BIT, DANS LE MONTAGE (nov. 2026, variante A ajustee par l'utilisateur)
Programme sans carte d'extension qui utilise UNE carte Kitronik sur son brochage d'origine (pas de fils) : le montage
la dessine vissee sur la micro:bit, comme sur les photos de Kitronik, au lieu de la micro:bit seule. Cinq vis
argentees sur les anneaux 0, 1, 2, 3V, GND ; les pastilles de la carte se voient par les trous des anneaux (le dessin
est derriere la micro:bit, les vis devant). Titre : "Carte micro:bit V2 vissee sur la carte STOP:bit" (ou LAMP:bit,
ACCESS:bit).
- STOP:bit et LAMP:bit : poteau debout (tete du feu ; crosse vers la gauche et LED du lampadaire), micro:bit tournee
  d'un quart de tour dans le sens horaire, bord a anneaux le long du poteau, anneau 0 en haut, bouton A en haut.
  L'ecran tourne avec la carte, comme en vrai. Inscriptions du poteau : RED, YLW, GRN, 3V, GND / LAMP, DETECT, 2,
  3V, 0V. La micro:bit reste cliquable (boutons, broches) ; la rotation est une classe CSS de sa place
  (#montage-carte.montage-carte-tournee, position posee par montage.js).
- ACCESS:bit : micro:bit droite, au-dessus de la carte (pastilles 0 SERVO, 1 BUZZ, 2, 3V, GND sous les anneaux),
  buzzer, servomoteur bleu et barriere rouge qui pivote sous la micro:bit.
Feu, lampe et barriere suivent la simulation. Deux cartes ou plus, ou une carte cablee par fils : montage habituel,
micro:bit droite. Une carte vissee avec des modules Grove (carte d'extension) n'est pas dessinee.
montage.js : dessinVissee, visVissee, anneauxVissee ; un.js : window.kitronikVissees.
ACCESS:bit redessinee d'apres la photo du kit fournie par l'utilisateur (nov. 2026) : carte noire en T. Barre du
haut : cinq grosses pastilles "P0 BARRIER", "P1 BUZZER", "P2", "3V", "0V" ; tige centrale cerclee de blanc (profil en
I) avec trois petites pastilles, le buzzer rond et l'interrupteur ON ; etiquette a bandes noires et blanches
"ACCESS:bit / Access barrier for BBC micro:bit" ; deux ecrous ; logo "Kitronik" ; la carte s'elargit a droite dans le
bas. Servomoteur bleu vertical a gauche de la tige (fils orange et rouge) ; barriere rouge avec un disque "sens
interdit", qui pivote sur l'axe du servo. Un seul dessin (montage.js : accessbitT, coordonnees mesurees sur la photo) :
- vissee : sous la micro:bit droite, a l'echelle qui met les grosses pastilles sur les anneaux (ecart < 1 unite),
  barriere vers la gauche ;
- cablee par fils : module de 150 x 272, barriere vers l'exterieur ; ses fils passent au-dessus du module et
  descendent sur la rangee de pastilles du haut (verifie : 18 fils sur 18 sur leurs pastilles, aucun ne traverse une
  carte).

53. RENDU DES CARTES KITRONIK REVU AVEC LE SKILL UI-UX-PRO-MAX (nov. 2026)
Audit (regles du skill : contraste 4,5:1 pour les textes, respect de "reduire les animations", style a plat sans
lueur ni ombre, l'etat ne doit pas reposer sur la couleur seule) puis corrections :
- inscriptions des pastilles agrandies et en gras (10 unites au lieu de 7, 12 sur une carte vissee ; ACCESS:bit 9) ;
- contour gris clair (#7a7f87) autour des cartes noires : elles se detachaient a peine du fond sombre (1,2:1) ;
- halo plat autour du feu allume (cercle de sa couleur, opacite 0,35, sans flou) ;
- etat ecrit sous la carte, comme la valeur des autres modules : "feu rouge", "rouge et orange", "feux eteints",
  "lampe allumee / eteinte", "barriere levee / baissee" (montage.js : etatKitronik, LECTEURS ; carte vissee :
  .mv-ketat) ; traduit en anglais ;
- "reduire les animations" demande par le systeme : la barriere prend sa position sans pivoter (index.html).
Deux defauts de fonctionnement trouves pendant l'audit et corriges :
- l'ACCESS:bit cablee chevauchait le module voisin : sa place fait 280 de large (barriere comprise), la carte y est
  decalee du cote oppose au bras (montage.js : LARGEUR_ACCESSBIT, largeurModule) ;
- le cablage automatique ignorait les ports de la Grove Shield (P0 / P14, P1 / P15, P2 / P16 sur le meme port) : il
  pouvait mettre deux cartes sur un port partage. Une broche prise reserve maintenant sa partenaire, sauf entre
  broches d'une meme carte (un.js : PARTENAIRE_GROVE, finirCarte).
Verifie (trois cartes sur la Grove Shield) : aucun conflit, aucun chevauchement, 19 fils sur 19 sur leurs pastilles,
aucun ne traverse une carte.
LAMP:bit redessine d'apres la photo du fabricant (nov. 2026, demande de l'utilisateur) : poteau etroit au sommet
arrondi (capteur au bout), crosse effilee cerclee de blanc terminee par une tete arrondie qui porte la LED (halo dessous
quand elle est allumee), "LAMP:bit" et ovale "Kitronik" sur le poteau, inscriptions courtes P0, P1, P2, 3V, 0V comme
sur la carte, pied etroit. Vissee : 30 unites de poteau visibles a gauche de la micro:bit au lieu de 55 (les anneaux
etant a 37 unites du bord de la micro:bit, le reste du poteau passe dessous) ; montage.js : dessinLampbitVisse.
Cablee par fils : meme forme en petit (dessinKitronik). Les autres cartes ne changent pas.
Ameliorations suivantes (nov. 2026, points 1 a 4 retenus par l'utilisateur) :
1. Import d'un .py : le cablage des cartes Kitronik n'est plus perdu. Les blocs "cabler" n'ecrivent qu'un commentaire,
   mais les pilotes du fichier portent les vraies broches ; un.js (cablagesDuCode) les relit avant de retirer les
   pilotes et recree les blocs "cabler" en tete de "au demarrage" (seulement si les broches different de celles de
   Kitronik et que le pilote n'est pas en "cablage automatique", que l'appli retrouve seule). "Feu ... allume / eteint"
   retrouve sa couleur d'apres ce cablage. Le display.off() des broches de la matrice est maintenant dans un pilote
   ("matrice") : il ne revient plus en "code personnalise". Verifie : cablage manuel, automatique et carte vissee.
2. Montage : les mentions sous un module (alerte, "hors port Grove", "cablage automatique"...) sont ecrites une par
   ligne, l'alerte seule en rouge ; sur une ligne, elles debordaient sous le module voisin. Inscriptions de l'ACCESS:bit
   cablee (BARRIER / BUZZER, etiquette) espacees. Verifie : aucun texte ne se chevauche (trois cartes, cartes vissees).
3. STOP:bit vissee : poteau etroit comme le LAMP:bit (30 unites visibles), tete du feu et pied centres sur le poteau.
4. "Pas de broche libre pour : ..." traduit en anglais (phrase et noms des modules traduits a part).

54. VERIFICATIONS ET CORRECTIONS DE FIN (nov. 2026, points 5 a 10 retenus par l'utilisateur)
5. Theme clair : montage lisible (cartes noires sur fond clair, textes fonces, etat ecrit en bleu-vert fonce).
   Corrige : les titres des sections de "Peripheriques" (.grove-titre, gris #b8b8b8 du theme sombre) n'atteignaient
   que 1,85:1 sur le fond clair ; #4a4d55 en theme clair (7,9:1), noir en contraste eleve. Concerne toutes les
   sections, pas seulement les cartes Kitronik.
6. "Cabler automatiquement" avec la DFR0548 : verifie (LED, relais, capteur de lumiere et STOP:bit sur P0 -> LED P0,
   relais P1, capteur P2, STOP:bit P8 + P12 + P13 ; 5 fils sur les pastilles, aucun a travers la carte).
7. Annulation : verifiee. "Cabler automatiquement" sur 4 modules = 5 modifications dans UN groupe ; un seul
   "Annuler" remet toutes les broches. (Dans le volet de test masque, les evenements de Blockly partent avec
   retard : il faut attendre quelques dizaines de secondes avant de lire la pile d'annulation.)
8. Montage : un fil qui sort vers le bas d'une broche a gauche de la Motor:bit (P3 a P11) vers une carte Kitronik
   placee sur le cote descend sous la carte d'extension, la longe par le bas et remonte le long du poteau, au lieu
   de la traverser en diagonale (montage.js : parDessous). Verifie : 0 fil des broches de gauche sur la carte.
10. Code inutile retire : ancien dessin de l'ACCESS:bit (dessinKitronik), cas [-26, 62] de pastillesKitronik,
   cablerKitronikAuto et l'option ignorerManuel de calculerCablageKitronik (remplaces par cablerTout, §50).
9. Carte Kitronik vissee (une seule, brochage d'origine) ET carte d'extension (modules Grove...) : deux variantes au
   choix de l'utilisateur, dans le menu "Carte d'extension" du montage, rubrique "Carte Kitronik vissee" (visible
   seulement dans ce cas ; choix memorise, cle montageKitronikVissee ; A par defaut) :
   A "Reliee par pinces crocodile" : la carte est dessinee a cote, reliee par pinces crocodile aux pastilles P0, P1,
     P2 et 3V3 de la Grove Shield, le fil GND passant sous la carte (montage.js : branchementPincesGrove) ; sur les
     autres cartes, fils vers leurs broches. Mention "pinces crocodile" sous le module.
   B "Simple mention" : rien n'est dessine, une ligne sous la carte d'extension le signale ("STOP:bit vissee sur la
     micro:bit (P0, P1, P2) : non dessinee").
   Verifie (STOP:bit + LED Grove sur P8) : A, 5 fils sur les pastilles, aucun a travers un module ; B, mention sous
   la carte ; le choix est retenu. Textes traduits en anglais.
ACCESS:bit cablee par fils, version reduite plus lisible (nov. 2026, demande de l'utilisateur) : a l'echelle du module
(150 de large), l'etiquette ne garde que "ACCESS:bit" dans un fin liseré (les deux lignes "Access barrier / for BBC
micro:bit" et les bandes epaisses la rendaient illisible), les inscriptions des pastilles tiennent sur une ligne (P0, P1,
P2, 3V, 0V ; "BARRIER" / "BUZZER" n'y tiennent pas), les trois petites pastilles et le texte "ON" disparaissent, et le
servomoteur, plus etroit, est colle a la tige a droite de l'axe : la barriere part nettement du palonnier
(montage.js : accessbitT, option simplifie). La version vissee sous la micro:bit garde tous ses details.
Cablage automatique Kitronik selon la carte d'extension (nov. 2026, correctif) : il ne connaissait que les ports de la
Grove Shield ; sur la BitMaker, il pouvait mettre deux cartes sur le port P8 et une broche sans port (P3). Il applique
maintenant les regles de la carte du montage (montage.js : window.montageRegles, memes fonctions branchement* que le
dessin et "Cabler automatiquement") : pour chaque carte Kitronik, la combinaison de broches la moins couteuse sans
alerte (broche sans port, moteur, LED de la BitMaker...) ni port deja pris, sur un port plutot qu'en pince crocodile,
matrice de LED en dernier (un.js : calculerCablageKitronik, choisir). Sans montage, ancienne attribution simple.
Verifie avec les trois cartes, sans conflit ni alerte : BitMaker (LAMP:bit P14, P0 ; ACCESS:bit P15, P16 ; STOP:bit
P12, P1, P2), Grove Shield (P14, P0 ; P15, P16 ; P13, P8, P12 : la matrice reste allumee), Motor:bit avec moteur
(P13, P3 ; P14, P15 ; P16, P4, P10 : matrice eteinte, pas d'autre solution), DFR0548 (P13, P0 ; P14, P15 ; P16, P8, P12).

54. AIDE D'UN BLOC : REMPLACER OU AJOUTER L'EXEMPLE (nov. 2026, comme mBot1)
Dans la fenetre d'aide d'un bloc (clic droit > "Expliquer ce bloc" quand le bloc n'a pas de fiche illustree), sous
l'exemple :
- programme deja en place : "Remplacer mon programme" (bouton secondaire ; efface le programme et met l'exemple a la
  place, apres confirmation ; un seul Ctrl+Z rend le programme d'avant) et "Ajouter a mon programme" (bouton
  principal ; l'exemple s'ajoute sous les blocs existants, comme avant) ;
- espace de depart ("au demarrage" et "repeter indefiniment" vides, ou rien) : le seul bouton "Inserer cet exemple dans
  mon espace de travail".
Le remplacement quitte l'edition manuelle du code si elle est active. index.html : #aide-actions-exemple,
#aide-remplacer ; un.js : ouvrirAideBloc, insererExemple(ex, remplacer). Textes traduits en anglais.
Les fiches illustrees (aide/<bloc>.html) gardent leur bouton "Essayer ce programme".
Fiches illustrees (aide/<bloc>.html) : memes choix (nov. 2026). Avec un programme deja en place, EasyBloc adapte les
boutons de l'exemple a l'ouverture de la fiche : le bouton vert de la fiche devient "Remplacer mon programme" (bouton
secondaire blanc ; confirmation, Ctrl+Z le retablit) et un bouton vert "Ajouter a mon programme" apparait a cote (un
seul Ctrl+Z). Espace de depart : le bouton "Essayer ce programme dans EasyBloc" de la fiche, inchange. Les 394 fiches
(francaises et anglaises) ne sont pas modifiees ; ouvertes seules, hors d'EasyBloc, elles gardent leur unique bouton
(un.js : adapterBoutonsFiche, window.ajouterExempleFiche).

55. VISITES GUIDEES MISES A JOUR, VISITE "TRANSFERER SUR LA CARTE" (nov. 2026)
Visite generale (menu Aide > "Visite guidee") : 14 etapes au lieu de 12. Deux etapes ajoutees : "5. Le montage et la
carte d'extension" (montage, menu de choix de la carte, bandeau rouge et "Cabler automatiquement" ; cible : le menu de
carte quand il est affiche, sinon le simulateur) et "9. Les extensions" (Fichier > Extensions..., STOP:bit, LAMP:bit,
ACCESS:bit). Textes actualises : "11. Envoyer sur la carte" renvoie a la nouvelle visite ; "14. De l'aide partout"
cite l'exemple a ajouter au programme ou a mettre a sa place.
Nouvelle visite : menu Aide > "Visite guidee Transferer sur la carte" (tuto.js : ETAPES_TRANSFERT, 8 etapes +
introduction et conclusion) : programme pret (attend un bloc dans "au demarrage" ou "repeter indefiniment"), l'essayer
dans le simulateur, brancher la carte (LED jaune, lecteur MICROBIT, cable de donnees), "Televerser" (attend le clic :
l'envoi demarre vraiment), choisir le lecteur MICROBIT (premiere fois, choix retenu), fenetre d'envoi (trois etapes,
pourcentage, annulation), redemarrage de la carte (ne pas debrancher pendant le clignotement), autre methode du
fichier .hex, problemes courants (bouton grise, mauvais dossier, erreur affichee par la carte). Sans carte, "Suivant"
permet de tout parcourir.
Correctif : une cible dans la colonne de categories (categorie IA, en bas depuis les extensions) est ramenee a
l'ecran ; elle en sortait a 1280 x 720. Message d'accueil : cite la visite du transfert. Textes traduits en anglais.
Verifie (1280 x 720) : les cinq visites, chaque cible presente et a l'ecran, demarrage par le menu, detection de
l'etape "Un programme pret". Pas verifie avec une vraie carte (etapes Televerser a redemarrage).

56. THEMES DE SAISON : HALLOWEEN RETIRE, PRINTEMPS, ETE, AUTOMNE, MICRO:BIT ET METEO (nov. 2026)
Menu Affichage > Saison : Aucune, Printemps, Ete, Automne, Noel, micro:bit, Meteo, Salon Educatech Expo, Selon la date.
Halloween est retire (menu, date automatique, couleurs, decor, theme Blockly, traduction).
Comme Noel et le salon, chaque theme est une variante du sombre en contraste normal ; les couleurs des blocs ne changent
pas ; le decor (#deco-saison, bandeau.js) n'est jamais cliquable et ses animations s'arretent si le systeme demande de
reduire les animations. Les decors du bas restent a gauche de la corbeille et du zoom.
- Printemps "Jardin en fleurs" (bandeau vert, accent rose) : prairie, tulipes et marguerites, petales qui tombent,
  papillon qui volette.
- Ete "Bord de mer" (bandeau bleu ocean, accent jaune) : soleil qui pulse, mouettes, vagues qui ondulent, plage, palmier.
- Automne "Foret d'automne" (bandeau rouille, accent orange) : feuilles d'erable qui tombent en tournoyant, sol de
  feuilles, champignon, gland.
- micro:bit "Circuit imprime" (bandeau ardoise, accent vert) : matrice 5 x 5 dont le coeur bat, pistes qui s'allument,
  connecteur dore. Sans le logo officiel.
"Selon la date" : printemps du 20 mars au 20 juin, ete du 21 juin au 22 septembre, automne du 23 septembre au
30 novembre, salon du 2 au 4 decembre 2026, Noel le reste de decembre, aucun theme du 1er janvier au 19 mars
(meme regle dans le script en tete de index.html et dans bandeau.js : saisonDuJour). micro:bit et Meteo : choix manuel.
Theme Meteo : le decor suit le temps local. Avant la premiere demande, une fenetre explique ce qui est envoye
(#meteo-accord ; accord retenu dans meteoAccord) ; puis le navigateur demande la position (sa propre autorisation).
La position est arrondie a 0,1 degre (environ 10 km) et envoyee seulement a Open-Meteo (api.open-meteo.com, gratuit,
sans cle ni compte : temperature, code meteo OMM, jour ou nuit), toutes les 30 minutes tant que le theme est affiche.
Elle n'est jamais enregistree ; seul le dernier releve (ambiance, temperature, heure) l'est, dans meteoReleve.
Sept ambiances (attribut data-meteo) : soleil, nuit (lune et etoiles), nuages, pluie, orage (eclair), neige,
brouillard (brume), chacune avec la couleur de son bandeau ; badge du bandeau "8 °C · Pluie" (#tb-meteo).
Sans autorisation ni connexion : dernier releve de moins de 3 h, sinon ambiance neutre et "Meteo indisponible".
Fonctionne aussi dans l'exe : il ouvre l'application dans le navigateur a l'adresse localhost, ou la geolocalisation
est permise. Fichiers : index.html (couleurs, decors, menu), bandeau.js (decors, saisonDuJour, theme Meteo), un.js
(themes Blockly), montage.js (capture : data-meteo), langue-en.js (textes anglais).
Verifie (1280 x 720) : les sept themes, les sept ambiances meteo, la fenetre d'accord, un vrai releve Open-Meteo
(position de test), "Selon la date" le 22 novembre (automne), retour a "Aucune" en choisissant le theme clair, aucune
erreur JavaScript. Pas verifie : la demande de position du navigateur (refusee dans l'apercu), l'exe.

57. CATEGORIE "KITRONIK" ET EXERCICES PAS A PAS KITRONIK (nov. 2026, variante A choisie par l'utilisateur)
Colonne des categories : STOP:bit, LAMP:bit et ACCESS:bit sont rangees dans une categorie "Kitronik" (un tiroir par
carte, comme "Cartes d'extension" et "Grove"). La categorie n'apparait que si au moins une carte est ajoutee
(Fichier > Extensions) et ne montre que les cartes ajoutees. La fenetre Extensions ne change pas ; un programme qui
utilise un bloc Kitronik reactive toujours sa carte (recherche des blocs d'extension dans les sous-categories).
un.js : categorie "Kitronik" dans la boite a outils, ORDRE_CATEGORIES, PALETTE_CATEGORIES, construireToolbox
(sansRetirees), indexerBlocs, window.extensionActive(nom).
Exercices pas a pas (exercices.json, 12 exercices) : quatre niveaux apres le niveau 8, avec indices, solution et
validation automatique comme les autres :
- "Kitronik — STOP:bit" : K1.1 Le feu au rouge, K1.2 Le cycle du feu, K1.3 Le bouton pieton, K1.4 Le feu orange
  clignotant ;
- "Kitronik — LAMP:bit" : K2.1 Allumer le lampadaire, K2.2 Mesurer la lumiere, K2.3 Le lampadaire automatique ;
- "Kitronik — ACCESS:bit" : K3.1 Lever la barriere, K3.2 Lever et baisser, K3.3 Attention, la barriere descend,
  K3.4 L'entree du parking ;
- "Kitronik — Projet" : K4.1 Le passage a niveau (STOP:bit et ACCESS:bit).
Nouvelles cles de niveau : "extensions" (le niveau n'est propose que si ces extensions sont toutes ajoutees : liste,
resultats, evaluation, exercice suivant) et "independant" (premier exercice ouvert sans avoir fini les niveaux
precedents). exercices.js : niveauxProposes, majPlat (a chaque ouverture), accessible. Visite generale, etape
"9. Les extensions" : cite la categorie "Kitronik" et ses exercices. Textes traduits en anglais.
Verifie : categorie absente sans carte, une ou deux cartes selon les ajouts, reactivation par un bloc pose ; niveaux
affiches selon les cartes ajoutees, premiers exercices ouverts ; les 12 solutions validees, un espace vierge refuse ;
aucune erreur JavaScript. Pas verifie : un eleve qui fait les exercices de bout en bout dans le simulateur.

58. MODELE IA : EXPORT EN .ZIP AVEC LES PHOTOS, REIMPORT (nov. 2026, demande de l'utilisateur)
Demande : pouvoir exporter le modele IA puis le reimporter, fichiers compris (le .json seul perdait les photos des
"objets ou images" : vignettes vides apres import).
- ia-immediat.js : chaque exemple d'objet ou d'image garde aussi une photo de 320 x 240 (JPEG, meme cadrage que la
  vignette), en memoire. "Exporter le modele" : objets ou images avec photos -> NOM.zip = modele.json (meme format que
  le .json, plus un tableau "photos" par classe) + photos/<classe>/001.jpg... ; autres types (mains, bras, sons) ou
  sans photo -> NOM.json comme avant. Zip ecrit sans compression (les photos sont deja du JPEG), noms en UTF-8.
- "Importer un modele" accepte .zip et .json : un .zip avec modele.json recharge le modele PUIS ses photos (vignettes
  refaites) ; un .zip sans modele.json, fait de dossiers d'images (un dossier = une classe, par exemple un projet
  Teachable Machine ou un dossier de photos zippe par l'Explorateur Windows), recree les classes et recalcule les
  empreintes. Lecture des zips stockes ou compresses (DecompressionStream du navigateur). Les anciens .json restent
  lisibles.
- Le .py garde seulement les empreintes (pas de photos) ; le .hex rien. Bulles des boutons, aide de la fenetre IA,
  visite guidee "8. Exporter et importer un modele" et traductions anglaises mises a jour.
Verifie dans l'editeur : export de 2 classes x 3 images -> test.zip (modele.json + 6 photos, noms accentues) ;
reimport : 6 exemples, 6 photos et vignettes ; ancien .json relu ; zip de dossiers sans modele.json (stocke, et
compresse par Python) -> classes nommees d'apres les dossiers, empreintes recalculees. Pas verifie : un export
avec la camera, et l'ouverture du .zip dans l'Explorateur Windows.

59. MODELE IA : FICHIER .EBIA (EasyBloc IA) A LA PLACE DU .JSON ET DU .ZIP (nov. 2026, demande de l'utilisateur)
Demande : ne plus produire de fichier de type JSON, en gardant les memes fonctions (export, reimport, photos).
- "Exporter le modele" produit toujours NOM.ebia, pour les 4 types. C'est un conteneur zip (comme un .docx) :
  modele.bin + pour les objets et images, photos/<classe>/001.jpg... Aucun texte JSON dedans.
- modele.bin (ia-immediat.js, ecrireModeleBin / lireModeleBin), petit-boutiste : "EBIA", version 1, type (0 images,
  1 mains, 2 bras, 3 sons), nom du modele, nombre de classes ; par classe : nom, dossier des photos (vide sans photo),
  nombre d'exemples, taille d'une empreinte, codage (0 = un octet signe par nombre pour les objets et images, comme
  le .py ; 1 = flottant 4 octets pour les autres) ; par exemple : l'empreinte puis 1 octet "photo presente".
  Textes : longueur sur 2 octets puis UTF-8. Un fichier etranger ou d'une version plus recente est refuse avec un
  message clair. Environ 3 fois plus petit que le JSON (base64) pour les objets et images.
- "Importer un modele" : .ebia, et toujours les anciens .zip (modele.json) et .json du §58, et un .zip de dossiers
  d'images. Le .py garde son annexe de commentaires (inchangee).
- Bulles, aide de la fenetre IA, visite guidee "8. Exporter et importer un modele", traductions anglaises a jour.
Verifie dans l'editeur : objets ou images 2 x 3 images -> test.ebia (17,8 Ko : modele.bin de 6,2 Ko + 6 photos),
reimport : 6 exemples et 6 photos, empreintes conservees (cosinus 0,997) ; positions des bras -> bras.ebia
(modele.bin seul), valeurs exactes au reimport ; fichier etranger refuse ; ancien .json et ancien .zip relus.
Pas verifie : export avec la camera ; Windows n'associe pas l'extension .ebia (ouvrir par "Importer un modele").

60. BLOCS EN C : PETIT TRAIT SOUS LE COIN BAS DROIT SUPPRIME (nov. 2026, signale par l'utilisateur)
Defaut : sous le coin bas droit d'un bloc en C (« si », « repeter »...), un fin trait vertical clair. Cause : la partie
basse, agrandie a 14 px par formeDesBlocs (un.js), depassait le bas du bloc de la hauteur de la languette (4 px) ; le
contour descendait puis remontait (« V 80 V 76 ») et ce trait d'aller-retour etait dessine avec le lisere clair.
Correction : drawRightSideRow_ du dessin thrasos ne descend jamais plus bas que le bas du bloc (bottomRow.baseline).
Verifie : les 255 types de blocs dessines, aucun contour qui remonte ; bloc « si » range dans « au demarrage » et seul.

61. FICHES ILLUSTREES POUR TOUS LES BLOCS (nov. 2026, demande de l'utilisateur)
Demande : "Expliquer ce bloc" doit presenter TOUS les blocs comme les fiches illustrees (aide/<type>.html), et non
avec l'ancienne fenetre "Aide sur ce bloc" (encore utilisee quand la fiche manque).
- 13 fiches ajoutees, en francais (aide/) et en anglais (aide/en/) : STOP:bit (stopbit_etat, stopbit_led,
  stopbit_eteindre, stopbit_cablage), LAMP:bit (lampbit_lampe, lampbit_lumiere, lampbit_sombre, lampbit_cablage),
  ACCESS:bit (accessbit_barriere, accessbit_bip, accessbit_cablage), code brut (code_brut, expression_brute).
- Textes dans outils/fiches/fiches-data.js et fiches-data-en.js ; exemples repris de l'aide d'avant (Kitronik) ou
  ecrits dans la fiche (code brut) ; generees par outils/fiches/generer-fiches.js (serveur easybloc_fiches).
- Verifie : les 197 blocs de la boite a outils (et les blocs Kitronik ajoutes par Fichier > Extensions) ont leur
  fiche en francais et en anglais ; clic droit "Expliquer ce bloc" sur "STOP:bit : mettre le feu sur" -> fiche.
  Les autres types sans fiche (blocs natifs de Blockly non proposes, pieces des fenetres d'engrenage) ne sont
  jamais poses par l'eleve.

62. FICHE "EXPLIQUER CE BLOC" SANS ASCENSEUR (nov. 2026, maquette validee par l'utilisateur)
Demande : toute la fiche doit tenir dans la fenetre, sans ascenseur ; l'ascenseur reste accepte quand l'eleve deplie
une rubrique, et sur un ecran trop petit.
- aide/style-aide.css (toutes les fiches, sans les refaire) : en-tete sur une ligne (nom du bloc + identifiant),
  marges resserrees, pied "Technologie Services" en une ligne discrete.
- index.html : fenetre de la fiche haute de presque tout l'ecran (100vh - 24 px, 1100 px au plus).
- un.js, ajusterFiche : a l'ouverture (rubriques repliees), le dessin de l'exemple est reduit juste assez pour que
  tout tienne ; jamais agrandi, jamais sous 60 % ; refait quand la police arrive et quand la fenetre change de
  taille ; plus de reduction une fois une rubrique depliee.
Verifie (fenetre de 1024 x 768) : 206 fiches sur 210 tiennent sans ascenseur ; les 4 autres (logic_boolean et les
3 blocs de cablage Kitronik, dont l'exemple est tres long) gardent l'ascenseur ; en 1080 px de haut, les 210.

63. BANDEAU : NOMS DE CONSOLE, SIMULATION ET CODE SELON LA PLACE (nov. 2026, maquette validee par l'utilisateur)
Demande : selon le zoom, les icones Console, Simulation et Code doivent etre accompagnees de leur nom.
- index.html : ces trois boutons montrent icone ET nom tant que le bandeau a la place ; des le palier de compactage 2
  (bandeau.js, deja utilise pour les autres boutons), ils repassent en icones seules (34 px), nom dans la bulle.
  Capture reste en icone seule. Pastille claire du panneau ouvert inchangee (elle s'elargit au nom).
Verifie (largeur du bandeau) : 1440 px et plus, et 1366 px (palier 1) : noms affiches ; 1280 px (zoom 150 % sur un
ecran de 1920 px) et moins : icones seules ; jamais de debordement.

64. TITRES DES PANNEAUX ET CONSOLE EN VIOLET (nov. 2026, variante B choisie par l'utilisateur)
Demande : remplacer l'orange de "Simulateur visuel", des onglets CONSOLE / GRAPHIQUE et de "Aucune mesure pour
l'instant" par le violet du bandeau (#6a2c91).
- index.html : variables --violet-trait (#6a2c91, traits), --violet-onglet (#8e44c0, soulignement de l'onglet actif),
  --violet-texte (#c08ae6 sur fond sombre : contraste 6,4:1, le violet exact n'y fait que 1,9:1). Theme clair : texte
  et soulignement en #6a2c91. Contraste eleve : blanc.
- Concernes : titres "Simulateur visuel" et "Code", onglet actif de la console, trait sous l'en-tete de la console,
  titre "Aucune mesure pour l'instant". Boutons orange pleins (Lancer la simulation...) inchanges.
Verifie : couleurs calculees dans les trois modes (sombre, clair, contraste eleve).

65. TELEVERSER ET CONSOLE PAR WEBUSB, SANS CHOIX DE DOSSIER (nov. 2026, demande et etude validees par l'utilisateur)
Demande : « Connecter » puis « Televerser » (choix de la carte, autorisation du navigateur, envoi), sans la fenetre
« Selectionnez ou ce site peut enregistrer des modifications » (choix du lecteur MICROBIT).
- lib/microbit/microbit-connection.js : @microbit/microbit-connection 1.0.3 (Fondation micro:bit, MIT, bibliotheque
  de python.microbit.org) + @microbit/microbit-universal-hex 0.3.1 (MIT) + nrf-intel-hex 1.4.0 (BSD), paquet unique
  (esbuild, IIFE, global window.MicrobitConnexion), licences en tete du fichier. Charge par index.html avant un.js.
- un.js, « Vraie carte par WebUSB » : une seule connexion USB (appareil « BBC micro:bit CMSIS-DAP ») pour la console
  (lecture : serialdata ; ecriture : serialWrite, console et panneau IA) ET le televersement (flash partiel : seules
  les pages changees ; barre de progression 25 a 99 %). Autorisation demandee la premiere fois seulement
  (UseAnyAllowed). « Televerser » se connecte tout seul si besoin ; la console reste connectee apres l'envoi.
  Fenetre d'envoi : etape du milieu « Connexion » (au lieu de « Lecteur MICROBIT ») ; « Annuler » grise pendant
  l'ecriture (non interruptible). Erreurs traduites en messages clairs (carte occupee, logiciel USB trop ancien,
  pas de reponse...).
- Sans WebUSB (ou sans la bibliotheque) : ancienne voie inchangee (Web Serial pour la console, lecteur MICROBIT).
- bandeau.js : le menu des cartes liste les micro:bit autorisees (navigator.usb.getDevices) et finit par
  « + Ajouter une carte… » (requestDevice), comme ⟳. Limite : avec plusieurs cartes autorisees branchees, la
  bibliotheque prend la premiere disponible.
- Aide de la console, visite « Transferer sur la carte » (etapes 3 a 7 et problemes ; etape 5 « Autoriser la
  carte »), visite Console (etape 9), bulles et messages : textes mis a jour, traduits en anglais.
- Campus : si l'editeur est dans un cadre (iframe), le cadre doit autoriser l'USB : allow="usb" (en plus de serial).
Verifie dans l'editeur, sans carte : bibliotheque chargee, menu « micro:bit / + Ajouter une carte… », etape
« Connexion » ; televersement avec fenetre d'autorisation fermee -> « Envoi annule » ; carte qui refuse la connexion
-> message d'erreur ; jamais de fenetre de choix de dossier ; aucune erreur JavaScript.
PAS verifie : l'envoi et la console sur une VRAIE carte (a essayer avant diffusion).

66. PANNEAU DU CODE TOUT A DROITE (nov. 2026, maquette validee par l'utilisateur)
Demande : le panneau « Transcription MicroPython » s'ouvrait entre les blocs et la simulation ; il doit s'ouvrir sur
la partie droite.
- index.html : ordre d'affichage par CSS (order) : blocs | poignee | simulation | code. L'ordre du HTML ne change pas.
- un.js : la poignee de la simulation est affichee des que la simulation l'est (son bord gauche touche toujours les
  blocs), code ouvert ou non ; sa largeur maximale retire celle du code ouvert (les blocs gardent 260 px).
Verifie (1024 et 1600 px) : code ouvert -> a droite de la simulation ; simulation fermee -> code a droite des
blocs ; poignee utilisable code ouvert (384 -> 484 px), largeur maximale sans debordement.
