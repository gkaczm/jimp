# JIMP — jak edytować instrukcje laboratoriów

**Instrukcje studentów edytujemy w Markdown (`content/lab3.md`, `content/lab4.md` itd.). Nie edytuj HTML-a, żeby poprawić zdanie.** Strona sama tworzy układ i spis treści. Możesz edytować pliki w VS Code, Notepad++ lub w GitHub (ikona ołówka).

> Uwaga: składnia `:::note`, `:::warning` itd. to nasze proste **rozszerzenia JIMP**, a nie standardowy Markdown. Zwykły podgląd Markdown w GitHub może wyświetlać te znaczniki dosłownie — na właściwej stronie wyglądają jak kolorowe bloki.

## 1. Układ laboratorium

W pliku `.md`:

```md
# Tytuł laboratorium

Krótki opis, widoczny pod głównym tytułem.

## Plan zajęć

1. Część pierwsza
2. Część druga

## Wskaźniki do funkcji

:::label Część 1 · wspólnie

Tekst tej sekcji.

### Szczegółowy podrozdział

Dalsze wyjaśnienia.
```

- `#` — duży tytuł strony, użyj **raz** na początku.
- Tekst między `#` a pierwszym `##` — opis pod tytułem.
- `##` — **nowa biała karta/sekcja**, automatycznie dodawana do spisu treści.
- `###` — mniejszy nagłówek wewnątrz karty; nie tworzy osobnej karty.
- `:::label tekst` — niewielki niebieski podpis nad treścią sekcji; **bez zamknięcia `:::`**.

## 2. Zwykły Markdown

```md
Ten akapit ma **pogrubiony tekst**, *kursywę* i `kod w zdaniu`.

- Pierwszy punkt
- Drugi punkt

1. Pierwszy krok
2. Drugi krok

[Dokumentacja](https://en.cppreference.com/w/c)
```

Nie musisz pisać `<p>`, `<div>` ani `<section>`.

## 3. Blok kodu z przyciskiem „Kopiuj”

Otwórz i zamknij blok trzema znakami `\`` (backtick). Po otwarciu podaj język (`c`, `bash` lub `text`) i opcjonalny podpis:

````md
```c Przykład deklaracji
double (*f)(double);
```

```bash Terminal
gcc -Wall -Wextra -pedantic -ansi program.c -o program
```
````

Strona pokaże ciemne pole z kodem, etykietę i przycisk Kopiuj. Kod w takim bloku **nie jest wykonywany**.

## 4. Niebieska notatka

```md
:::note Uwaga na nawiasy
`double (*f)(double)` to wskaźnik na funkcję.
:::
```

## 5. Żółte ostrzeżenie

```md
:::warning Wymagania
Nie twórz dodatkowej tablicy. Korzystaj z **arytmetyki wskaźników**.
:::
```

## 6. Panel do pobierania

Zwykły panel:

```md
:::download Plik do wspólnej analizy
Pełny program demonstracyjny.

file: downloads/p3.c
button: Pobierz p3.c ↓
:::
```

Wyróżniony (niebieski) panel:

```md
:::download-primary Szkielet programu
Uzupełnij plik zgodnie z poleceniem.

file: downloads/LMP3_temperatury_dla_studentow.c
button: Pobierz plik .c ↓
:::
```

Plik musi istnieć w repozytorium pod podaną ścieżką. Ścieżki w `.md` zaczynają się **od głównego folderu strony** (`downloads/...`, `images/...`), nie od folderu `content/`.

## 7. Kafelki z wzorami

Każdy wiersz ma postać `etykieta | wzór`:

```md
:::formulas
°C → °F | F = C × 9/5 + 32
°C → K | K = C + 273,15
:::
```

Wynik: dwa kafelki obok siebie (na telefonach jeden pod drugim).

## 8. Pole na notatki/kod studentów

```md
## Notatki i kod

:::scratchpad
:::
```

Pole nie zawiera tekstu zastępczego (placeholder). To zwykłe pole do pisania, **bez wykonywania kodu**. Treść jest zapisywana wyłącznie w pamięci lokalnej przeglądarki na danym urządzeniu. Nie jest wysyłana ani synchronizowana między komputerami.

## 9. Obrazki

Umieść obrazek np. w `images/wskazniki.png`, a w `.md`:

```md
![Schemat działania wskaźników](images/wskazniki.png)
```

Obraz dopasuje się do szerokości ekranu. Możesz też stosować zwykłe linki do plików.

## 10. Dodawanie nowego laboratorium

1. Utwórz `content/lab4.md` na wzór `content/lab3.md`.
2. W `labs.json` dopisz obiekt (pamiętając o przecinku między elementami):

```json
[
  {
    "id": "3",
    "title": "Wskaźniki do funkcji i pomiary temperatury",
    "url": "labs/lab.html?id=3"
  },
  {
    "id": "4",
    "title": "Nowe zagadnienie",
    "url": "labs/lab.html?id=4"
  }
]
```

3. Dodaj potrzebne pliki do `downloads/` lub obrazki do `images/`.
4. Zatwierdź zmiany (`git add`, `git commit`, `git push`) lub edytuj na GitHub.

**Ważne:** `labs.json` służy też stronie prowadzącego do wyboru laboratorium. Jeśli jeszcze nie przygotowano zaszyfrowanych wejściówek dla Lab 4, wybranie go na stronie prowadzącego zakończy się komunikatem o braku pliku. Same instrukcje będą już działać.

## 11. Podgląd przed opublikowaniem

Przeglądarka może blokować wczytywanie `.md` z lokalnego pliku `file://`. Z folderu repozytorium uruchom w PowerShell:

```powershell
py -m http.server 8000
```

Otwórz `http://localhost:8000/labs/lab.html?id=3` i odśwież stronę po zmianach. Jeśli port 8000 jest zajęty, użyj np. `8001`.

## 12. Bezpieczeństwo i współpraca

- Folder `private/` powinien pozostać w `.gitignore` — nie publikuj pytań w jawnej formie, szyfratora z hasłami ani rozwiązań przeznaczonych tylko dla prowadzącego.
- Nie dodawaj surowego HTML ani JavaScript do Markdown. Ten prosty renderer świadomie obsługuje **tylko wymienioną składnię**.
- W GitHub możesz edytować `.md` przyciskiem ołówka, a współpracownicy mogą proponować zmiany przez pull requesty.
- Zmiany w pliku `content/lab3.md` są widoczne po nowym wdrożeniu GitHub Pages; nie trzeba osobno generować HTML.
