import pandas as pd
import json

# Ouvre le fichier ODS avec pandas
fichier = "allcoeff.ods"
ods = pd.ExcelFile(fichier, engine="odf")

# Liste les noms des feuilles
print(ods.sheet_names)

result = {}

# Pour lire chaque feuille du fichier ods :
for nom_feuille in ods.sheet_names:
    df = pd.read_excel(ods, sheet_name=nom_feuille, engine="odf", header=None)

    # retire les espaces inutiles
    df = df.map(lambda x: x.strip() if isinstance(x, str) else x)


    current_annee = None
    current_semestre = None

    for _, ligne in df.iterrows():
        val0 = str(ligne.iloc[0]) if not pd.isna(ligne.iloc[0]) else ""
        val1 = str(ligne.iloc[1]) if not pd.isna(ligne.iloc[1]) else ""
        val2 = str(ligne.iloc[2]) if not pd.isna(ligne.iloc[2]) else 0

        # Vérifie si la ligne marque un changement d'année/semestre
        if val0 == "-":
            
            current_annee = str(val1)
            current_semestre = str(val2)

            if current_annee not in result:
                result[current_annee] = {}

            result[current_annee][current_semestre] = {
                "maj": 0,
                "min": 0,
                "tra": 0,
                "cours": [],
                "coeff": []
            }
        else:
            type_cours = str(val1)
            coeff = val2

            if type_cours == 'M':
                result[current_annee][current_semestre]["maj"] += 1
            elif type_cours == 'm':
                result[current_annee][current_semestre]["min"] += 1
            elif type_cours == 'T':
                result[current_annee][current_semestre]["tra"] += 1

            result[current_annee][current_semestre]["cours"].append(str(val0))
            result[current_annee][current_semestre]["coeff"].append(int(coeff))

# Écriture JSON
with open("data.json", "w", encoding="utf-8") as f:
    json.dump(result, f, indent=4, ensure_ascii=False)
