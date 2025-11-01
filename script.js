$(() => {
    // --- GESTION DES COOKIES --- //
    const setCookie = (name, value, days = 240) => {
        const d = new Date();
        d.setTime(d.getTime() + (days*24*60*60*1000));
        const expires = "expires=" + d.toUTCString();
        document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/`;
    };

    const getCookie = (name) => {
        const cookies = document.cookie.split(';');
        for (let c of cookies) {
            c = c.trim();
            if (c.startsWith(name + "=")) {
                return decodeURIComponent(c.substring(name.length + 1));
            }
        }
        return "";
    };

    const deleteCookie = (name) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    };

    // --- VARIABLES --- //
    let fil = "";
    let prom = "";
    let spe = "";
    let ufr = "";
    let key = "";
    const tab = $("#tab table");
    let data = [];

    const fil_avec_spe = {
        "Sciences de la Vie L1" : ["LAS"],
        "Sciences de la Vie L2" : ["LAS Voie A", "LAS Voie B"],
        "Sciences de la Vie L3" : ["LAS"],
        "Mathématiques L1" : ["LAS"],
        "Mathématiques L2" : ["LAS Voie A","LAS Voie B", "Métiers de l'enseignement"],
        "Mathématiques L3" : ["LAS", "Métiers de l'enseignement"],
        "Chimie L1" : ["LAS"],
        "Chimie L2" : ["LAS Voie A","LAS Voie B", "Métiers de l'enseignement"],
        "Chimie L3" : ["LAS", "LAS Métiers de l'enseignement", "Métiers de l'enseignement"],
        "Sciences Sociales L1" : ["LAS"],
        "Sciences Sociales L2" : ["LAS Voie A","LAS Voie B"],
        "Sciences Sociales L3" : ["LAS"],

    }

    // Création d'un tableau avec le nom des filières avec spécialités
    // TODO le faire que dans la fonction ajouterSpécialités()
    const new_file_avec_spe = [];

    for (const fil in fil_avec_spe) {
        const specialites = fil_avec_spe[fil];
        for (const spe of specialites) {
            new_file_avec_spe.push(`${fil} ${spe}`);
        }
        console.log(new_file_avec_spe);
    }

    // Mets à jour le titre pour mettre la filière
    const majTitre = () => {
        if(ufr==""){
            $("#titre_fil_prom").text("Sélectionne ton UFR");
        } else if(!fil || !prom){     
            $("#titre_fil_prom").text("Sélectionne ta filière et ta promotion");
        } else if(ajouterSpécialité()){
            $("#titre_fil_prom").text(`${fil} ${prom} ${spe}`);
        }        
        else {
            $("#titre_fil_prom").text("Sélectionne ta spécialité");
        }
            
    };

    // = Gestion cookies pour les notes
    const saveNotes = () => {
        let allNotes = {};
        // On parcourt les tableaux
        for (let i = 0; i < 2; i++) {
            allNotes[`sem${i}`] = [];
            $(`#tab_moyenne${i} tbody tr`).each(function () {
                const note = $(this).find("input.note_input").val();
                allNotes[`sem${i}`].push(note);
            });
        }
        setCookie("notes_" + key, JSON.stringify(allNotes));
        console.log("Notes sauvegardées pour", key, allNotes);
    };

    const restoreNotes = () => {
        const cookieData = getCookie("notes_" + key);
        if (!cookieData) return;
        try {
            const notes = JSON.parse(cookieData);
            for (let i = 0; i < 2; i++) {
                const semNotes = notes[`sem${i}`] || [];
                $(`#tab_moyenne${i} tbody tr`).each(function (index) {
                    $(this).find("input.note_input").val(semNotes[index] || 0);
                });
                majMoySem(i);
            }
            majMoyGen();
            console.log("Notes restaurées pour", key);
        } catch (e) {
            console.error("Erreur de restauration des notes :", e);
        }
    };

    const resetNotesCookies = () => {
        for (const c of document.cookie.split(";")) {
            const name = c.split("=")[0].trim();
            if (name.startsWith("notes_")) deleteCookie(name);
        }
    };

    // Construis les tableaux avec les données dans data.json
    const setTabs = () => {

        // Si UFR non sélectionnée : Règle problème avec nouvie cookie ufr et ancien user
        if (!ufr) {
            resetTabs(); // vide les tableaux au cas où
            return;
        }
        
        let semestres;

        resetTabs();
        setKey();
        
        console.log(key);

        if (data[key] && ajouterSpécialité()) {
            $("#calcul_moyenne").show();
               
            semestres = Object.keys(data[key]);

            for (let i = 0; i < tab.length; i++) {
                // On rajoute un id avec le numéro pour le calcul de la moyenne
                tab.eq(i).attr("id", "tab_moyenne" + i);

                // On vide les tableaux
                tab.eq(i).empty();
            
                // 1 - On ajoute les en-têtes
                tab.eq(i).append(`
                    <thead>
                        <tr><th colspan="4" class="lexend_bold">`+semestres[i]+`</th></tr>
                        <tr>
                            <th colspan="2" class="lexend_bold">Intitulé UE</th>
                            <th class="lexend_bold" style="width:10%;">ECTS</th>
                            <th class="lexend_bold" style="width:15%;">NOTE</th>
                        </tr>
                    </thead>
                `);

                // 2a - On ajoute le body des tableaux
                // Ouverture tbody
                tab.eq(i).append("<tbody>");
                // 2 - On récupère le nombre de maj min tra
                const semKey = semestres[i];
                const maj = data[key][semKey]["maj"];
                const min = data[key][semKey]["min"];
                const tra = data[key][semKey]["tra"];
                let ligneIndex = 0;

                const tbody = $("<tbody>");

                // Pour les maj
                for (let j = 0; j < maj; j++, ligneIndex++) {
                    tbody.append(`
                        <tr>
                            ${j === 0 ? `<td class="lexend_bold text_center maj0" rowspan="${maj}">M</td>` : ""}
                            <td class="lexend_bold text_left maj1">${data[key][semKey]["cours"][j]}</td>
                            <td class="tab_align_center lexend_normal text_center maj2">${data[key][semKey]["coeff"][j]}</td>
                            <td class="text_center maj3" id="note_${i}_${ligneIndex}"><input class="lexend_normal text_center note_input" type="number" min=0 max=20 value=0></td>
                        </tr>
                    `);
                }

                // Pour les min
                for (let j = 0; j < min; j++, ligneIndex++) {
                    tbody.append(`
                        <tr>
                            ${j === 0 ? `<td class="lexend_bold text_center min0" rowspan="${min}">m</td>` : ""}
                            <td class="lexend_bold min1">${data[key][semKey]["cours"][maj + j]}</td>
                            <td class="tab_align_center lexend_normal text_center min2">${data[key][semKey]["coeff"][maj + j]}</td>
                            <td class="text_center min3" id="note_${i}_${ligneIndex}"><input class="lexend_normal text_center note_input" type="number" min=0 max=20 value=0></td>
                        </tr>
                    `);
                }

                // Pour les tra
                for (let j = 0; j < tra; j++, ligneIndex++) {
                    tbody.append(`
                        <tr>
                            ${j === 0 ? `<td class="lexend_bold text_center tra0" rowspan="${tra}">T</td>` : ""}
                            <td class="lexend_bold text_left tra1">${data[key][semKey]["cours"][maj + min + j]}</td>
                            <td class="tab_align_center lexend_normal text_center tra2">${data[key][semKey]["coeff"][maj + min + j]}</td>
                            <td class="text_center tra3" id="note_${i}_${ligneIndex}"><input class="lexend_normal text_center note_input" type="number" min=0 max=20 value=0></td>
                        </tr>
                    `);
                }

                // Et là, on ajoute le vrai tbody au tableau
                tab.eq(i).append(tbody);

                // 3 - Les foot
                tab.eq(i).append(`
                    <tfoot>
                        <tr>
                            <th class="lexend_bold" colspan="3">Moyenne semestre</th>
                            <th class="lexend_bold" id="calcul_moyenne_sem_${i}">0.000</th>
                        </tr>
                    </tfoot>
                `);
            }

            // Affiche le bouton/calcul
            $("#calcul_moyenne").show();            

            return;

        }
    };

    // Construits et affiche les listes dérouantes pour décider de sa filière 
    const setListes = () => {

        $("#filiere_select").empty()

        switch(ufr){
            case "st":
                $("#filiere_select").append(`
                <option selected disabled class="placeholder">Choisir la filière</option>
                <option value="Chimie">Chimie</option>
                <option value="Informatique">Informatique</option>
                <option value="Mathématiques">Mathématiques</option>
                <option value="MIASHS">MIASHS</option>
                <option value="Physique">Physique</option>
                <option value="SPI">SPI</option>
                <option value="Sciences de la Terre">Sciences de la Terre</option>
                <option value="Sciences de la Vie">Sciences de la Vie</option>
                <option value="Prof Agronomie">Prof Agronomie</option>
                `);
                break;
            case "de":
                $("#filiere_select").append(`
                    <option selected disabled class="placeholder">Choisir la filière</option>
                    <option value="Administration Economique et Sociale (AES)">Administration Economique et Sociale (AES)</option>
                    <option value="AES Licence Accès Santé (LAS)">AES Licence Accès Santé (LAS)</option>
                    <option value="Economie Gestion">Economie Gestion</option>
                    <option value="MIASHS">MIASHS</option>
                    <option value="Adaptation Technicien Supérieur (ATS)">Adaptation Technicien Supérieur (ATS)</option>
                    <option value="Classes Préparatoires aux Études Supérieures (CPES)">Classes Préparatoires aux Études Supérieures (CPES)</option>
                    <option value="Droit">Droit</option>
                    <option value="Droit Classes préparatoires aux grandes écoles (CPGE)">Droit Classes préparatoires aux grandes écoles (CPGE)</option>
                    <option value="Droit Licence Accès santé (LAS)">Droit Licence Accès santé (LAS)</option>
                    <option value="Licence Administration Publique (LAP)">Licence Administration Publique (LAP)</option>
                    <option value="Parcours Préparatiore au Professorat des Ecoles (PPPE)">Parcours Préparatiore au Professorat des Ecoles (PPPE)</option>
                `);
                break;
            case "lsh":
                $("#filiere_select").append(`        
                    <option selected disabled class="placeholder">Choisir la filière</option>
                    <option value="LLCER Allemand">LLCER Allemand</option>
                    <option value="LLCER Franco-Allemand">LLCER Franco-Allemand</option>
                    <option value="LLCER Anglais">LLCER Anglais</option>
                    <option value="LEA Anglais-Chinois">LEA Anglais-Chinois</option>
                    <option value="LLCER Créole">LLCER Créole</option>
                    <option value="LLCER Espagnol">LLCER Espagnol</option>
                    <option value="Géographie">Géographie</option>
                    <option value="Histoire">Histoire</option>
                    <option value="Information - Communication">Information - Communication</option>
                    <option value="Lettres">Lettres</option>
                    <option value="Sciences Sociales">Sciences Sociales</option>
                    `);
                break;
            case "she":
                $("#filiere_select").append(`
                    <option selected disabled class="placeholder">Indisponible</option>
                `);
                break;
            case "sante":
                $("#filiere_select").append(`
                    <option selected disabled class="placeholder">Indisponible</option>
                `);
                break;
        }
    }

    // Méthode qui ajoute les spécialités si besoin
    const ajouterSpécialité = () => {
        if (spe!=" " && key in fil_avec_spe) {
            $("#specialite_select").empty();
            $("#specialite_select").append(`
                <option selected disabled value="">Choisir la spécialité</option>
                <option value = " ">Aucune</option>
            `);

            for (let i = 0; i < fil_avec_spe[key].length; i++) {
                const spe = fil_avec_spe[key][i];
                $("#specialite_select").append(`<option value="${spe}">${spe}</option>`);
            }

            $("#specialite").show();
            return false;
        } else if(new_file_avec_spe.includes(key) || spe == " "){
            return true;
        } else {
            
            $("#specialite").hide().val("");
            return true;
        }
    };

    const resetSpe = () =>{
        spe = "";
        setCookie("spe", "");
    }

    const resetFilAndProm = () =>{
        fil = "";
        prom = "";
        setCookie("prom", "");
        setCookie("fil", "");

        $("#promotion_select").prop("selectedIndex", 0);
        $("#filiere_select").prop("selectedIndex", 0);
    }

    const resetTabs = () => {
        tab.eq(0).empty();
        tab.eq(1).empty();
        $("#calcul_moyenne").hide();
    }

    // Calcule la moyenne de chaque tab
    const majMoySem = (i) => {
        let sommeNotes = 0;
        let sommeECTS = 0;

        const semKey = Object.keys(data[key])[i];

        // Parcours des lignes du tableau i
        $(`#tab_moyenne${i} tbody tr`).each(function(j){
            let note = parseFloat($(this).find("input.note_input").val()) || 0;
            let coeff = parseFloat(data[key][semKey]["coeff"][j]) || 0;

            sommeNotes += note * coeff;
            sommeECTS += coeff;

        });

        const moyenne = sommeECTS > 0 ? (sommeNotes / sommeECTS).toFixed(3) : "0.000";
        $(`#calcul_moyenne_sem_${i}`).text(moyenne);
    };

    const majMoyGen = () =>{
        
        let moy1 = parseFloat($("#calcul_moyenne_sem_0").text()) || 0;
        let moy2 = parseFloat($("#calcul_moyenne_sem_1").text()) || 0;

        $("#moy_gen").text("MOYENNE GENÉRALE : "+((moy1 + moy2) / 2).toFixed(3));
    
        //easterEgg();
    };

    // Chimie L2 + Chimie L2 LAS 
    // + Chimie L2 Métiers enseignements 
    // + Chimie L2 LAS Métiers enseignements 
    // ==> Pour éviter de tous les mettre dans la liste, on affine
    // le premier questionnaire
    InfosRemplies = () => {
    };

    //Pour avoir l'indice dans le dictionnaire
    const setKey = () => {
        key = (fil + " " + prom + " " + spe).trim()
    };

    // Évènements sur les selects
    $("#ufr_select").on("change", function () {
        ufr = $(this).val();
        setCookie("ufr", ufr);
        resetFilAndProm();
        resetNotesCookies();
        setListes();
        resetTabs();
        setTabs();
        majTitre();
        $(".choix_fil_prom").css("display", "block");
    });

    $("#filiere_select").on("change", function () {
        fil = $(this).val();
        setCookie("fil", fil);
        resetSpe();
        resetNotesCookies();
        setTabs();
        majTitre();
    });

    $("#promotion_select").on("change", function () {
        prom = $(this).val();
        setCookie("prom", prom);
        resetSpe();
        resetNotesCookies();
        setTabs();
        majTitre();
    });

    $("#specialite_select").on("change", function () {
        spe = $(this).val();
        setCookie("spe", spe);
        resetNotesCookies();
        setTabs();
        majTitre();
    });

    // Mise à jour dynamique moy_sem
    $(document).on("input", ".note_input", function () {
        majMoySem(0);
        majMoySem(1);
        majMoyGen();
        saveNotes();
    });

    $.getJSON("data.json", function(datas) {
        data = datas;

        fil = getCookie("fil");
        prom = getCookie("prom");
        spe = getCookie("spe");
        ufr = getCookie("ufr");

        if (spe) $("#specialite_select").val(spe);
        if (ufr) {
            $("#ufr_select").val(ufr);
            $(".choix_fil_prom").css("display","block");
        }

        majTitre();
        setTabs();
        restoreNotes();
        setListes();
        
        if (fil) $("#filiere_select").val(fil);
        if (prom) $("#promotion_select").val(prom);

    });

});


