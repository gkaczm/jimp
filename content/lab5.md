# Laboratorium 5 — Uruchamianie i debugowanie programów

## 1. Cel laboratorium

Podczas tego laboratorium naprawimy dwa programy sortujące liczby: **Insertion Sort** (sortowanie przez wstawianie) oraz **Quick Sort** (sortowanie szybkie). Program, który się kompiluje, nie musi działać poprawnie — dlatego nauczymy się odróżniać błędy kompilacji, błędy wykonania i błędy logiczne, a następnie znajdować ich przyczyny.

Naszym głównym narzędziem będzie **GDB**, czyli debugger pozwalający zatrzymać program w wybranym miejscu, wykonywać go krok po kroku i sprawdzać wartości zmiennych. Nie piszemy algorytmów od zera: otrzymamy ich błędne implementacje i doprowadzimy je do poprawnego działania.

Pobieramy [pliki startowe LMP/5](downloads/lab5/lmp5_start.zip) i rozpakowujemy je w osobnym katalogu. Zestaw zawiera:

```text
insort.h     — deklaracja funkcji insort()
insort.c     — sortowanie przez wstawianie, celowo błędne
test.c       — generator danych i test poprawności sortowania
q_sort.h     — deklaracja funkcji q_sort()
q_sort.c     — sortowanie szybkie, celowo błędne
README.txt   — komendy potrzebne do uruchomienia projektu
```

**Ważne:** błędy w `insort.c` i `q_sort.c` są zamierzone. Nie zastępujemy algorytmów gotową funkcją `qsort()` z biblioteki standardowej — naszym zadaniem jest zdiagnozowanie i naprawienie otrzymanego kodu.

## 2. Sortowanie przez wstawianie — `insort()`

Insertion Sort porządkuje tablicę, przechodząc od drugiego elementu do ostatniego. W każdym kroku zakładamy, że elementy po lewej stronie są już posortowane, a bieżący element wstawiamy na właściwe miejsce, przesuwając większe wartości w prawo.

Na przykład dla tablicy `[3.0, 2.1, 1.4, 4.6]` pierwsze dwie iteracje wyglądają następująco:

```text
Początek:       [ 3.0, 2.1, 1.4, 4.6 ]
Wstawiamy 2.1:  [ 2.1, 3.0, 1.4, 4.6 ]
Wstawiamy 1.4:  [ 1.4, 2.1, 3.0, 4.6 ]
```

W trakcie wstawiania zapamiętujemy przesuwany element w zmiennej `tmp`. Dzięki temu przesunięcie innych wartości nie powoduje jego utraty.

W pliku `insort.c` znajduje się następujący kod (zawierający zarówno błędy wykrywane przez kompilator, jak i błędy ujawniające się podczas uruchamiania):

```c
#include "insort.h"

void insort(double v[], int n)
{
    int i, j;

    for (i = 1; i < n; i++) {
        double tmp = v[j];
        for (j = i - 1; v[j] > tmp, j--)
            v[j + 1] = v[j];
        v[j + 1] = tnp;
    }
}
```

**Nie poprawiamy jeszcze wszystkiego naraz.** Najpierw doprowadzimy program do poprawnej kompilacji, a dopiero potem sprawdzimy jego zachowanie przy pomocy debuggera.

### Ćwiczenie 1. Pierwsza kompilacja

Kompilujemy równocześnie plik z algorytmem i programem testującym. Opcja `-Wall` włącza przydatne ostrzeżenia, `-g` umieszcza w programie informacje dla debuggera, a `-o` nadaje nazwę plikowi wynikowemu.

```bash
gcc -Wall -g -DMAX_ELEM_2_PRINT=12 insort.c test.c -o insort_test
```

Dodatkowa opcja `-DMAX_ELEM_2_PRINT=12` definiuje **makro preprocesora** o wartości `12`. Korzysta z niego `test.c`, aby nie wyświetlać całych bardzo długich tablic. Jest to odpowiednik umieszczenia `#define MAX_ELEM_2_PRINT 12` przed użyciem makra w kodzie.

Odczytujemy komunikaty kompilatora i poprawiamy błędy składniowe w `insort.c`. **Po każdej poprawce ponawiamy kompilację.** Dopiero gdy powstanie program `insort_test`, przechodzimy dalej. Ostrzeżenia również warto przeczytać — poprawna kompilacja nie oznacza jeszcze poprawnego programu.

## 3. Program testujący — dane, argumenty i kontrola wyniku

Plik `test.c` tworzy tablicę `double` o długości `n`, wypełnia ją liczbami pseudolosowymi, wywołuje `insort()` i sprawdza, czy każdy kolejny element jest nie mniejszy od poprzedniego. W przypadku błędu wyświetla informację, które sąsiednie wartości znajdują się w nieprawidłowej kolejności.

