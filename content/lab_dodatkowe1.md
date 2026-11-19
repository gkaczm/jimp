# Ćwiczenie dodatkowe 1

## 1. Treść zadania i warunki rozwiązania

Napisz program, który spośród `n` pomiarów wybierze `k` najbliższych zadanej wartości `T`, obliczy ich średnią i zapisze wybrane pomiary do pliku. Porównaj wyniki sortowania bibliotecznego `qsort()` oraz własnego sortowania przez wstawianie `insort()`.

**Sortujemy indeksy pomiarów. Tablica wejściowa z wartościami pomiarów pozostaje niezmieniona.**

W rozwiązaniu wykorzystaj trzy tablice przydzielone przez `malloc()`:

| Tablica | Typ elementów | Rola |
| --- | --- | --- |
| `dane` | `double` | Pomiary w kolejności wczytania; nie przestawiamy ich |
| `indeksy_q` | `int` | Indeksy pomiarów porządkowane przez `qsort()` |
| `indeksy_i` | `int` | Indeksy pomiarów porządkowane przez `insort()` |

Obie tablice indeksów początkowo zawierają `0, 1, ..., n - 1` i mają osobną pamięć. Przygotuj je przed uruchomieniem któregokolwiek sortowania. Oba algorytmy mają uporządkować indeksy według tych samych kryteriów opisanych w sekcji 2.

Przykład dla `T = 2`:

```text
Tablica dane:                           [ 3, 1, 2 ]
Obie tablice indeksów przed sortowaniem: [ 0, 1, 2 ]
Obie tablice indeksów po sortowaniu:     [ 2, 1, 0 ]
Tablica dane po sortowaniu:             [ 3, 1, 2 ]
```

Indeks `2` wskazuje pomiar `dane[2]`, czyli wartość `2`, najbliższą `T`. Potem wybieramy pomiar `1`, a następnie `3`.

**Pozycja w wyniku i pierwotny indeks pomiaru mają różne znaczenie.** Dla pozycji `j`:

- `indeksy_q[j]` jest pierwotnym indeksem pomiaru;
- `dane[indeksy_q[j]]` jest jego wartością.

Porównaj kolejności otrzymane przez oba algorytmy. Wybierz pierwszych `k` indeksów z wyniku `qsort()`, a następnie oblicz średnią i zapisz wskazywane przez nie pomiary. Nie obliczaj średniej z samych indeksów.

Rozwiązanie podziel na `main.c`, `bibl.c` i `bibl.h`. Sprawdzaj odczyt danych, przydzielenie pamięci i otwarcie pliku. Zwolnij przydzieloną pamięć przed zakończeniem programu.

## 2. Dane wejściowe i kryteria porównania

Program wczytuje kolejno:

1. Liczbę pomiarów `n`, gdzie `1 <= n <= 100`.
2. Wartość odniesienia `T` typu `double`.
3. Liczbę wybieranych pomiarów `k`, gdzie `1 <= k <= n`.
4. `n` wartości pomiarowych typu `double`.

Liczby oddzielamy białymi znakami, np. spacjami. Ułamki zapisujemy z kropką. Sprawdzamy poprawność odczytu oraz zakresy `n` i `k`. Zakładamy, że `T` i pomiary są skończone, a różnice `pomiar - T` mieszczą się w zakresie `double`.

Obowiązują kolejno trzy kryteria:

1. Rosnąca odległość `|pomiar - T|`.
2. Przy równych odległościach — mniejsza wartość pomiaru.
3. Przy identycznych wartościach — mniejszy pierwotny indeks, liczony od zera.

Dla `T = 2` wartość `1` występuje przed `3`, mimo że obie są odległe od `T` o `1`. Powtarzające się wartości porządkujemy według ich pierwotnych indeksów.

Odległość obliczamy funkcją `fabs()` z `<math.h>`. Funkcja `abs()` służy do liczb całkowitych.

## 3. Etapy rozwiązania

### Krok 1. Dane i tablice

Wczytujemy `n`, `T`, `k` i pomiary do tablicy `double`. Sprawdzamy dane oraz alokacje. Przygotowujemy dwie niezależne tablice indeksów według sekcji 6. Tablica pomiarów pozostaje niezmieniona.

### Krok 2. Funkcja porównująca i `qsort()`

Uzupełniamy `compare()` o wszystkie trzy kryteria. Ustawiamy wskaźnik `pomiary` i sortujemy `indeksy_q` przez `qsort()`.

### Krok 3. Sortowanie przez wstawianie

Piszemy samodzielnie funkcję:

```c
void insort(int tab[], int n);
```

