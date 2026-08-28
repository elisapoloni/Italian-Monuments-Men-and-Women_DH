// dichiaro la funzione per caricare i components
async function caricaComponenti() {    
    // navbar
    const responseNav = await fetch("components/navbar.html"); // la variabile che chiamo responseNav contiene la risposta del fetch = oggetto response
    const htmlNav = await responseNav.text(); // con .text() trasformo l'oggetto response in un testo
    document.getElementById("navbar-placeholder").innerHTML = htmlNav; 
    // document = oggetto che rappresenta l'intero documento HTML
    // getElementById = metodo per selezionare un elemento HTML tramite il suo id 
    // innerHTML = proprietà che permette di inserire un contenuto HTML all'interno dell'elemento selezionato
    // inserisco htmlNav all'interno dell'elemento con id="navbar-placeholder"

    // footer
    const responseFoot = await fetch("components/footer.html");
    const htmlFoot = await responseFoot.text();
    document.getElementById("footer-placeholder").innerHTML = htmlFoot;

    // window = oggetto che rappresenta la finestra del browser 
    // location = proprietà che rappresenta l'URL della pagina corrente
    // pathname = proprietà che rappresenta il percorso dell'URL (https://elisapoloni.github.io/Italian-Monuments-Men-and-Women/protagonisti.html)
    // window.location.pathname = prende il percorso dopo il dominio (Italian-Monuments-Men-and-Women/protagonisti.html)
    // split("/") = metodo che taglia la stringa ogni volta che vede "/", creando un array di stringhe (["Italian-Monuments-Men-and-Women", "protagonisti.html"])
    // pop() = metodo che prende l'ultimo elemento dell'array -> prende l'ultimo pezzo di lista (protagonisti.html)
    const percorso = window.location.pathname.split("/").pop();
    const paginaAttuale = percorso === "" ? "index.html" : percorso; //CONDIZIONE ? VALORE SE VERO : VALORE SE FALSO
    // la variabile che abbiamo chiamato percorso è uguale a un testo vuoto? 
    // se vero: assegna alla variabile che abbiamo chiamato paginaAttuale il valore "index.html"
    // se falso (es: c'è scritto "protagonisti.html"): assegna alla variabile che abbiamo chiamato paginaAttuale il valore che è stato trovato

    // recuperiamo dati dal JSON per sapere i nomi dei protagonisti da mettere nei breadcrumbs senza dover aggiornare manualmente nomiPagine
    const response = await fetch("json/database.json");
    const data = await response.json();

    // richiamo le funzioni e gli passo il risultato che ho calcolato nella variabile paginaAttuale 
    gestisciLinkAttivo(paginaAttuale);
    generaBreadcrumbs(paginaAttuale, data.persone);
    //l'argomento (paginaAttuale) è il risultato del calcolo che avevo fatto nella variabile precedente 
    //lo inserisco nel richiamo della funzione in modo che abbia le info che gli servono
    //il parametro (pagina) invece è un'etichetta, un segnaposto che sarà poi occupato dal risultato del calcolo che gli chiedo di fare quando la funzione viene eseguita
}

