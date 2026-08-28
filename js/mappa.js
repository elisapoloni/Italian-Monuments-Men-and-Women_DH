// L.map('map') dice a Leaflet di usare il div con id="map"; ('map') è l'id del div che contiene la mappa (è una stringa)
// il punto (operatore di accesso) collega un oggetto all'altro
// con L apro la libreria Leaflet, il punto mi permette di accedere alla funzione map() che crea la mappa e l'altro punto mi permette di accedere alla funzione setView()
// setView([lat, lng], zoom) centra la mappa sull'Italia
var map = L.map('map').setView([42.5000, 12.5000], 6);
// creo una variabile che si chiama map e che contiene la mappa centrata sull'Italia con zoom 6 e che inserirò nel div con id="map" (che si trova in mappa.html)

// aggiungo i tiles = le mattonelle che compongono la mappa. In questo caso uso OpenStreetMap
// L. = Leaflet, tileLayer = comando tecnico per creare lo strato di immagini, (...) = parametri per caricare le immagini da OpenStreetMap
// l'url è l'indirizzo del server che fornisce le immagini della mappa, {z} = livello di zoom, {x} = coordinata x, {y} = coordinata y
// z x e y servono per caricare le immagini corrette in base alla posizione e allo zoom della mappa (in base a come l'utente si sposta sulla mappa)
// dentro le parentesi graffe ci sono istruzioni extra: il testo che appare in basso a destra per citare la fonte delle immagini della mappa (OpenStreetMap) e il link al sito di OpenStreetMap
// .addTo(map) = aggiunge alla variabile che ho chiamato map la mappa con le immagini di OpenStreetMap
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// creo un contenitore vuoto per raggruppare più elementi (marcatori), contenitore come se fosse uno strato appoggiato sulla mappa
// mettiamo i marcatori su questo strato pittosto che direttamente sulla mappa così con un unico comando riusciamo a cancellare tutti i marcatori quando filtriamo
// L.layerGroup() = Leaflet crea un oggetto che non contiene ancora nessun marcatore; si riempirà quando userò comando .addTo(layerMarcatori)
let layerMarcatori = L.layerGroup().addTo(map);
let layerSbarco = L.layerGroup(); 
let layerBombardamento = L.layerGroup(); // Layer per le icone nere

let tuttiIProtagonisti = []; // variabile che contiene tutto il blocco delle persone del JSON, è un piccolo pezzo di database 
let tuttiILuoghi = [];
let tuttiSbarchi = [];
let tuttiBombardamenti = [];
let oggettoLuogo = {}; // oggetto vuoto che conterrà oggetti del tipo [chiave] = valore
let oggettoProtagonista = {} 



async function caricaDatabase() {
    const response = await fetch("json/database.json");
    const data = await response.json();
    // con .json() trasformo la risposta in un oggetto JSON
    // JSON è un formato di dati che contiene informazioni strutturate in coppie chiave-valore, simile a un oggetto JavaScript
    // JavaScript Object Notation = un modo di scrivere un testo che imita la struttura di un oggetto JavaScript MA è SOLO TESTO, devo trasformarlo in OGGETTO in modo che Javascript lo comprenda
    
    tuttiIProtagonisti = data.persone;
    tuttiILuoghi = data.luoghi; // data è il mio oggetto JavaScript e con il punto apro dentro l'oggetto solo la parte che mi interessa, cioè luoghi
    tuttiSbarchi = data.sbarco;
    tuttiBombardamenti = data.bombardamento;


    // avvio ciclo che fa passare tutti i luoghi
    for (let i = 0; i < tuttiILuoghi.length; i++) {
        let l = tuttiILuoghi[i]; // l è il i-esimo luogo che viene analizzato (es: oggetto della Pinacoteca di brera, quindi id, lat, lng, note...)
        oggettoLuogo[l.id] = l; // associa l'ID (chiave) all'oggetto intero (valore)
        // prendo oggettoLuogo, creo una "casella" che si chiama l.id e dentro ci metto l quindi tutti i dati del i-esimo luogo
        
        // es: i = 0 primo luogo della lista tuttiILuoghi -> Pinacoteca di Brera; l = oggetto della Pinacoteca di brera, quindi id, lat, lng, note...
        // l.id = apro l'oggetto l, quindi Pinacoteca di Brera e vado a prendere l'id quindi PB_loc
        // prendo oggettoLuogo, creo una "casella" che si chiama PB_loc quindi oggettoLuogo[PB_loc]
        // [PB_loc] = l -> [chiave] = valore; la chiave è l'id, il valore sono tutti i dati che io in questo modo gli associo quindi quindi id, lat, lng, note...
        // oggettoLuogo è l'elenco di tutti i [chiave] = valore
    }

    for (let j = 0; j < tuttiIProtagonisti.length; j++) {
        let p = tuttiIProtagonisti[j]
        oggettoProtagonista[tuttiIProtagonisti[j].id] = p;
    }

    // richiamo le funzioni dentro la dichiarazione di caricaDatabase perchè hanno bisogno dei dei dati per funzionare 
    creaFiltroProtagonisti();
    creaFiltroTipologie();
    gestisciLineaGotica();
    disegnaMappa(tuttiILuoghi);
    // tuttiILuoghi è l'argomento che passo alla funzione creaMarcatori per creare i marker sulla mappa
    ottieniSbarco(tuttiSbarchi); 
    gestisciBottoneSbarco();
    gestisciLineaGustav();
    ottieniBombardamento(tuttiBombardamenti); 
    gestisciBottoneBombardamento();



}

