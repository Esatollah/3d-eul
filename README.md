# Halsatlas

Interaktiver 3D-Lernatlas für das Halskapitel des PT EuL Handbuchs 2025/26. Zum lokalen Lernen genügt ein Doppelklick auf `index.html`. Alle Modelle, Abbildungen und PDF-Verweise funktionieren offline. Der Lernstand wird im jeweiligen Browser gespeichert.

## Deployment

Das Projekt besteht aus statischen Dateien. `index.html` liegt direkt im Repository-Stamm. Alle lokalen URLs sind relativ, sodass der Atlas auch unter einem GitHub-Pages-Projektpfad funktioniert.

Für eine öffentliche Ausgabe in GitHub unter **Settings → Pages → Build and deployment** die Quelle **Deploy from a branch**, den Branch **main** und den Ordner **/ (root)** auswählen. Nach dem Speichern veröffentlicht GitHub spätere Pushes auf diesen Branch automatisch. [GitHub Pages einrichten](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

Das Repository enthält das vollständige Handbuch und seine Originalabbildungen. Der Zugriff auf die gehostete Website ist eine eigene Einstellung. Für einen geschlossenen Lernkreis eignet sich ein privates GitHub-Repository mit Cloudflare Pages und Cloudflare Access. Dabei den Zugriff sowohl für die Produktionsadresse als auch für die Vorschauen einrichten. [Produktionsadresse mit Access schützen](https://developers.cloudflare.com/pages/platform/known-issues/)

Die Herkunft und Lizenzen der 3D-Modelle stehen im [Modellnachweis](modelle.md).