Funkcja porządkuje **indeksy według wskazywanych pomiarów**. Nie wystarczy porównywać indeksów wyrażeniem `tab[j] > tmp`. Możemy użyć wspólnej funkcji porównującej: `compare(&tab[j], &tmp) > 0`.

Przechodzimy od drugiego elementu. Zapamiętujemy bieżący indeks w `tmp`, przesuwamy wcześniejsze elementy wymagające późniejszej pozycji i wstawiamy `tmp` w wolne miejsce. Przed odczytem `tab[j]` sprawdzamy, czy `j >= 0`.

Nie wywołujemy wewnątrz `insort()` funkcji `qsort()` ani gotowego sortowania. Wywołujemy `insort(indeksy_i, n)` dla drugiej tablicy.

### Krok 4. Sprawdzenie i zapis

Porównujemy obie tablice wynikowe element po elemencie i wyświetlamy, czy zawierają te same indeksy w tej samej kolejności. Ponieważ oba wyniki odwołują się do jednej niezmienionej tablicy pomiarów, zgodność indeksów oznacza też zgodność wskazywanych wartości.

Wybieramy pierwszych `k` indeksów. Średnią obliczamy z **wartości pomiarów**, np. `dane[indeksy_q[j]]`, a nie z samych indeksów, i wypisujemy na ekranie.

Do `wynik.txt` zapisujemy nagłówek `indeks wartosc odleglosc`, a pod nim `k` wierszy. Każdy wiersz zawiera pierwotny indeks, wartość i odległość od `T`, oddzielone spacjami. Zachowujemy kolejność sortowania. Sprawdzamy otwarcie pliku i zamykamy go po zapisie. Tryb `"w"` nadpisuje wcześniejszą zawartość pliku w bieżącym katalogu.

## 4. Przykład działania

Dane wejściowe:

```text
7 2 4
3 1 2 -1 3 1 2
```

Oczekiwana kolejność wszystkich pomiarów:

| Pierwotny indeks | Wartość | Odległość od T |
| ---: | ---: | ---: |
| 2 | 2 | 0 |
| 6 | 2 | 0 |
| 1 | 1 | 1 |
| 5 | 1 | 1 |
| 0 | 3 | 1 |
| 4 | 3 | 1 |
| 3 | -1 | 3 |

Obie posortowane tablice indeksów powinny więc zawierać:

```text
2 6 1 5 0 4 3
```

Pierwsze cztery wskazywane wartości to `2, 2, 1, 1`, a średnia wynosi `1.5`.

Przykładowe komunikaty:

```text
Kolejnosci identyczne: TAK
Srednia wybranych pomiarow: 1.5
Zapisano 4 pomiarow do wynik.txt
```

Zawartość `wynik.txt`:

```text
indeks wartosc odleglosc
2 2 0
6 2 0
1 1 1
5 1 1
```

Liczby mogą być wypisane z większą liczbą cyfr po kropce.

Poniższe sekcje wyjaśniają nowe elementy potrzebne do wykonania zadania.

## 5. Przydzielanie pamięci — malloc() i free()

Gdy znamy już poprawne `n`, możemy przydzielić pamięć na tablicę pomiarów oraz dwie tablice indeksów. Poniższy fragment umieszczamy w `main()`; wymaga nagłówków `<stdlib.h>` i `<stdio.h>`:

```c
double *dane = malloc((size_t)n * sizeof *dane);
int *indeksy_q = malloc((size_t)n * sizeof *indeksy_q);
int *indeksy_i = malloc((size_t)n * sizeof *indeksy_i);

if (dane == NULL || indeksy_q == NULL || indeksy_i == NULL) {
    fprintf(stderr, "Brak pamieci.\n");
    free(indeksy_i);
    free(indeksy_q);
    free(dane);
    return EXIT_FAILURE;
}

/* Tutaj wczytujemy dane, przygotowujemy indeksy i wykonujemy zadanie. */

free(indeksy_i);
free(indeksy_q);
free(dane);
```

`malloc()` przyjmuje liczbę bajtów. `sizeof *dane` to rozmiar jednego elementu wskazywanego przez `dane`, czyli `double`. `sizeof *indeksy_q` to rozmiar jednego `int`. Mnożymy rozmiar elementu przez ich liczbę; `(size_t)n` zmienia typ liczby na typ używany do rozmiarów.

Przydzielona pamięć **nie jest zainicjalizowana**. Przed odczytem elementów nadajemy im wartości. Wyniku `malloc()` nie trzeba rzutować w C. Po zakończeniu pracy zwalniamy każdą alokację przez `free()` i nie korzystamy już z jej elementów. `free(NULL)` jest dozwolone, co ułatwia obsługę częściowo nieudanej alokacji.

