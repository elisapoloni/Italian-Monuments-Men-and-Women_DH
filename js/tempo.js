let database = null;
let tuttiIProtagonisti = [];
let tuttiGliEventi = [];
let timeline = null;
let datiEvento = new vis.DataSet(); // vis.DataSet() = oggetto della libreria vis.js che contiene dati
let descrizione = "";

const nomiContesti = {
    "guerra": "Guerra", 
    "ente-pubblico": "Ente pubblico"
};

async function caricaDatabase() {

    const response = await fetch("json/database.json");
    const data = await response.json();
    
    tuttiIProtagonisti = data.persone;
    tuttiGliEventi = data.eventi;

    disegnaTimeline();
    creaFiltroProtagonisti();
    applicaFiltroProtagonisti();
    gestisciNavigazione(); // bottoni zoom, armistizio e frecce

    // creo una variabile che contiene la card prima che venga sovrascritto dalle descrizioni
    descrizione = document.getElementById('info').innerHTML;
}

function disegnaTimeline() {
    const contenitore = document.getElementById('timeline');
    
    const options = {
        stack: true, // due eventi contemporanei uno sopra l'altro
        maxHeight: '500px', // altezza massima
        horizontalScroll: true, // scorrimento orizzontale
        zoomKey: 'ctrlKey', // per zoomare tenere premuto ctrl + rotella mouse
        orientation: 'bottom', // barra delle date sotto
        start: '1939-01-01', // data inizio e fine quanso si carica la pagina
        end: '1946-01-01'
    };

    timeline = new vis.Timeline(contenitore, datiEvento, options); 
    // creo una nuova timeline dentro contenitore, con dati contenuti in datiEvento e che segue le regole di options
    // datiEvento = vis.DataSet creato all'inizio

    // .on = metodo della libreria vis.js; select = azione di selezionare una card -> quando utente clicca su un evento ...
    // properties = oggetto che libreria vis.js crea nel momento in cui viene cliccata la card di un evento.
    timeline.on('select', function (properties) {
        // properties.items = lista degli ID degli eventi cliccati -> ... avvio ciclo degli elementi selezionati
        if (properties.items.length > 0) { 
            // ... il primo id viene passato alla funzione che scrive la descrizione
            mostraDescrizioneEvento(properties.items[0]); 
        }

    // quando avviene l'evento 'select', vis.js passa alla funzione l'oggetto 'properties' che contiene l'id dell'evento cliccato

    });
}

function creaFiltroProtagonisti() {
    const filtroP = document.getElementById("filtro-protagonista");
    let html = "";
    
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
        html += `<li><label class="filter-item">
                    <input type="checkbox" class="form-check-input scelta-p-tempo" value="${listaOrdinataP[i].id}"> 
                    ${listaOrdinataP[i].nome} ${listaOrdinataP[i].cognome}
                 </label></li>`;
    }
    filtroP.innerHTML = html;

    // aggiungo listener del cambiamento di ogni checkbox
    let checkboxP = document.querySelectorAll(".scelta-p-tempo");
    for (let k = 0; k < checkboxP.length; k++) {
        checkboxP[k].addEventListener("change", applicaFiltroProtagonisti);
    }
}

function applicaFiltroProtagonisti() {
    let selezionati = []; // lista vuota -> ID dei protagonisti scelti
    let checkP = document.querySelectorAll(".scelta-p-tempo:checked"); // solo checkbox che hanno la spunta checked

    // avvio ciclo di tutti i checkbox selezionati
    for (let i = 0; i < checkP.length; i++) { 
        // e inserisco nella lista "selezionati" con push il value (value="${listaOrdinataP[i].id -> ID del protagonista)
        selezionati.push(checkP[i].value); 
    }
    
    datiEvento.clear(); // svuota la timeline per non sovrapporre eventi

    // avvio ciclo che fa passare tutti gli eventi
    for (let j = 0; j < tuttiGliEventi.length; j++) {
        // ev = j-esimo evento analizzato
        let ev = tuttiGliEventi[j];
        // se l'id_contesto dell'evento che sto analizzando è uguale e dello stesso tipo di ... oppure se nella lista degli ID dei protagonisti delezionati è presente l'id_contesto
        if (ev.id_contesto === "guerra" || ev.id_contesto === "ente-pubblico" || selezionati.includes(ev.id_contesto)) {
            
            let classeColore = "";

            // colori sono definiti nel css
            if (ev.id_contesto === "guerra") {
                classeColore = "ev-guerra";
            } else if (ev.id_contesto === "ente-pubblico") {
                classeColore = "ev-ente";
            } else {
                classeColore = "ev-protagonista";
            }

            // datiEvento è un vis.DataSet(), cioè un oggetto che contiene dati ed è questo a far comparire l'evento sulla linea del tempo
            datiEvento.add({
                id: ev.id,
                content: ev.evento,
                start: ev.data_inizio,
                end: ev.data_fine,
                className: classeColore,
                type: 'box' // quadratino con linea che punta alla data
            });
        }
    }
}

