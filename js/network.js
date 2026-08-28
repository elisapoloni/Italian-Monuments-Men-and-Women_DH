let database = null; // null perchè deve contenere il JSON che è un oggetto complesso
let tuttiIProtagonisti = []; // [] perchè conterrà un array
let tutteLeOrganizzazioni = [];
let cy = null;
let descrizione = "";

const coloriTematici = {
    protagonista: '#d4a42a',
    istituzione: '#c93e3e',
    rifugio: '#305f57',
    entePubblico: '#3a3aab',
    altro: '#6c757d',
    default: '#c5dfd3'
};

async function caricaDatabase() {

    const response = await fetch("json/database.json");
    const data = await response.json();
    
    database = data;
    tuttiIProtagonisti = data.persone;
    tutteLeOrganizzazioni = data.organizzazioni;

    // richiamo le funzioni dentro la dichiarazione di caricaDatabase perchè hanno bisogno dei dei dati per funzionare 
    attivaBottoni();
    creaFiltriNetwork();
    collaborazioni(); // richiamo solo la funzione del primo grafo per la pagina iniziale
    // imposto il testo iniziale appena si apre la pagina
    document.getElementById('testo-spiegazione-filtri').innerHTML = 
    "Il grafo mostra le correlazioni tra le persone coinvolte nella vicenda. Non sono necessari filtri poiché l’obiettivo è osservare la rete nel suo insieme.";

    // creo una variabile che contiene la card prima che venga sovrascritto dalle descrizioni
    descrizione = document.getElementById('info').innerHTML;
}

function attivaBottoni() {

    // creo variabile che contiene tutti i bottoni HTML che si trovano dentro un elemento con classe .btn-group
    let tuttiBottoni = document.querySelectorAll('.btn-group button'); 
    // btn-group = classe del contenitore che contiene i bottoni; button = è il contenuto del contenitore

    // avvio ciclo: per ogni bottone trovato...
    for (let i = 0; i < tuttiBottoni.length; i++) {
        let unBottone = tuttiBottoni[i]; // un bottone è il i-esimo bottone che viene analizzato nel ciclo; i = 0 primo bottone, i = 1 secondo bottone ecc
        let areaTestoSpiegazione = document.getElementById('testo-spiegazione-filtri');

        // ad ogni ciclo viene assegnata al i-esimo bottone la proprietà onclick, che definisco con la funzione anonima
        // quindi ad ogni ciclo prima viene rimossa la class active, poi viene attribuita active solo a "questo", poi viene controllato l'id di "questo" per capire quale grafico far vedere
        unBottone.onclick = function() {  // funzione anonima = non ha un nome proprio, viene assegnata direttamente alla proprietà onclick
            for (let j = 0; j < tuttiBottoni.length; j++) {
                tuttiBottoni[j].classList.remove('active');
            } // 1 avvio ciclo per togliere a tutti i bottoni la classe active 

            // 2 metto la classe active solo al bottone selezionato
            // this è il bottone che è stato cliccato
            this.classList.add('active');

            // in base al bottone fa apparire i filtri
            document.getElementById('filtri-collaborazioni').style.display = 'none';
            document.getElementById('filtri-responsabilita').style.display = 'none';
            document.getElementById('filtri-flusso').style.display = 'none';
 
            // 3 controllo l'id di "questo" bottone; es: se l'id di "this" è uguale e dello stesso tipo di btn-collab avvio il grafo delle collaborazioni + filtri relativi + spiegazione filtri
            if (this.id === 'btn-collab') { 
                document.getElementById('filtri-collaborazioni').style.display = 'block';
                areaTestoSpiegazione.innerHTML = 
                "Il grafo mostra le correlazioni tra le persone coinvolte nella vicenda. Non sono necessari filtri poiché l’obiettivo è osservare la rete nel suo insieme.";
                collaborazioni();
            } else if (this.id === 'btn-resp') {
                document.getElementById('filtri-responsabilita').style.display = 'block';
                areaTestoSpiegazione.innerHTML = 
                "Selezionando uno o più protagonisti, è possibile isolare le istituzioni e i rifugi che sono stati sotto la loro diretta responsabilità e gli enti pubblici cui fecero riferimento.";
                responsabilita();
            } else if (this.id === 'btn-flusso') {
                document.getElementById('filtri-flusso').style.display = 'block';
                areaTestoSpiegazione.innerHTML = 
                "I filtri consentono l’analisi incrociata per protagonista e per rifugio, permettendo di ricostruire i percorsi logistici compiuti dalle collezioni.";
                flusso();
            }
        };
    }
}

