
# Laboratorium 4 — Programy wieloplikowe i operacje na wektorach

## 1. Co będziemy robić?

Napiszemy program, który **wczytuje z pliku dwa wektory liczb typu `double`**, oblicza długość każdego z nich (normę L2) oraz — jeśli mają tyle samo elementów — ich iloczyn skalarny. Wszystkie obliczenia umieścimy we własnej małej bibliotece. Sam program główny będzie tylko wczytywać dane, wywoływać odpowiednie funkcje i wypisywać wyniki.

**Główny temat zajęć to nie matematyka, lecz podział jednego programu na kilka plików:** dowiemy się, do czego służą pliki `.h`, czym różni się deklaracja od definicji i jak kompilować oraz łączyć kod z kilku plików.

Po pobraniu [pliku ZIP z projektem](../downloads/lab4/lmp4_start.zip) rozpakuj go w katalogu do ćwiczeń. Projekt zawiera:

```text
bibl.h     — deklaracje funkcji biblioteki
bibl.c     — definicje funkcji biblioteki
main.c     — funkcja main(), czyli korzystanie z biblioteki
dane.txt   — przykładowe dane do testowania
```

> **Na początek:** Nie poprawiaj jeszcze kodu. Najpierw przeczytaj opis trzech plików i zobacz, jak są ze sobą powiązane. W projekcie celowo pozostawiono dwa błędy, które później znajdziemy.

## 2. Plik nagłówkowy `bibl.h` — co udostępnia biblioteka?

Plik nagłówkowy zawiera **deklaracje** funkcji. Dzięki nim `main.c` wie, jakie funkcje istnieją, jakie argumenty przyjmują i jaki typ wartości zwracają. W `.h` nie umieszczamy tutaj ich implementacji — te znajdują się w `bibl.c`.

```c
#ifndef BIBL_H
#define BIBL_H

#include <stdio.h>

/* Wczytuje wektor z pliku. Zwraca liczbe elementow lub -1 przy bledzie. */
int read(FILE *p, double v[], int max_n);

/* Oblicza norme euklidesowa wektora. */
double L2(double v[], int n);

/* Oblicza iloczyn skalarny dwoch wektorow. */
double dot_product(double v[], double u[], int n);

#endif
```

Zwróć uwagę na dwie rzeczy:

- `double L2(double v[], int n);` to **deklaracja**: na końcu jest średnik, nie ma ciała funkcji.
- `#include <stdio.h>` jest potrzebne, ponieważ deklaracja `read()` używa typu `FILE *`.

### Po co są `#ifndef BIBL_H`, `#define BIBL_H` i `#endif`?

Przed kompilacją działa **preprocesor**, który m.in. zastępuje dyrektywy `#include` zawartością wskazanych plików. Ten sam nagłówek może zostać dołączony kilkakrotnie, np. bezpośrednio i dodatkowo przez inny nagłówek.

Powyższe trzy dyrektywy tworzą *include guard*, czyli zabezpieczenie przed powtórnym przetworzeniem zawartości `bibl.h`:

1. `#ifndef BIBL_H` — sprawdza, czy nazwa `BIBL_H` **nie została jeszcze zdefiniowana**. Jeśli nie, preprocesor przetwarza kolejne linie.
2. `#define BIBL_H` — definiuje tę nazwę, aby kolejne dołączenie nagłówka można było rozpoznać.
3. `#endif` — zamyka obszar objęty sprawdzeniem. Przy ponownym dołączeniu preprocesor pomija kod znajdujący się między `#ifndef` i `#endif`.

**Co by się stało bez tego zabezpieczenia?** W naszej obecnej wersji `bibl.h`, zawierającej głównie prototypy funkcji, program nadal mógłby działać: zgodne deklaracje funkcji można powtarzać. Jednak w bardziej rozbudowanych nagłówkach wielokrotne deklarowanie np. definicji struktur mogłoby powodować błędy kompilacji. Dlatego taki zapis stosujemy od początku.

