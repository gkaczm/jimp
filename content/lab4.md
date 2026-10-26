# Laboratorium 4 — Programy wieloplikowe i biblioteka operacji na wektorach

## 1. Cel laboratorium

Budujemy program, który wczytuje dwa wektory liczb typu `double`, oblicza ich normy i — jeśli mają tę samą liczbę elementów — iloczyn skalarny. Następnie rozbudujemy go o dodawanie wektorów, kolejne normy, zapis danych do pliku i normalizację z wykorzystaniem wskaźnika na funkcję.

Obliczenia umieszczamy we własnej **bibliotece wektorowej**, czyli zestawie funkcji, z których korzysta program główny. Dzięki temu możemy rozbudowywać obliczenia bez umieszczania całego kodu w `main()`.

Punktem wyjścia jest [projekt do pobrania](../downloads/lab4/lmp4_start.zip), zawierający cztery pliki:

```text
bibl.h     — deklaracje funkcji biblioteki
bibl.c     — definicje funkcji biblioteki
main.c     — program główny korzystający z biblioteki
dane.txt   — przykładowe dane wejściowe
```

Dane wejściowe składają się z dwóch wektorów. Każdy zapisujemy jako liczbę elementów, po której występują wartości w nawiasach kwadratowych, np. `3 [ 1.5 2.0 2.0 ]`. Na początku program potrafi je odczytać i wykonać dwie operacje; w kolejnych ćwiczeniach będziemy dopisywać następne.

## 2. Plik `bibl.h` — deklaracje funkcji

W pliku nagłówkowym `.h` umieszczamy **deklaracje** funkcji: ich nazwy, typy argumentów i typy zwracanych wartości. Deklaracje pozwalają kompilatorowi sprawdzić poprawność wywołań w innych plikach. Same instrukcje wykonywane przez funkcje znajdą się w `bibl.c`.

```c
#ifndef BIBL_H
#define BIBL_H

#include <stdio.h>

/* Wczytuje wektor z pliku; zwraca liczbe elementow lub -1. */
int read(FILE *p, double v[], int max_n);

/* Oblicza norme euklidesowa wektora. */
double L2(double v[], int n);

/* Oblicza iloczyn skalarny dwoch wektorow. */
double dot_product(double v[], double u[], int n);

#endif
```

Deklaracja `double L2(double v[], int n);` kończy się średnikiem. Zawiera informację, **jak wywołać funkcję**, ale jeszcze nie definiuje jej działania. Z kolei `#include <stdio.h>` udostępnia typ `FILE`, wykorzystywany w deklaracji `read()`.

### Dlaczego stosujemy `#ifndef`, `#define` i `#endif`?

Zanim kompilator zacznie tłumaczyć kod C, **preprocesor** obsługuje dyrektywy zaczynające się od `#`. Dyrektywa `#include "bibl.h"` powoduje włączenie zawartości tego pliku w miejscu wystąpienia dyrektywy. Gdy kolejne nagłówki dołączają się nawzajem, ten sam plik może zostać włączony więcej niż raz.

Mechanizm *include guard* sprawia, że zawartość nagłówka jest przetwarzana tylko raz w ramach kompilacji danego pliku źródłowego:

1. `#ifndef BIBL_H` sprawdza, czy nazwa `BIBL_H` nie została wcześniej zdefiniowana. Przy pierwszym włączeniu warunek jest spełniony.
2. `#define BIBL_H` definiuje tę nazwę, więc przy kolejnym włączeniu warunek z pierwszej linii nie będzie spełniony.
3. `#endif` kończy obszar objęty tym sprawdzeniem.

Bez tego zabezpieczenia nasze obecne prototypy funkcji nadal mogłyby się poprawnie kompilować, ponieważ zgodne deklaracje wolno powtarzać. W większych nagłówkach mogą jednak występować np. definicje struktur, których powtórzenie powodowałoby błędy. *Include guard* chroni przed takimi wielokrotnymi definicjami.

## 3. Plik `bibl.c` — definicje funkcji

W `bibl.c` znajdują się implementacje funkcji zadeklarowanych w nagłówku. `read()` odczytuje liczby z pliku, `L2()` oblicza normę euklidesową, a `dot_product()` — iloczyn skalarny. W kodzie początkowym pozostawiono dwa błędy, które wykorzystamy podczas testowania programu.

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
        /* Sprawdzamy zgodnosc formatu z typem elementu tablicy. */
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
    int suma_kwadratow = 0; /* Jakiego typu powinna byc suma? */

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