// funzione per generare i checkbox dei filtri prendendoli dal database
function creaFiltriNetwork() {
    let htmlP = ""; 
    let htmlR = ""; 

    // lista in ordine alfabetico dei protagonisti 
    let listaOrdinataP = [];
    for (let i = 0; i < tuttiIProtagonisti.length; i++){
        if (tuttiIProtagonisti[i].ruolo_card === "protagonista") {
            listaOrdinataP.push(tuttiIProtagonisti[i]);
        }
    }

    // metto in ordine alfabetico per cognome
    listaOrdinataP.sort(function(a, b) {
        return a.cognome.localeCompare(b.cognome);
    });

    for (let i = 0; i < listaOrdinataP.length; i++) {
        let p = listaOrdinataP[i];
        if (p.ruolo_card === "protagonista") {
            htmlP += `<li><label class="filter-item">
                        <input type="checkbox" class="form-check-input scelta-p-net" value="${p.id}"> 
                        ${p.nome} ${p.cognome}
                      </label></li>`;
        }
    }

    // lista in ordine alfabetico dei rifugi 
    let listaOrdinataR = [];
    for (let i = 0; i < tutteLeOrganizzazioni.length; i++){
        if (tutteLeOrganizzazioni[i].tipologia_org === "rifugio") {
            listaOrdinataR.push(tutteLeOrganizzazioni[i]);
        }
    }

    // metto in ordine alfabetico per nome dell'org
    listaOrdinataR.sort(function(a, b) {
        return a.nome_org.localeCompare(b.nome_org);
    });

    for (let j = 0; j < listaOrdinataR.length; j++) {
        let org = listaOrdinataR[j]; {
            htmlR += `<li>
                        <label class="filter-item d-flex align-items-center small" style="white-space: normal">
                            <input type="checkbox" class="form-check-input scelta-r-net me-2" value="${org.id}"> 
                                ${org.nome_org}
                        </label></li>`;
        }
    }

    // scrivo solo se gli elementi esistono nell'HTML
    let contenitoreResp = document.getElementById("filtro-protagonista-resp");
    let contenitoreFlussoP = document.getElementById("filtro-protagonista-flusso");
    let contenitoreFlussoR = document.getElementById("filtro-rifugio-flusso");

    if (contenitoreResp) { contenitoreResp.innerHTML = htmlP; }
    if (contenitoreFlussoP) { contenitoreFlussoP.innerHTML = htmlP; }
    if (contenitoreFlussoR) { contenitoreFlussoR.innerHTML = htmlR; }

    // checkbox devono ascoltare evento
    let tuttiCheck = document.querySelectorAll(".form-check-input");
    for (let k = 0; k < tuttiCheck.length; k++) {
        tuttiCheck[k].addEventListener("change", gestisciCambiamentoFiltri);
    }
}


// funzione per gestire quale filtro è stato toccato e ricaricare il grafo corretto
function gestisciCambiamentoFiltri() {
    if (document.getElementById("btn-resp").classList.contains("active")) {
        // Se siamo in responsabilità, raccogliamo i check di quel div
        let selezionati = document.querySelectorAll("#filtro-protagonista-resp .scelta-p-net:checked");
        let listaId = [];
        for (let i = 0; i < selezionati.length; i++) { listaId.push(selezionati[i].value); }
        responsabilita(listaId);
    } else if (document.getElementById("btn-flusso").classList.contains("active")) {
        // Se siamo in flusso, raccogliamo check persone e check rifugi
        let selezionatiP = document.querySelectorAll("#filtro-protagonista-flusso .scelta-p-net:checked");
        let selezionatiR = document.querySelectorAll("#filtro-rifugio-flusso .scelta-r-net:checked");
        let filtri = { persone: [], rifugi: [] };
        for (let j = 0; j < selezionatiP.length; j++) { filtri.persone.push(selezionatiP[j].value); }
        for (let k = 0; k < selezionatiR.length; k++) { filtri.rifugi.push(selezionatiR[k].value); }
        flusso(filtri);
    }
}