// funzione per calcolare icona in base alla tipologia
function ottieniIcona(tipologiaIcona) {
    let nomeIcona = ""; //variabile vuota che sarà riempita col nome dell'icona
    let stileIcona = ""; //variabile vuota che sarà riempita con la classe CSS che decide lo stile dell'icona

    // switch = "se la tipologia è X, allora usa l'icona Y" senza ripetere continuamente if...
    // guarda il parametro e in base a quello che c'è scritto usa le regole che ho dato
    switch (tipologiaIcona) {
        // nel caso in cui il parametro è "istituzione"...
        case 'istituzione':
            nomeIcona = 'bi-bank'; // ... l'icona è "bi-bank"
            stileIcona = 'marker-istituzione'; // e lo stile è definito dalla classe CSS "marker-istituzione"
            break; // se ho trovato quello che cercavo, FINE. non va avanti a leggere il codice
        case 'rifugio':
            nomeIcona = 'bi-exclamation-circle-fill';
            stileIcona = 'marker-rifugio';
            break;
        case 'ente-pubblico':
            nomeIcona = 'bi-building';
            stileIcona = 'marker-ente-pubblico';
            break;
        case 'città':
            nomeIcona = 'bi-browser-safari';
            stileIcona = 'marker-citta';
            break;
        // nel caso in cui la tipologia trovata nel JSON non corrisponde a nessuno dei nomi sopra
        default:
            nomeIcona = 'bi-geo-alt-fill';
            stileIcona = 'marker-default';
    }

    // return = restituisce i calcoli che ha fatto la funzione e crea l'icona
    // L = libreria Leaflet; operatore di accesso; divIcon = metodo di Leaflet che dice di creare l'icona usando il codice HTML che segue
    return L.divIcon({ // nelle parentesi grafe ci sono le configurazioni

        html: `<div class="marker-pin ${stileIcona}"><i class="bi ${nomeIcona}"></i></div>`, // crea il marker con lo stile e l'icona che abbiamo definito con lo switch
        className: 'custom-div-icon', // classe per pulire gli stili di base di Leaflet
        iconSize: [35, 35],           // dimensione del cerchio dell'icona
        iconAnchor: [17, 35],         // punto che tocca le coordinate (metà larghezza, tutta altezza)
        popupAnchor: [0, -35]         // dove deve apparire il popup rispetto all'icona
    });
}