Funkcja `read()` najpierw odczytuje liczbę elementów `n` i sprawdza, czy mieści się ona w dopuszczalnym zakresie. Następnie oczekuje znaku `[`, wczytuje `n` liczb i sprawdza obecność znaku `]`. Gdy format jest niepoprawny, zwraca `-1`. Operator `||` oznacza logiczne **LUB**: wystarczy, że jeden z warunków błędu jest prawdziwy.

Dwie funkcje numeryczne korzystają z następujących wzorów:

- **Norma L2:** `sqrt(v[0]*v[0] + ... + v[n-1]*v[n-1])` — pierwiastek z sumy kwadratów elementów.
- **Iloczyn skalarny:** `v[0]*u[0] + ... + v[n-1]*u[n-1]` — suma iloczynów odpowiadających sobie elementów dwóch wektorów.

### Skąd różnica między `%lf` w `fscanf()` i `%f` w `printf()`?

`fscanf()` odczytuje dane i **zapisuje je pod przekazanym adresem**. Specyfikator formatu musi zatem odpowiadać typowi wskaźnika:

- `%f` oczekuje argumentu typu `float *`;
- `%lf` oczekuje argumentu typu `double *`.

Element `v[i]` ma typ `double`, więc `&v[i]` ma typ `double *`. Odczyt takiej wartości wymaga formatu `%lf`. Niezgodność specyfikatora ze wskaźnikiem prowadzi do nieprawidłowego zapisu w pamięci.

`printf()` działa inaczej: otrzymuje **wartość do wypisania**, a nie adres miejsca, do którego ma ją zapisać. W argumentach tej funkcji wartości typu `float` są automatycznie przekształcane w `double`; specyfikator `%f` służy do wypisywania `double`, a zapis `%.3f` ogranicza wynik do trzech cyfr po przecinku.

### Dlaczego typ zmiennej sumującej ma znaczenie?

W normie L2 sumujemy kwadraty elementów tablicy typu `double`. Kwadraty mogą mieć część ułamkową. Jeżeli przechowujemy sumę w zmiennej `int`, przy kolejnych przypisaniach tracimy tę część, więc wynik normy może być błędny. Zmienna akumulująca sumę powinna mieć typ pozwalający przechowywać wartości niecałkowite.

## 4. Plik `main.c` — użycie biblioteki

Program główny przygotowuje tablice, otwiera plik wejściowy, wczytuje dwa wektory i korzysta z funkcji udostępnionych przez `bibl.h`. Obliczenia pozostają w `bibl.c`, dlatego późniejsze rozszerzanie biblioteki nie wymaga przepisywania istniejących algorytmów do `main()`.

```c
#include <stdio.h>
#include "bibl.h"

int main(int argc, char *argv[])
{
    double v[10], u[10];
    int n_v, n_u, i;
    FILE *we = stdin;

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

Dzięki `#include "bibl.h"` kompilator zna deklaracje `read()`, `L2()` i `dot_product()`. Definicje tych funkcji zostaną dołączone podczas **linkowania**, czyli łączenia osobno skompilowanych części programu.

Jeśli uruchamiamy program z argumentem `dane.txt`, nazwa pliku znajduje się w `argv[1]`. Gdy nazwa pliku nie zostanie podana, odczytujemy dane ze standardowego wejścia `stdin`. W obliczaniu iloczynu skalarnego sprawdzamy równość liczby elementów obu wektorów.

## 5. Kompilacja i linkowanie

Każdy plik `.c` można skompilować osobno do pliku obiektowego `.o`. Następnie **linker** łączy przygotowane części w jeden program wykonywalny.

```bash
gcc -Wall -c bibl.c
gcc -Wall -c main.c
gcc main.o bibl.o -o lmp4 -lm
```

Opcja `-c` oznacza kompilację bez linkowania. `-o lmp4` nadaje nazwę programowi wynikowemu, a `-lm` dołącza bibliotekę matematyczną używaną przez `sqrt()`.

Ten sam program powstanie również po wykonaniu jednej komendy:

```bash
gcc -Wall main.c bibl.c -o lmp4 -lm
```

Pierwszy sposób pozwala ponownie kompilować wyłącznie zmienione pliki `.c`, gdy ich zależności nie uległy zmianie. Jeśli modyfikujemy również wspólny nagłówek `bibl.h`, ponownej kompilacji mogą wymagać oba pliki źródłowe.

