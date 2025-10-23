$(() => {
    let fil = ""; 
    let prom = "";
    const tab = $("#tab table");

    let data = [];

    // Prend les données de data.json
    $.getJSON("data.json", function(datas){
        data = datas;
        console.log(data);
    });

    // Mets à jour le titre pour mettre la filière
    const majTitre = () => {
        $("#titre_fil_prom").text(fil && prom ? `${fil} ${prom}` : "Sélectionne ta filière et ta promotion");
    };

    // Construis les tableaux avec les données dans data.json
    const setTabs = () => {
        // Si les deux choix sont faits
        const key = fil + " " + prom;
        let semestres;

        if (data[key]) {    
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
                            ${j === 0 ? `<td class="lexend_bold text_center" rowspan="${maj}">M</td>` : ""}
                            <td class="lexend_bold text_left">${data[key][semKey]["cours"][j]}</td>
                            <td class="tab_align_center lexend_normal text_center">${data[key][semKey]["coeff"][j]}</td>
                            <td class="text_center" id="note_${i}_${ligneIndex}"><input class="lexend_normal text_center note_input" type="number" min=0 max=20 value=0></td>
                        </tr>
                    `);
                }

                // Pour les min
                for (let j = 0; j < min; j++, ligneIndex++) {
                    tbody.append(`
                        <tr>
                            ${j === 0 ? `<td class="lexend_bold text_center" rowspan="${min}">m</td>` : ""}
                            <td class="lexend_bold">${data[key][semKey]["cours"][maj + j]}</td>
                            <td class="tab_align_center lexend_normal text_center">${data[key][semKey]["coeff"][maj + j]}</td>
                            <td class="text_center" id="note_${i}_${ligneIndex}"><input class="lexend_normal text_center note_input" type="number" min=0 max=20 value=0></td>
                        </tr>
                    `);
                }

                // Pour les tra
                for (let j = 0; j < tra; j++, ligneIndex++) {
                    tbody.append(`
                        <tr>
                            ${j === 0 ? `<td class="lexend_bold text_center" rowspan="${tra}">T</td>` : ""}
                            <td class="lexend_bold text_left">${data[key][semKey]["cours"][maj + min + j]}</td>
                            <td class="tab_align_center lexend_normal text_center">${data[key][semKey]["coeff"][maj + min + j]}</td>
                            <td class="text_center" id="note_${i}_${ligneIndex}"><input class="lexend_normal text_center note_input" type="number" min=0 max=20 value=0></td>
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
            $("#calcul_moyenne").css("visibility", "visible");
            $("#en_cours").css("visibility", "hidden");

            return;

        } else {
            // On vide les tableaux
            tab.eq(0).empty();
            tab.eq(1).empty();
            // Cache le bouton/calcul
            $("#calcul_moyenne").css("visibility", "hidden");
            if(fil && prom) $("#en_cours").css("visibility", "visible");

            return;
        }

    };

    // Calcule la moyenne de chaque tab
    const majMoySem = (i) => {
        let sommeNotes = 0;
        let sommeECTS = 0;

        const key = fil + " " + prom;
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

        $("#moy_gen").text("Moyenne MOYENNE GENÉRALE : "+((moy1 + moy2) / 2).toFixed(3));
    }



    // Évènements sur les selects
    $("#filiere_select").on("change", function () {
        fil = $(this).val();
        majTitre();
        setTabs();
    });

    $("#promotion_select").on("change", function () {
        prom = $(this).val();
        majTitre();
        setTabs();
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

});