function disegnaMappa(luoghi) {

    // metodo di Leaflet che cancella i marcatori nel momento in cui applico un filtro
    layerMarcatori.clearLayers();

    // avvio il ciclo for per scorrere tutti i luoghi presenti nel JSON e trovare latitudine, longitudine e tipologia
    for (let i = 0; i < luoghi.length; i++) {
        let lat = luoghi[i].lat;
        let lng = luoghi[i].lng;
        let tipo = luoghi[i].tipologia_loc;

        // if (condizione) allora {} eseguo quello che c'è scritto nelle graffe
        if (lat && lng) {
            
            let contenutoPopup = "<b>" + luoghi[i].nome_loc + "</b>"; // contenuto del pop up è il nome del luogo ...
            
            if (luoghi[i].tipologia_loc !== "città" && luoghi[i].note_loc) { // ... se la tipologia del luogo è diverso da città e c'è la nota del luogo ...
                contenutoPopup += "<br><p class='small m-0 mt-1'>" + luoghi[i].note_loc + "</p>"; // aggiungo a contenutoPopup la nota
            }
            
            // Comando di Leaflet per creare un marker
            // L. = Leaflet, marker = marcatore sulla mappa, ([lat, lng]) = coordinate del marcatore sotto forma di array (lista di valori)
            // marker può ricevere info extra dentro a parentesi graffe -> icon = comando di Leaflet per cui capisce che stiamo creando un'icona
            // in particolare uso quella che ho ottenuto con la funzione ottieniIcona che ha come parametro la tipologia di luogo che ho trovato col ciclo
            L.marker([lat, lng], { icon: ottieniIcona(tipo) })
                .addTo(layerMarcatori) // aggiunge il marcatore al layer
                .bindPopup(contenutoPopup); // aggiunge il popup al marker
                
        }
    }
}

// let tipo = luoghi[i].tipologia_loc; -> JavaScript estrae dal JSON la parola "rifugio"
// ottieniIcona(tipo) -> JavaScript chiama la funzione e le consegna la parola "rifugio" -> ottieniIcona(rifugio)
// function ottieniIcona(tipologiaIcona) -> ottieniIcona(rifugio) -> La funzione riceve la parola e la salva dentro l'etichetta tipologiaIcona.
// switch (tipologiaIcona) -> switch (rifugio) -> "Se tipologiaIcona è uguale a 'rifugio', allora usa icona = bi-exclamation-circle-fill e stile = marker-rifugio".

// funzione per creare il menu a tendina del filtro per protagonista
function creaFiltroProtagonisti() {
    const filtroP = document.getElementById("filtro-protagonista");
    let htmlProtagonisti = "";

    // lista in ordine alfabetico dei protagonisti 
    let listaOrdinata = [];
    for (let i = 0; i < tuttiIProtagonisti.length; i++){
        if (tuttiIProtagonisti[i].ruolo_card === "protagonista") {
            listaOrdinata.push(tuttiIProtagonisti[i]);
        }
    }

    // metto in ordine alfabetico per cognome
    listaOrdinata.sort(function(a, b) {
        return a.cognome.localeCompare(b.cognome);
    });

    for (let i = 0; i < listaOrdinata.length; i++){
        let p = listaOrdinata[i];
        // prende solo chi ha ruolo_card = protagonista (uguale e dello stesso tipo)
        if (p.ruolo_card === "protagonista") {
            htmlProtagonisti += `
                <li>
                    <label class="filter-item">
                        <input type="checkbox" class="form-check-input scelta-p-map" value="${p.id}"> 
                        ${p.nome} ${p.cognome}
                    </label>
                </li>`;
        }
    }

    filtroP.innerHTML = htmlProtagonisti;

    // raccolgo in una variabile tutti i checkbox con classe .scelta-p-map
    let checkboxP = document.querySelectorAll(".scelta-p-map");
    // avvio un ciclo che li fa passare tutti
    for (let j = 0; j < checkboxP.length; j++) {
        // per ognuno applico il metodo che "ascolta gli eventi"
        checkboxP[j].addEventListener("change", applicaFiltri);
        // l'evento che deve ascoltare è "change", quando avviene deve fare quello che viene definito nella funzione applicaFiltroProtagonisti
    }
}

function creaFiltroTipologie() {
    const filtroT = document.getElementById("filtro-tipologia");
    let tipologie = [];

    // trovo tutte le tipologie presenti nel JSON senza duplicati
    for (let i = 0; i < tuttiILuoghi.length; i++) {
        let t = tuttiILuoghi[i].tipologia_loc;
        if (t && tipologie.indexOf(t) === -1) {
            tipologie.push(t);
        }
    }

    let htmlTipologie = "";
    for (let j = 0; j < tipologie.length; j++) {
        htmlTipologie += `
            <li>
                <label class="filter-item">
                    <input type="checkbox" class="form-check-input scelta-t-map" value="${tipologie[j]}"> 
                    <span class="small text-capitalize">${tipologie[j].replace('-', ' ')}</span>
                </label>
            </li>`;
    }
    filtroT.innerHTML = htmlTipologie;

    // aggiungo listener
    let checkboxT = document.querySelectorAll(".scelta-t-map");
    for (let k = 0; k < checkboxT.length; k++) {
        checkboxT[k].addEventListener("change", applicaFiltri);
    }
}

