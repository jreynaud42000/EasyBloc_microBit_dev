// bandeau.js — comportement du bandeau du haut (apparence identique a la version Arduino R4).
//
// AUCUNE fonction existante du logiciel n'est modifiee ni dupliquee : ce fichier ne fait que
//  - relayer les nouveaux boutons du modele vers les boutons / fonctions qui existent deja
//    (#btn-theme, #btn-contraste, #btn-console-carte, #run-sim, #btn-reset...) ;
//  - mettre a jour les libelles variables (Afficher / Masquer la console...) et les coches ✓,
//    en observant l'etat deja tenu par le logiciel (classes, attributs data-theme / data-contrast,
//    window.simuEnCours).
// Les menus deroulants (ouverture / fermeture) restent geres par le code existant (un.js).

const $ = id => document.getElementById(id);
const racine = document.documentElement;

// ---------- Affichage : theme et contraste ----------
// #btn-theme et #btn-contraste (caches) basculent ; on ne les clique que si l'etat voulu differe.
const themeClair = () => racine.dataset.theme === 'light';
const contrasteEleve = () => racine.dataset.contrast === 'high';
function choisirTheme(clair) { if (themeClair() !== clair && $('btn-theme')) $('btn-theme').click(); }
function choisirContraste(eleve) { if (contrasteEleve() !== eleve && $('btn-contraste')) $('btn-contraste').click(); }

// ---------- Affichage : theme de saison (printemps, ete, automne, Noel, micro:bit, meteo, salon Educatech Expo) ----------
// Choix memorise dans saisonApp : aucune, un theme, ou auto (selon la date). L'attribut data-saison
// est pose des le chargement par le petit script en tete de index.html ; un.js y accorde le theme Blockly.
// Un theme de saison est une variante du sombre en contraste normal : le choisir y ramene, et choisir
// le theme clair ou le contraste eleve revient a « Aucune ». Halloween retire (demande de l'utilisateur, nov. 2026).
const SAISONS = ['aucune', 'printemps', 'ete', 'automne', 'noel', 'microbit', 'meteo', 'salon', 'auto'];
const SALON = { titre: 'Educatech Expo', dates: '2-4 déc. 2026', stand: 'K3' };   // a mettre a jour pour un autre salon
function saisonDuJour(d = new Date()) {   // meme regle qu'en tete de index.html ; micro:bit et Meteo : jamais automatiques
    const m = d.getMonth() + 1, j = d.getDate(), q = m * 100 + j;
    if (d.getFullYear() === 2026 && m === 12 && j >= 2 && j <= 4) return 'salon';
    if (m === 12) return 'noel';
    if (q >= 320 && q <= 620) return 'printemps';
    if (q >= 621 && q <= 922) return 'ete';
    return q >= 923 ? 'automne' : '';
}
function choixSaison() {
    let choix = 'aucune';
    try { choix = localStorage.getItem('saisonApp') || 'aucune'; } catch (erreur) { /* navigation privee */ }
    return SAISONS.includes(choix) ? choix : 'aucune';
}
function appliquerSaison(choix) {
    if (choix === 'meteo' && !accordMeteo()) { demanderAccordMeteo(); return; }   // fenetre d'explication d'abord
    try { localStorage.setItem('saisonApp', choix); } catch (erreur) { /* le choix ne survivra pas au rechargement */ }
    const saison = choix === 'auto' ? saisonDuJour() : (choix === 'aucune' ? '' : choix);
    if (saison) { racine.dataset.saison = saison; choisirTheme(false); choisirContraste(false); }
    else delete racine.dataset.saison;
    majCoches();
    suivreMeteo();
}
SAISONS.forEach(choix => {
    const b = $('aff-saison-' + choix);
    if (b) b.addEventListener('click', () => appliquerSaison(choix));
});
const quitterSaison = () => { if (choixSaison() !== 'aucune') appliquerSaison('aucune'); };

// Decorations : un repere dans le bandeau, juste apres le logo, et un calque sur la zone de programmation.
if ($('tb-logo') && !$('tb-saison')) {
    const repere = document.createElement('span');
    repere.id = 'tb-saison';
    repere.setAttribute('aria-hidden', 'true');
    $('tb-logo').after(repere);
}
// Dessins des decors (SVG dans la page, aucun fichier a telecharger) : printemps, ete, automne, Noel, micro:bit, meteo, salon.
const svg = (classe, vue, contenu) => '<svg class="' + classe + '" viewBox="' + vue + '" aria-hidden="true">' + contenu + '</svg>';
const tulipe = (x, y, s, c) => '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
    '<path d="M10 40 V14" stroke="#40c057" stroke-width="2.4"/><path d="M10 32 Q2 26 0 18 Q8 22 10 30Z" fill="#2f9e44"/>' +
    '<path d="M3 4 L6.5 8 L10 3 L13.5 8 L17 4 V10 A7 7 0 0 1 3 10Z" fill="' + c + '"/></g>';
const marguerite = (x, y, s) => '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
    '<path d="M10 40 V12" stroke="#40c057" stroke-width="2.2"/><g fill="#fff">' +
    [0, 45, 90, 135, 180, 225, 270, 315].map(a => '<ellipse cx="10" cy="4" rx="2.6" ry="5" transform="rotate(' + a + ' 10 10)"/>').join('') +
    '</g><circle cx="10" cy="10" r="3.4" fill="#fcc419"/></g>';
const feuilleErable = c => '<svg viewBox="-13 -13 26 26" width="26" height="26">' +
    '<path d="M0 -12 L3 -5 L9 -8 L7 -1 L12 1 L5 4 L6 9 L0 6 L-6 9 L-5 4 L-12 1 L-7 -1 L-9 -8 L-3 -5Z" fill="' + c + '"/>' +
    '<path d="M0 6 V13" stroke="#6b3e1f" stroke-width="1.4"/></svg>';
const nuage = (x, y, s, c) => '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')" fill="' + c + '">' +
    '<ellipse cx="30" cy="24" rx="30" ry="12"/><ellipse cx="20" cy="16" rx="13" ry="11"/><ellipse cx="38" cy="12" rx="16" ry="13"/></g>';
const soleil = () => '<g class="rayons" stroke="#ffd43b" stroke-width="3" stroke-linecap="round">' +
    [0, 45, 90, 135, 180, 225, 270, 315].map(a => '<line x1="38" y1="4" x2="38" y2="11" transform="rotate(' + a + ' 38 38)"/>').join('') +
    '</g><circle class="disque" cx="38" cy="38" r="20" fill="#ffd43b"/>';
function dessinMatrice() {   // micro:bit : 5 x 5 LED, coeur allume
    const COEUR = ['01010', '11111', '11111', '01110', '00100'];
    let leds = '';
    COEUR.forEach((ligne, l) => [...ligne].forEach((v, c) => {
        leds += '<rect x="' + (16 + c * 14) + '" y="' + (16 + l * 14) + '" width="8" height="8" rx="1.5" fill="#ff3b30"' +
            (v === '1' ? '' : ' opacity="0.18"') + '/>';
    }));
    return '<rect x="2" y="2" width="92" height="92" rx="12" fill="#1d2a3a" stroke="#4dabf7" stroke-width="1.2"/>' +
        '<g class="coeur">' + leds + '</g>';
}
const sapin = (x, y, s) => '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
    '<path d="M10 0 L20 14 L15 14 L22 24 L-2 24 L5 14 L0 14Z" fill="#2b8a3e"/>' +
    '<path d="M10 0 L14 6 L6 6Z M5 14 L15 14 L16 16 L4 16Z M-2 24 L22 24 L20 21 L0 21Z" fill="#f1f6fb"/>' +
    '<rect x="8" y="24" width="4" height="4" fill="#6b3e1f"/></g>';