Zabezpieczenie działa osobno przy przetwarzaniu każdego pliku `.c`, więc zarówno `main.c`, jak i `bibl.c` mogą dołączyć `bibl.h`.

## 3. Plik `bibl.c` — gdzie znajdują się obliczenia?

To tutaj znajdują się **definicje** funkcji zadeklarowanych w nagłówku. Funkcja `read()` pobiera z pliku wektor zapisany w formacie `3 [ 1.5 2.0 2.0 ]`. Funkcja `L2()` oblicza normę euklidesową, a `dot_product()` iloczyn skalarny dwóch wektorów.

```c
#include "bibl.h"
#include <math.h>

int read(FILE *p, double v[], int max_n)
{
    int n, i;
    char znak;

    if (fscanf(p, "%d", &n) != 1 || n <= 0 || n > max_n)
        return -1;

    if (fscanf(p, " %c", &znak) != 1 || znak != '[')
        return -1;

    for (i = 0; i < n; i++) {
        /* UWAGA: sprawdz ostrzezenia kompilatora dla tej linii. */
        if (fscanf(p, "%f", &v[i]) != 1)
            return -1;
    }

    if (fscanf(p, " %c", &znak) != 1 || znak != ']')
        return -1;

    return n;
}

double L2(double v[], int n)
{
    int i;
    int suma_kwadratow = 0; /* Czy to dobry typ? Sprawdz wyniki. */

    for (i = 0; i < n; i++)
        suma_kwadratow += v[i] * v[i];

    return sqrt(suma_kwadratow);
}

double dot_product(double v[], double u[], int n)
{
    int i;
    double wynik = 0.0;

    for (i = 0; i < n; i++)
        wynik += v[i] * u[i];

    return wynik;
}
```

**Czytając kod od góry:**

1. `#include "bibl.h"` dołącza **nasz własny nagłówek**. Dla porównania, `#include <math.h>` udostępnia deklarację standardowej funkcji `sqrt()`.
2. `read()` najpierw czyta liczbę elementów, potem nawias `[`, następnie liczby i nawias `]`. Zwraca `-1`, jeśli dane są błędne lub wektor nie mieści się w tablicy.
3. `L2()` realizuje wzór `sqrt(v[0]^2 + v[1]^2 + ... + v[n-1]^2)`.
4. `dot_product()` mnoży odpowiadające sobie elementy i sumuje iloczyny. Oba wektory muszą mieć co najmniej `n` elementów.

**Dwa wzory, które wystarczą na te zajęcia:**

- Norma L2: `sqrt(sum(v[i] * v[i]))` — pierwiastek z sumy kwadratów.
- Iloczyn skalarny: `sum(v[i] * u[i])` — suma iloczynów elementów o tych samych indeksach.

### Dlaczego `fscanf()` używa `%lf`, a `printf()` — `%f`?

`fscanf()` **wczytuje dane do zmiennej**: otrzymuje jej adres i na podstawie specyfikatora ustala, jakiego typu wartość ma zapisać w pamięci.

W tej funkcji:

- `%f` oznacza adres zmiennej typu `float` (`float *`).
- `%lf` oznacza adres zmiennej typu `double` (`double *`).

Dlatego w naszej funkcji `read()` poprawny zapis to `fscanf(p, "%lf", &v[i])`.

`printf()` **wypisuje wartość** przekazaną jako argument, np. `printf("%.3f", v[i])`. Specyfikator `%f` służy tutaj do wyświetlania liczby typu `double`, a `.3` określa liczbę cyfr po przecinku.

Wynika to również z zasad przekazywania argumentów do `printf()`: wartości typu `float` są automatycznie przekształcane w `double`.

```c
double x;
fscanf(p, "%lf", &x);  /* odczyt: przekazujemy adres zmiennej double */
printf("%.3f\n", x);  /* wypisanie: przekazujemy wartosc double */
```