// GRAFO 1: PROTAGONISTA <-> PROTAGONISTA
function collaborazioni() {
    const nodi = []; // variabile vuota (array) che conterrà i nodi (protagonisti)
    let archiTemporanei = []; // variabile vuota (array) che conterrà gli archi (linee), prima della pulizia con helper

    // primo ciclo = crea i nodi (protagonisti)
    for (let i = 0; i < tuttiIProtagonisti.length; i++) {
        const protagonista = tuttiIProtagonisti[i]; // protagonista = il protagonista che viene analizzato nel i-esimo ciclo

        nodi.push({ // metto nella variabile "nodi" i dati per ogni protagonista
            data: {
                id: protagonista.id,
                label: protagonista.nome + " " + protagonista.cognome,
                type: protagonista.ruolo_card,
                ruolo: protagonista.ruolo,
                info: protagonista.note_bio,
                cognome: protagonista.cognome // serve per il bottone che va alla scheda personale
            }
        });
    }
    
    // secondo ciclo = crea gli archi (linee)
    for (let j = 0; j < tuttiIProtagonisti.length; j++) { // faccio passare tutti i protagonisti
        const protagonista = tuttiIProtagonisti[j]; // protagonista che viene analizzato nel j-esimo ciclo
        // se nel JSON nell'array del j-esimo protagonista esiste un array chiamato id_persone (elenco degli id delle persone correlate)...
        if (protagonista.id_persone) {
            // ... avvio un ciclo che fa passare l'array delle persone correlate alla j-esima persona (per tutta la lunghezza dell'elenco degli id correlati)
            for (let k = 0; k < protagonista.id_persone.length; k++) {
                // estraggo l'ID della persona correlata che sto analizzando nel k-esimo giro
                const correlazione = protagonista.id_persone[k];
                // metto nella variabile "archiTemporanei" i dati per le linee (da... a...)
                archiTemporanei.push({
                    data: { 
                            source: protagonista.id, // id da cui parte la linea
                            target: correlazione //
                        }
                });
            }
        }
    }

    // rimuovo i duplicati
    const archiPuliti = rimuoviArchiDuplicati(archiTemporanei);

    // unisco nodi e archi puliti
    const elementi = [...nodi, ...archiPuliti];

    disegna(elementi, 'cose'); // disegno il grafo caricando i dati che ho appena calcolato e con il layout circle
}

// GRAFO 2: PROTAGONISTA <-> ORGANIZZAZIONI
function responsabilita(idFiltro = []) {
    const nodi = []; // variabile vuota (array) che conterrà i nodi (protagonisti)
    let archiTemporanei = []; // variabile vuota (array) che conterrà gli archi (linee), prima della pulizia con helper
    let setOrgDaMostrare  = new Set(); // mostrare solo le organizzazioni che hanno un collegamento con i protagonisti filtrati

    // variabile che contiene protagonisti da mostrare 
    let personeDaMostrare = [];
    if (idFiltro.length === 0) {
        personeDaMostrare = tuttiIProtagonisti;
    } else {
        for (let i = 0; i < tuttiIProtagonisti.length; i++) {
            if (idFiltro.includes(tuttiIProtagonisti[i].id)) { 
                personeDaMostrare.push(tuttiIProtagonisti[i]); 
            }
        }
    }

    // riempio il set delle organizzazioni collegate
    for (let f = 0; f < personeDaMostrare.length; f++) {
        let p = personeDaMostrare[f];
        if (p.id_istituzioni) { 
            for (let a = 0; a < p.id_istituzioni.length; a++) {
                setOrgDaMostrare.add(p.id_istituzioni[a]); 
                } 
            }
        if (p.id_rifugi) { 
            for (let b = 0; b < p.id_rifugi.length; b++) {
                setOrgDaMostrare.add(p.id_rifugi[b]); 
                } 
            }
        if (p.id_enti) { 
            for (let c = 0; c < p.id_enti.length; c++) { 
                setOrgDaMostrare.add(p.id_enti[c]); 
            } 
        }
    }
    
    // primo ciclo = crea i nodi dei protagonisti
    for (let i = 0; i < personeDaMostrare.length; i++) {
        const protagonista = personeDaMostrare[i]; // protagonista = la persona da mostrare che viene analizzata nel i-esimo ciclo

        nodi.push({ // metto nella variabile "nodi" i dati per ogni protagonista
            data: {
                id: protagonista.id,
                label: protagonista.nome + " " + protagonista.cognome,
                type: protagonista.ruolo_card,
                ruolo: protagonista.ruolo,
                info: protagonista.note_bio
            }
        });
    }

    // secondo ciclo = crea i nodi delle organizzazioni
    for (let i = 0; i < tutteLeOrganizzazioni.length; i++) {
        let org = tutteLeOrganizzazioni[i]; // org = l'organizzazione che viene analizzato nel i-esimo ciclo

        if (setOrgDaMostrare.has(org.id)) {
            nodi.push({ 
                data: {
                    id: org.id,
                    label: org.nome_org,
                    type: org.tipologia_org,
                    info: org.note_org
                }
            });
        }
    }

    // terzo ciclo = crea gli archi (linee)
    for (let k = 0; k < personeDaMostrare.length; k++) {
        const p = personeDaMostrare[k];

        if (p.id_istituzioni) {
            for (let l = 0; l < p.id_istituzioni.length; l++) {
                archiTemporanei.push({
                    data: { 
                            source: p.id, 
                            target: p.id_istituzioni[l] 
                        }
                });
            }
        }

        if (p.id_rifugi) {
            for (let m = 0; m < p.id_rifugi.length; m++) {
                archiTemporanei.push({
                    data: { 
                            source: p.id, 
                            target: p.id_rifugi[m] 
                        }
                });
            }
        }

        if (p.id_enti) {
            for (let n = 0; n < p.id_enti.length; n++) {
                archiTemporanei.push({
                    data: { 
                            source: p.id, 
                            target: p.id_enti[n] 
                        }
                });
            }
        }
    }

    // rimuovo i duplicati
    const archiPuliti = rimuoviArchiDuplicati(archiTemporanei);

    // unisco nodi e archi puliti
    const elementi = [...nodi, ...archiPuliti];

    // Una volta raccolto tutto, disegnamo il grafo
    disegna(elementi, 'cose');
}