function dessinGuirlande() {   // fil en festons et ampoules qui clignotent, sur toute la largeur du bandeau
    const COULEURS = ['#ffd43b', '#4dabf7', '#ff6b6b', '#69db7c'];
    let fil = 'M0 2', ampoules = '';
    for (let i = 0; i < 100; i++) {
        const x = i * 36;
        fil += ' Q' + (x + 18) + ' 16 ' + (x + 36) + ' 2';
        ampoules += '<rect x="' + (x + 16) + '" y="8" width="4" height="4" fill="#495057"/>' +
            '<ellipse class="' + (i % 2 ? 'deco-lueur' : 'deco-lueur-2') + '" cx="' + (x + 18) + '" cy="17.5" rx="4.6" ry="6" fill="' + COULEURS[i % 4] + '"/>';
    }
    return '<path d="' + fil + '" fill="none" stroke="#212529" stroke-width="1.4"/>' + ampoules;
}
if ($('blockly-wrapper') && !$('deco-saison')) {
    const deco = document.createElement('div');
    deco.id = 'deco-saison';
    deco.setAttribute('aria-hidden', 'true');
    deco.innerHTML =
        // Printemps
        '<div class="deco-printemps deco-petales"></div>' +
        '<svg class="deco-printemps deco-prairie" viewBox="0 0 1000 60" preserveAspectRatio="none" aria-hidden="true">' +
            '<path d="M0 60 L0 34 Q160 14 340 30 T700 26 T1000 30 L1000 60Z" fill="#2b8a3e"/>' +
            '<path d="M0 60 L0 48 Q240 34 480 46 T1000 42 L1000 60Z" fill="#37b24d"/></svg>' +
        svg('deco-printemps deco-fleurs', '0 0 170 80', tulipe(10, 36, 1.1, '#f03e3e') + marguerite(48, 40, 1) +
            tulipe(80, 28, 1.3, '#f783ac') + marguerite(120, 38, 1.05) + tulipe(146, 40, 0.95, '#fab005')) +
        svg('deco-printemps deco-papillon', '0 0 46 40',
            '<path class="aile" d="M22 20 C10 4 0 8 4 18 C0 28 12 32 22 22Z" fill="#ffd43b" stroke="#e8590c" stroke-width="1"/>' +
            '<path class="aile aile-d" d="M24 20 C36 4 46 8 42 18 C46 28 34 32 24 22Z" fill="#ffd43b" stroke="#e8590c" stroke-width="1"/>' +
            '<rect x="21.5" y="12" width="3" height="18" rx="1.5" fill="#343a40"/>') +
        // Ete
        svg('deco-ete deco-soleil', '0 0 76 76', soleil()) +
        svg('deco-ete deco-mouettes', '0 0 90 30', '<path d="M4 16 q8 -9 16 0 q8 -9 16 0 M54 8 q6 -7 12 0 q6 -7 12 0" fill="none" stroke="#e9ecef" stroke-width="2"/>') +
        '<div class="deco-ete deco-vagues"></div><div class="deco-ete deco-vagues-2"></div>' +
        svg('deco-ete deco-plage', '0 0 230 120', '<path d="M0 120 Q90 88 230 96 V120Z" fill="#f2d49b"/>' +
            '<path d="M150 104 Q142 64 160 30" fill="none" stroke="#8a5a2b" stroke-width="6" stroke-linecap="round"/>' +
            '<g fill="#2f9e44"><path d="M160 30 Q132 18 112 38 Q136 26 160 33Z"/><path d="M160 30 Q190 14 214 34 Q188 24 162 33Z"/>' +
            '<path d="M160 30 Q150 4 128 2 Q152 12 157 30Z"/><path d="M160 30 Q176 4 198 6 Q174 14 163 30Z"/></g>' +
            '<circle cx="155" cy="36" r="3.5" fill="#8a5a2b"/><circle cx="163" cy="37" r="3.5" fill="#8a5a2b"/>') +
        // Automne
        [[8, 0, '#e8590c'], [22, -4, '#f59f00'], [38, -8, '#c92a2a'], [55, -2, '#fab005'], [70, -6, '#e8590c'], [86, -10, '#c92a2a']]
            .map(([gauche, retard, c], n) => '<div class="deco-automne deco-feuille" style="left:' + gauche + '%;animation-delay:' + retard +
                's;animation-duration:' + (10 + (n % 3) * 3) + 's">' + feuilleErable(c) + '</div>').join('') +
        '<svg class="deco-automne deco-sol" viewBox="0 0 1000 50" preserveAspectRatio="none" aria-hidden="true">' +
            '<path d="M0 50 L0 26 Q200 10 420 24 T1000 20 L1000 50Z" fill="#5c3a1e"/>' +
            '<g fill="#e8590c" opacity="0.85"><ellipse cx="120" cy="30" rx="14" ry="5"/><ellipse cx="330" cy="28" rx="12" ry="4" fill="#fab005"/>' +
            '<ellipse cx="560" cy="30" rx="14" ry="5" fill="#c92a2a"/><ellipse cx="780" cy="27" rx="12" ry="4"/></g></svg>' +
        svg('deco-automne deco-sous-bois', '0 0 110 50', '<rect x="22" y="22" width="9" height="20" rx="3" fill="#f1e3c8"/>' +
            '<path d="M8 26 Q26 0 45 26Z" fill="#e03131"/><circle cx="20" cy="18" r="2.6" fill="#fff"/><circle cx="31" cy="14" r="2.2" fill="#fff"/>' +
            '<ellipse cx="84" cy="36" rx="9" ry="11" fill="#a0612b"/><path d="M74 30 Q84 18 94 30Z" fill="#5c3a1e"/>') +
        // micro:bit
        svg('deco-microbit deco-matrice', '0 0 96 96', dessinMatrice()) +
        svg('deco-microbit deco-circuit-haut', '0 0 320 190',
            '<g fill="none" stroke-width="2"><path class="deco-piste" d="M320 150 H250 V176 H190" stroke="#00c853"/>' +
            '<path class="deco-piste" d="M210 0 V30 H150 V90" stroke="#4dabf7" style="animation-delay:-1.5s"/></g>' +
            '<circle class="deco-lueur" cx="190" cy="176" r="4" fill="#00c853"/><circle class="deco-lueur-2" cx="150" cy="90" r="4" fill="#4dabf7"/>') +
        svg('deco-microbit deco-circuit-bas', '0 0 260 120',
            '<g fill="none" stroke-width="2"><path class="deco-piste" d="M0 110 H60 V70 H130" stroke="#00c853"/>' +
            '<path class="deco-piste" d="M0 30 H40 V50 H90" stroke="#4dabf7" style="animation-delay:-1s"/></g>' +
            '<circle class="deco-lueur-2" cx="130" cy="70" r="4" fill="#00c853"/><circle class="deco-lueur" cx="90" cy="50" r="4" fill="#4dabf7"/>') +
        svg('deco-microbit deco-connecteur', '0 0 240 36', '<rect x="0" y="0" width="240" height="36" fill="#1d2a3a"/><g fill="#e6b800">' +
            [[8, 22], [38, 6], [50, 6], [64, 22], [94, 6], [106, 6], [120, 22], [150, 6], [162, 6], [176, 22], [206, 6], [218, 6]]
                .map(([x, l]) => '<rect x="' + x + '" y="8" width="' + l + '" height="28"/>').join('') + '</g>') +
        // Meteo : chaque element porte les ambiances ou il apparait (m-<ambiance>)
        svg('deco-meteo m-soleil deco-soleil', '0 0 76 76', soleil()) +
        svg('deco-meteo m-nuit deco-lune', '0 0 56 56', '<path d="M30 4 A24 24 0 1 0 52 34 A18 18 0 1 1 30 4Z" fill="#fff3bf"/>') +
        '<svg class="deco-meteo m-nuit deco-etoiles" aria-hidden="true">' +
            [[8, 12], [22, 30], [35, 8], [48, 22], [62, 14], [74, 34], [86, 10], [15, 52], [56, 44], [92, 48]]
                .map(([x, y], n) => '<circle class="' + (n % 2 ? 'deco-lueur' : 'deco-lueur-2') + '" cx="' + x + '%" cy="' + y + '%" r="' + (1 + (n % 3) * 0.5) + '" fill="#fff"/>').join('') +
            '</svg>' +
        svg('deco-meteo m-nuages m-pluie m-orage m-neige m-brouillard deco-nuages', '0 0 300 90',
            nuage(170, 6, 1.6, '#868e96') + nuage(60, 30, 1.1, '#5c6670') + nuage(0, 0, 0.8, '#6c7680')) +
        '<div class="deco-meteo m-pluie m-orage deco-pluie"></div>' +
        svg('deco-meteo m-orage deco-eclair', '0 0 40 70', '<path d="M24 0 L6 38 H20 L10 70 L36 28 H22 L32 0Z" fill="#ffd43b"/>') +
        '<div class="deco-meteo m-neige deco-neige"></div><div class="deco-meteo m-neige deco-neige deco-neige-2"></div>' +
        '<div class="deco-meteo m-brouillard deco-brume"></div>' +
        '<div class="deco-noel deco-neige"></div><div class="deco-noel deco-neige deco-neige-2"></div><div class="deco-noel deco-neige deco-neige-3"></div>' +
        '<svg class="deco-noel deco-collines" viewBox="0 0 1000 70" preserveAspectRatio="none" aria-hidden="true">' +
            '<path d="M0 70 L0 40 Q120 10 260 34 T520 30 T780 26 T1000 32 L1000 70Z" fill="#dde9f5"/>' +
            '<path d="M0 70 L0 56 Q200 32 420 50 T1000 46 L1000 70Z" fill="#f5f9fd"/></svg>' +
        svg('deco-noel deco-sapins', '0 0 150 70', sapin(10, 26, 1.4) + sapin(62, 14, 1.9) + sapin(118, 32, 1.2)) +
        svg('deco-noel deco-etoile', '0 0 34 34', '<path class="deco-lueur" d="M17 1 L21 12 L33 12 L23.5 19 L27 31 L17 24 L7 31 L10.5 19 L1 12 L13 12Z" fill="#ffd43b"/>') +
        svg('deco-salon deco-circuit-haut', '0 0 320 190',
            '<g fill="none" stroke-width="2"><path class="deco-piste" d="M320 120 H250 V160 H190" stroke="#2bb3a0"/>' +
            '<path class="deco-piste" d="M320 176 H280 V140" stroke="#7b5cff" style="animation-delay:-1s"/>' +
            '<path class="deco-piste" d="M200 0 V40 H150 V90" stroke="#e0218a" style="animation-delay:-2s"/></g>' +
            '<g><circle class="deco-lueur" cx="190" cy="160" r="4" fill="#2bb3a0"/><circle class="deco-lueur-2" cx="280" cy="140" r="4" fill="#7b5cff"/>' +
            '<circle class="deco-lueur" cx="150" cy="90" r="4" fill="#e0218a"/></g>') +
        svg('deco-salon deco-circuit-bas', '0 0 260 120',
            '<g fill="none" stroke-width="2"><path class="deco-piste" d="M0 110 H60 V70 H130" stroke="#e0218a"/>' +
            '<path class="deco-piste" d="M0 30 H40 V50 H90" stroke="#2bb3a0" style="animation-delay:-1.5s"/></g>' +
            '<circle class="deco-lueur-2" cx="130" cy="70" r="4" fill="#e0218a"/><circle class="deco-lueur" cx="90" cy="50" r="4" fill="#2bb3a0"/>') +
        '<div class="deco-salon deco-badge-salon">' + SALON.titre + ' · ' + SALON.dates +
            '<b>Technologie Services</b><span class="stand">Stand ' + SALON.stand + '</span></div>' +
        '<div class="deco-salon deco-banniere-salon"><span>' +
            ('Programmez votre micro:bit : essayez ! · Technologie Services · Stand ' + SALON.stand + ' · ' + SALON.titre + ' · ').repeat(4) +
            '</span></div>';
    $('blockly-wrapper').appendChild(deco);
}
if ($('toolbar') && !$('guirlande-saison')) {
    const guirlande = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    guirlande.id = 'guirlande-saison';
    guirlande.setAttribute('aria-hidden', 'true');
    guirlande.setAttribute('height', '26');
    guirlande.innerHTML = dessinGuirlande();
    $('toolbar').appendChild(guirlande);
}
// ---------- Multi-editeur radio (multi.html) ----------
// Fichier > Multi-editeur radio ouvre deux editeurs cote a cote dans un nouvel onglet (le travail en cours reste ici).
// Dans chacun d'eux (?editeur=1 ou 2), une pastille « Carte 1 / Carte 2 » suit le logo et l'entree du menu disparait.
if ($('multi-editeur-btn')) {
    if (racine.dataset.editeur) $('multi-editeur-btn').hidden = true;
    else $('multi-editeur-btn').addEventListener('click', () => { window.open('multi.html', '_blank', 'noopener'); });
}
// Bouton « Radio » du bandeau (a droite de IA) : meme effet que l'entree du menu Fichier, cache dans le multi-editeur.
if ($('btn-radio-multi')) {
    if (racine.dataset.editeur || !$('multi-editeur-btn')) $('btn-radio-multi').hidden = true;
    else $('btn-radio-multi').addEventListener('click', () => $('multi-editeur-btn').click());
}
// Proposition du multi-editeur : quand l'eleve glisse un bloc Radio (types radio_*) dans la zone de programmation,
// un bandeau (#proposition-radio) propose d'ouvrir le multi-editeur. Seul le glisser declenche (evenement 'drag' de
// fin) : charger un fichier, un exercice ou un exemple ne glisse rien. Une seule fois par onglet (sessionStorage) ;
// « Ne plus proposer » est memorise dans le navigateur (localStorage). Jamais dans le multi-editeur lui-meme.
const CLE_RADIO_VUE = 'propositionRadioVue', CLE_RADIO_JAMAIS = 'propositionRadioJamais';
function lireStockage(stockage, cle) { try { return stockage.getItem(cle); } catch (erreur) { return null; } }
function ecrireStockage(stockage, cle) { try { stockage.setItem(cle, '1'); } catch (erreur) { /* navigation privee */ } }
function installerPropositionRadio() {
    const bandeau = $('proposition-radio'), ws = window.workspace, reactiver = $('proposition-radio-reactiver');
    if (reactiver && (racine.dataset.editeur || !$('multi-editeur-btn'))) reactiver.hidden = true;
    if (!bandeau || !ws || racine.dataset.editeur || !$('multi-editeur-btn')) return;
    const fermer = () => { bandeau.hidden = true; };
    // Bandeau et confirmation : centres sur l'espace de programmation, a droite de la colonne de categories
    // (qui les recouvrirait sinon).
    const placer = el => {
        const boite = ws.getToolbox && ws.getToolbox();
        const colonne = boite && boite.getWidth ? boite.getWidth() : 0;
        el.style.left = 'calc(' + colonne + 'px + (100% - ' + colonne + 'px) / 2)';
        el.style.maxWidth = 'calc(100% - ' + (colonne + 24) + 'px)';
    };
    // Menu Aide > Reactiver : annule « Ne plus proposer » (et le « deja propose » de l'onglet), grisee sinon.
    const majReactiver = () => { if (reactiver) reactiver.disabled = !lireStockage(localStorage, CLE_RADIO_JAMAIS); };
    majReactiver();
    if (reactiver) reactiver.addEventListener('click', () => {
        try { localStorage.removeItem(CLE_RADIO_JAMAIS); sessionStorage.removeItem(CLE_RADIO_VUE); } catch (erreur) { /* navigation privee */ }
        majReactiver();
        const info = $('proposition-radio-info');
        if (info) { placer(info); info.hidden = false; clearTimeout(info.minuteur); info.minuteur = setTimeout(() => { info.hidden = true; }, 3500); }
    });
    $('proposition-radio-ouvrir').addEventListener('click', () => { fermer(); $('multi-editeur-btn').click(); });
    $('proposition-radio-plus-tard').addEventListener('click', fermer);
    $('proposition-radio-jamais').addEventListener('click', () => { ecrireStockage(localStorage, CLE_RADIO_JAMAIS); fermer(); majReactiver(); });
    ws.addChangeListener(ev => {
        if (ev.type !== Blockly.Events.BLOCK_DRAG || ev.isStart) return;
        if (lireStockage(sessionStorage, CLE_RADIO_VUE) || lireStockage(localStorage, CLE_RADIO_JAMAIS)) return;
        const bloc = ws.getBlockById(ev.blockId);   // absent si le bloc a fini a la corbeille
        if (!bloc || !bloc.getDescendants(false).some(b => b.type.startsWith('radio_'))) return;
        ecrireStockage(sessionStorage, CLE_RADIO_VUE);
        placer(bandeau);
        bandeau.hidden = false;
    });
}
if (window.workspace) installerPropositionRadio();
else window.addEventListener('load', installerPropositionRadio);
if (racine.dataset.editeur && $('tb-logo')) {
    const pastille = document.createElement('span');
    pastille.id = 'tb-carte';
    pastille.textContent = 'Carte ' + racine.dataset.editeur;
    pastille.title = 'Multi-éditeur radio : carte simulée n° ' + racine.dataset.editeur;
    $('tb-logo').after(pastille);
}

