//variabili vuote fuori dalle funzioni perchè servono a tutto il codice
let protagonisti = []; // [] perchè deve contenere un array
let database = null; // null perchè deve contenere il JSON che è un oggetto complesso

// funzione per caricare i dati dal JSON -> async permette di usare await
// dichiarazione della funzione
async function caricaDatabase() {
    // await = aspetta che la funzione fetch finisca di leggere il file prima di andare avanti
    // fetch = funzione che va a prendere i dati nel file JSON
    // creo una variabile che si chiama response e che contiene la risposta della funzione fetch
  const response = await fetch("json/database.json");
  // creo un'altra variabile che si chiama data e che contiene la risposta del fetch MA convertita in oggetto JavaScript con response.json()
  const data = await response.json(); 
  
  // prendiamo dal JSON solo le info che riguardano le persone; data è l'intero database, data.persone è l'array che contiene solo le persone
  // mostraProtagonisti è una funzione; data.persone è l'argomento: inserisco nella funzione mostraProtagonis
  // dico di andare a vedere nell'oggetto data solo le persone e di passare quelle informazioni alla funzione mostraProtagonistiti i dati che riguardano le persone
  // inserisco questi dati dentro la variabile vuota che avevo creato prima
  protagonisti = data.persone;
  database = data
  creaMenuFiltri();
  mostraProtagonisti(protagonisti); // richiamo la funzione passandogli i dati che ho appena recuperato e che ho inserito nel contenitore chiamato "protagonisti"
}

function mostraProtagonisti(protagonisti) {
 // variabile che contiene il codice che viene appena dopo = il ciclo e il contenuto delle card
  let cardProtagonisti = "";
  // ciclo che scorre tutti i protagonisti e prendere le info che servono
  // let i = 0 inizializza la variabile prima che parta il ciclo. i è la posizione 0 nell'array, il primo elemento
  // i < protagonisti.length definisce la condizione per cui il ciclo continua a girare
  // i++ incrementa la variabile i di 1 ad ogni giro del ciclo
  // protagonisti.length = lunghezza dell'array protagonisti
  // il ciclo continua finchè i è minore della lunghezza dell'array protagonisti
  for (let i = 0; i < protagonisti.length; i++) {
    const p = protagonisti[i];
    
    if (p.ruolo_card === "protagonista" && p.img){
    
        cardProtagonisti +=
        // cardProtagonisti += significa che deve aggiungere al contenuto della variabile cardProtagonisti (il risultato dei cicli) il codice che segue
        // ` = backtick, serve per scrivere il codice HTML
            `<!--col-12 = su schermo piccolo le card occupano tutta la larghezza
                col-sm-6 = su schermo medio occupano metà della larghezza
                col-lg-4 = su schermo grande occupano 4 su 12 quindi 1/3 -->
            <!--d-flex align-items-stretch = allinea le card in modo che siano tutte alte uguali-->
            <div class="col-12 col-sm-6 col-lg-4 d-flex align-items-stretch">
                
                <div class="card card-protagonisti w-100 mb-4 text-dark">
                    <!-- va nella cartella immagini e per ogni ciclo a partire da i = 0,
                    prende l'immagine relativa a quella persona grazie alla chiave img nel file JSON -->
                    <img src="img/${protagonisti[i].img}" class="card-img-top" alt="${protagonisti[i].nome} ${protagonisti[i].cognome}">
                    
                    <div class="card-body d-flex flex-column text-center"> <!-- d-flex flex-column = dispone gli elementi in colonna uno sopra l'altro-->
                        <h4 class="card-title"><b>${protagonisti[i].nome} ${protagonisti[i].cognome}</b></h4>
                        <p class="card-text text-muted flex-grow-1" style="text-align:justify; font-size: 0.9rem;">
                            ${protagonisti[i].ruolo}
                        </p> <!-- text-muted = testo grigio; flex-grow-1 = riepie lo spazio disponibile per spingere il bottone in basso in modo che siano tutti allineati-->
                        
                        <div class="mt-3">
                            <a href="${protagonisti[i].cognome.toLowerCase()}.html" class="btn btn-dark w-100"><i class="bi bi-file-person me-2"></i>Scheda dettagliata</a>
                        </div>
                    </div>
                </div>
            </div>`;
    
        }
    }

    document.getElementById("container-protagonisti").innerHTML = cardProtagonisti;
    
}


