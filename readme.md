Filtry CLI do scrapera

Można użyć tych flag po `scraper.py` aby zawęzić obszar pobierania harmonogramów.
Za każdym razem skrypt Python pobiera list_faculties.json, a następnie pobiera też pliki dla wybranych filtrów.

1. `--all` (domyślnie)
   Pobierz wszystkie dostępne harmonogramy.
   Przykład: python scraper.py --all

2. `--faculty "[Nazwa Wydziału]"`
   Pobierz harmonogramy dla konkretnego wydziału.
   Przykład: python scraper.py --faculty "Wydział Nauk Technicznych i Ekonomicznych"

3. `--specialization "[Nazwa Kierunku]"`
   Pobierz harmonogramy dla konkretnego kierunku.
   Przykład: python scraper.py --specialization "Informatyka"

4. `--year [Year]`
   Pobierz harmonogramy dla konkretnego roku.
   Przykład: python scraper.py --year 2

5. `--code [Group Code]`
   Pobierz harmonogramy dla konkretnego kodu specjalizacji.
   Przykład: python scraper.py --code s2PAM

6. `--subgroup [Subgroup Code]`
   Pobierz harmonogram dla konkretnej grupy.
   Przykład: python scraper.py --subgroup s2PAM1(1)

Można również użyć wielu filtrów jednocześnie:
Przykład: python scraper.py --specialization "Informatyka" --year 2