// Repere de saison du bandeau : la meme icone SVG au trait que le menu Affichage (pas d'emoji, comme la version Arduino R4).
function majRepereSaison() {
    const repere = $('tb-saison');
    if (!repere) return;
    const bouton = racine.dataset.saison && $('aff-saison-' + racine.dataset.saison);
    const icone = bouton && bouton.querySelector('svg');
    repere.innerHTML = '';
    if (icone) {
        const copie = icone.cloneNode(true);
        copie.setAttribute('width', '20');
        copie.setAttribute('height', '20');
        repere.appendChild(copie);
    }
}

function majCoches() {
    const bascule = (id, vrai) => { const b = $(id); if (b) b.classList.toggle('choisi', !!vrai); };
    bascule('aff-theme-clair', themeClair());
    bascule('aff-theme-sombre', !themeClair());
    bascule('aff-contraste-normal', !contrasteEleve());
    bascule('aff-contraste-eleve', contrasteEleve());
    const saison = choixSaison();
    SAISONS.forEach(choix => bascule('aff-saison-' + choix, saison === choix));
    majRepereSaison();
}
if ($('aff-theme-clair')) $('aff-theme-clair').addEventListener('click', () => { quitterSaison(); choisirTheme(true); });
if ($('aff-theme-sombre')) $('aff-theme-sombre').addEventListener('click', () => choisirTheme(false));
if ($('aff-contraste-normal')) $('aff-contraste-normal').addEventListener('click', () => choisirContraste(false));
if ($('aff-contraste-eleve')) $('aff-contraste-eleve').addEventListener('click', () => { quitterSaison(); choisirContraste(true); });
new MutationObserver(majCoches).observe(racine, { attributes: true, attributeFilter: ['data-theme', 'data-contrast', 'data-saison'] });
majCoches();

