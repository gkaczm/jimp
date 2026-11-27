# Laboratorium 7 — Przetwarzanie napisów

## 1. Cel laboratorium

Podczas zajęć będziemy sortować napisy i znaki, odczytywać wiersze z plików tekstowych oraz wyszukiwać fragmenty tekstu. Poznamy funkcje biblioteczne `qsort()`, `strcmp()`, `strlen()` i `strstr()`, a także wykorzystamy `fgets()`, `malloc()` i `strcpy()` w pracy z plikami.

Pracujemy na czterech kompletnych programach. Uruchamiamy je, porównujemy wyniki z kodem źródłowym i wykonujemy ćwiczenia podane przy każdym przykładzie.

### Przygotowanie do zajęć

Utwórz katalog roboczy na laboratorium i przejdź do niego:

```bash
mkdir -p ~/lmp/lmp7
cd ~/lmp/lmp7
```

**Pliki startowe do pobrania:** [wszystkie programy i dane (ZIP)](downloads/lab7/lmp7_start.zip). Rozpakuj archiwum w katalogu roboczym, np. poleceniem `unzip lmp7_start.zip`.

Programy osobno: [`asort.c`](downloads/lab7/asort.c), [`zsort.c`](downloads/lab7/zsort.c), [`psort.c`](downloads/lab7/psort.c), [`pstr.c`](downloads/lab7/pstr.c). Dane do ćwiczeń: [`dane.1`](downloads/lab7/dane.1), [`dane.2`](downloads/lab7/dane.2), [`dane.3`](downloads/lab7/dane.3).

**Wszystkie cztery kompletne listingi znajdują się również poniżej**, razem z objaśnieniami. Jeśli nie korzystasz z archiwum, zapisz je ręcznie w osobnych plikach `.c`.

Plik `dane.1` ma następującą zawartość (pięć wierszy, w tym kropka na końcu):

```text
Ala
ma kota
a Ola ma
psa
.
```

Do dodatkowych eksperymentów wykorzystaj dołączone `dane.2` i `dane.3` lub przygotuj własne pliki tekstowe z innymi kombinacjami małych i wielkich liter.

## 2. Program 1 — sortowanie argumentów (`asort.c`)

Program otrzymuje słowa jako argumenty wiersza poleceń, sortuje tablicę `argv` za pomocą `qsort()` i wypisuje słowa w kolejności alfabetycznej. Funkcja `qsort()` potrzebuje **funkcji porównującej** — otrzymuje ją jako ostatni argument.

```c
#include <stdio.h> // wiadomo po co
#include <stdlib.h> // qsort
#include <string.h> // strcmp

int
alphacmp( const void *a, const void *b ) {
    char **ca = (char**)a;
    char **cb = (char**)b;
    return strcmp( *ca, *cb );
}

int
main( int argc, char **argv ) {
    int i;

    qsort( argv+1, argc-1, sizeof *argv, alphacmp );

    for( i= 1; i < argc; i++ )
        printf( "%s\n", argv[i] );

    return 0;
}
```

### Ćwiczenie 1. Sortowanie napisów

Skompiluj i uruchom program:

```bash
gcc -Wall asort.c -o asort
./asort ala ma kota a Ola ma psa
```

Przyjrzyj się komparatorowi `alphacmp()`. Funkcja `qsort()` przekazuje mu **adresy dwóch elementów tablicy**. Każdy element `argv` jest wskaźnikiem na napis (`char *`), dlatego komparator odbiera wskaźnik na taki element (`char **`) i przekazuje do `strcmp()` napisy przez `*ca` i `*cb`.

**Pytania:**

1. Jakie typy mają `argv`, `argv[i]`, `ca` i `*ca`?
2. Co oznacza dereferencja `*ca` w wywołaniu `strcmp(*ca, *cb)`?
3. Dlaczego program wypisuje słowa `Ola` przed `ala`?

Sprawdź również:

```bash
./asort Ala ma kota a Ola ma psa
```