function creaMenuFiltri() {
    let listaRuoli = [];

    // ciclo per trovare tutti i ruoli presenti nel JSON
    for (let i = 0; i < protagonisti.length; i++) {
        let ruolo = protagonisti[i].ruolo_filtri;
        let p = protagonisti[i];
    
    //includes() metodo di js per controllare se un valore è già presente nell'array
    //false = non è presente
    //.push() = inserisce nella lista il ruolo
    //in questo modo non ci saranno doppioni (esempio: se ci sono 8 soprintendenti e 5 direttori non ci sarà scritto 8 volte s e 5 volte d)
    if (listaRuoli.includes(ruolo) == false && p.ruolo_card === "protagonista") { // seconda condizione: è protagonista e non altro
            listaRuoli.push(ruolo);
        }
    }

    // crea il codice html per il filtro a tendina
    let htmlFiltroRuoli = "";
    for (let j = 0; j < listaRuoli.length; j++) {
        htmlFiltroRuoli += `
            <li>
                <label class="filter-item">
                    <input type="checkbox" class="form-check-input sceltaruolo" value="${listaRuoli[j]}"> 
                    ${listaRuoli[j]}
                </label>
            </li>`;
    }

    document.getElementById("filtro-ruolo").innerHTML = htmlFiltroRuoli;

    // variabile che recupera nell'html tutti gli elementi con classe .sceltaruolo
    //avvia ciclo e per ognuno applica il metodo che "ascolta gli eventi"
    //l'evento che deve ascoltare è "change", quando avviene deve fare quello che viene definito nella funzione applicaFiltro
    let checkbox = document.querySelectorAll(".sceltaruolo");
    for (let k = 0; k < checkbox.length; k++) {
        checkbox[k].addEventListener("change", applicaFiltro);
    }
}

function applicaFiltro() {
    // variabile che recupera i checkbox selezionati
    let checkboxSelezionati = document.querySelectorAll(".sceltaruolo:checked");
    //arraty che chiamo ruoliSelezionati e che lascio vuoto perchè sarà riempito dal codice che segue
    let ruoliSelezionati = [];
    
    //avvio un ciclo che controlla tutti i checkboxSelezionati
    for (let i = 0; i < checkboxSelezionati.length; i++) {
        //push aggiunge in fondo all'array ruoliSeleizonati quello che viene calcolato tra parentesi ()
        //fa passare tutti i checkboxSelezionati e va a leggere value 
        ruoliSelezionati.push(checkboxSelezionati[i].value);
    }

    //variabile con array vuoto
    let risultatiFiltrati = [];

    //se la lunghezza dei ruoliSelezionati è uguale a 0 (quindi non è selezionato niente)
    if (ruoliSelezionati.length == 0) {
        // risultatiFiltrati è uguale al risultato del fetch iniziale, quindi l'elenco dei protagonisti del json
        risultatiFiltrati = protagonisti;
    } else {
        // Altrimenti, avvia ciclo che controlla tutti i protagonisti 
        for (let j = 0; j < protagonisti.length; j++) {
            //se il ruolo del j-esimo protagonista è presente in ruoliSelezionati
            if (ruoliSelezionati.includes(protagonisti[j].ruolo_filtri)) {
                //allora inserisco alla fine dell'array risultatiFiltrati il j-esimo protagonista
                risultatiFiltrati.push(protagonisti[j]);
            }
        }
    }

    // funzione viene richiamata ma al posto di dare tutti i dati del json dò quello che ho appena calcolato
    mostraProtagonisti(risultatiFiltrati);
}

function resetFiltri() {
    // cerca tutti i checkbox della pagina
    // uso form-check-input in modo da andare a prendere tutti i checkbox
    let tuttiICheckbox = document.querySelectorAll(".form-check-input");

    // avvia un ciclo che fa passare tutti i checkbox
    for (let i = 0; i < tuttiICheckbox.length; i++) {
        // .checked è una proprietà booleana dell'elemento html (booleana = può avere solo due stati: true (vero/acceso) o false (falso/spento))
        // = false -> toglie la spunta blu dal quadratino
        tuttiICheckbox[i].checked = false;
    }

    // richiamo la funzione
    mostraProtagonisti(protagonisti);
}

// dico al bottone Reset di ascoltare il click e applicare quello che ho definito nella funzione resetFiltri
// change è divero da click. change viene usato quando viene cliccato qualcosa che cambia valore; click invece per bottone che non cambia valore
document.getElementById("btn-reset").addEventListener("click", resetFiltri);



// richiamo la funzione
caricaDatabase();