// ---------- Theme Meteo (nov. 2026) ----------
// Le decor suit le temps qu'il fait autour de l'eleve. La position est demandee au navigateur (sa propre fenetre
// d'autorisation), arrondie a 0,1 degre (environ 10 km) et envoyee seulement a Open-Meteo (gratuit, sans cle ni
// compte), toutes les 30 minutes tant que le theme est affiche. Elle n'est jamais enregistree : seul le dernier releve
// (ambiance, temperature, heure) l'est, dans meteoReleve. Une fenetre explique tout cela avant la premiere demande
// (accord retenu dans meteoAccord). Sans autorisation ni connexion : dernier releve de moins de 3 h, sinon ambiance
// neutre et « Météo indisponible ». Jamais choisi par « Selon la date ».
const trM = (texte, vars) => (typeof window.tr === 'function' ? window.tr(texte, vars) : texte);
const CLE_METEO_ACCORD = 'meteoAccord', CLE_METEO_RELEVE = 'meteoReleve';
const METEO_PERIODE = 30 * 60e3, METEO_VALIDITE = 3 * 3600e3;
const CIELS = { soleil: 'Ensoleillé', nuit: 'Ciel dégagé', nuages: 'Nuageux', pluie: 'Pluie', orage: 'Orage', neige: 'Neige', brouillard: 'Brouillard' };
const accordMeteo = () => lireStockage(localStorage, CLE_METEO_ACCORD) === '1';
function cielDeCode(code, jour) {   // codes meteo OMM (WMO) renvoyes par Open-Meteo
    if (code <= 1) return jour ? 'soleil' : 'nuit';
    if (code <= 3) return 'nuages';
    if (code === 45 || code === 48) return 'brouillard';
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'neige';
    if (code >= 95) return 'orage';
    return 'pluie';   // bruine, pluie, pluie verglacante, averses (51 a 67, 80 a 82)
}
function lireReleve() {
    try { const r = JSON.parse(localStorage.getItem(CLE_METEO_RELEVE) || 'null'); return r && CIELS[r.ciel] ? r : null; }
    catch (erreur) { return null; }
}
let repereMeteo = null;
if ($('tb-saison') && !$('tb-meteo')) {
    repereMeteo = document.createElement('span');
    repereMeteo.id = 'tb-meteo';
    repereMeteo.setAttribute('role', 'status');
    $('tb-saison').after(repereMeteo);
}
function afficherMeteo(releve) {
    const frais = releve && Date.now() - releve.quand < METEO_VALIDITE;
    racine.dataset.meteo = frais ? releve.ciel : 'indispo';
    if (!repereMeteo) return;
    repereMeteo.textContent = frais ? Math.round(releve.temp) + ' °C · ' + trM(CIELS[releve.ciel]) : trM('Météo indisponible');
    repereMeteo.title = frais
        ? trM('Météo locale relevée à {heure} (Open-Meteo)', { heure: new Date(releve.quand).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })
        : trM('Position refusée ou pas de connexion : le décor reste neutre.');
}
function releverMeteo() {
    if (!navigator.geolocation) { afficherMeteo(lireReleve()); return; }
    navigator.geolocation.getCurrentPosition(pos => {
        const lat = pos.coords.latitude.toFixed(1), lon = pos.coords.longitude.toFixed(1);   // environ 10 km
        fetch('https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon +
              '&current=temperature_2m,weather_code,is_day&timezone=auto', { cache: 'no-store' })
            .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
            .then(d => {
                const c = d.current;
                const releve = { quand: Date.now(), temp: c.temperature_2m, ciel: cielDeCode(c.weather_code, c.is_day === 1) };
                try { localStorage.setItem(CLE_METEO_RELEVE, JSON.stringify(releve)); } catch (erreur) { /* navigation privee */ }
                if (racine.dataset.saison === 'meteo') afficherMeteo(releve);
            })
            .catch(() => { if (racine.dataset.saison === 'meteo') afficherMeteo(lireReleve()); });
    }, () => { if (racine.dataset.saison === 'meteo') afficherMeteo(lireReleve()); },
    { maximumAge: METEO_PERIODE, timeout: 20000 });
}
let minuteurMeteo = null;
function suivreMeteo() {   // demarre ou arrete le suivi selon le theme affiche
    clearInterval(minuteurMeteo); minuteurMeteo = null;
    if (racine.dataset.saison !== 'meteo') { delete racine.dataset.meteo; return; }
    const releve = lireReleve();
    afficherMeteo(releve);
    if (!releve || Date.now() - releve.quand >= METEO_PERIODE) releverMeteo();
    minuteurMeteo = setInterval(releverMeteo, METEO_PERIODE);
}
function demanderAccordMeteo() {
    let fenetre = $('meteo-accord');
    if (!fenetre) {
        fenetre = document.createElement('div');
        fenetre.id = 'meteo-accord';
        fenetre.innerHTML = '<div class="boite" role="dialog" aria-modal="true" aria-labelledby="meteo-accord-titre">' +
            '<h2 id="meteo-accord-titre">Thème Météo</h2>' +
            '<p>Ce thème adapte le décor au temps qu\'il fait autour de vous. Le navigateur va vous demander votre position.</p>' +
            '<p>Votre position est arrondie à environ 10 km. Elle est envoyée seulement au service météo Open-Meteo, toutes ' +
            'les 30 minutes tant que le thème est affiché, et n\'est pas enregistrée.</p>' +
            '<div class="actions"><button type="button" id="meteo-accord-non">Annuler</button>' +
            '<button type="button" class="principal" id="meteo-accord-oui">Autoriser la météo</button></div></div>';
        document.body.appendChild(fenetre);
        const fermer = () => { fenetre.hidden = true; };
        $('meteo-accord-non').addEventListener('click', fermer);
        $('meteo-accord-oui').addEventListener('click', () => {
            fermer();
            ecrireStockage(localStorage, CLE_METEO_ACCORD);
            appliquerSaison('meteo');
        });
        fenetre.addEventListener('click', ev => { if (ev.target === fenetre) fermer(); });
        fenetre.addEventListener('keydown', ev => { if (ev.key === 'Escape') fermer(); });
    }
    fenetre.hidden = false;
    $('meteo-accord-oui').focus();
}
suivreMeteo();

// ---------- Libelles Afficher / Masquer (l'etat « ferme » = classe .inactif, posee par le code existant) ----------
function suivreBascule(idBouton, idLibelle, quandOuvert, quandFerme) {
    const bouton = $(idBouton), libelle = $(idLibelle);
    if (!bouton || !libelle) return;
    // aria-pressed : etat du panneau pour les lecteurs d'ecran, utile quand le libelle ne change pas (Console, Simulation)
    const maj = () => {
        const ouvert = !bouton.classList.contains('inactif');
        libelle.textContent = ouvert ? quandOuvert : quandFerme;
        bouton.setAttribute('aria-pressed', String(ouvert));
    };
    new MutationObserver(maj).observe(bouton, { attributes: true, attributeFilter: ['class'] });
    maj();
}
// Libelles fixes « Console », « Simulation » et « Code » (demandes de l'utilisateur, nov. 2026) : l'etat ouvert se voit au
// soulignement du bouton (classe inactif absente).
suivreBascule('btn-vue-console', 'lib-console', 'Console', 'Console');
suivreBascule('btn-vue-simu', 'lib-simulation', 'Simulation', 'Simulation');
suivreBascule('btn-vue-code', 'lib-code', 'Code', 'Code');

// ---------- Voyant de connexion de la carte (bouton Console) ----------
// Le bouton « Moniteur serie » du modele est fusionne dans « Console » : la console EST le moniteur.
// Le bouton « Console » affiche / masque le panneau ; la connexion se fait avec « Connecter » dans la
// console (#btn-console-carte, code existant). Le voyant reflete l'etat de ce bouton (classe .connecte).
const boutonCarte = $('btn-console-carte');
const voyant = $('voyant-carte');
if (boutonCarte && voyant) {
    const majVoyant = () => {
        const connecte = boutonCarte.classList.contains('connecte');
        voyant.classList.toggle('connecte', connecte);
        const texte = connecte ? 'Carte connectée' : 'Carte non connectée';
        voyant.title = texte;
        voyant.setAttribute('aria-label', texte);
    };
    new MutationObserver(majVoyant).observe(boutonCarte, { attributes: true, attributeFilter: ['class'] });
    majVoyant();
}