Uruchamiamy program na przykład tak:

```bash
./insort_test 10 0
```

Pierwszy argument (`10`) określa **liczbę elementów tablicy**. Drugi (`0`) jest **ziarnem generatora liczb pseudolosowych**. To, jakie liczby zostaną wygenerowane, zależy od ziarna; przy tej samej implementacji `rand()` to samo ziarno odtwarza tę samą sekwencję. Bez drugiego argumentu ziarno pochodzi z aktualnego czasu, więc dane wejściowe zwykle będą się różnić między uruchomieniami.

W programie testującym wykorzystujemy kilka znanych już mechanizmów:

```c
int n = argc > 1 ? atoi(argv[1]) : 1000;

double *v = malloc(n * sizeof *v);

srand(argc > 2 ? (unsigned)atoi(argv[2]) : (unsigned)time(NULL));

for (i = 0; i < n; i++)
    v[i] = (2.0 * rand() / RAND_MAX - 1.0) * n;
```

Operator warunkowy `warunek ? a : b` wybiera jedną z dwóch wartości. `argc` określa liczbę argumentów programu, a `argv[1]` i `argv[2]` pozwalają odczytać argumenty wpisane w terminalu. `atoi()` przekształca tekst na liczbę całkowitą; `malloc()` przydziela pamięć na tablicę, a `srand()` i `rand()` sterują losowaniem. W pełnym pliku `test.c` sprawdzamy również poprawność `n`, wynik `malloc()` oraz zwalniamy pamięć przez `free()`.

**Uwaga:** w oryginalnym materiale źródłowym sposób generowania liczb był zapisany inaczej. W dostarczonym `test.c` wykorzystujemy dzielenie zmiennoprzecinkowe przed mnożeniem, aby uniknąć przepełnienia przy pośrednim mnożeniu liczb całkowitych. Nie zmienia to zadania dotyczącego debugowania sortowania.

### Ćwiczenie 2. Pierwsze uruchomienie

Uruchamiamy program kilkakrotnie, zmieniając liczbę elementów i ziarno. Obserwujemy tablicę wejściową, ewentualny komunikat o awarii oraz komunikaty kontroli poprawności.

```bash
./insort_test 10 0
./insort_test 20 0
./insort_test 10 1
```

Jeśli program zakończy się błędem `Segmentation fault`, oznacza to próbę niedozwolonego dostępu do pamięci. Taka awaria jest jedną z możliwych konsekwencji błędów obecnych w `insort.c`. Czasem niepoprawny odczyt pamięci nie powoduje natychmiastowej awarii, dlatego **sam brak komunikatu `Segmentation fault` nie dowodzi, że kod jest poprawny**.

## 4. Debugowanie w GDB

Debugger pozwala obserwować działanie programu w chwili, gdy wykonuje się interesujący nas fragment kodu. Będziemy uruchamiać program pod kontrolą GDB, zatrzymywać go przed wejściem do `insort()` i sprawdzać wartości indeksów używanych do odczytu elementów tablicy.

Kompilacja z `-g` powinna już być wykonana. Uruchamiamy:

```bash
gdb -q ./insort_test
```

Wewnątrz GDB pojawia się znak zachęty `(gdb)`. Od tej chwili wpisujemy polecenia debuggera, a nie polecenia powłoki.

| Polecenie | Znaczenie |
| --- | --- |
| `break insort` | Zatrzymaj program na początku funkcji `insort()` |
| `run 10 0` | Uruchom program z argumentami `10` i `0` |
| `next` | Wykonaj następną linię, bez wchodzenia do wywołanej funkcji |
| `step` | Wykonaj następny krok, wchodząc do wywołanej funkcji |
| `print i` | Wyświetl bieżącą wartość zmiennej `i` |
| `print j` | Wyświetl bieżącą wartość zmiennej `j` |
| `continue` | Wznów działanie do następnego zatrzymania |
| `backtrace` | Pokaż stos wywołań funkcji |
| `quit` | Wyjdź z debuggera |

### Ćwiczenie 3. Znalezienie pierwszej przyczyny błędu

Wykonujemy poniższy zestaw poleceń. Po zatrzymaniu na początku `insort()` przechodzimy krokowo do linii wykorzystujących zmienne `i` i `j` i sprawdzamy ich wartości.

```text
(gdb) break insort
(gdb) run 10 0
(gdb) next
(gdb) print i
(gdb) print j
(gdb) print n
```

Zastanawiamy się: **które indeksy są dozwolone dla tablicy o `n` elementach?** Czy każda zmienna używana jako indeks ma w tym momencie określoną wartość? Czy instrukcja pobiera element, który rzeczywiście chcieliśmy zapamiętać?

