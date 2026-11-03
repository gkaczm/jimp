# Laboratorium 2 — Podstawy programowania w języku C

## 1. Cel i materiały

To archiwalna instrukcja do drugiego laboratorium. Ćwiczymy przekazywanie argumentów programu, funkcje operujące na tablicach, generator liczb pseudolosowych oraz zapis i odczyt liczb z plików tekstowych. Na koniec obliczamy podstawowe statystyki i obserwujemy, jak rozmiar danych wpływa na czas pracy programu.

Pobieramy [zestaw kodów LMP/2](downloads/lab2/lmp2_kody.zip), zawierający `p1.c`, `p2.c` i `p3.c`. Materiał zachowuje strukturę archiwalnych zajęć; trzy niewielkie zabezpieczenia kodu opisano na końcu strony.

## 2. Pierwszy program — suma elementów tablicy

Pierwszy program odczytuje liczby podane jako argumenty uruchomienia i umieszcza je w tablicy. Następnie wyświetla tablicę i oblicza sumę jej elementów za pomocą osobnej funkcji `sum()`.

```c
#include <stdio.h>
#include <stdlib.h>

double sum(double v[], int n)
{
    double s = v[0];
    while (--n)
        s += v[n];
    return s;
}

void pwekt(double v[], int n)
{
    int i;
    printf("[");
    for (i = 0; i < n; i++)
        printf(" %g", v[i]);
    printf(" ]");
}

int main(int argc, char *argv[])
{
    double r[1000];
    int i;
    int l = argc - 1;

    /* Bez argumentow funkcja sum() odczytalaby niezainicjowane r[0]. */
    if (l == 0 || l > 1000) {
        fprintf(stderr, "Podaj od 1 do 1000 liczb.\n");
        return 1;
    }

    for (i = 1; i < argc; i++)
        r[i - 1] = atof(argv[i]);

    pwekt(r, l);
    printf(", suma elementow = %g\n", sum(r, l));
    printf("wektor ma %d elementow\n", l);
    return 0;
}
```

W `main()` argumenty `argv[1]`, `argv[2]` i kolejne są napisami, a `atof()` zamienia je na liczby rzeczywiste. Funkcja `pwekt()` wypisuje tablicę, a `sum()` zwraca obliczoną sumę. Zwracamy uwagę na to, że zmienna `n` wewnątrz `sum()` jest lokalną kopią liczby elementów — jej zmniejszanie nie zmienia `l` w `main()`.

Kompilujemy i uruchamiamy:

```bash
gcc -Wall p1.c -o suma
./suma 1 2 3 4 5.5 6.6 7.7
```

Oczekiwany wynik sumy to `29.8`, a liczba elementów nadal wynosi `7`.

### Ćwiczenie. Argumenty, `while` i bezpieczeństwo tablicy

Sprawdzamy, co robi `atof()`, gdy otrzyma napis niebędący poprawną liczbą. Następnie zastępujemy pętlę `while` w `sum()` pętlą `for` i ponownie porównujemy wyniki.

W oryginalnym materiale proponowano także usunięcie `#include <stdlib.h>` oraz przepełnienie tablicy przez zbyt wiele argumentów. Pierwszy eksperyment pokazuje, dlaczego ważna jest deklaracja `atof()` — **po otrzymaniu ostrzeżenia przywracamy nagłówek, zanim uruchomimy program**. Drugi omawiamy bez wywoływania błędu pamięci: dostępna wersja programu sprawdza liczbę argumentów i informuje o przekroczeniu pojemności tablicy.

## 3. Drugi program — generator liczb pseudolosowych

Drugi program generuje `n` liczb rzeczywistych w podanym przedziale. Może wypisywać je na standardowe wyjście (`stdout`) albo zapisywać do pliku wskazanego jako czwarty argument programu.

```c
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

/* Makro LL podajemy podczas kompilacji, np. -DLL=5. */
int main(int argc, char *argv[])
{
    int n = argc > 1 ? atoi(argv[1]) : 10;
    double min = argc > 2 ? atof(argv[2]) : 0.0;
    double max = argc > 3 ? atof(argv[3]) : 1.0;
    FILE *out = argc > 4 ? fopen(argv[4], "w") : stdout;
    int i;

    if (out == NULL) {
        fprintf(stderr, "%s: nie moge pisac do %s\n", argv[0], argv[4]);
        return 1;
    }

    srand((unsigned)time(NULL));
    for (i = 0; i < n; i++) {
        double ulamek = (double)rand() / RAND_MAX;
        fprintf(out, "%g%c", min + (max - min) * ulamek,
                i % LL == LL - 1 ? '\n' : ' ');
    }
    if (i % LL != 0)
        fprintf(out, "\n");

    if (out != stdout)
        fclose(out);
    return 0;
}
```

`rand()` zwraca liczbę całkowitą z przedziału od `0` do `RAND_MAX`. Dzielenie `(double)rand() / RAND_MAX` daje ułamek z przedziału od `0` do `1`, a wyrażenie `min + (max - min) * ulamek` przelicza go na żądany przedział. `srand(time(NULL))` inicjalizuje generator na podstawie aktualnego czasu; bez wywołania `srand()` kolejne uruchomienia zwykle odtwarzają tę samą sekwencję.

### Makro `LL` i kompilacja

Kod używa `LL` do ustalenia, ile liczb wypisać w jednym wierszu. Tak jak w oryginalnej instrukcji, definiujemy tę wartość podczas kompilacji opcją `-D` (alternatywą jest dopisanie na początku pliku `#define LL 5`).

```bash
gcc -Wall -DLL=5 p2.c -o generator
./generator
./generator 12 -5 5
./generator 20 0 10 dane.txt
```