// ---------- Lancer la simulation / Arreter ----------
// Lancer = #run-sim ; Arreter = #btn-reset (« Reinitialiser la simulation », qui arrete le programme).
const lancer = $('tb-lancer');
if (lancer) {
    lancer.addEventListener('click', () => {
        const cible = window.simuEnCours === true ? $('btn-reset') : $('run-sim');
        if (cible) cible.click();
    });
    let enCours = null;
    setInterval(() => {
        const maintenant = window.simuEnCours === true;
        if (maintenant === enCours) return;
        enCours = maintenant;
        lancer.classList.toggle('running', maintenant);
        if ($('tb-lancer-label')) $('tb-lancer-label').textContent = maintenant ? 'Arrêter' : 'Lancer la simulation';
        const icone = $('tb-lancer-icone');
        if (icone) icone.innerHTML = maintenant ? '<rect x="5" y="5" width="14" height="14" rx="1"/>' : '<polygon points="5,3 19,12 5,21"/>';
    }, 250);
}

// ---------- Selecteur de carte (menu + « rechercher les cartes ») ----------
// Web Serial memorise les cartes deja autorisees (navigator.serial.getPorts). Le menu les liste ; ⟳ ouvre la
// fenetre de choix du navigateur pour en autoriser une nouvelle (requestPort). Le bouton « Connecter » de la
// console (code existant, un.js) appelle navigator.serial.requestPort a chaque clic : on y intercale un relais
// qui renvoie directement la carte choisie dans le menu, sans rouvrir la fenetre. Sans carte choisie, ou si le
// relais ne s'applique pas, la fenetre de choix habituelle s'ouvre (comportement d'origine).
// Le choix ne concerne que la connexion serie : « Televerser » garde son propre choix de lecteur MICROBIT.
const VENDEUR_MICROBIT = 0x0D28;
const USB_BANDEAU_ACTIF = () => 'usb' in navigator && !!window.MicrobitConnexion;
const choix = $('port-select'), rechercher = $('port-refresh');
let serialActif = null;           // objet navigator.serial utilise (parametrable pour les tests)
let cartes = [];                  // ports connus (SerialPort), dans l'ordre du menu
let appelInterne = false;         // vrai pendant NOTRE appel a requestPort (ne pas le detourner)
const dejaEnveloppe = new WeakSet();

const estMicrobit = port => { try { return port.getInfo().usbVendorId === VENDEUR_MICROBIT; } catch (e) { return false; } };
const carteChoisie = () => { const i = choix ? parseInt(choix.value, 10) : NaN; return Number.isInteger(i) ? cartes[i] || null : null; };

function remplirCartes(aSelectionner) {
    if (!choix) return;
    const ancienne = aSelectionner || carteChoisie();
    choix.textContent = '';
    if (!cartes.length) {
        const o = document.createElement('option'); o.value = ''; o.textContent = 'micro:bit'; choix.appendChild(o);
        choix.title = 'Aucune carte autorisée : cliquez ⟳ ou « Connecter » dans la console pour en choisir une';
        return;
    }
    cartes.forEach((port, i) => {
        const o = document.createElement('option');
        o.value = String(i); o.textContent = cartes.length > 1 ? 'micro:bit ' + (i + 1) : 'micro:bit';
        choix.appendChild(o);
    });
    const idx = ancienne ? cartes.indexOf(ancienne) : -1;
    choix.value = String(idx >= 0 ? idx : 0);
    choix.title = 'Carte à connecter (appliqué au prochain « Connecter ») — ' + cartes.length + ' carte(s) autorisée(s)';
}

async function chargerCartes(aSelectionner) {
    if (!serialActif) return;
    try { cartes = (await serialActif.getPorts()).filter(estMicrobit); } catch (e) { cartes = []; }
    remplirCartes(aSelectionner);
}

function demarrerCartes(serial) {
    serialActif = serial || null;
    if (!choix || !rechercher) return;
    if (!serialActif) {
        choix.disabled = true; rechercher.disabled = true;
        $('port-group').title = 'Cartes micro:bit : demande Chrome ou Edge (Web Serial)';
        return;
    }
    choix.disabled = false; rechercher.disabled = false;
    if (!dejaEnveloppe.has(serialActif)) {
        dejaEnveloppe.add(serialActif);
        const origine = serialActif.requestPort.bind(serialActif);
        serialActif.requestPort = async function (options) {
            if (!appelInterne) {
                const deja = carteChoisie();
                if (deja) return deja;                                   // carte choisie dans le menu : pas de fenetre
            }
            const port = await origine(options);                          // fenetre de choix du navigateur
            if (!appelInterne && estMicrobit(port)) chargerCartes(port); // la carte autorisee apparait dans le menu
            return port;
        };
        serialActif.addEventListener('connect', () => chargerCartes());
        serialActif.addEventListener('disconnect', () => chargerCartes());
    }
    chargerCartes();
}

if (rechercher) {
    rechercher.addEventListener('click', async () => {
        if (USB_BANDEAU_ACTIF() || !serialActif || rechercher.classList.contains('occupe')) return;
        rechercher.classList.add('occupe');
        appelInterne = true;
        try {
            const port = await serialActif.requestPort({ filters: [{ usbVendorId: VENDEUR_MICROBIT }] });
            await chargerCartes(port);
        } catch (e) {
            /* fenetre fermee sans choix (NotFoundError) : rien a faire */
        } finally {
            appelInterne = false;
            rechercher.classList.remove('occupe');
        }
    });
}
// Par WebUSB (nov. 2026, voir un.js « Vraie carte par WebUSB ») : le menu liste les micro:bit deja autorisees
// (navigator.usb.getDevices) et se termine par « + Ajouter une carte… », qui ouvre la fenetre d'autorisation du
// navigateur (requestDevice), comme ⟳. La connexion (« Connecter » ou « Televerser ») prend une carte autorisee
// branchee : avec plusieurs cartes autorisees branchees en meme temps, mieux vaut n'en brancher qu'une.
const USB_BANDEAU = 'usb' in navigator && !!window.MicrobitConnexion;
let cartesUSB = [];
async function chargerCartesUSB() {
    if (!choix) return;
    try { cartesUSB = (await navigator.usb.getDevices()).filter(d => d.vendorId === VENDEUR_MICROBIT); } catch (e) { cartesUSB = []; }
    choix.textContent = '';
    const option = (valeur, texte) => { const o = document.createElement('option'); o.value = valeur; o.textContent = texte; choix.appendChild(o); };
    if (!cartesUSB.length) option('', 'micro:bit');
    cartesUSB.forEach((d, i) => option(String(i), cartesUSB.length > 1 ? 'micro:bit ' + (i + 1) : 'micro:bit'));
    option('ajouter', '＋ ' + (window.tr ? window.tr('Ajouter une carte…') : 'Ajouter une carte…'));
    choix.value = cartesUSB.length ? '0' : '';
    choix.title = cartesUSB.length
        ? (window.tr ? window.tr('Carte micro:bit autorisée ({n}) : « Connecter » ou « Téléverser » l\'utilise', { n: cartesUSB.length })
                     : 'Carte micro:bit autorisée')
        : (window.tr ? window.tr('Aucune carte autorisée : choisissez « Ajouter une carte… »') : 'Aucune carte autorisée');
}
async function ajouterCarteUSB() {
    try { await navigator.usb.requestDevice({ filters: [{ vendorId: VENDEUR_MICROBIT }] }); } catch (e) { /* fenetre fermee sans choix */ }
    await chargerCartesUSB();
}
if (USB_BANDEAU) {
    if (choix) {
        choix.disabled = false;
        choix.addEventListener('change', () => { if (choix.value === 'ajouter') ajouterCarteUSB(); });
    }
    if (rechercher) {
        rechercher.disabled = false;
        rechercher.title = window.tr ? window.tr('Ajouter une carte : autoriser une nouvelle micro:bit branchée en USB') : 'Ajouter une carte';
        rechercher.addEventListener('click', ajouterCarteUSB);
    }
    const groupe = $('port-group');
    if (groupe) groupe.title = window.tr ? window.tr('Carte micro:bit utilisée par « Connecter » et « Téléverser » (Chrome ou Edge)') : '';
    navigator.usb.addEventListener('connect', () => chargerCartesUSB());
    navigator.usb.addEventListener('disconnect', () => chargerCartesUSB());
    window.addEventListener('easybloc-carte', () => chargerCartesUSB());
    chargerCartesUSB();
} else {
    demarrerCartes('serial' in navigator ? navigator.serial : null);
}
window.bandeauTest = { demarrerCartes, chargerCartes, cartes: () => cartes, chargerCartesUSB, cartesUSB: () => cartesUSB };