## 6. Przygotowanie i kopiowanie tablic indeksów

Pierwszą tablicę wypełniamy kolejnymi indeksami. Następnie kopiujemy ją do drugiej:

```c
for (int i = 0; i < n; ++i)
    indeksy_q[i] = i;

for (int i = 0; i < n; ++i)
    indeksy_i[i] = indeksy_q[i];
```

Obie tablice zawierają teraz te same indeksy, ale mają osobną pamięć. Obie przygotowujemy **przed rozpoczęciem sortowania**. Nie kopiujemy do drugiej już posortowanego wyniku pierwszego algorytmu.

**Przypisanie `indeksy_i = indeksy_q;` nie kopiuje tablicy.** Kopiuje tylko adres, więc oba wskaźniki wskazywałyby te same elementy. Jeśli `indeksy_i` wcześniej wskazywało osobną alokację, utracilibyśmy też dostęp do niej.

Zamiast drugiej pętli można użyć `memcpy()` z `<string.h>`:

```c
memcpy(indeksy_i, indeksy_q, (size_t)n * sizeof *indeksy_i);
```

Funkcja kopiuje podaną liczbę bajtów. Pamięć docelowa musi być już przydzielona, mieć wystarczający rozmiar i nie nachodzić na obszar źródłowy. W tym zadaniu wystarczy kopiowanie pętlą.

## 7. Sortowanie indeksów przez qsort()

`qsort()` z `<stdlib.h>` otrzymuje adres tablicy, liczbę elementów, rozmiar elementu i funkcję porównującą:

```c
qsort(indeksy_q, (size_t)n, sizeof *indeksy_q, compare);
```

Tutaj elementami są indeksy typu `int`. `qsort()` zmienia ich kolejność w przekazanej tablicy i nie tworzy nowej tablicy.

Funkcja porównująca ma nagłówek:

```c
int compare(const void *a, const void *b);
```

Argumenty wskazują na dwa **indeksy**, a nie na wartości pomiarów. Najpierw odczytujemy indeksy, potem korzystamy z tablicy pomiarów. Dla uproszczenia udostępnimy funkcji globalne `T` i wskaźnik `pomiary`:

```c
/* W bibl.c, poza funkcjami: */
double T = 0.0;
const double *pomiary = NULL;

int compare(const void *a, const void *b)
{
    int ia = *(const int *)a;
    int ib = *(const int *)b;

    double da = fabs(pomiary[ia] - T);
    double db = fabs(pomiary[ib] - T);

    /* Tutaj sprawdzamy trzy kryteria i zwracamy wynik porównania. */
    /* To fragment do uzupełnienia, nie pełna implementacja. */
}
```

Wyrażenie `*(const int *)a` oznacza: potraktuj otrzymany adres jako wskaźnik na `int` i odczytaj wskazywaną liczbę. `pomiary[ia]` to wartość pomiaru o tym indeksie. Do tego fragmentu potrzebne są `<math.h>` i `<stddef.h>` lub `<stdlib.h>` definiujące `NULL`.

Po wczytaniu danych, przed sortowaniem, ustawiamy w `main()`:

```c
pomiary = dane;
```

W tym miejscu przypisanie adresu jest zamierzone: funkcja porównująca ma odczytywać oryginalne pomiary. Nie potrzebuje ich kopii. `const double *` pozwala czytać elementy przez wskaźnik `pomiary`, ale nie pozwala ich przez niego zmieniać. Nie zmieniamy `T` ani tablicy pomiarów podczas sortowania.

Funkcja porównująca zwraca:

| Wynik | Znaczenie |
| --- | --- |
| Ujemny | Pomiar o indeksie ia powinien wystąpić wcześniej |
| Zero | Oba elementy są równoważne według wszystkich kryteriów |
| Dodatni | Pomiar o indeksie ia powinien wystąpić później |

Sprawdzamy kolejno odległości, wartości pomiarów i indeksy. Używamy porównań `<` i `>` oraz wyników np. `-1`, `0`, `1`. **Nie zwracamy `(int)(da - db)`**: różnica mniejsza od `1` mogłaby zostać obcięta do zera.

Przekazując `compare` do `qsort()`, podajemy nazwę bez nawiasów wywołania. To funkcja biblioteczna wywołuje porównanie dla wybranych par elementów. `qsort()` nie gwarantuje zachowania kolejności elementów uznanych za równe; trzeci klucz, czyli indeks, zapewnia jednoznaczny porządek. Standard nie narzuca konkretnego algorytmu używanego przez `qsort()`.