### Ćwiczenie 1. Pierwsza kompilacja i poprawa błędów

Kompilujemy projekt z opcją `-Wall` i analizujemy ostrzeżenia. W `bibl.c` poprawiamy format odczytu elementów typu `double`, a następnie typ zmiennej sumującej kwadraty w funkcji `L2()`. Po zmianach kompilujemy projekt ponownie.

## 6. Dane wejściowe i kontrola wyników

Plik `dane.txt` zawiera:

```text
3 [ 1.5 2.0 2.0 ]
3 [ 2.0 -1.0 0.5 ]
```

Każdy wektor ma trzy elementy. Uruchamiamy program poleceniem:

```bash
./lmp4 dane.txt
```

Po poprawieniu błędów otrzymujemy następujące wyniki (do trzech miejsc po przecinku):

```text
Norma L2(v): 3.202
Norma L2(u): 2.291
Iloczyn skalarny: 2.000
```

### Ćwiczenie 2. Testowanie danych

Porównujemy wyniki programu z obliczeniami wykonanymi ręcznie. Następnie zmieniamy jedną liczbę w `dane.txt` i sprawdzamy wpływ tej zmiany na iloczyn skalarny. Testujemy również przypadek wektorów o różnej liczbie elementów.

## 7. Zadanie na zaliczenie — rozbudowa biblioteki wektorowej

Rozszerzamy istniejący projekt o **pięć nowych funkcji**: dodawanie wektorów, normy L1 i L∞, zapis wektora do pliku oraz normalizację z wykorzystaniem wskaźnika na funkcję. Wszystkie funkcje stają się częścią biblioteki `bibl`, a ich działanie sprawdzamy w programie głównym.

W przypadku **każdej funkcji** uzupełniamy trzy pliki projektu:

1. W `bibl.h` umieszczamy **deklarację**, określającą nazwę funkcji, typy jej argumentów i typ zwracanej wartości.
2. W `bibl.c` zapisujemy **definicję**, czyli implementację funkcji.
3. W `main.c` dodajemy **wywołanie** funkcji oraz kod pozwalający sprawdzić i wyświetlić wynik.

Po zmianach ponownie kompilujemy program i sprawdzamy wyniki na danych z `dane.txt`. W razie potrzeby tworzymy w `main.c` dodatkowe tablice na wyniki obliczeń.

**Ważne — funkcje modyfikujące tablicę w miejscu.** Niektóre funkcje wyłącznie odczytują dane, ale `normalize()` **zmienia zawartość przekazanej tablicy**. Gdy chcemy porównać normalizację według różnych norm (L1, L2 i L∞), każda z nich musi otrzymać **takie same wartości początkowe**. Dlatego pracujemy na kopii wektora, pozostawiając oryginał bez zmian. Przed kolejnym wywołaniem możemy utworzyć nową kopię albo ponownie skopiować wartości do tej samej tablicy. W przeciwnym razie kolejne wywołanie otrzyma dane zmodyfikowane przez poprzednie.

Przykładowo, w `main.c` (gdzie zmienna `i` jest już zadeklarowana) tablica `kopia` może przechowywać wartości z `v` przed wykonaniem jednej normalizacji:

```c
double kopia[10];

for (i = 0; i < n_v; i++)
    kopia[i] = v[i];

normalize(kopia, n_v, L1);
```

Przed przetestowaniem `normalize()` z normą `L2` lub `Linf` **ponownie kopiujemy wartości z `v` do `kopia`**, aby każdy wariant rozpoczynał pracę od tego samego wektora. Ten fragment ilustruje sposób przygotowania danych do testów — deklarację i definicję `normalize()` opracowujemy w ramach zadania.

### 7.1. Dodawanie wektorów — `add_vectors()`

Dodajemy funkcję przyjmującą dwa wektory o tej samej liczbie elementów, tablicę na wynik i liczbę elementów. Funkcja nic nie zwraca (`void`), ponieważ **zapisuje sumę do przekazanej tablicy wynikowej**.

Dodawanie wykonujemy element po elemencie: `wynik[i] = v[i] + u[i]`. W `main.c` przygotowujemy miejsce na wynik i wywołujemy funkcję tylko wtedy, gdy wektory mają tę samą liczbę elementów.