// ---------- Puces rondes de la colonne de categories ----------
// Blockly colore chaque categorie par la bordure gauche de sa ligne (rectangle). On recopie cette couleur dans
// --puce (variable CSS) pour dessiner une puce ronde a la place ; la bordure est supprimee par le CSS (index.html).
// La puce a EXACTEMENT la couleur des blocs de sa categorie (table PALETTE_CATEGORIES, un.js) ; une sous-categorie
// prend la couleur de sa categorie principale.
function colorerPuces() {
    document.querySelectorAll('.blocklyToolboxCategory .blocklyTreeRow').forEach(ligne => {
        // Colonne de 160 px : « Entrees/Sorties » passe a la ligne apres la barre oblique, pas au milieu d'un mot.
        const nom = ligne.querySelector('.blocklyTreeLabel');
        if (nom && nom.textContent.includes('/') && !nom.textContent.includes('/​')) nom.textContent = nom.textContent.replace(/\//g, '/​');
        const base = getComputedStyle(ligne).borderLeftColor;
        if (!base || ligne.dataset.puceBase === base) return;
        ligne.dataset.puceBase = base;
        ligne.style.setProperty('--puce', base);
    });
}
colorerPuces();
const boiteOutils = document.querySelector('.blocklyToolboxDiv');
if (boiteOutils) {
    // La boite a outils est reconstruite (panneau administrateur, changement de langue...) : on recolore.
    new MutationObserver(colorerPuces).observe(boiteOutils, { childList: true, subtree: true });
}
// Categorie parente (Radio, Grove, Cartes d'extension, Robots) d'une sous-categorie ouverte : classe contient-actif
// (lisere et texte blanc, voir index.html), comme la version Arduino R4.
function marquerParentActif() {
    document.querySelectorAll('.blocklyTreeRow.contient-actif').forEach(l => l.classList.remove('contient-actif'));
    const boite = window.workspace && window.workspace.getToolbox && window.workspace.getToolbox();
    const choix = boite && boite.getSelectedItem && boite.getSelectedItem();
    const parent = choix && choix.getParent && choix.getParent();
    const ligne = parent && parent.getDiv && parent.getDiv() && parent.getDiv().querySelector('.blocklyTreeRow');
    if (ligne) ligne.classList.add('contient-actif');
}
if (window.workspace && window.Blockly) {
    window.workspace.addChangeListener(e => { if (e.type === Blockly.Events.TOOLBOX_ITEM_SELECT) marquerParentActif(); });
}

// ---------- Recherche de blocs (au-dessus de la premiere categorie) ----------
// Zone de saisie placee en haut de la colonne de categories. Elle cherche dans TOUS les blocs de la boite a outils
// d'origine (toutes categories, sous-categories comprises) et affiche les resultats dans le tiroir, comme une
// categorie : les blocs se prennent et se deposent normalement. Le texte cherche = ce qui s'affiche sur le bloc
// (« attendre ... secondes »), le nom de sa categorie et, en second rang, son texte d'aide.
// Variables et Fonctions (tiroirs generes a la volee) sont interroges a chaque recherche (voir blocsDynamiques).
const normaliser = t => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
let indexBlocs = null;                 // [{ def, texte, aide, categorie }]

function parcourirBoite(contenus, chemin, sortie) {
    for (const e of contenus || []) {
        if (e.kind === 'category') parcourirBoite(e.contents, chemin.concat(e.name), sortie);
        else if (e.kind === 'block' && e.type) sortie.push({ def: e, chemin });
    }
}

function construireIndex() {
    const ws = window.workspace;
    const arbre = ws && ws.options && ws.options.languageTree;
    const brut = [];
    if (arbre) parcourirBoite(arbre.contents, [], brut);
    const aides = (window.aideBlocTest && window.aideBlocTest.AIDE_BLOCS) || {};
    const scratch = new Blockly.Workspace();
    const resultat = [];
    for (const { def, chemin } of brut) {
        let texte = '';
        try {
            const b = Blockly.serialization.blocks.append(def, scratch);
            texte = b.toString(200, '?');
            b.dispose(false);
        } catch (erreur) { texte = def.type; }
        const noms = chemin.map(c => c === 'Communication' ? 'Radio' : c);
        resultat.push({ def, texte: normaliser(texte + ' ' + def.type.replace(/_/g, ' ')), aide: normaliser(aides[def.type] || ''),
            categorie: normaliser(noms.join(' ')), titre: noms.join(' · ') });   // titre des resultats : « Grove · LED »
    }
    scratch.dispose();
    return resultat;
}

// Variables et Fonctions : tiroirs generes par Blockly a la volee (selon les variables et fonctions creees). On interroge
// les memes generateurs que la boite a outils a chaque recherche, pour que le bouton « Creer une variable… », les blocs
// de variables et les appels des fonctions deja definies soient trouvables.
// Mots que l'on pense a taper pour ces blocs mais qui ne figurent pas dans leur libelle francais (« definir x a », « incrementer »...).
const SYNONYMES_DYNAMIQUES = {
    variables_set: 'mettre definir affecter donner valeur variable',
    variables_get: 'variable valeur lire utiliser',
    math_change: 'changer ajouter augmenter incrementer variable',
    procedures_defnoreturn: 'creer definir nouvelle fonction procedure',
    procedures_defreturn: 'creer definir nouvelle fonction retour resultat renvoyer',
    procedures_ifreturn: 'retourner renvoyer si fonction',
    procedures_callnoreturn: 'appeler appel executer lancer fonction procedure',
    procedures_callreturn: 'appeler appel utiliser resultat fonction procedure',
};
function blocsDynamiques() {
    const ws = window.workspace;
    const liste = [];
    const ajouter = (generateur, categorie) => {
        let defs = [];
        try { defs = Blockly.utils.toolbox.convertFlyoutDefToJsonArray(generateur(ws)); } catch (erreur) { return; }
        const scratch = new Blockly.Workspace();
        try { ws.getAllVariables().forEach(v => scratch.createVariable(v.name, v.type, v.getId())); } catch (erreur) { /* variables absentes : texte de repli */ }
        for (const def of defs) {
            let texte = '';
            if (String(def.kind).toUpperCase() === 'BUTTON') {
                texte = String(def.text || '').replace(/%\{BKY_(\w+)\}/g, (m, cle) => (Blockly.Msg && Blockly.Msg[cle]) || '');   // %{BKY_NEW_VARIABLE} -> « Creer une variable… »
            } else {
                try {
                    const b = Blockly.Xml.domToBlock(def.blockxml, scratch);
                    texte = b.toString(200, '?');
                    b.dispose(false);
                } catch (erreur) { texte = ''; }
            }
            const synonymes = SYNONYMES_DYNAMIQUES[def.type] || (String(def.kind).toUpperCase() === 'BUTTON' ? 'nouvelle variable ajouter' : '');
            liste.push({ def, texte: normaliser(texte + ' ' + synonymes + ' ' + String(def.type || '').replace(/_/g, ' ')), aide: '', categorie: normaliser(categorie), titre: categorie });
        }
        scratch.dispose();
    };
    ajouter(Blockly.Variables.flyoutCategory, 'Variables');
    ajouter(Blockly.Procedures.flyoutCategory, 'Fonctions');
    return liste;
}

function chercherEntrees(requete) {
    const mots = normaliser(requete).split(/\s+/).filter(Boolean);
    if (!mots.length) return [];
    if (!indexBlocs) indexBlocs = construireIndex();
    const premier = [], second = [];
    for (const e of indexBlocs.concat(blocsDynamiques())) {
        const base = e.texte + ' ' + e.categorie;
        if (mots.every(m => base.includes(m))) premier.push(e);
        else if (e.aide && mots.every(m => (base + ' ' + e.aide).includes(m))) second.push(e);
    }
    return premier.concat(second).slice(0, 40);
}
function chercherBlocs(requete) { return chercherEntrees(requete).map(e => e.def); }

// Contenu du tiroir de resultats, comme la version Arduino R4 : un petit titre par categorie (« Grove · LED »), ses
// blocs, puis un espace. Les categories gardent l'ordre de la colonne ; dans chacune, les blocs trouves par leur
// libelle passent avant ceux trouves par leur texte d'aide.
function contenuRecherche(requete) {
    const groupes = new Map();
    for (const e of chercherEntrees(requete)) {
        if (!groupes.has(e.titre)) groupes.set(e.titre, []);
        groupes.get(e.titre).push(e);
    }
    const rang = new Map();   // rang de chaque categorie dans la colonne (Variables et Fonctions, hors index : a la fin)
    (indexBlocs || []).forEach((e, i) => { if (!rang.has(e.titre)) rang.set(e.titre, i); });
    const titres = [...groupes.keys()].sort((a, b) => (rang.has(a) ? rang.get(a) : 1e6) - (rang.has(b) ? rang.get(b) : 1e6));
    const contenu = [];
    for (const titre of titres) {
        contenu.push({ kind: 'label', text: titre, 'web-class': 'titre-recherche' });
        groupes.get(titre).forEach(e => contenu.push(e.def));
        contenu.push({ kind: 'sep', gap: 28 });
    }
    return contenu;
}

const zoneRecherche = document.createElement('div');
zoneRecherche.id = 'recherche-blocs';
zoneRecherche.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true">' +
    '<circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>' +
    '<input type="search" id="recherche-blocs-champ" placeholder="Rechercher un bloc…" autocomplete="off" spellcheck="false" ' +
    'aria-label="Rechercher un bloc" title="Tapez au moins 2 lettres (« attendre », « LED », « servo »…) : les blocs correspondants s\'affichent">' +
    '<button type="button" id="recherche-blocs-effacer" title="Effacer la recherche" aria-label="Effacer la recherche">✕</button>';
const champRecherche = zoneRecherche.querySelector('input');
const boutonEffacer = zoneRecherche.querySelector('button');

function installerRecherche() {
    const boite = document.querySelector('.blocklyToolboxDiv');
    if (!boite) return;
    if (zoneRecherche.parentElement !== boite) boite.insertBefore(zoneRecherche, boite.firstChild);
}

let minuterieRecherche = null;
function lancerRecherche() {
    const toolbox = window.workspace && window.workspace.getToolbox && window.workspace.getToolbox();
    if (!toolbox) return;
    const tiroir = toolbox.getFlyout && toolbox.getFlyout();
    if (!tiroir) return;
    const requete = champRecherche.value;
    zoneRecherche.classList.toggle('remplie', !!requete);   // affiche la croix d'effacement
    if (requete.trim().length < 2) {             // comme la version Arduino R4 : la recherche commence a 2 lettres
        if (toolbox.clearSelection) toolbox.clearSelection();
        tiroir.autoClose = true;                 // comportement normal des categories
        tiroir.hide();
        return;
    }
    const contenu = contenuRecherche(requete);
    if (toolbox.clearSelection) toolbox.clearSelection();
    tiroir.autoClose = false;                    // le tiroir de resultats RESTE ouvert apres un depot (Echap ou effacer pour le fermer)
    tiroir.show(contenu.length ? contenu : [{ kind: 'label', text: 'Aucun bloc ne correspond à « ' + requete.trim() + ' »' }]);
}
function effacerRecherche() { champRecherche.value = ''; lancerRecherche(); }
champRecherche.addEventListener('input', () => { clearTimeout(minuterieRecherche); minuterieRecherche = setTimeout(lancerRecherche, 150); });
champRecherche.addEventListener('keydown', e => {
    if (e.key === 'Escape') { effacerRecherche(); e.stopPropagation(); }
});
boutonEffacer.addEventListener('click', () => { effacerRecherche(); champRecherche.focus(); });
// Choisir une categorie vide la recherche (le tiroir montre alors cette categorie).
document.addEventListener('click', e => {
    if (e.target.closest && e.target.closest('.blocklyToolboxCategory')) {
        if (champRecherche.value) { champRecherche.value = ''; zoneRecherche.classList.remove('remplie'); }
        const toolbox = window.workspace && window.workspace.getToolbox && window.workspace.getToolbox();
        const tiroir = toolbox && toolbox.getFlyout && toolbox.getFlyout();
        if (tiroir) tiroir.autoClose = true;     // une categorie se referme apres un depot, comme avant
    }
}, true);

installerRecherche();
{
    const boite = document.querySelector('.blocklyToolboxDiv');
    // La boite a outils est reconstruite (panneau administrateur) : la zone de recherche doit rester en tete.
    if (boite) new MutationObserver(installerRecherche).observe(boite, { childList: true });
}
window.bandeauTest = Object.assign(window.bandeauTest || {}, { chercherBlocs, blocsDynamiques, construireIndex: () => (indexBlocs = construireIndex()) });

// ---------- Nom du programme : largeur ajustee au texte, nom complet dans la bulle ----------
// Comme la version Arduino R4 : le cadre suit la longueur du nom (80 a 240 px, voir index.html) ; un nom plus long est
// coupe par « … » et la bulle le montre en entier. Le nom change aussi par programme (chargement d'un fichier, un.js) :
// le setter de .value du champ est enveloppe pour suivre ces changements.
const champNom = $('nom-fichier');
const cadreNom = $('tb-nomfichier');
const TITRE_NOM = cadreNom ? cadreNom.title : '';
function ajusterNom() {
    if (!champNom) return;
    const texte = champNom.value || champNom.placeholder || '';
    const ctx = (ajusterNom.c = ajusterNom.c || document.createElement('canvas')).getContext('2d');
    const style = getComputedStyle(champNom);
    ctx.font = style.fontWeight + ' ' + style.fontSize + ' ' + style.fontFamily;
    champNom.style.width = Math.min(216, Math.max(56, Math.ceil(ctx.measureText(texte).width) + 4)) + 'px';
    if (cadreNom) cadreNom.title = champNom.value ? champNom.value + ' — cliquez pour le renommer.' : TITRE_NOM;
}
if (champNom) {
    const valeur = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    Object.defineProperty(champNom, 'value', {
        configurable: true,
        get() { return valeur.get.call(this); },
        set(v) { valeur.set.call(this, v); ajusterNom(); compacterBientot(); },
    });
    champNom.addEventListener('input', () => { ajusterNom(); compacterBientot(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(ajusterNom);
}

// ---------- Fenetre « Donnez un nom a votre programme » / « Renommer le programme » ----------
// Comme la version Arduino R4 (demanderNomProgramme de blockly-jeulin.html, nov. 2026) : fond grise, titre sur le bandeau
// de couleur, champ, exemple, Valider (et Annuler si annulable). Renvoie une Promise : le nom saisi, ou null si annule.
// annulable = false : l'eleve doit donner un nom (premier bloc pose).
// options (fenetre « Exporter le modele » de l'IA) : { etiquette, exemple } a la place de ceux du nom du programme
function demanderNomProgramme(titre, texte, valeur, annulable, options) {
    return new Promise(resolve => {
        const ancien = $('fenetre-nom-voile');
        if (ancien) ancien.remove();
        const voile = document.createElement('div');
        voile.id = 'fenetre-nom-voile';
        voile.className = 'fen-voile';
        voile.innerHTML = '<div class="fen-boite" role="dialog" aria-modal="true" aria-labelledby="fenetre-nom-titre">'
            + '<h3 class="fen-titre" id="fenetre-nom-titre"></h3><div class="fen-corps"><p></p>'
            + '<input type="text" maxlength="60" autocomplete="off" spellcheck="false" aria-label="Nom du programme">'
            + '<span class="fen-exemple">Par exemple : feu-tricolore-groupe3</span></div>'
            + '<div class="fen-pied">' + (annulable ? '<button type="button" class="fen-btn annuler">Annuler</button>' : '')
            + '<button type="button" class="fen-btn principal">Valider</button></div></div>';
        voile.querySelector('h3').textContent = titre;
        voile.querySelector('p').textContent = texte;
        if (options && options.etiquette) voile.querySelector('input').setAttribute('aria-label', options.etiquette);
        if (options && options.exemple) voile.querySelector('.fen-exemple').textContent = options.exemple;
        const champ = voile.querySelector('input');
        const ok = voile.querySelector('.principal');
        champ.value = valeur || '';
        const majOk = () => { ok.disabled = !champ.value.trim(); };
        const finir = v => {
            voile.remove();
            document.removeEventListener('keydown', clavier, true);
            resolve(v);
        };
        const clavier = e => {
            if (e.key === 'Escape' && annulable) { e.stopPropagation(); finir(null); }
            else if (e.key === 'Enter' && !ok.disabled) { e.preventDefault(); finir(champ.value.trim()); }
        };
        champ.addEventListener('input', majOk);
        ok.onclick = () => finir(champ.value.trim());
        if (annulable) voile.querySelector('.annuler').onclick = () => finir(null);
        document.addEventListener('keydown', clavier, true);
        document.body.appendChild(voile);
        majOk();
        setTimeout(() => { champ.focus(); champ.select(); }, 30);
    });
}
window.demanderNomProgramme = demanderNomProgramme;

// Renommer : clic (ou Entree) sur le cadre du nom, dans le bandeau.
async function renommerProgramme() {
    if (!champNom) return;
    const saisie = await demanderNomProgramme('Renommer le programme', 'Nouveau nom pour votre programme :', champNom.value, true);
    if (saisie !== null) champNom.value = saisie.replace(/\.(hex|py)$/i, '');
}
if (cadreNom) {
    cadreNom.addEventListener('click', e => { e.preventDefault(); renommerProgramme(); });
    cadreNom.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); renommerProgramme(); } });
}