**Ważne:** użycie `%f` z adresem `double` w `fscanf()` oznacza niezgodność typów i może uszkodzić dane w pamięci. Warto więc odczytywać ostrzeżenia kompilatora.

## 4. Plik `main.c` — jak korzystamy z biblioteki?

Program główny nie musi wiedzieć, **jak** obliczana jest norma ani iloczyn skalarny. Musi wiedzieć tylko, **jak wywołać funkcje**, których deklaracje znajdują się w `bibl.h`.

Wczyta więc dwa wektory, wypisze je, a następnie wyświetli wyniki obliczeń.

```c
#include <stdio.h>
#include "bibl.h"

int main(int argc, char *argv[])
{
    double v[10], u[10];
    int n_v, n_u, i;
    FILE *we = stdin;

    /* Jesli podano nazwe pliku, czytamy z pliku zamiast z klawiatury. */
    if (argc > 1) {
        we = fopen(argv[1], "r");
        if (we == NULL) {
            fprintf(stderr, "Nie mozna otworzyc pliku: %s\n", argv[1]);
            return 1;
        }
    }

    n_v = read(we, v, 10);
    n_u = read(we, u, 10);

    if (we != stdin)
        fclose(we);

    if (n_v < 0 || n_u < 0) {
        fprintf(stderr, "Bledny format danych wejsciowych.\n");
        return 1;
    }

    printf("Wektor v: ");
    for (i = 0; i < n_v; i++)
        printf("%.2f ", v[i]);
    printf("\n");

    printf("Wektor u: ");
    for (i = 0; i < n_u; i++)
        printf("%.2f ", u[i]);
    printf("\n");

    printf("Norma L2(v): %.3f\n", L2(v, n_v));
    printf("Norma L2(u): %.3f\n", L2(u, n_u));

    if (n_v == n_u)
        printf("Iloczyn skalarny: %.3f\n", dot_product(v, u, n_v));
    else
        printf("Wektory maja rozna liczbe elementow.\n");

    return 0;
}
```

Najważniejsze miejsca:

- `#include "bibl.h"` udostępnia deklaracje `read`, `L2` i `dot_product`; `main.c` **nie dołącza** pliku `bibl.c`.
- `argc` i `argv` znamy już z wcześniejszych zajęć. Jeśli wywołamy `./lmp4 dane.txt`, nazwa pliku znajdzie się w `argv[1]`.
- Jeśli nie podamy nazwy pliku, `we` pozostanie równe `stdin`, więc program będzie odczytywał dane ze standardowego wejścia.
- Iloczyn skalarny liczymy tylko wtedy, gdy obie tablice mają tę samą liczbę elementów.

## 5. Kompilacja: osobno, a potem razem

Trzy pliki źródłowe **nie oznaczają trzech osobnych programów**. Kompilujemy pliki `.c` do plików obiektowych `.o`, a następnie łączymy je w jeden program wykonywalny.

W katalogu z projektem wykonaj:

```bash
gcc -Wall -c bibl.c
gcc -Wall -c main.c
gcc main.o bibl.o -o lmp4 -lm
```

- `-c` — skompiluj plik, ale **jeszcze nie twórz programu wykonywalnego**.
- `bibl.o`, `main.o` — pliki obiektowe utworzone przez kompilator.
- `gcc main.o bibl.o -o lmp4 -lm` — połącz części w program `lmp4`. Flaga `-lm` dołącza bibliotekę matematyczną, potrzebną do `sqrt()`.

**Możemy też skompilować cały program jednym poleceniem:**

```bash
gcc -Wall main.c bibl.c -o lmp4 -lm
```

Efekt jest taki sam: powstaje program `lmp4`. W tym przypadku GCC sam kompiluje i łączy oba pliki. Osobna kompilacja przydaje się w większych projektach, bo po zmianie tylko `bibl.c` nie trzeba kompilować `main.c` od nowa.

