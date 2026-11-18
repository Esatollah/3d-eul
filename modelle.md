# Modellnachweis

## Enthaltene Knochenmodelle

Die Datei `meshes.js` enthält Oberflächen aus dem OpenSim-Modell Gait2392 von Ajay Seth, Darryl Thelen, Frank C. Anderson und Scott L. Delp. OpenSim nennt für Gait2392 die Lizenz Creative Commons Namensnennung 3.0. [Modell und Lizenzangabe](https://opensimconfluence.atlassian.net/wiki/spaces/OpenSim/pages/53090607/Musculoskeletal+Models) · [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)

| Geometrie im Halsatlas | Originaldatei |
| --- | --- |
| Schädel | [hat_skull.vtp](https://github.com/opensim-org/opensim-models/blob/master/Geometry/hat_skull.vtp) |
| Unterkiefer | [hat_jaw.vtp](https://github.com/opensim-org/opensim-models/blob/master/Geometry/hat_jaw.vtp) |
| C1 bis C7 und T1 | [hat_spine.vtp](https://github.com/opensim-org/opensim-models/blob/master/Geometry/hat_spine.vtp) |
| Erste und zweite Rippe beider Seiten | [hat_ribs.vtp](https://github.com/opensim-org/opensim-models/blob/master/Geometry/hat_ribs.vtp) |

Für den Halsatlas wurden Oberflächen aus den VTK-Dateien in indizierte Dreiecke umgewandelt. Bei Wirbelsäule und Rippen wurden zusammenhängende Komponenten ausgewählt und die Indizes neu vergeben. Die Dateien verwenden Meter und bewahren die gemeinsame Lage im ursprünglichen Torso-Koordinatensystem. Die positive x-Achse zeigt nach ventral, die positive y-Achse nach kranial und die positive z-Achse zur rechten Körperseite. Die Darstellung färbt und skaliert die Oberflächen und ergänzt schematische Weichteile und Lernmarkierungen.

## Weitere geprüfte Modelle

BodyParts3D stellt einen umfangreichen anatomischen Referenzdatensatz mit einzeln adressierbaren Organ- und Muskeloberflächen bereit. Das offizielle Archiv veröffentlicht die Polygonmodelle von Version 4.0 und nennt für die bereitgestellten Daten die Lizenz CC BY 4.0. Die einzelnen benötigten OBJ-Dateien waren beim Erstellen über den verfügbaren Downloadzugang nicht abrufbar. [BodyParts3D-Download](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html) · [Lizenz](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html)

Z-Anatomy veröffentlicht einen umfassenderen Blender-Atlas unter CC BY-SA 4.0 und nennt BodyParts3D als Grundlage. Für diese lokal startbare Ausgabe wurde der kleinere, direkt eingebettete OpenSim-Ausschnitt gewählt. [Z-Anatomy und Herkunft der Modelle](https://github.com/Z-Anatomy/Models-of-human-anatomy/blob/master/License.txt)
