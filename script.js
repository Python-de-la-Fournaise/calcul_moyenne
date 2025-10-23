$(() => {
    let fil = "";
    let prom = "";
    const tab = $("#tab table");

    let data = [];

    // Prend les données de data.json
    $.getJSON("data.json", function(datas) {
        data = datas;
        console.log(data);
    });

    const majTitre = () => {
        $("#titre_fil_prom").text(fil && prom ? `${fil} ${prom}` : "Sélectionne ta filière et ta promotion");
    };

    const majTabs = () => {
        // Si les deux choix sont faits
        if (fil && prom) {
            let key = fil+" "+prom;
            let semestres = Object.keys(data[key])
    
            for (let i = 0; i < tab.length; i++) {
                // On vide les tableaux
                tab.eq(i).empty();
            
                // On ajoute les en-têtes
                tab.eq(i).append(`
                    <thead>
                        <tr><th colspan="4">`+semestres[i]+`</th></tr>
                        <tr>
                            <th colspan="2">Intitulé UE</th>
                            <th style="width:10%;">ECTS</th>
                            <th style="width:20%;">Note</th>
                        </tr>
                    </thead>
                `);

                // On ajoute le contenu des tableaux
                // Ouverture tbody
                tab.eq(i).append("<tbody>");
                // 1 - On récupère le nombre de maj min tra
                let semKey = semestres[i]
                let maj = data[key][semKey]["maj"];
                let min = data[key][semKey]["min"];
                let tra = data[key][semKey]["tra"];
                
                // 1a - pour les maj
                for (let j = 0; j < maj; j++) {
                    tab.eq(i).append(`
                        <tr>
                            ${j === 0 ? `<th rowspan="${maj}">M</th>` : ""}
                            <th>${data[key][semKey]["cours"][j]}</th>
                            <th>${data[key][semKey]["coeff"][j]}</th>
                            <th><input type="number" min=0 max=20 class="note1" value=0></th>
                        </tr>
                    `);
                }

                // 1b - pour les min
                for (let j = 0; j < min; j++) {
                    tab.eq(i).append(`
                        <tr>
                            ${j === 0 ? `<th rowspan="${min}">m</th>` : ""}
                            <th>${data[key][semKey]["cours"][maj + j]}</th>
                            <th>${data[key][semKey]["coeff"][maj + j]}</th>
                            <th><input type="number" min=0 max=20 class="note1" value=0></th>
                        </tr>
                    `);
                }

                // 1c - pour les tra
                for (let j = 0; j < tra; j++) {
                    tab.eq(i).append(`
                        <tr>
                            ${j === 0 ? `<th rowspan="${tra}">t</th>` : ""}
                            <th>${data[key][semKey]["cours"][maj + min + j]}</th>
                            <th>${data[key][semKey]["coeff"][maj + min + j]}</th>
                            <th><input type="number" min=0 max=20 class="note1" value=0></th>
                        </tr>
                    `);
                }

            
                // 1 - Les foot

                // Fermeture tbody
                tab.eq(i).append("</tbody>");
            }

            // Affiche le bouton/calcul
            $("#calcul_moyenne").css("visibility", "visible");

        } else {
            // Cache le bouton/calcul
            $("#calcul_moyenne").css("visibility", "hidden");
        }
    };




    // Évènements sur les selects
    $("#filiere_select").on("change", function () {
        fil = $(this).val();
        majTitre();
        majTabs();
    });

    $("#promotion_select").on("change", function () {
        prom = $(this).val();
        majTitre();
        majTabs();
    });
});