**Zadanie 1.** Przeczytaj komunikaty kompilatora. W kodzie `bibl.c` jest niezgodność między formatem `fscanf()` a typem przekazywanego argumentu. Znajdź ją i popraw **przed uruchomieniem programu**. Następnie skompiluj ponownie tylko `bibl.c` i jeszcze raz połącz pliki `.o`.

> **Zapamiętaj:** Po zmianie tylko `bibl.c` nie musisz kompilować ponownie `main.c`, jeśli `bibl.h` pozostał bez zmian. Wystarczy odtworzyć `bibl.o` i ponownie uruchomić etap łączenia.

## 6. Uruchomienie i testowanie

Plik `dane.txt` zawiera dwa wektory:

```text
3 [ 1.5 2.0 2.0 ]
3 [ 2.0 -1.0 0.5 ]
```

Pierwsza liczba oznacza **liczbę elementów** wektora. Potem, w nawiasach kwadratowych, zapisane są jego wartości.

Uruchom program:

```bash
./lmp4 dane.txt
```

**Zadanie 2.** Sprawdź, czy program daje poprawne wyniki. Oczekiwane wartości (zaokrąglone do trzech miejsc po przecinku) to:

```text
Norma L2(v): 3.202
Norma L2(u): 2.291
Iloczyn skalarny: 2.000
```

Jeśli normy się różnią, znajdź błąd w typie zmiennej użytej do sumowania kwadratów. Popraw kod, ponownie skompiluj `bibl.c`, połącz program i uruchom go raz jeszcze.

**Zadanie 3.** Zmień jedną wartość w `dane.txt` i przewidź, co się stanie z iloczynem skalarnym. Sprawdź przewidywanie, uruchamiając program. Następnie spróbuj podać wektory o różnej liczbie elementów.

## 7. Rozbudowa biblioteki — Twoje zadanie

Dodaj do projektu funkcję `L1`, która oblicza **sumę wartości bezwzględnych** elementów wektora. Jest to tzw. norma L1:

```text
L1(v) = |v[0]| + |v[1]| + ... + |v[n-1]|
```

Dla wektora `[1.5, 2.0, 2.0]` wynik wynosi `5.5`. Dla `[2.0, -1.0, 0.5]` wynik wynosi `3.5`.

**Zadanie 4.** Wprowadź zmianę w **trzech plikach**:

1. W `bibl.h` dodaj deklarację funkcji `L1`, zwracającej `double` i przyjmującej tablicę `double` oraz liczbę jej elementów.
2. W `bibl.c` dopisz definicję `L1`. Możesz użyć funkcji `fabs(x)` z `<math.h>` do obliczenia wartości bezwzględnej liczby typu `double`.
3. W `main.c` dopisz wywołania `L1` dla obu wektorów i wypisz wyniki.

**Zadanie 5.** Skompiluj zmienione pliki i uruchom cały program. Tym razem oprócz poprzednich wyników powinny pojawić się normy L1: **5.500** i **3.500**.

> **Dlaczego zmieniamy trzy pliki?** W `bibl.h` ogłaszamy, że funkcja istnieje; w `bibl.c` opisujemy, co robi; w `main.c` z niej korzystamy. To najważniejsza umiejętność z tego ćwiczenia.

## Co warto zapamiętać?

- **Deklaracja** mówi kompilatorowi, jak wywołać funkcję; **definicja** zawiera jej kod.
- `#include "bibl.h"` pozwala korzystać ze wspólnego interfejsu biblioteki, ale **nie zastępuje** dołączenia pliku `bibl.o` na etapie linkowania.
- Kompilacja (`gcc -c`) i linkowanie (`gcc ... .o`) to dwa różne etapy.
- Ostrzeżeń kompilatora o niezgodności typów nie wolno ignorować — w tym ćwiczeniu wskazują rzeczywisty problem.
- Aby dodać funkcję do projektu wieloplikowego, zwykle trzeba dopisać **deklarację, definicję i wywołanie**.