Oczekiwana kolejność: `Ala`, `Ola`, `a`, `kota`, `ma`, `ma`, `psa`. `strcmp()` porównuje napisy według kodów bajtów, a nie według zasad słownikowego sortowania po polsku.

**Ćwiczenie dodatkowe:** zmień znak wyniku porównania tak, aby uzyskać kolejność malejącą. Sprawdź działanie programu na obu zestawach argumentów.

## 3. Program 2 — sortowanie znaków w słowie (`zsort.c`)

Tym razem `qsort()` sortuje **znaki** wewnątrz każdego argumentu. W komparatorze porównywane są pojedyncze wartości `char`, a funkcja `strlen()` ustala długość napisu (bez końcowego `\0`).


```c
#include <stdio.h> // wiadomo po co
#include <stdlib.h> // qsort
#include <string.h> // strlen

int
charcmp( const void *a, const void *b ) {
    char *ca = (char*)a;
    char *cb = (char*)b;
    return *ca - *cb;
}

int
main( int argc, char **argv ) {
    int i;

    for( i= 1; i < argc; i++ ) {
        qsort( argv[i], strlen(argv[i]), sizeof( char ), charcmp );
        printf( "%s\n", argv[i] );
    }

    return 0;
}
```

### Ćwiczenie 2. Sortowanie znaków

```bash
gcc -Wall zsort.c -o zsort
./zsort ala ma kota a ola ma psa
```

Oczekiwany wynik:

```text
aal
am
akot
a
alo
am
aps
```

Porównaj sposób wywołania `qsort()` w `asort.c` i `zsort.c`: co jest pojedynczym elementem sortowanej tablicy? Dlaczego w drugim programie wystarczy `char *`, a w pierwszym trzeba dodatkowo odczytać wskaźnik na napis?

**Ćwiczenie:** uruchom program również na słowach z dużymi literami i cyframi. Zmień kierunek sortowania znaków na malejący.

## 4. Program 3 — sortowanie wierszy pliku (`psort.c`)

Program czyta plik linia po linii przez `fgets()`. Ponieważ zawartość `buf` jest nadpisywana przy każdym odczycie, każdy wiersz musi zostać skopiowany do osobno przydzielonego obszaru pamięci. W ten sposób powstaje tablica `char *kopia[]`, przypominająca tablicę `argv`. Po odczycie wszystkie wiersze są sortowane za pomocą `qsort()`.

Kod zakłada, że wiersz mieści się w buforze `BUFSIZE` i że plik zawiera najwyżej `MAXLINES` wierszy. To ograniczenia tego przykładu, a nie uniwersalnego odczytu plików. Program z oryginalnych materiałów nie zwalnia przydzielonej pamięci przed zakończeniem działania.


```c
#include <stdio.h> // wiadomo po co
#include <stdlib.h> // qsort
#include <string.h> // strcmp

#define BUFSIZE 8192    // zakładamy, że linie będą krótsze niż 8kB
#define MAXLINES 100000 // maksymalna liczba linii

int
alphacmp( const void *a, const void *b ) {
    char **ca = (char**)a;
    char **cb = (char**)b;
    return strcmp( *ca, *cb );
}

int
main( int argc, char **argv ) {
    int i;
    char *kopia[MAXLINES];
    int ile_linii;

    char buf[BUFSIZE];

    FILE *in= argc > 1 ? fopen( argv[1], "r" ) : stdin;

    if( in == NULL ) {
        fprintf( stderr, "%s: błąd: nie mogę czytać pliku %s\n", argv[0], argv[1] );
        return EXIT_FAILURE;
    }

    ile_linii= 0;
    while( fgets( buf, BUFSIZE, in ) != NULL ) {
        if( ile_linii < MAXLINES ) {
            if( (kopia[ile_linii]= malloc( (strlen(buf)+1) * sizeof( char ) )) == NULL ) {
                fprintf( stderr, "%s: błąd: zbyt wiele danych (brak pamięci)\n", argv[0] );
                return EXIT_FAILURE;
            }
            strcpy( kopia[ile_linii], buf );
            ile_linii++;
        } else {
            fprintf( stderr, "%s: błąd: zbyt wiele linii wejścia\n", argv[0] );
            return EXIT_FAILURE;
        }
    }

    qsort( kopia, ile_linii, sizeof *kopia, alphacmp );

    for( i= 0; i < ile_linii; i++ )
        printf( "%s", kopia[i] );

    return EXIT_SUCCESS;
}
```