// idEvento = properties.items[0]
function mostraDescrizioneEvento(idEvento) {
    let eventoTrovato = null;
    for (let i = 0; i < tuttiGliEventi.length; i++) {
        // contronto id di tutti gli eventi con l'id del click
        if (tuttiGliEventi[i].id === idEvento) { // se trova id uguale e dello stesso tipo di idEvento
            eventoTrovato = tuttiGliEventi[i]; // inserisco nella variabile tutto l'oggetto (id, note, date, ecc.)
            break;
        }
    }

    if (eventoTrovato) {
        const cardInfo = document.getElementById('info');
        let tipo = eventoTrovato.id_contesto; // vado a guardare id_contesto

        let tipoBadge = "";
        let testoBadge = "";

        if (tipo === "guerra") {
            tipoBadge = "badge-guerra"; // stile definito nel css
            testoBadge = nomiContesti["guerra"]; // definito all'inizio del file
        } 
        else if (tipo === "ente-pubblico") {
            tipoBadge = "badge-ente-pubblico"; 
            testoBadge = nomiContesti["ente-pubblico"];
        } 

        else {

            tipoBadge = "badge-protagonista";
            
            let nomeCompleto = "Protagonista";
            for (let j = 0; j < tuttiIProtagonisti.length; j++) {
                // se ID del protagonista è uguale a id_contesti allora uso come testo del badge nome e cognome
                if (tuttiIProtagonisti[j].id === tipo) {
                    nomeCompleto = tuttiIProtagonisti[j].nome + " " + tuttiIProtagonisti[j].cognome;
                    break;
                }
            }

            testoBadge = nomeCompleto;

        }

        cardInfo.innerHTML = `
            <span class="badge ${tipoBadge} mb-2 text-uppercase">${testoBadge}</span>
            <h5 class="fw-bold">${eventoTrovato.evento}</h5>
            <p class="text-muted small"><i class="bi bi-calendar3"></i> 
                ${eventoTrovato.data_inizio}
                ${eventoTrovato.data_fine ? ' - ' + eventoTrovato.data_fine : ''}
            </p>
            <hr>
            <p class="small" style="text-align:justify">${eventoTrovato.note_ev || "Nessuna nota disponibile."}</p>
        `;
    }
}

function gestisciNavigazione() {
    // associo una funzione anonima a .onclick -> quando viene cliccato ... fai...
    document.getElementById('move-left').onclick = function() { move(0.2); };
    document.getElementById('move-right').onclick = function() { move(-0.2); };
    document.getElementById('zoom-in').onclick = function() { timeline.zoomIn(0.5, { animation: { duration: 500 } }); }; // 0.5 = ingrandire o diminuire
    document.getElementById('zoom-out').onclick = function() { timeline.zoomOut(0.5, { animation: { duration: 500 } }); }; // 500 millisecondi = mezzo secondo
    // zoomIn 0.5 -> ingrandisce la visuale riducendo della metà il periodo di tempo visualizzato
    // zoomOut 0.5 -> raddoppia la quantità di tempo visibile quindi diminuisce l'ingrandimento
    
    const btnArmistizio = document.getElementById('focus-armistizio');
    if (btnArmistizio) {
        btnArmistizio.onclick = function() {
            // setWindow = imposta una precisa finestra temporale
            // finestra temporale da luglio 1943 a gennaio 1944 -> 8 settembre al centro
            timeline.setWindow('1943-07-01', '1944-01-01', {
                animation: { 
                    duration: 1000, // 1000 millisecondi = 1 secondo
                    easingFunction: 'easeInOutQuart' // effetto del movimento che parte lento e poi accelera
                }
            });
        };
    }

    // funzione per far scorrere la timeline a destra e sinistra (riceve come parametro la percentuale 0.2 o -0.2)
    function move(percentualeSpostamento) {
        let finestra = timeline.getWindow(); // prendo finestra temporale attuale 
        let intervallo = finestra.end - finestra.start; // oggetto che contiene data di inizio e di fine
        // sposto inizio e fine in base alla percentuale indicata (es. 0.2 = 20%)
        // spostamento è proporzionale alla finestra temporale di partenza
        timeline.setWindow({
            // finestra.start (o end) .valueOf() -> trasforma la data in un numero così js può fare il calcolo 
            start: finestra.start.valueOf() - intervallo * percentualeSpostamento, // il nuovo start dopo il movimento sarà = finestra.start trasformato in numero - intervallo * percentuale
            end: finestra.end.valueOf() - intervallo * percentualeSpostamento, // stessa cosa per l'end, spostiamo tutti e due della stessa quantità
            animation: { duration: 500 }
        });
    }
}

document.getElementById("btn-reset").onclick = function() {
    // array di tutti gli elementi che hanno la classe css = .form-check-input
    let tuttiCheck = document.querySelectorAll(".form-check-input");
   
    // faccio passare titti i checkbox della lista e metto proprietà .checked a false.
    for (let i = 0; i < tuttiCheck.length; i++) { 
        tuttiCheck[i].checked = false; 
    }

    applicaFiltroProtagonisti(); // NO disegnaTimeline() -> crea una nuova timeline e la sovrappone
    // con datiEvento.clear() svuota la timeline

    // recupero la card originale pulida dalla descrizione
    document.getElementById('info').innerHTML = descrizione

};

caricaDatabase();
