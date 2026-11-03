# Laboratorium 1 — Środowisko Unix/Linux i pierwszy program w C

## 1. Cel i materiały

To archiwalna instrukcja do pierwszego laboratorium. Poznajemy podstawowe polecenia terminala, edycję plików tekstowych w Vimie oraz kompilowanie i uruchamianie prostych programów w języku C. Prześledzimy też działanie `printf()`, zmiennych, pętli `for` i argumentów wiersza poleceń.

Pobieramy [pliki programów LMP/1](downloads/lab1/lmp1_kody.zip), zawierające `p1.c`–`p4.c`. Instrukcja zachowuje zakres archiwalnego ćwiczenia; zapis komend został nieznacznie uproszczony.

## 2. Praca w terminalu

Terminal pozwala wykonywać polecenia systemowe bez korzystania z graficznego menedżera plików. Na początku przygotowujemy katalog roboczy, w którym będziemy przechowywać programy i wyniki ich kompilacji.

```bash
mkdir lmp
cd lmp
pwd
ls
```

Polecenie `mkdir` tworzy katalog, `cd` zmienia katalog bieżący, `pwd` wypisuje jego ścieżkę, a `ls` pokazuje zawartość. Pozostałe przydatne komendy to `cp` (kopiowanie), `mv` (przenoszenie lub zmiana nazwy), `rm` (usuwanie), `cat` (wyświetlanie pliku), `less` (przeglądanie tekstu) oraz `man` (pomoc).

### Ćwiczenie. Kilka komend

Sprawdzamy bieżący katalog przez `pwd`, wyświetlamy pliki przez `ls`, a następnie kopiujemy wybrany plik do nowej nazwy (`cp p1.c kopia.c`). Otwieramy go przy pomocy `cat kopia.c`, a opis komendy `cp` sprawdzamy przez `man cp`.

## 3. Edytowanie i kompilacja

Pliki `.c` możemy edytować w Vimie (`vim p1.c`) lub w innym edytorze tekstowym. W Vimie klawisz `i` włącza wpisywanie tekstu; po `Esc` polecenie `:wq` zapisuje i zamyka plik, a `:q!` wychodzi bez zapisywania zmian.

Do kompilacji wykorzystujemy GCC. Przykładowe polecenie tworzy program wykonywalny o nazwie `p1`, który potem uruchamiamy z terminala:

```bash
gcc -Wall p1.c -o p1
./p1
```

Opcja `-Wall` włącza wiele przydatnych ostrzeżeń, a `-o p1` ustala nazwę programu wynikowego. W oryginalnym materiale program nazywał się domyślnie `a.out`, ponieważ kompilację wykonywano bez `-o`.

## 4. Pierwszy program — `p1.c`

Zaczynamy od programu, który wypisuje krótki komunikat. Pozwala to sprawdzić cały proces: otwarcie pliku, kompilację i uruchomienie, a także poznać funkcje `main()` i `printf()`.

```c
#include <stdio.h>

int main(void)
{
    printf("Dzien dobry!");
    return 0;
}
```

`#include <stdio.h>` udostępnia deklarację funkcji `printf()`. Wykonywanie programu zaczyna się w `main()`, a `return 0` oznacza poprawne zakończenie. W pierwszej wersji po komunikacie nie ma nowej linii, więc znak zachęty terminala może pojawić się bezpośrednio za tekstem.

### Ćwiczenie. Znak nowej linii

Zmieniamy instrukcję wypisującą tekst na poniższą, kompilujemy program ponownie i porównujemy wynik. Sekwencja `\n` przenosi wypisywanie do kolejnego wiersza.

```c
printf("Dzien dobry!\n");
```

## 5. Zmienne i wyrażenia — `p2.c`

Drugi program pokazuje, jak przechowywać liczby całkowite w zmiennych, modyfikować je i wypisywać wyniki obliczeń. Prześledźmy go linia po linii, zwracając uwagę na różnicę między wypisaniem napisu a wypisaniem wartości zmiennej.

```c
#include <stdio.h>

int main(void)
{
    int i = 0;
    int j = 1;

    printf("i=%d\n", i);
    printf("j=%d\n", j);
    printf("i-j=%d\n", i - j);
    i = j + 1;
    printf("j+1=%d\n", i);
    j -= 3;
    printf("j-3=%d\n", j);
    printf("j=j-3\n");
    printf("j=%d\n", j);
    printf("%d+%d=%d\n", i, j, i + j);
    printf("%d*%d=%d\n", i, j, i * j);

    return 0;
}
```