### Ćwiczenie 3. Sortowanie całych linii

```bash
gcc -Wall psort.c -o psort
./psort dane.1
```

Przypomnienie: w pliku `dane.1` znajdują się wiersze:

```text
Ala
ma kota
a Ola ma
psa
.
```

Oczekiwany wynik sortowania:

```text
.
Ala
a Ola ma
ma kota
psa
```

Kropka w osobnym wierszu pojawia się jako pierwsza ze względu na wartość jej znaku w porządku porównywania.

**Ćwiczenie:** sprawdź działanie programu na `dane.2` i `dane.3`. Utwórz własny większy plik (ponad 1 MB) i sprawdź ograniczenia programu; dobierz długości wierszy i ich liczbę tak, by nie przekroczyć założeń `BUFSIZE` i `MAXLINES`.

Prześledź rolę `malloc(strlen(buf)+1)`: dlaczego potrzebujemy dodatkowego bajtu? Zastanów się, co stałoby się, gdybyśmy zamiast kopiować każdy wiersz, wielokrotnie zapisywali do `kopia[i]` ten sam adres `buf`.

## 5. Program 4 — wyszukiwanie fragmentu tekstu (`pstr.c`)

Program wypisuje wyłącznie wiersze zawierające wskazany wzorzec. `strstr(napis, fragment)` zwraca wskaźnik na pierwsze wystąpienie fragmentu lub `NULL`, jeśli go nie znalazła. Przy jednym argumencie program odczytuje dane ze standardowego wejścia; przy drugim argumentem otwiera podany plik.


```c
#include <stdio.h> // wiadomo po co
#include <stdlib.h> // qsort
#include <string.h> // strstr

#define BUFSIZE 8192    // zakładamy, że linie będą krótsze niż 8kB

int
main( int argc, char **argv ) {
    int ile_linii;
    char buf[BUFSIZE];

    char *str= argc > 1 ? argv[1] : NULL;

    FILE *in= argc > 2 ? fopen( argv[2], "r" ) : stdin;

    if( str == NULL ) {
        fprintf( stderr, "%s: błąd: proszę podac napis do wyszukiwania\n", argv[0] );
        return EXIT_FAILURE;
    }

    if( in == NULL ) {
        fprintf( stderr, "%s: błąd: nie mogę czytać pliku %s\n", argv[0], argv[2] );
        return EXIT_FAILURE;
    }

    ile_linii= 0;
    while( fgets( buf, BUFSIZE, in ) != NULL ) {
        ile_linii++;
        if( strstr( buf, str ) != NULL )
            printf( "%s", buf );
    }

    return EXIT_SUCCESS;
}
```

### Ćwiczenie 4. Szukanie napisów i numerów wierszy

```bash
gcc -Wall pstr.c -o pstr
./pstr Ala dane.1
./pstr ma dane.1
```

Pierwsze polecenie wypisuje `Ala`, a drugie:

```text
ma kota
a Ola ma
```

**Ćwiczenie:** zmodyfikuj `pstr.c` tak, aby wraz z każdą pasującą linią wypisywał również **jej numer w pliku**, licząc od 1. Sprawdź w pliku, gdzie wzorzec występuje w kilku wierszach. Zmienna `ile_linii` jest już w programie, ale nie jest jeszcze wykorzystywana przy wypisywaniu.

Sprawdź też wyszukiwanie z wejścia standardowego:

```bash
./pstr kot
```

Wpisz kilka wierszy i zakończ wejście przez `Ctrl+D` (Linux).