function applicaFiltri() {
    // raccolgo nella variabile il checkbox selezionato tramite la classe scelta-p:checked
    let checkP = document.querySelectorAll(".scelta-p-map:checked");
    let checkT = document.querySelectorAll(".scelta-t-map:checked");

    let protagonistiSelezionati = [];
    for (let i = 0; i < checkP.length; i++) {
        protagonistiSelezionati.push(checkP[i].value); 
    }

    let tipologieSelezionate = [];
    for (let j = 0; j < checkT.length; j++) {
        tipologieSelezionate.push(checkT[j].value); 
    }

    // se la lunghezza dei checkbox selezionati è uguale e dello stesso tipo di 0 -> non è stato selezionato niente
    if (protagonistiSelezionati.length === 0 && tipologieSelezionate.length === 0) {
        disegnaMappa(tuttiILuoghi);
        return;
    }

    let risultati = []; // variabile che conterrà i risultati del ciclo = quali sono i protagonisti filtrati e/o la tipologia selezionata
    
    // selezionata solo una tipologia e nessun protagonista
    if (protagonistiSelezionati.length === 0) {
        for (let l = 0; l < tuttiILuoghi.length; l++) {
            if (tipologieSelezionate.indexOf(tuttiILuoghi[l].tipologia_loc) !== -1) {
                risultati.push(tuttiILuoghi[l]);
            }
        }
    }  else { // slezionato anche un protagonista
        let luoghiDelProtagonista = new Set();
        for (let p = 0; p < protagonistiSelezionati.length; p++) {
            let idProt = protagonistiSelezionati[p];
            let datiP = oggettoProtagonista[idProt];
            if (datiP.id_luoghi) {
                for (let k = 0; k < datiP.id_luoghi.length; k++) {
                    luoghiDelProtagonista.add(datiP.id_luoghi[k]);
                }
            }
        }

        // tra i luoghi dei protagonisti scelti, tengo solo quelli che della tipologia (se selezionata)
        luoghiDelProtagonista.forEach(function(idLuogo) {
            let luogo = oggettoLuogo[idLuogo];
            if (luogo) {
                let passaTipo = tipologieSelezionate.length === 0 || tipologieSelezionate.indexOf(luogo.tipologia_loc) !== -1;
                if (passaTipo) {
                    risultati.push(luogo);
                }
            }
        });
    }
            
// chiamo la funzione per disegnare i marcatori e gli do come argomento i luoghi filtrati
disegnaMappa(risultati);

}

function resetFiltri() {
    // cerca tutti i checkbox della pagina
    // uso form-check-input in modo da andare a prendere tutti i checkbox, anche nel caso in cui aggiunga altri filtri con class per esempio scelta-t-map (filtro per tipologia)
    let tuttiICheckbox = document.querySelectorAll(".form-check-input");

    // avvia un ciclo che fa passare tutti i checkbox
    for (let i = 0; i < tuttiICheckbox.length; i++) {
        // .checked è una proprietà booleana dell'elemento html (booleana = può avere solo due stati: true (vero/acceso) o false (falso/spento))
        // = false -> toglie la spunta blu dal quadratino
        tuttiICheckbox[i].checked = false;
    }

    // richiamo la funzione disegnaMappa passandogli tutti i luoghi
    disegnaMappa(tuttiILuoghi);
}

// dico al bottone Reset di ascoltare il click e applicare quello che ho definito nella funzione resetFiltri
// change è divero da click. change viene usato quando viene cliccato qualcosa che cambia valore; click invece per bottone che non cambia valore
document.getElementById("btn-reset").addEventListener("click", resetFiltri);