// GRAFO 3: ISTITUZIONI <-> RIFUGI
function flusso(filtri = { persone: [], rifugi: [] }) {
    const nodi = []; // variabile vuota (array) che conterrà i nodi (protagonisti)
    let archiTemporanei = []; // variabile vuota (array) che conterrà gli archi (linee), prima della pulizia con helper
    let setRifugiDaMostrare = new Set();
    let setIstituzioniDaMostrare = new Set();

    // (1) prima capisco quali rifugi mostrare in base al protagonista selezionato
    if (filtri.persone.length > 0) {
        for (let i = 0; i < tuttiIProtagonisti.length; i++) {
            let p = tuttiIProtagonisti[i];
            // se la persona i-esima è tra quelle selezionate...
            if (filtri.persone.includes(p.id) && p.id_rifugi) {
                // ...aggiungo tutti i suoi rifugi al set
                for (let j = 0; j < p.id_rifugi.length; j++) {
                    setRifugiDaMostrare.add(p.id_rifugi[j]);
                }
            }
        }
    }

    // se ho filtrato per rifugio, aggiungo gli ID al set
    if (filtri.rifugi.length > 0) {
        for (let k = 0; k < filtri.rifugi.length; k++) {
            setRifugiDaMostrare.add(filtri.rifugi[k]);
        }
    }

    // se non ho filtri attivi mostro tutto
    if (filtri.persone.length === 0 && filtri.rifugi.length === 0) {
        for (let m = 0; m < tutteLeOrganizzazioni.length; m++) {
            if (tutteLeOrganizzazioni[m].tipologia_org === "rifugio") {
                setRifugiDaMostrare.add(tutteLeOrganizzazioni[m].id);
            }
        }
    }

    // (2) poi capisco quali istituzioni sono correlate e creo gli archi
    for (let k = 0; k < tutteLeOrganizzazioni.length; k++) {
        let org = tutteLeOrganizzazioni[k];

        // se l'organizzazione è un rifugio ed è tra quelli che dobbiamo mostrare
        if (org.tipologia_org === "rifugio" && setRifugiDaMostrare.has(org.id)) {
            // Se ha delle istituzioni correlate ...
            if (org.id_istituzioni) {
                for (let x = 0; x < org.id_istituzioni.length; x++) {
                    let idIst = org.id_istituzioni[x];
                    
                    // Aggiungo l'istituzione alla lista di quelle da mostrare
                    setIstituzioniDaMostrare.add(idIst);
                    
                    // creo l'arco: Source (Istituzione) -> Target (Rifugio)
                    archiTemporanei.push({
                        data: {
                            source: org.id,
                            target: idIst
                        }
                    });
                }
            }
        }
    }

    // (3) creo i nodi delle organizzazioni
    for (let j = 0; j < tutteLeOrganizzazioni.length; j++) {
        const org = tutteLeOrganizzazioni[j]; // org = j-esima organizzazione dell'array
        
        // nodo creato solo se è un rifugio selezionato o un'istituzione collegata a un rifugio selezionato
        if (setRifugiDaMostrare.has(org.id) || setIstituzioniDaMostrare.has(org.id)) {
            nodi.push({
                data: {
                    id: org.id,
                    label: org.nome_org,
                    type: org.tipologia_org,
                    info: org.note_org
                }
            });
        }
    }  

    // rimuovo i duplicati
    const archiPuliti = rimuoviArchiDuplicati(archiTemporanei);

    // unisco nodi e archi puliti
    const elementi = [...nodi, ...archiPuliti];

    // chiamo la funzione per disegnare il grafo
    disegna(elementi, 'cose');
}

