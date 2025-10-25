$(() => {
    // --- GESTION DES COOKIES --- //
    const setCookie = (name, value, days = 365) => {
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

    // --- VARIABLES --- //
    let fil = "";
    let prom = "";
    let spe = "";
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
        "Chimie L3" : ["LAS", "LAS Métiers de l'enseignement", "Métiers de l'enseignement"]
    }

    const new_file_avec_spe = [];

    for (const fil in fil_avec_spe) {
        const specialites = fil_avec_spe[fil];
        for (const spe of specialites) {
            new_file_avec_spe.push(`${fil} ${spe}`);
        }
    }

    console.log(new_file_avec_spe);

    // Mets à jour le titre pour mettre la filière
    const majTitre = () => {
        if(ajouterSpécialité() && fil && prom){
            $("#titre_fil_prom").text(`${fil} ${prom} ${spe}`);
        }else{
            $("#titre_fil_prom").text("Sélectionne ta filière et ta promotion")
        }
        
    };

    // Construis les tableaux avec les données dans data.json
    const setTabs = () => {
        let semestres;

        tab.eq(0).empty();
        tab.eq(1).empty();
        $("#calcul_moyenne").hide();

        setKey();
        
        console.log(key);

        if (data[key] && ajouterSpécialité()) {
            $("#calcul_moyenne").show();
               
            semestres = Object.keys(data[key]);

            for (let i = 0; i < tab.length; i++) {
                console.log("Yes");
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


    // Méthode qui ajoute les spécialités si besoin
    const ajouterSpécialité = () => {
        if (key in fil_avec_spe) {
            console.log("NOK");
            $("#specialite_select").empty();
            $("#specialite_select").append(
                `<option selected disabled value="">Choisir la spécialité</option>`
            );

            for (let i = 0; i < fil_avec_spe[key].length; i++) {
                const spe = fil_avec_spe[key][i];
                $("#specialite_select").append(`<option value="${spe}">${spe}</option>`);
            }

            $("#specialite").show();
            return false;
        } else if(new_file_avec_spe.includes(key)){
            console.log("in");
            return true;
        } else {
            console.log("OK");
            
            $("#specialite").hide().val("");
            return true;
        }
    };

    const resetSpe = () =>{
        spe = "";
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
    $("#filiere_select").on("change", function () {
        fil = $(this).val();
        setCookie("fil", fil);
        resetSpe();
        setTabs();
        majTitre();
    });

    $("#promotion_select").on("change", function () {
        prom = $(this).val();
        setCookie("prom", prom);
        resetSpe();
        setTabs();
        majTitre();
    });

    $("#specialite_select").on("change", function () {
        spe = $(this).val();
        setCookie("spe", spe);
        setTabs();
        majTitre();
    });

    // Mise à jour dynamique moy_sem
    $(document).on("input", "#tab_moyenne0", function() {
        majMoySem(0);
        majMoyGen();
    });
    $(document).on("input", "#tab_moyenne1", function() {
        majMoySem(1);
        majMoyGen()
    });

    $.getJSON("data.json", function(datas) {
        data = datas;

        fil = getCookie("fil");
        prom = getCookie("prom");
        spe = getCookie("spe");

        if (fil) $("#filiere_select").val(fil);
        if (prom) $("#promotion_select").val(prom);
        if (spe) $("#specialite_select").val(spe);

        majTitre();
        setTabs();
    });

});