// Premier bloc pose par l'eleve dans un programme sans nom : il le nomme (comme le modele). Seuls les blocs poses a la
// main comptent (evenement enregistre pour « Annuler ») : le chargement d'un fichier, d'un exemple, d'un exercice ou d'une
// seance ne declenche rien. Pendant une visite guidee ou une autre fenetre de nom, on attend.
let nomEnAttente = false;
function visiteEnCours() { const b = $('tuto-bulle'); return !!b && getComputedStyle(b).display !== 'none'; }
function demanderNomAuPremierBloc() {
    if (!champNom || champNom.value.trim() || nomEnAttente) return;
    nomEnAttente = true;
    const essayer = () => {
        if (champNom.value.trim()) { nomEnAttente = false; return; }
        if (visiteEnCours() || $('fenetre-nom-voile')) { setTimeout(essayer, 800); return; }
        if (window.workspace && window.workspace.isDragging()) { setTimeout(essayer, 300); return; }   // bloc encore tenu
        demanderNomProgramme('Donnez un nom à votre programme',
            'Votre programme commence ! Quel nom voulez-vous lui donner ? C\'est le nom du fichier quand vous le téléchargerez.',
            '', false).then(nom => {
                nomEnAttente = false;
                if (nom) champNom.value = nom.replace(/\.(hex|py)$/i, '');
            });
    };
    setTimeout(essayer, 400);   // le bloc finit d'etre pose
}
if (window.workspace && window.Blockly) {
    window.workspace.addChangeListener(e => {
        if (e.type === Blockly.Events.BLOCK_CREATE && e.recordUndo) demanderNomAuPremierBloc();
    });
}