Operator `%` zwraca resztę z dzielenia, a `i % LL == LL - 1 ? '\n' : ' '` wybiera znak nowej linii po każdej grupie `LL` wartości. Funkcja `fprintf()` zapisuje wynik do wybranego strumienia: `stdout` lub pliku otwartego przez `fopen(..., "w")`. Jeśli `fopen()` zwróci `NULL`, program wypisze błąd na `stderr`.

### Ćwiczenie. Zachowanie generatora

Uruchamiamy program z różnymi liczbami argumentów, a następnie tymczasowo usuwamy `srand()` i porównujemy kolejne wyniki. Testujemy również `#define LL 3` i zestawiamy jego działanie z opcją `-DLL=5` — definicji makra nie należy jednocześnie ustawiać na dwie różne wartości bez przemyślenia kolejności.

Na koniec generujemy większy plik, np. milion liczb:

```bash
./generator 1000000 0 10 milion.txt
```

## 4. Trzeci program — statystyki danych z pliku

Trzeci program czyta kolejne wartości `double` z pliku tekstowego albo ze standardowego wejścia (`stdin`). Bez przechowywania całego zbioru w tablicy oblicza liczbę elementów, sumę, średnią i odchylenie standardowe.

```c
#include <stdio.h>
#include <math.h>

int main(int argc, char *argv[])
{
    FILE *in = argc > 1 ? fopen(argv[1], "r") : stdin;
    if (in != NULL) {
        double sum = 0;
        double sum2 = 0;
        double x;
        int n = 0;

        while (fscanf(in, "%lf", &x) == 1) {
            sum += x;
            sum2 += x * x;
            n++;
        }
        if (in != stdin)
            fclose(in);
        if (n == 0) {
            fprintf(stderr, "Brak danych liczbowych.\n");
            return 1;
        }

        printf("\tn=%d, sum=%g, avg=%g std_dev=%g\n",
               n, sum, sum / n, sqrt(n * sum2 - sum * sum) / n);
        return 0;
    }
    return 1;
}
```

Instrukcja `fscanf(in, "%lf", &x)` próbuje odczytać jedną liczbę typu `double`. Gdy odczyt się powiedzie, funkcja zwraca `1` i pętla trwa dalej. `&x` oznacza adres zmiennej, pod którym ma zostać zapisana odczytana wartość. Gdy napotkamy koniec danych albo tekst niebędący liczbą, pętla się kończy.

W każdym kroku zwiększamy `n`, dodajemy wartość do `sum` i jej kwadrat do `sum2`. Średnia wynosi `sum/n`, a odchylenie standardowe liczymy ze wzoru `sqrt(n*sum2 - sum*sum)/n`, odpowiadającego odchyleniu populacyjnemu. Jest to jednoprzebiegowa metoda z oryginalnego materiału, ale przy danych o bardzo małej wariancji może być niedokładna numerycznie.

### Kompilacja i pierwsze testy

Ponieważ używamy funkcji `sqrt()` z biblioteki matematycznej, dołączamy ją opcją `-lm`. Kompilujemy program pod nazwą `stat` i przetwarzamy plik utworzony w poprzednim ćwiczeniu.

```bash
gcc -Wall p3.c -lm -o stat
./stat milion.txt
```

Możemy też przekierować standardowe wejście, zamiast przekazywać nazwę pliku:

```bash
./stat < milion.txt
```

Oba wywołania powinny zwrócić te same statystyki dla tego samego zestawu danych.

### Ćwiczenie. Wielkość danych i czas wykonania

Przygotowujemy kilka plików o różnych rozmiarach, a następnie porównujemy czas obliczeń. W oryginalnym ćwiczeniu wykorzystano 1000, 1 000 000 i 10 000 000 liczb; największy zestaw możemy pominąć, jeśli nie potrzebujemy tak dużego pliku.

```bash
./generator 1000 0 10 tysiac.txt
./generator 1000000 0 10 milion.txt
time ./stat tysiac.txt
time ./stat milion.txt
```

Polecenie `time` mierzy czas wykonania programu. Porównujemy też wynik średniej dla obu zestawów, pamiętając, że generator jest pseudolosowy, a otrzymane liczby mogą być różne w kolejnych uruchomieniach.

## 5. Archiwalne warianty zadania zaliczeniowego

W oryginalnej instrukcji prowadzący wybierał jedno rozszerzenie trzeciego programu. W każdym wariancie należało wczytać dane do wektora, a następnie dopisać osobną funkcję obliczającą odpowiednio **średnią lub odchylenie standardowe**, **minimum lub maksimum**, albo **długość euklidesową wektora**.

Te warianty pozostawiamy jako materiał powtórkowy z przeprowadzonych zajęć. Nie są dodatkowym zadaniem do oddania.

## 6. Uwagi do archiwalnego kodu

Przykłady zachowują oryginalne nazwy funkcji, kolejność działania, mechanizmy języka i wzór obliczeń. W plikach do pobrania dodano jedynie podstawowe zabezpieczenia: `p1.c` sprawdza, czy podano przynajmniej jedną liczbę i czy nie przekroczono 1000 argumentów liczbowych; `p2.c` zamyka własny plik wynikowy (ale nie `stdout`); `p3.c` sprawdza, czy wczytano jakąkolwiek liczbę, i nie zamyka `stdin`.

---

*Opracowano na podstawie archiwalnych materiałów „Laboratorium metodyki programowania”, ćwiczenie 2, WikiDyd PW (2015). Zachowano pierwotne ćwiczenia i warianty zaliczenia, dostosowując format instrukcji do obecnej strony.*
