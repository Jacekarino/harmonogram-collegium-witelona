<div align="center">

# 📅 Harmonogram Collegium Witelona

**Nowoczesna, zoptymalizowana i w pełni responsywna przeglądarka planu zajęć dla studentów Collegium Witelona w Legnicy.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-plan--cw.pages.dev-8b5cf6?style=for-the-badge&logo=cloudflarepages&logoColor=white)](https://plan-cw.pages.dev/)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare%20Pages-Hosting-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)
[![GitHub Actions](https://img.shields.io/badge/Data%20Pipeline-GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/jacekarino/harmonogram-collegium-witelona/actions)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0%20(Vanilla%20Frontend)-06B6D4?style=for-the-badge&logo=npm&logoColor=white)](#%EF%B8%8F-architektura-i-stack-technologiczny)
[![GitHub Stars](https://img.shields.io/github/stars/jacekarino/harmonogram-collegium-witelona?style=for-the-badge&logo=github&color=EAB308)](https://github.com/jacekarino/harmonogram-collegium-witelona/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/jacekarino/harmonogram-collegium-witelona?style=for-the-badge&logo=github&color=6366F1)](https://github.com/jacekarino/harmonogram-collegium-witelona/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/jacekarino/harmonogram-collegium-witelona?style=for-the-badge&logo=github&color=EC4899)](https://github.com/jacekarino/harmonogram-collegium-witelona/issues)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-22C55E?style=for-the-badge&logo=github)](https://github.com/jacekarino/harmonogram-collegium-witelona/pulls)
[![License: MIT](https://img.shields.io/badge/License-MIT-3B82F6?style=for-the-badge&logo=open-source-initiative&logoColor=white)](license.txt)

<br />

<p align="center">
  <img src="https://raw.githubusercontent.com/jacekarino/harmonogram-collegium-witelona/main/thumbnail.png" alt="Harmonogram Collegium Witelona Interface Preview" width="720" />
</p>
<br />

</div>

---

## 🌟 Overview / Przegląd

**Harmonogram Collegium Witelona** to niezależna, nowoczesna aplikacja webowa stworzona jako szybka i czytelna alternatywa dla oficjalnego systemu planu zajęć uczelni ([plan.pwsz.legnica.edu.pl](http://plan.pwsz.legnica.edu.pl/)).

Aplikacja całkowicie eliminuje problemy z brakiem responsywności i archaicznym interfejsem na urządzeniach mobilnych, oferując intuicyjną estetykę *Glassmorphism*, błyskawiczne filtrowanie, dynamiczny wskaźnik postępu semestru oraz bezpośredni eksport terminów do zewnętrznych kalendarzy (Google Calendar, Apple Calendar, Outlook).

> [!NOTE] Projekt ma charakter pomocniczy i open-source. W przypadku nagłych zmian sal lub odwołanych zajęć zaleca się weryfikację z oficjalnym komunikatem uczelni.

---

## ✨ Features / Funkcjonalności

- 📱 **Nowoczesny Interfejs Glassmorphic** — Lekki, w pełni responsywny layout dopracowany pod smartfony i komputery z płynnymi mikro-interakcjami.
- 🎓 **Wieloetapowa Nawigacja Kaskadowa** — Intuicyjny wybór struktury: *Wydział &rarr; Kierunek &rarr; Rok &rarr; Specjalizacja &rarr; Grupa*.
- 🏃 **Integracja z Wychowaniem Fizycznym** — Wygodne dołączanie zajęć WF wybranej sekcji bezpośrednio do głównego widoku harmonogramu.
- 🔍 **Błyskawiczna Wyszukiwarka & Filtry** — Dynamiczne przeszukiwanie po nazwisku wykładowcy, nazwie przedmiotu, numerze sali lub typie zajęć (wykład, ćwiczenia, laboratoria).
- 📊 **Wskaźnik Postępu Semestru** — Zestawienie zrealizowanych oraz pozostałych godzin lekcyjnych dla każdego przedmiotu z procentowym paskiem ukończenia.
- 📅 **Eksport do Kalendarza (.ics)** — Generowanie uniwersalnego pliku iCalendar kompatybilnego z Google Calendar, Apple Calendar oraz MS Outlook.
- 🎨 **Zaawansowana Personalizacja** — Przełącznik trybu ciemnego/jasnego (Dark/Light mode), widok kompaktowy, wykrywanie „okienek”, automatyczne pomijanie dni wolnych oraz wyróżnianie trwających lekcji w czasie rzeczywistym.
- ⚡ **Zero Zależności Klienckich** — 100% Vanilla JS i CSS — błyskawiczny czas ładowania bez konieczności pobierania ciężkich bibliotek.

---

## 🚀 Live Instances / Dostęp Online

Aplikacja jest stale dostępna pod poniższym adresem:

| Provider | URL | Status |
| :--- | :--- | :--- |
| **Cloudflare Pages (Produkcja)** | [https://plan-cw.pages.dev/](https://plan-cw.pages.dev/) | ![Active](https://img.shields.io/badge/online-emerald?style=flat-square) |
| **Oficjalny Serwis Uczelni (Źródło)** | [http://plan.pwsz.legnica.edu.pl/](http://plan.pwsz.legnica.edu.pl/) | ![Active](https://img.shields.io/badge/źródło-blue?style=flat-square) |

---

## 🛠️ Architektura i Stack Technologiczny

| Warstwa | Technologie | Rola w systemie |
| :--- | :--- | :--- |
| **Frontend & UI** | Vanilla HTML5, Modern CSS3 (Variables, Flexbox/Grid), JavaScript (ES6+) | Bezramkowa, ultra-szybka aplikacja SPA (Zero Dependencies) |
| **Data Scraper** | Python 3.10+, `requests`, `BeautifulSoup4` | Pobieranie, parsowanie tabel HTML, konwersja kodowania (`ISO-8859-2` &rarr; `UTF-8`) oraz generowanie JSON |
| **Baza Danych** | Pliki statyczne JSON (`/data`) | Zoptymalizowana hierarchia katalogów odwzorowująca wydziały i grupy |
| **Hosting & CDN** | Cloudflare Pages | Globalna dystrybucja statycznych assetów na krawędzi sieci (Edge) |
| **Automatyzacja CI/CD** | GitHub Actions | Cykliczny scraping i aktualizacja planów 4 razy na dobę |

---

## 💻 Getting Started / Uruchomienie Lokalne

Aplikacja kliencka nie wymaga kompilacji ani instalacji Node.js!

### 1. Sklonuj repozytorium
```bash
git clone https://github.com/jacekarino/harmonogram-collegium-witelona.git
cd harmonogram-collegium-witelona
```

### 2. Uruchom w przeglądarce
Otwórz `index.html` bezpośrednio lub skorzystaj z dowolnego lokalnego serwera:

```bash
# Na Windows (PowerShell)
Start-Process index.html

# Na macOS
open index.html

# Na Linux
xdg-open index.html
```

Lub z użyciem lokalnego serwera deweloperskiego:
```bash
# Używając Pythona
python -m http.server 8000

# Używając Node / npx
npx serve .
```

Aplikacja będzie dostępna pod adresem: `http://localhost:8000`

---

## 🐍 Scraper Danych (Python CLI)

Skrypt `scraper.py` odpowiada za pobranie surowych danych ze strony uczelnianej i przetworzenie ich do ustrukturyzowanego formatu JSON.

### 1. Instalacja zależności
```bash
pip install -r requirements.txt
```

### 2. Parametry wiersza poleceń

| Flaga | Wartość | Opis |
| :--- | :--- | :--- |
| `--all` | *(brak)* | Pobiera pełną bazę wszystkich wydziałów i grup (domyślnie) |
| `--faculty` | `"[Nazwa]"` | Zawęża pobieranie do wybranego wydziału |
| `--specialization` | `"[Nazwa]"` | Pobiera dane dla wskazanego kierunku |
| `--year` | `[Numer]` | Filtruje po roku studiów |
| `--code` | `[Kod]` | Pobiera dane dla konkretnego kodu specjalizacji |
| `--subgroup` | `[Kod]` | Zawęża wynik do pojedynczej podgrupy |

#### Przykłady użycia:
```bash
# Pobranie wszystkich dostępnych planów
python scraper.py --all

# Pobranie planu dla konkretnego kierunku i roku
python scraper.py --specialization "Informatyka" --year 2

# Pobranie wybranej podgrupy
python scraper.py --subgroup "s2PAM1(1)"
```

---

## 🔄 Automatyzacja & Synchronizacja CI/CD

Repozytorium posiada wbudowany zautomatyzowany przepływ pracy GitHub Actions ([`.github/workflows/autorun.yml`](.github/workflows/autorun.yml)):

- 🕒 **Harmonogram**: Wyzwalany automatycznie 4 razy na dobę (`0 23, 5, 11, 17 * * * UTC`).
- ⚙️ **Etapy potoku**:
  1. Uruchomienie parsera `scraper.py --all` w kontenerze Ubuntu.
  2. Weryfikacja różnic w katalogu `data/`.
  3. W przypadku zmian – automatyczny commit i push do gałęzi `main`.
  4. Natychmiastowe odświeżenie produkcyjnej wersji w Cloudflare Pages.

---

## 📂 Struktura Projektu

```text
harmonogram-collegium-witelona/
├── .github/
│   └── workflows/
│       └── autorun.yml          # Konfiguracja potoku CI/CD GitHub Actions
├── data/                        # Ustrukturyzowane pliki bazy danych w formacie JSON
│   ├── list_faculties.json      # Główny indeks wydziałów i kierunków
│   └── [Wydział]/[Kierunek]/[Rok]/[Grupa]/
├── app.js                       # Główna logika interfejsu SPA i zarządzanie stanem
├── index.html                   # Semantyczna struktura aplikacji
├── style.css                    # Zaawansowane arkusze stylów (Glassmorphism, Dark/Light)
├── scraper.py                   # Parser HTML do ekstrakcji i czyszczenia danych
├── requirements.txt             # Zależności bibliotek Pythona
├── thumbnail.png                # Zrzut ekranu interfejsu aplikacji
└── readme.md                    # Dokumentacja techniczna projektu
```

---

## 🤝 Contributing / Wkład w projekt

Wszelkie sugestie, zgłoszenia błędów oraz nowe funkcjonalności są mile widziane!

1. Sforkuj projekt (**Fork**)
2. Utwórz gałąź dla nowej funkcji (`git checkout -b feature/NazwaFunkcji`)
3. Zatwierdź swoje zmiany (`git commit -m 'Dodano nową funkcję'`)
4. Wypchnij zmiany do gałęzi (`git push origin feature/NazwaFunkcji`)
5. Otwórz **Pull Request**

---

## 📬 Kontakt

**Jacek Kowalczyk**
- 📧 Email (studencki): [jacek.kowalczyk.inf@studenci.collegiumwitelona.pl](mailto:jacek.kowalczyk.inf@studenci.collegiumwitelona.pl)
- 📧 Email (kontaktowy): [jacekarino@duck.com](mailto:jacekarino@duck.com)
- 🐙 Profil GitHub: [@jacekarino](https://github.com/jacekarino)

---

## 📄 Licencja

Projekt dystrybuowany na licencji **MIT**. Szczegółowe informacje znajdują się w pliku [`license.txt`](license.txt).

---

<div align="center">

Made with ♡ by [**Jacekarino**](https://github.com/jacekarino)

</div>