// helper -> rimuove le linee doppie tra gli stessi due nodi
// dichiaro la funzione che riceve come parametro la lista degli archi (archiTemporanei)
function rimuoviArchiDuplicati(archiDaPulire) {
    // creo un oggetto di tipo set al posto di un array -> può contenere solo valori unici, se aggiungo due volte la stessa cosa la ignora
    const setArchi = new Set();
    
    // .filter() crea un nuovo array partendo da quello originale (archiDaPulire) e lo chiama arco -> in ogni ciclo fa passare uno ad uno gli archi da pulire e li chiama arco
    // per ogni elemento (arco) eseguo il codice tra le grafe
    return archiDaPulire.filter(function(arco) {
        // prendo i due id e li metto in un piccolo array
        // .sort() ordine alfaberico, es: sia ["PR", "FW"] che ["FW", "PR"] diventano entrambi ["FW", "PR"]
        // .join("-") unisco i due ID con un trattino, es: "FW-PR" -> il collegamento tra i due ha sempre lo stesso nome
        const idUnico = [arco.data.source, arco.data.target].sort().join("-");
        
        if (setArchi.has(idUnico)) {
            return false; // se esiste già, scarto
        } else {
            setArchi.add(idUnico); 
            return true; // se è nuovo, aggiungo al set
        }
    });
}

// dichiaro la funzione che disegna i grafi e riceve come parametro gli elementi che ho calcolato nelle funzioni prima e il tipo di layout
function disegna(elementi, nameLayout) {
    if (cy) {cy.destroy()}
    
    cy = cytoscape({
        container: document.getElementById('network'), // dove inserire il grafo nell'html
        elements: elementi, // i dati che deve visualizzare calcolati con le precedenti funzioni
        style: [
            {
                selector: 'node', // caratteristiche di tutti i nodi
                style: {
                    'label': 'data(label)', // apre l'oggetto data e va a guardare label
                    'text-valign': 'bottom', // mette il nome del nodo sotto al pallino
                    'font-size': '10px', // grandezza della scritta
                    'width': 22, // larghezza e altezza del nodo
                    'height': 22,
                    'text-margin-y': '5px', // distanza del nome dal noto in verticale
                    'color': '#000000' // colore della scritta
                }
            },

            { 
                // node[proprietà="valore"], cerca tra tutti i nodi la proprietà che è uguale a protagonista
                selector: 'node[type="protagonista"]', // caratteristiche specifiche dei vari tipi di nodi (colore e forma)
                style: { 
                    'background-color': coloriTematici.protagonista
                } 
            },
            { 
                // node[proprietà="valore"], cerca tra tutti i nodi la proprietà che è uguale a protagonista
                selector: 'node[type="altro"]', // caratteristiche specifiche dei vari tipi di nodi (colore e forma)
                style: { 
                    'background-color': coloriTematici.altro 
                } 
            },
            { 
                selector: 'node[type="istituzione"]', 
                style: { 
                    'background-color': coloriTematici.istituzione,
                    'shape': 'round-rectangle' 
                } 
            },
            
            { 
                selector: 'node[type="ente-pubblico"]', 
                style: { 
                    'background-color': coloriTematici.entePubblico,
                    'shape': 'round-hexagon' 
                } 
            },
            
            { 
                selector: 'node[type="rifugio"]', 
                style: { 
                    'background-color': coloriTematici.rifugio, 
                    'shape': 'round-diamond' 
                } 
            },
            
            { 
                selector: 'node[type="organizzazione"]', 
                style: { 
                    'background-color': coloriTematici.default 
                } 
            },
            
            {
                selector: 'edge',
                style: {
                    'width': 1.5,
                    'line-color': '#ced4da',
                    'curve-style': 'bezier', // linea leggermente curvata
                    'target-arrow-shape': 'triangle', // freccia
                    'target-arrow-color': '#ced4da'
                }
            }
        ],

        layout: {
            name: nameLayout,
            animate: true, // movimento fluido quando cambio grafo
            animationDuration: 800,
            fit: true, // adatta il grafo allo schermo
            padding: 50, // spazio dai bordi del contenitore
            nodeRepulsion: function( node ){ return 1000000; }, // evita sovrapposizioni
            idealEdgeLength: function( edge ){ return 100; }, // Lunghezza ideale delle linee
            edgeElasticity: function( edge ){ return 100; }, // Forza di attrazione delle linee
            nodeOverlap: 20, // Spazio minimo tra i nodi
            refresh: 20,
            componentSpacing: 120, // Spazio tra cluster non collegati tra loro
            nodeDimensionsIncludeLabels: true // lunghezza del nome per non sovrapporli
        }


    });

    // cy.on = dice al grafo di aspettare che si verifichi un evento
    // tap = comando universale per il click -> l'evento
    // selector = node -> quindi quando viene cliccato un nodo
    cy.on('tap', 'node', function(evt) { // funzione che definisce l'azione da compiere; evt qabbreviaizone di event è il parametro
        const dataPerSidebar = evt.target.data(); // evt.target = il target dell'evento (lo specifico nodo che viene cliccato); .data() va a prendere in data i dati relativi (id, label, type, info)
        aggiornaSidebar(dataPerSidebar); // passa i dati alla funzione che li mostra sulla barra laterale
    });
}