## 6. Podsumowanie — czego używaliśmy?

| Funkcja | Zastosowanie w laboratorium |
| --- | --- |
| `qsort()` | Sortowanie tablicy za pomocą przekazanej funkcji porównującej |
| `strcmp()` | Porównywanie dwóch napisów |
| `strlen()` | Wyznaczanie długości napisu bez `\0` |
| `strstr()` | Szukanie fragmentu w napisie |
| `fgets()` | Odczyt jednego wiersza z pliku/standardowego wejścia (do granicy bufora) |
| `malloc()` i `strcpy()` | Zapis osobnych kopii wierszy w pamięci |

## 7. Zadanie na zaliczenie

Treść zadania zaliczeniowego zostanie udostępniona przez prowadzącą podczas laboratorium. Zadanie polega na **modyfikacji lub rozszerzeniu jednego z programów z bieżących zajęć**.



### Grupa 1 (8:00) — zadanie zaliczeniowe: wyszukiwanie OR i AND

Program otrzymuje tryb (`-or` albo `-and`), nazwę pliku oraz dowolną liczbę wzorców (co najmniej jeden):

```bash
gcc -Wall zaliczenie_gr1.c -o zaliczenie_gr1
./zaliczenie_gr1 -or dane.1 ma Ala
./zaliczenie_gr1 -and dane.1 ma Ola
```

**Zadanie:** zapisz poniższy szkielet w pliku `zaliczenie_gr1.c` i uzupełnij **tylko dwie funkcje** `pasuje_or()` oraz `pasuje_and()` (miejsca `TODO`). Korzystaj z pętli i `strstr()`.

- `-or`: wypisz linię, jeżeli zawiera przynajmniej jeden wzorzec.
- `-and`: wypisz linię, jeżeli zawiera wszystkie wzorce.
- Funkcje zwracają `1` dla dopasowania i `0` w przeciwnym razie. Każda linia może zostać wypisana najwyżej raz.

**Gotowy szkielet programu (nie trzeba pobierać dodatkowego pliku):**

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define BUFSIZE 8192

/* Zwraca 1, jesli linia zawiera co najmniej jeden wzorzec, inaczej 0. */
int pasuje_or(const char *linia, int n, char *wzorce[])
{
    /* TODO: uzupelnij funkcje. */
    return 0;
}

/* Zwraca 1, jesli linia zawiera wszystkie wzorce, inaczej 0. */
int pasuje_and(const char *linia, int n, char *wzorce[])
{
    /* TODO: uzupelnij funkcje. */
    return 0;
}

int main(int argc, char *argv[])
{
    FILE *plik;
    char linia[BUFSIZE];
    int tryb_or;
    int n;
    char **wzorce;

    if (argc < 4) {
        fprintf(stderr, "Uzycie: %s -or|-and plik wzorzec [wzorzec ...]\n", argv[0]);
        return 1;
    }

    if (strcmp(argv[1], "-or") == 0)
        tryb_or = 1;
    else if (strcmp(argv[1], "-and") == 0)
        tryb_or = 0;
    else {
        fprintf(stderr, "Nieznany tryb: %s\n", argv[1]);
        return 1;
    }

    plik = fopen(argv[2], "r");
    if (plik == NULL) {
        fprintf(stderr, "Nie mozna otworzyc pliku %s\n", argv[2]);
        return 1;
    }

    n = argc - 3;
    wzorce = argv + 3;

    while (fgets(linia, sizeof linia, plik) != NULL) {
        int pasuje;
        if (tryb_or)
            pasuje = pasuje_or(linia, n, wzorce);
        else
            pasuje = pasuje_and(linia, n, wzorce);

        if (pasuje)
            printf("%s", linia);
    }

    fclose(plik);
    return 0;
}
```

**Sprawdzenie:** dla `-and dane.1 ma Ola` wynikiem ma być tylko `a Ola ma`; dla `-or dane.1 ma Ala` powinny zostać wypisane trzy linie: `Ala`, `ma kota`, `a Ola ma`.