Jeśli program zatrzyma się na `SIGSEGV`, możemy użyć `backtrace`, aby ustalić, w której funkcji i na jakiej linii nastąpiła awaria. W zależności od kompilatora, uruchomienia i błędu nie każde niepoprawne odwołanie do pamięci musi prowadzić do awarii w identycznym miejscu.

**Poprawiamy zidentyfikowany problem**, zamykamy GDB i ponownie kompilujemy projekt. Sprawdzamy, czy program działa. Jeśli nadal nie, uruchamiamy debugger jeszcze raz i szukamy kolejnej przyczyny.

### Ćwiczenie 4. Sprawdzanie granic tablicy

Podczas debugowania pętli wewnętrznej obserwujemy zmienną `j`. Wartości indeksów tablicy o `n` elementach powinny mieścić się w przedziale od `0` do `n - 1` — również wtedy, gdy indeks zmniejszamy w pętli.

Ustalamy, czy **warunek pętli** na pewno chroni przed odczytem poza granicami tablicy. W C kolejne części warunku połączone operatorem `&&` są sprawdzane od lewej do prawej, a gdy pierwsza część jest fałszywa, pozostałe nie są obliczane. Kolejność warunków ma więc znaczenie dla bezpieczeństwa odczytu.

Po naprawieniu `insort()` kompilujemy program i testujemy go na kilku danych wejściowych:

```bash
./insort_test 10 0
./insort_test 30 10
./insort_test 100 1
```

W poprawnym programie tablica wynikowa jest uporządkowana rosnąco, a program testujący wyświetla `Kontrola: OK`. Test dla małej tablicy ułatwia prześledzenie wszystkich elementów; większe tablice pozwalają sprawdzić więcej przypadków.

## 5. Sortowanie szybkie — `q_sort()`

Quick Sort działa inaczej niż Insertion Sort. Najpierw wybiera element zwany **pivotem**, dzieli tablicę tak, aby mniejsze wartości znalazły się po jego lewej stronie, a większe lub równe — po prawej, a następnie rekurencyjnie sortuje obie części.

Dla przykładu, jeśli pivotem jest `3.0`, po poprawnym podziale może powstać taka sytuacja:

```text
Przed podziałem: [ 3.0, 2.1, 1.4, 4.6, 7.7, 5.8, 6.1 ]
Po podziale:    [ 2.1, 1.4, 3.0, 7.7, 4.6, 5.8, 6.1 ]
                             ^ pivot na właściwym miejscu
```

**To jeszcze nie jest posortowana tablica.** Gwarantujemy tylko właściwą stronę pivotu. Rekurencyjne wywołania wykonają sortowanie części po lewej i po prawej stronie.

W pliku `q_sort.c` odpowiada za to funkcja:

```c
void qsort_rec(double v[], int first, int last)
{
    if (first < last) {
        int m = divide(v, first, last);
        qsort_rec(v, first, m - 1);
        qsort_rec(v, m + 1, last);
    }
}
```

Warunek `first < last` kończy rekurencję, gdy fragment ma mniej niż dwa elementy. Funkcja `divide()` zwraca indeks `m`, na którym ostatecznie powinien znaleźć się pivot. Funkcja `q_sort()` jest krótkim opakowaniem, dzięki któremu cały algorytm wywołujemy podobnie jak `insort()`.

### Ćwiczenie 5. Przygotowanie drugiego programu testującego

Zamiast pisać kolejny program od początku, kopiujemy istniejący `test.c`. Następnie zmieniamy w kopii **dwie linie**: dołączany nagłówek (`insort.h` na `q_sort.h`) oraz wywoływaną funkcję sortującą (`insort()` na `q_sort()`).

```bash
cp test.c qtest.c
```

Po edycji `qtest.c` kompilujemy projekt:

```bash
gcc -Wall -g -DMAX_ELEM_2_PRINT=12 q_sort.c qtest.c -o quick_test
```

W C istnieje również standardowa funkcja `qsort()`, ale **nie korzystamy z niej**. Nasza własna funkcja nosi nazwę `q_sort()` i to ją badamy oraz poprawiamy.

## 6. Naprawienie podziału — `divide()`

W naszej implementacji Quick Sorta pivotem jest pierwszy element rozpatrywanego fragmentu tablicy. Funkcja `divide()` używa dwóch indeksów: `f` przesuwa się od lewej strony, a `l` od prawej. Po znalezieniu elementów po niewłaściwych stronach pivotu zamienia je miejscami, a na końcu umieszcza pivot na jego docelowej pozycji.

W pliku startowym znajduje się **celowo błędna** implementacja:

```c
int divide(double v[], int f, int l)
{
    double tmp;
    int s = f;
    f++;

    while (f < l) {
        while (f < l && v[f] < v[s])
            f++;
        while (f < l && v[l] >= v[s])
            l--;
        if (f < l) {
            tmp = v[f];
            v[f] = v[l];
            v[l] = tmp;
        }
    }

    tmp = v[s];
    v[s] = v[f];
    v[f] = tmp;
    return f;
}
```

Kod się kompiluje, ale nie zawsze sortuje poprawnie. Dlatego nie wystarczy znaleźć literówkę: trzeba ustalić, czy po wykonaniu `divide()` **zwrócony indeks rzeczywiście wskazuje pivot, a wartości po obu jego stronach spełniają warunek podziału**.

### Ćwiczenie 6. Powtarzalny przypadek błędu

Uruchamiamy Quick Sort kilkukrotnie z tą samą liczbą elementów i tym samym ziarnem. Dzięki temu analizujemy takie same dane wejściowe i łatwiej sprawdzamy, jak zmiany kodu wpływają na wynik.

```bash
./quick_test 12 0
./quick_test 12 0
./quick_test 12 1
```

Program testujący wypisuje pary sąsiednich elementów, które pozostały w złej kolejności. Gdy test zgłosi błąd, analizujemy mały przykład i sprawdzamy, w którym miejscu `divide()` wybiera nieprawidłowy podział.

### Ćwiczenie 7. Samodzielne debugowanie Quick Sorta

Uruchamiamy `quick_test` w GDB i zatrzymujemy program na początku funkcji `divide()`. Korzystając z `next`, obserwujemy indeksy `s`, `f` i `l` oraz wartości elementów tablicy w kolejnych krokach.

```text
(gdb) break divide
(gdb) run 12 0
(gdb) print s
(gdb) print f
(gdb) print l
(gdb) print v[s]
```

**Uwaga:** jeśli debugger zatrzyma program na początku funkcji, zmienne lokalne mogą jeszcze nie być zainicjalizowane. Wykonujemy odpowiednie linie przez `next`, zanim zaczniemy odczytywać ich wartości. Nie odczytujemy `v[f]` ani `v[l]`, jeśli indeks znajduje się poza tablicą.

Szukając błędu, odpowiadamy sobie na pytania: gdzie powinien trafić pivot, kiedy `f` i `l` się spotkają? Czy miejsce spotkania jest zawsze poprawnym indeksem pivotu? Co się stanie, gdy pivot okaże się najmniejszym albo największym elementem fragmentu? Co z wartościami równymi pivotowi?

Naprawiamy funkcję `divide()` i ponawiamy kompilację oraz testy. Możemy zmieniać sposób realizacji podziału, ale zachowujemy funkcje `q_sort()`, `qsort_rec()` i `divide()` oraz poprawne rekurencyjne wywołania.

## 7. Zadanie na zaliczenie

Przedstawiamy prowadzącej **działające oba programy** oraz pokazujemy, że potrafimy znaleźć problem za pomocą GDB. Nie przygotowujemy osobnego sprawozdania — sprawdzamy programy na bieżąco podczas laboratorium.

| Wymaganie | Punkty |
| --- | ---: |
| Poprawne sortowanie przez wstawianie (`insort()`) | 2 pkt |
| Użycie GDB do zdiagnozowania błędu: zatrzymanie programu, odczyt zmiennej i wyjaśnienie przyczyny | 1 pkt |
| Poprawne sortowanie szybkie (`q_sort()` wraz z `divide()`) | 2 pkt |
| **Razem** | **5 pkt** |

Przy sprawdzaniu uruchamiamy oba programy na kilku wartościach `n` i ziarna, np.:

```bash
./insort_test 10 0
./insort_test 30 10
./quick_test 12 0
./quick_test 100 7
```

Możemy też sprawdzić tablice już posortowane, odwrotnie posortowane oraz z powtarzającymi się wartościami. Jeśli program wyświetla tylko początkowy fragment długiej tablicy, **nie oznacza to, że sprawdza wyłącznie te elementy** — pętla weryfikacyjna przechodzi przez całą tablicę.

## 8. Dla osób, które skończą wcześniej

Algorytmy Insertion Sort i Quick Sort mają różne właściwości wydajnościowe. Możemy porównać czas działania obu programów dla większej liczby elementów. Warto jednak pamiętać, że nasz Quick Sort wybiera pierwszy element jako pivot, co dla niektórych układów danych prowadzi do niekorzystnych podziałów.

Jeśli chcemy przeprowadzić takie porównanie, używamy **tych samych wartości `n` oraz ziarna** dla obu programów i sprawdzamy poprawność otrzymanych wyników. Właściwe mierzenie czasu wykonania pozostaje rozszerzeniem — podstawowym celem LMP/5 jest samodzielne diagnozowanie i poprawianie błędów.