Dla danych z `dane.txt`:

```text
v + u = [3.5, 1.0, 2.5]
```

### 7.2. Norma L1 — `L1()`

Dodajemy funkcję przyjmującą wektor i liczbę jego elementów, zwracającą wynik typu `double`. **Norma L1** to suma wartości bezwzględnych wszystkich elementów:

```text
L1(v) = |v[0]| + |v[1]| + ... + |v[n-1]|
```

Do obliczania wartości bezwzględnej liczb typu `double` służy `fabs()` z `<math.h>`. Dla wektorów z `dane.txt` otrzymujemy odpowiednio **5.500** i **3.500**.

### 7.3. Norma nieskończoność — `Linf()`

Dodajemy funkcję przyjmującą wektor i liczbę jego elementów, zwracającą wynik typu `double`. **Norma nieskończoność (L∞)** to największa wartość bezwzględna spośród elementów wektora:

```text
Linf(v) = max(|v[0]|, |v[1]|, ..., |v[n-1]|)
```

Podczas wyszukiwania maksimum można przyjąć początkową wartość równą `0.0`, ponieważ wartości bezwzględne są nieujemne. Dla obu przykładowych wektorów norma wynosi **2.000**.

### 7.4. Zapis wektora do pliku — `write_vector()`

Dodajemy funkcję zapisującą wektor do strumienia `FILE *` **w tym samym formacie, który rozpoznaje `read()`**. Dzięki temu zapisane dane można później ponownie wczytać.

Funkcja przyjmuje wskaźnik na otwarty plik, tablicę liczb `double` i liczbę jej elementów. Zwraca `0` po poprawnym zapisie albo `-1`, gdy wystąpi błąd zapisu. Do zapisywania danych wykorzystujemy `fprintf()`, którego wartość zwracana pozwala rozpoznać błąd.

W `main.c` otwieramy plik `wynik.txt` w trybie zapisu (`fopen("wynik.txt", "w")`), sprawdzamy powodzenie otwarcia, zapisujemy do niego **sumę wektorów** otrzymaną z `add_vectors()` i zamykamy plik przez `fclose()`.

Przykładowa zawartość pliku:

```text
3 [ 3.5 1 2.5 ]
```

### 7.5. Normalizacja wektora — `normalize()`

Normalizacja polega na podzieleniu **każdego elementu wektora przez jego normę**. Rodzaj normy przekazujemy jako argument, dzięki czemu jedna funkcja `normalize()` może korzystać zarówno z `L1()`, `L2()`, jak i `Linf()`.

Funkcja przyjmuje wektor, liczbę jego elementów oraz **wskaźnik na funkcję** obliczającą normę. Funkcja normy przyjmuje tablicę `double[]` i liczbę jej elementów (`int`), a zwraca `double`. Odpowiadający temu typ parametru zapisujemy następująco:

```c
double (*norma)(double [], int)
```

`normalize()` modyfikuje przekazany wektor **w miejscu** i nic nie zwraca (`void`). Najpierw obliczamy normę całego, niezmienionego wektora i zapisujemy wynik w zmiennej, a dopiero później dzielimy przez nią poszczególne elementy. Gdy norma wynosi `0`, pozostawiamy wektor bez zmian, aby uniknąć dzielenia przez zero.

W `main.c` sprawdzamy normalizację z użyciem `L1`, `L2` i `Linf`. Zgodnie z uwagą w poleceniu głównym, **przed każdym wywołaniem przywracamy w kopii oryginalne wartości**. Dla `v = [1.5, 2.0, 2.0]` otrzymujemy w przybliżeniu:

| Funkcja normy | Wektor po normalizacji |
| --- | --- |
| `L1` | `[0.273, 0.364, 0.364]` |
| `L2` | `[0.469, 0.625, 0.625]` |
| `Linf` | `[0.750, 1.000, 1.000]` |

## 8. Podsumowanie

W jednym projekcie wykorzystaliśmy deklaracje i definicje funkcji, kompilację osobnych plików, operacje na tablicach, odczyt i zapis danych oraz wskaźnik na funkcję. Własna biblioteka pozwala rozwijać program przez dopisywanie kolejnych operacji bez przenoszenia całej logiki obliczeń do `main()`.

Po każdej modyfikacji sprawdzamy zgodność deklaracji z definicją, kompilujemy zmienione pliki i testujemy program na danych, dla których znamy oczekiwany wynik.