// coordinate geografiche della Linea Gotica (approssimative Massa-Pesaro)
let coordinateGotica = [
    [44.037, 10.133], // Massa
    [44.112, 10.457], // Garfagnana
    [44.200, 10.800], // Abetone
    [44.150, 11.250], // Passo della Futa
    [43.850, 11.950], // Badia Prataglia
    [43.781, 12.336], // Carpegna
    [43.912, 12.915]  // Pesaro
];

// poligono Leaflet
let lineaGotica = L.polyline(coordinateGotica, {
    color: '#800000', // colore
    weight: 4,        // spessore linea
    opacity: 0.6,     // trasparenza
    dashArray: '10, 10', // linea tratteggiata
    lineJoin: 'round'
});

// popup alla linea per spiegare cos'è se l'utente ci clicca sopra
lineaGotica.bindPopup("<b>Linea Gotica</b><br>Fronte di guerra tra l'agosto del 1944 e l'aprile del 1945.");

// coordinate geografiche della Linea Gustav (approssimative Minturno-Cassino-Ortona)
let coordinateGustav = [
    [41.227, 13.771], // Minturno (Foce del Garigliano)
    [41.293, 13.825], // Castelforte
    [41.491, 13.832], // Cassino
    [41.784, 14.105], // Castel di Sangro
    [41.983, 14.173], // Lama dei Peligni
    [42.235, 14.341], // Guardiagrele
    [42.351, 14.403]  // Ortona
];

let lineaGustav = L.polyline(coordinateGustav, {
    color: '#4a4a4a',
    weight: 4,
    opacity: 0.7,
    dashArray: '5, 10', // colore e tratteggio diverso per distinguerla
    lineJoin: 'round'
});

lineaGustav.bindPopup("<b>Linea Gustav</b><br>Fronte di guerra tra il dicembre del 1943 e il maggio del 1944.");

// funzione per gestire l'accensione/spegnimento bottone
function gestisciLineaGustav() {
    var checkbox = document.getElementById('check-gustav');
    if (checkbox) {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                lineaGustav.addTo(map);
            } else {
                map.removeLayer(lineaGustav);
            }
        });
    }
}

function gestisciLineaGotica() {
    var checkbox = document.getElementById('check-gotica');
    
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            lineaGotica.addTo(map); // aggiunge la linea alla variabile map
        } else {
            map.removeLayer(lineaGotica); // rimuove la linea
        }
    });
}

function ottieniSbarco(punti) {
    for (var i = 0; i < punti.length; i++) {
        var p = punti[i];
        
        var iconaSbarco = L.divIcon({
            html: '<div class="marker-pin marker-sbarco"><i class="bi bi-flag-fill"></i></div>',
            className: 'custom-div-icon',
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30]
        });

        L.marker([p.lat, p.lng], { icon: iconaSbarco })
            .bindPopup("<b>Sbarco Alleato: " + p.nome_loc + "</b><br><p class='small m-0'>" + p.note_loc + "</p>")
            .addTo(layerSbarco); 
    }
}

function gestisciBottoneSbarco() {
    var checkSbarco = document.getElementById('check-sbarco');
    if (checkSbarco) {
        checkSbarco.addEventListener('change', function() {
            if (this.checked) {
                layerSbarco.addTo(map);
            } else {
                map.removeLayer(layerSbarco);
            }
        });
    }
}

function ottieniBombardamento(punti) {
    for (var i = 0; i < punti.length; i++) {
        var p = punti[i];
        
        // Icona nera con simbolo esplosione (bi-fire)
        var iconaBomb = L.divIcon({
            html: '<div class="marker-pin marker-bombardamento"><i class="bi bi-fire"></i></div>',
            className: 'custom-div-icon',
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30]
        });

        L.marker([p.lat, p.lng], { icon: iconaBomb })
            .bindPopup("<b>Bombardamento: " + p.nome_loc + "</b><br><p class='small m-0'>" + p.note_loc + "</p>")
            .addTo(layerBombardamento); 
    }
}

function gestisciBottoneBombardamento() {
    var checkBomb = document.getElementById('check-bombardamento');
    if (checkBomb) {
        checkBomb.addEventListener('change', function() {
            if (this.checked) {
                layerBombardamento.addTo(map);
            } else {
                map.removeLayer(layerBombardamento);
            }
        });
    }
}



// richiamo alla fine perchè prima ho spiegato al browser tutto quello che deve sapere per funzionare
caricaDatabase();