function aggiornaSidebar(dataPerSidebar) {
    const sidebar = document.getElementById('info'); // recupero dall'html dove devo mettere la barra laterale per le info
    if (!sidebar) return; // se non trova un id che si chiama info si ferma

    // se il type è "protagonista", l'etichetta è "PROTAGONISTA", altriemtni è il type stesso (altro)
    const etichetta = dataPerSidebar.type === 'protagonista' ? "PROTAGONISTA" : dataPerSidebar.type;

    // in base al type un colore diverso
    let classeColore = `badge-${dataPerSidebar.type}`;

    // Se il tipo non è tra quelli previsti, forziamo la classe badge-default
    const tipiPrevisti = ['protagonista', 'istituzione', 'rifugio', 'ente-pubblico', 'altro', 'città'];
    if (tipiPrevisti.indexOf(dataPerSidebar.type) === -1) {
        classeColore = 'badge-default';
    }


    let htmlDescrizione = `
        <div class="p-2">
            <!--inserisce nella barra laterale type label e info -->
            <span class="badge ${classeColore} mb-2 text-uppercase">${etichetta}</span>
            <h6>${dataPerSidebar.label}</h6>
            <!-- se "ruolo" esiste, allora fai quello che segue, altrimenti niente -->
            ${dataPerSidebar.ruolo ? `<p class="text-muted small mt-1 mb-0"><em>${dataPerSidebar.ruolo}</em></p>` : ''}
            <hr>
            <p class="small" style="text-align:justify">${dataPerSidebar.info || "Informazione non disponibile."}</p>
        </div>
    `;


    // se type è uguale a protagonista e nei dati c'è il cognome, aggiungi a htmlDescrizione quello che segue
    if (dataPerSidebar.type === 'protagonista' && dataPerSidebar.cognome) {
        htmlDescrizione += `
            <div class="container-bottone-sidebar">
                <a href="${dataPerSidebar.cognome.toLowerCase()}.html" class="btn btn-dark btn-sm w-100 py-2" style="font-style: normal !important;">
                    <i class="bi bi-file-person me-2"></i>Vai alla scheda dettagliata
                </a>
            </div>
        `;
    }

    htmlDescrizione += `</div>`;
    sidebar.innerHTML = htmlDescrizione;

}

// tasto Reset
document.getElementById("btn-reset-network").onclick = function() {
    let tuttiCheck = document.querySelectorAll(".form-check-input");
    for (let i = 0; i < tuttiCheck.length; i++) {
        tuttiCheck[i].checked = false;
    }
    // ricarico il grafo senza filtri
    if (document.getElementById("btn-resp").classList.contains("active")) { responsabilita(); }
    else if (document.getElementById("btn-flusso").classList.contains("active")) { flusso(); }

    // recupero la card originale pulita dalla descrizione
    document.getElementById('info').innerHTML = descrizione
};


caricaDatabase();