// ---------- Bandeau du haut : JAMAIS sur deux lignes ----------
// Comme la version Arduino R4 (r4-interface.js § 10) : le bandeau ne passe pas a la ligne (flex-wrap: nowrap, index.html) ;
// on choisit le plus petit palier de compactage qui le fait tenir (classes .compact-1 a .compact-5, cumulees), a chaque
// changement de taille de la fenetre et de texte dans le bandeau (nom du programme, « Arreter », « Masquer la console »...).
const PALIERS_BANDEAU = 5;
let compactageEnCours = false;
function compacterBandeau() {
    const barre = $('toolbar');
    if (!barre || compactageEnCours) return;
    compactageEnCours = true;
    const deborde = () => barre.scrollWidth > barre.clientWidth + 1;
    for (let n = 1; n <= PALIERS_BANDEAU; n++) barre.classList.remove('compact-' + n);
    for (let n = 1; n <= PALIERS_BANDEAU && deborde(); n++) barre.classList.add('compact-' + n);
    barre.dataset.palier = String([...barre.classList].filter(c => c.startsWith('compact-')).length);
    compactageEnCours = false;
}
let minuterieBandeau = null;
function compacterBientot() { clearTimeout(minuterieBandeau); minuterieBandeau = setTimeout(compacterBandeau, 30); }
ajusterNom();
compacterBandeau();
window.addEventListener('resize', compacterBientot);
if ($('toolbar')) new MutationObserver(compacterBientot).observe($('toolbar'), { subtree: true, childList: true, characterData: true });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(compacterBandeau);
window.bandeauTest.compacterBandeau = compacterBandeau;

// ---------- Barre de la simulation (comme la version Arduino R4, nov. 2026) ----------
// Menu « Affichage » : simulation seule, tableau seul (panneau « Peripheriques »...), ou les deux ; choix memorise.
const CLE_VUE_SIMU = 'affichageSimulation';
const conteneurSimu = $('simulator-container');
function appliquerVueSimu(vue) {
    if (!conteneurSimu) return;
    conteneurSimu.classList.toggle('vue-simulation', vue === 'simulation');
    conteneurSimu.classList.toggle('vue-tableau', vue === 'tableau');
    document.querySelectorAll('#sim-affichage [data-vue]').forEach(b => b.classList.toggle('choisi', b.dataset.vue === vue));
}
document.querySelectorAll('#sim-affichage [data-vue]').forEach(b => b.addEventListener('click', () => {
    try { localStorage.setItem(CLE_VUE_SIMU, b.dataset.vue); } catch (erreur) { /* choix oublie au rechargement */ }
    appliquerVueSimu(b.dataset.vue);
    window.dispatchEvent(new Event('resize'));   // la vue de la simulation se recale sur sa nouvelle taille
}));
let vueSimu = 'deux';
try { vueSimu = localStorage.getItem(CLE_VUE_SIMU) || 'deux'; } catch (erreur) { /* stockage indisponible */ }
appliquerVueSimu(['simulation', 'tableau', 'deux'].includes(vueSimu) ? vueSimu : 'deux');

// « Reinitialiser » = « Arreter » puis « Lancer la simulation », en un clic. Si la simulation tourne, on attend qu'elle
// soit vraiment arretee (3 s au plus) avant de la relancer ; sinon on la lance.
const boutonReinit = $('sim-reinit');
if (boutonReinit) {
    boutonReinit.addEventListener('click', () => {
        if (boutonReinit.disabled) return;
        if (window.simuEnCours !== true) { if ($('run-sim')) $('run-sim').click(); return; }
        boutonReinit.disabled = true;
        if ($('btn-reset')) $('btn-reset').click();
        const debut = performance.now();
        (function attendre() {
            if (window.simuEnCours === true && performance.now() - debut < 3000) { setTimeout(attendre, 30); return; }
            boutonReinit.disabled = false;
            if (window.simuEnCours !== true && $('run-sim')) $('run-sim').click();
        })();
    });
}

// Barre jamais sur deux lignes : libelles masques par paliers quand la colonne est etroite (icones seules).
const barreSimu = $('sim-barre');
function compacterBarreSimu() {
    if (!barreSimu) return;
    for (let n = 1; n <= 4; n++) barreSimu.classList.remove('compact-' + n);
    for (let n = 1; n <= 4 && barreSimu.scrollWidth > barreSimu.clientWidth + 1; n++) barreSimu.classList.add('compact-' + n);
}
if (barreSimu) {
    new ResizeObserver(compacterBarreSimu).observe(barreSimu);
    new MutationObserver(() => requestAnimationFrame(compacterBarreSimu)).observe(barreSimu, { subtree: true, childList: true, attributes: true, attributeFilter: ['hidden'] });
    compacterBarreSimu();
}

// ---------- Bouton « Accueil » : retour a la page d'accueil du lanceur (blockly_ts_lanceur) ----------
// L'editeur ouvert depuis la page d'accueil recoit l'adresse de retour :
//  - ?lanceur=<port>  lanceur local : retour vers http://localhost:<port>/ ;
//  - ?accueil=<url>   version en ligne : retour vers cette adresse, acceptee seulement sur jreynaud42000.github.io
//                     (ou localhost) pour qu'un lien exterieur ne puisse pas detourner le bouton.
// L'adresse est gardee pour l'onglet (sessionStorage) : le bouton reste apres un rechargement sans le parametre.
// Ouvert autrement (lancer_projet.bat, favori, exe), l'editeur n'affiche pas ce bouton.
function adresseAccueil() {
    const parametres = new URLSearchParams(location.search);
    const port = parametres.get('lanceur');
    if (/^\d{2,5}$/.test(port || '')) return 'http://localhost:' + port + '/';
    try {
        const url = new URL(parametres.get('accueil') || '');
        const local = url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname);
        if (local || (url.protocol === 'https:' && url.hostname === 'jreynaud42000.github.io')) return url.href;
    } catch (e) { /* parametre absent ou adresse invalide */ }
    return null;
}
function installerAccueil() {
    let adresse = adresseAccueil();
    try {
        if (adresse) sessionStorage.setItem('accueilLanceur', adresse);
        else adresse = sessionStorage.getItem('accueilLanceur');
    } catch (e) { /* stockage refuse : bouton seulement si le parametre est la */ }
    const barre = $('toolbar');
    if (!adresse || !barre || $('tb-accueil')) return;
    const lien = document.createElement('a');
    lien.id = 'tb-accueil';
    lien.className = 'tb-btn';
    lien.href = adresse;
    lien.title = "Revenir à l'accueil : choix de l'éditeur";
    lien.style.textDecoration = 'none';
    lien.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/></svg>' +
        '<span>Accueil</span>';
    barre.insertBefore(lien, barre.firstChild);
}
installerAccueil();
