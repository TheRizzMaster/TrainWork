# TrainWork

## Funktionsumfang

### Was ist es?

**Trainwork** ist eine Progressive Web App (PWA), die es ermöglicht, produktive Arbeitsrouten für Zugreisen zu planen. Nutzer können auf einer einfach gehaltenen Nutzeroberfläche den Start- und Zielbahnhof sowie die gewünschte Reisezeit eingeben. Die App generiert daraufhin eine Route basierend auf dem Schweizer Bahnnetz, inklusive Fahrplandaten.

### Was kann es?

**Trainwork** nutzt den innovativen *Anywhere-to-Anywhere*-Algorithmus (Patent pending), um optimale Reiserouten zu erstellen. Basierend auf 17 strategischen Knotenpunkten essentieller Bahnhöfe generiert die App Reisen, die minimalen Umsteigeaufwand und maximalen Komfort bieten. So können Nutzer effizient, produktiv und stressfrei durch die Schweiz reisen.

- Routenplanung
- Suchvorschläge
- Optimierte Routenvorschläge
- Download als App möglich (PWA)

### Was kann es nicht?

Derzeit bietet **Trainwork** folgende Funktionen noch nicht: Reisen können weder exportiert noch geteilt werden. Ausserdem ist es noch nicht möglich, Filter wie Speisewagen, WLAN oder andere Annehmlichkeiten in die Suche einzubeziehen. Live-Daten wie Gleisänderungen, Störungen oder Zugausfälle müssen über die SBB-App überprüft werden.

## Learnings und Reflexion

### Learnings

Obwohl der HTML-Tag `<input type="datetime-local">` ein Standard ist, wird er von verschiedenen Browsern unterschiedlich interpretiert. In einigen Browsern ist es nicht möglich, die Zeit über eine grafische Benutzeroberfläche auszuwählen – sie muss stattdessen manuell eingegeben werden.

Bei Progressive Web Apps (PWA) müssen Lottie-Dateien immer im Voraus geladen werden. Das bedeutet, dass sie nicht einfach bei Bedarf durch DOM-Manipulation eingefügt werden können. Stattdessen sollte die Datei im Hintergrund geladen und vorbereitet werden, um sie anschließend über `display: block` sichtbar zu machen.

Python ist tatsächlich nicht so schnell.

### Reflexionen

### Jasper

Um eine produktionsreife Version dieser App erzielen zu können wären noch einige wichtige Arbeitsschritte notwendig:

- Ausgiebiges Testing des erstellten Prototyps
- Optimierung / Verbesserung des Algorithmus
- Standardisierung der Fahrplan Daten (GTFS)
- Implementierung von Nice to haves wie Live Daten (Gleisänderungen, Service alerts…)

Abschliessend lässt sich sagen,

### Siro

Um Edgecases richtig zu behandeln, muss man sich einfach einen Tag Zeit nehmen und überlegen, was manche Leute alles Falsch mit der App machen könnten und wie man das verhindern kann.

— Siro, 2025

Das Projekt hat sehr viel Spass gemacht und es wäre interessant zu sehen wie stark sich die Performance verbessert, wenn man die Leistung des Servers aufrüsten würde.