## 8. Podział na pliki i uruchomienie

Przygotowujemy:

```text
main.c  - wejście, alokacje, tablice indeksów i sterowanie programem
bibl.c  - compare(), insort() i funkcje pomocnicze
bibl.h  - deklaracje funkcji i zmiennych globalnych
```

Oba pliki `.c` dołączają `bibl.h`. Nagłówek zabezpieczamy przed wielokrotnym dołączeniem.

### Co oznacza `extern`?

W tym rozwiązaniu `main.c` ustawia `T` i wskaźnik `pomiary`, a funkcja `compare()` z `bibl.c` odczytuje te same zmienne. Potrzebujemy więc udostępnić ich deklaracje obu plikom.

W nagłówku `bibl.h` zapisujemy:

```c
extern double T;
extern const double *pomiary;
```

Słowo `extern` w tych deklaracjach informuje kompilator o nazwie i typie zmiennej, której definicja znajduje się w programie. **Deklaracja z `extern`, bez inicjalizatora, nie tworzy nowej zmiennej ani kopii jej wartości.**

Definicje umieszczamy tylko raz, w `bibl.c`:

```c
double T = 0.0;
const double *pomiary = NULL;
```

To definicje zapewniają miejsce na zmienną `T` i na wskaźnik `pomiary`. Miejsce na same pomiary przydzielamy osobno przez `malloc()`. Po dołączeniu nagłówka `main.c` może wczytać `T` oraz wykonać `pomiary = dane;`, a `compare()` odczytuje te same obiekty.

Nie umieszczamy powyższych definicji w nagłówku dołączanym do obu plików: spowodowałoby to wielokrotne definicje. Same deklaracje `extern` również nie wystarczą — w programie musi istnieć definicja każdej używanej zmiennej.

`extern` nie jest wymagane dla każdej zmiennej globalnej. Tutaj stosujemy je, ponieważ korzystamy z tej samej zmiennej w dwóch plikach `.c`. Gdyby zmienna i wszystkie używające jej funkcje znajdowały się w jednym pliku, taka deklaracja w nagłówku nie byłaby potrzebna.

### Dlaczego funkcja porównująca korzysta ze zmiennych globalnych?

Standardowe `qsort()` przekazuje do `compare()` tylko adresy dwóch porównywanych elementów. Nie przekazuje dodatkowo tablicy pomiarów ani `T`. W przyjętym wariancie sortujemy same indeksy, więc funkcja musi uzyskać te dane w inny sposób. Tutaj służą do tego zmienne globalne. To uproszczenie na potrzeby tego wariantu ćwiczenia; w funkcjach, które projektujemy samodzielnie, dane potrzebne do pracy zwykle przekazujemy przez parametry.


Kompilujemy:

```bash
gcc -std=c11 -Wall -Wextra -Wpedantic -g main.c bibl.c -lm -o pomiary
```

`-lm` dołącza bibliotekę matematyczną w środowiskach, które tego wymagają. Po zapisaniu wejścia w `dane.txt` uruchamiamy:

```bash
./pomiary < dane.txt
cat wynik.txt
```

Możemy też wpisać dane bezpośrednio w terminalu po uruchomieniu `./pomiary`.

## 9. Sprawdzanie programu i punktacja

Sprawdzamy pojedynczy pomiar, `k = n`, wartości ujemne i zero, remisy odległości, powtórzenia wartości, ułamki, dane uporządkowane i odwrócone oraz `n = 100`. Sprawdzamy odrzucanie `n = 0`, `n = 101`, `k = 0` i `k > n`.

Do sprawdzenia kryteriów porównania wykorzystaj także poniższe małe zestawy. W kolumnie wyniku podano całą tablicę indeksów po sortowaniu; do średniej wybieramy pierwszych `k`.

| Pomiary w kolejności wejściowej | T | k | Oczekiwane indeksy po sortowaniu | Średnia wybranych pomiarów |
| --- | ---: | ---: | --- | ---: |
| `5` | 2 | 1 | `0` | 5 |
| `3, 1` | 2 | 1 | `1, 0` | 1 |
| `1, 1, 1` | 2 | 2 | `0, 1, 2` | 1 |
| `0.75, -0.25, 0.25, -0.25` | 0 | 2 | `1, 3, 2, 0` | -0.25 |

Zgodność obu sortowań nie wystarcza: wspólny błąd w `compare()` może dać dwa jednakowe błędne wyniki. Sprawdzamy też oczekiwane indeksy, np. dla przykładu z sekcji 4. Upewniamy się, że oryginalne pomiary nie zostały zmienione.