`int` oznacza liczbę całkowitą, `=` przypisanie, a `j -= 3` jest krótszym zapisem `j = j - 3`. Specyfikator `%d` w `printf()` oznacza miejsce na liczbę całkowitą. Dla początkowych wartości `i = 0` i `j = 1` końcowe obliczenia prowadzą do `i = 2` oraz `j = -2`.

### Ćwiczenie. Śledzenie zmian

Przed uruchomieniem zapisujemy na kartce, jakie wartości `i` i `j` mają po każdej instrukcji przypisania. Następnie zmieniamy wartości początkowe i przewidujemy, które linie wyniku się zmienią.

## 6. Pętla `for` i kody znaków — `p3.c`

Trzeci program przechodzi przez wielkie litery alfabetu i wypisuje zarówno znak, jak i jego kod liczbowy. Na tym przykładzie poznajemy pętlę `for` oraz formaty `%c` (znak) i `%d` (liczba całkowita).

```c
#include <stdio.h>

int main(void)
{
    int i;

    printf("Kody dziesietne wielkich liter:\n");
    for (i = 'A'; i <= 'Z'; i++)
        printf("%c - %d\n", i, i);

    return 0;
}
```

Zapis `for (i = 'A'; i <= 'Z'; i++)` ustawia początkową wartość, sprawdza warunek przed każdą iteracją i zwiększa `i` po jej wykonaniu. W kodowaniu ASCII litera `A` ma wartość 65, a `Z` — 90. W wywołaniu `printf()` ta sama wartość `i` jest przedstawiona w dwóch formatach.

### Ćwiczenie. Inny zakres znaków

Modyfikujemy granice pętli tak, żeby wypisać małe litery `a`–`z`, a następnie cyfry `0`–`9`. Zwracamy uwagę na różnicę między znakiem `'0'` a liczbą `0`.

## 7. Argumenty programu i obsługa błędów — `p4.c`

Czwarty program przyjmuje przy uruchomieniu dwa argumenty wyznaczające zakres kodów znaków. Sprawdzamy ich liczbę, przekształcamy napisy na wartości typu `int` i kończymy program kodem błędu, jeśli dane są nieprawidłowe.

```c
#include <stdio.h>
#include <stdlib.h>

int main(int argc, char *argv[])
{
    if (argc == 3) {
        int a = atoi(argv[1]);
        int b = atoi(argv[2]);
        int i;

        if (a <= 0 || b <= a || b > 255)
            return 2;

        printf("Znaki odpowiadajace kodom z zakresu %d - %d:\n", a, b);
        for (i = a; i <= b; i++)
            printf("%d -> '%c'\n", i, i);

        return 0;
    }
    return 1;
}
```

`argc` to liczba argumentów uruchomienia, wliczając nazwę programu. Tablica `argv` zawiera argumenty w postaci napisów: w wywołaniu `./p4 65 70` zmienna `argc` ma wartość `3`, a `argv[1]` i `argv[2]` zawierają napisy `"65"` i `"70"`. Funkcja `atoi()` zamienia je na liczby całkowite.

Sprawdzamy trzy przypadki i odczytujemy kod zakończenia przez `echo $?` (w powłoce Unix/Linux):

```bash
gcc -Wall p4.c -o p4
./p4
echo $?
./p4 10 9
echo $?
./p4 65 70
echo $?
```

W pierwszym przypadku program zwraca `1`, ponieważ liczba argumentów jest niewłaściwa. W drugim zwraca `2`, ponieważ zakres jest błędny. Dla poprawnych danych zwraca `0` i wypisuje znaki z żądanego przedziału.

**Uwaga do archiwum:** w oryginalnym listingu w napisie formatującym `printf()` pojawiał się znak `` ` `` zamiast zamykającego apostrofu; w pliku do pobrania poprawiono tę literówkę. Dla kodów spoza drukowalnego zakresu ASCII wynik może zależeć od terminala i kodowania.

## 8. Przykładowe zadania zaliczeniowe z oryginalnych materiałów

W archiwalnym ćwiczeniu piąty program był zadaniem wyznaczanym przez prowadzącego. Przykładowe warianty obejmowały obliczenie sumy liczb podanych jako argumenty programu, różnicy dwóch liczb (z kontrolą liczby argumentów) albo wypisanie wszystkich liczb całkowitych z zakresu podanego przy uruchomieniu.

Są to **przykłady z materiałów źródłowych**, a nie nowe zadanie wymagane po zakończonych zajęciach. Można do nich wrócić jako do ćwiczeń powtórkowych.

---

*Opracowano na podstawie archiwalnych materiałów „Laboratorium metodyki programowania”, ćwiczenie 1, WikiDyd PW (2015). Zachowano kolejność zagadnień i przykładów; uproszczono komendy kompilacji oraz poprawiono wskazaną literówkę w programie `p4.c`.*