//dichiaro la funzione che gestisce i breadcrumbs
function generaBreadcrumbs(pagina, persone) {
    // creo una variabile che si chiama placeholder e che contiene tutti gli elementi html con id="breadcrumb-placeholder"
    const placeholder = document.getElementById("breadcrumb-placeholder");
    if (!placeholder) return; // se non c'è il placeholder return = esce dalla funzione senza fare nulla

    // creo una variabile (costante) che si chiama nomiPagine che contiene tutti i nomi delle pagine (da aggiornare manualmente se aggiungo)
    const nomiPagine = {
        "index.html": "Home",
        "protagonisti.html": "Protagonisti",
        "mappa.html": "Mappa interattiva",
        "tempo.html": "Linea del tempo",
        "network.html": "Network"
    };

    // creo una variabile (che cambia in base al risultato del calcolo) che si chiama htmlBread che contiene il codice html dei breadcrumbs
    // cominciamo con Home perchè ogni pagina parte da qui
    let htmlBread = `<li class="breadcrumb-item"><a class="link" href="index.html">Home</a></li>`;

    // se il parametro che abbiamo calcolato è uguale a index.html oppure è uguale a vuoto siamo nella pagina home
    //andiamo a mettere quindi quello che abbiamo definito nella variabile htmlBread e basta (return)
    if (pagina == "index.html" || pagina == "") {
        placeholder.innerHTML = htmlBread;
        return; 
    }

    // creo una variabile che chiamo titolo ed è il risultato del calcolo che chiedo = nell'elenco che ho creato prima deve trovare quello che corrisponde a pagina
        let titolo = nomiPagine[pagina];
        //se titolo è diverso da indefinito, allora aggiungo a htmlBread quello che scrivo di seguito
        // ${titolo} placeholder dove inserisco quello che viene calcolato dalla variabile che chiamo titolo
        if (titolo != undefined) {
            htmlBread += `<li class="breadcrumb-item active">${titolo}</li>`;
        }
        
    else {
        //creo una variabile che contiene una stringa vuota
        let nomeProtagonista = "" ;
        //avvio un ciclo
        for (let i = 0; i < persone.length; i++) {
        // se il cognome della persona i-esima + .html è uguale alla pagina attuale...
            if (persone[i].cognome.toLowerCase() + ".html" == pagina) {
                //...allora in quella stringa vuota che avevo definito prima inserico quello che calcolo adesso = nome + spazio + cognome
                nomeProtagonista = persone[i].nome + " " + persone[i].cognome;
            }
        }
    
        //se nel calcolo che abbiamo fatto prima esce un risultato, quindi non risulta una stringa vuota...
        if (nomeProtagonista != "") {
            //...allora aggiungo al risultato della variabile che ho calcolato prima (nomeProtagonista) quello che segue
            htmlBread += `<li class="breadcrumb-item"><a href="protagonisti.html">Protagonisti</a></li>`;
            htmlBread += `<li class="breadcrumb-item active">${nomeProtagonista}</li>`;

        }
    }

    placeholder.innerHTML = htmlBread;

}

//dichiaro la funzione. parametro (pagina) è segnaposto che riceverà il nome del file attuale (es: "mappa.html") dalla funzione caricaComponenti
function gestisciLinkAttivo(pagina) {
    // prende tutti i link che hanno la classe .nav-link o .dropdown-item
    // querySelectorAll = lista (array); diverso da getElementById che prende un solo elemento
    let links = document.querySelectorAll('.nav-link, .dropdown-item');

    // avvia ciclo
    for (let i = 0; i < links.length; i++) {
        
        // creo variabile che contiene il link che viene analizzato per ogni ciclo
        // i = 0 quindi il primo ciclo analizza il primo link quindi linkCorrente = home
        // i = 1 quindi il secondo ciclo analizza il secondo link quindi linkCorrente = protagonisti, ecc.
        let linkCorrente = links[i];

        // creo una variabile che si chiama destinazioneLink che prende quello che ho calcolato con la variabile appena prima e va a recuperare l'attributo href di quel link
        let destinazioneLink = linkCorrente.getAttribute('href');

        // se il link che ho appena calcolato mi porta alla pagina dove mi trovo...
        if (destinazioneLink == pagina) {
            
            // ...allora aggiungo la classe 'active'
            linkCorrente.classList.add('active');

            // se il percorso che ho appena calcolato è contenuto in un menu a tendina...
            if (linkCorrente.classList.contains('dropdown-item')) {
                
                // creo una variabile che dal link risale al contenitore del dropdown (attraverso la classe nav-item dropdown)
                let contenitoreDropdown = linkCorrente.closest('.nav-item.dropdown');
                
                // creo una variabile che dal contenitore risale al bottone principale "Esplora" (attraverso la classe nav-link)
                let linkPrincipale = contenitoreDropdown.querySelector('.nav-link');
                
                // ...aggiungo active al bottone "Esplora"
                linkPrincipale.classList.add('active');
            }
        
        // altrimenti rimuovi la classe active
        } else {
            linkCorrente.classList.remove('active');
        }
    }
}

// richiamo la funzione
caricaComponenti();