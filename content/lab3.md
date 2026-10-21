# Wskaźniki do funkcji i pomiary temperatury

Najpierw przeanalizujemy wspólnie program `p3.c` i sposób przekazywania funkcji jako argumentu. Następnie samodzielnie uzupełnisz program przetwarzający pomiary temperatury.

## Plan zajęć

1. **Powtórka:** wskaźniki i operacje na tablicach (`p1` i `p2` były realizowane na poprzednich zajęciach).
2. **Wspólna analiza:** program `p3.c` — wskaźniki do funkcji.
3. **Ćwiczenie:** przetwarzanie pomiarów temperatury (TODO 1–3).

## Program p3.c — wskaźniki do funkcji

:::label Część 1 · wspólnie

W programach `p1` i `p2` wskaźniki służyły do odczytu i modyfikowania danych. W `p3.c` pojawia się nowy pomysł: **funkcję również można przekazać jako argument**. Pozwala to napisać jeden fragment kodu wykonujący tę samą operację na różnych funkcjach.

:::download Plik do wspólnej analizy
Pełny program demonstracyjny z funkcją `tabelka`.

file: downloads/p3.c
button: Pobierz p3.c ↓
:::

### 1. Jak czytać zapis wskaźnika na funkcję?

```c Przykład deklaracji
double (*f)(double);
```

To oznacza: `f` wskazuje na funkcję, która **przyjmuje jeden argument typu `double` i zwraca `double`**. Nawiasy wokół `*f` są kluczowe — bez nich deklaracja oznaczałaby coś innego.

:::note Uwaga na nawiasy
`double (*f)(double)` — wskaźnik na funkcję. `double *f(double)` — funkcja zwracająca wskaźnik na `double`.
:::

### 2. Co robi funkcja tabelka?

Funkcja `tabelka` otrzymuje wskaźnik na inną funkcję oraz parametry przedziału. W pętli oblicza kolejne wartości `x` i wywołuje `f(x)`. Sama `tabelka` nie musi wiedzieć, czy wywołuje `sin`, `cos`, czy własną funkcję użytkownika.

```c Fragment p3.c
void tabelka(double (*f)(double), double a,
             double b, int n, FILE *out)
{
    int i;
    double dx = (b - a) / (n - 1);

    for (i = 0; i < n; i++)
        fprintf(out, "%g %g\n", a + i * dx,
                f(a + i * dx));
}
```

W tym przykładzie `n` musi wynosić co najmniej 2, bo odstęp między punktami jest wyliczany jako `(b-a)/(n-1)`.

### 3. Jak program wybiera funkcję?

`p3.c` przechowuje wskaźniki do pięciu funkcji w tablicy `funkcje`, a ich nazwy tekstowe w osobnej tablicy `nazwy`. Program porównuje nazwę podaną przez użytkownika z elementami `nazwy` za pomocą `strcmp`. Gdy znajdzie zgodną nazwę, wybiera funkcję o tym samym indeksie.

```c Fragment p3.c
double (*funkcje[5])(double) =
    {cos, sin, tan, moja, atan};
char *nazwy[5] =
    {"cos", "sin", "tan", "moja", "atan"};

/* wybrana_fun wskazuje potem na jedną z tych funkcji */
tabelka(wybrana_fun, a, b, n, out);
```

W tej konstrukcji **pozycje nazw i wskaźników muszą do siebie pasować**. Tablice nie są automatycznie powiązane.

### 4. Uruchomienie programu

Argumenty wiersza poleceń (`argc`, `argv`) pozwalają wybrać nazwę funkcji, zakres oraz liczbę punktów. W oryginalnym `p3.c` do odczytu liczb wykorzystano `atof` i `atoi`; biblioteka `math.h` dostarcza m.in. `sin` i `cos`.

```bash Terminal
gcc -Wall p3.c -lm -o p3
./p3 sin 0 3.14159 5
```

Wspólnie prześledźmy, gdzie program wybiera funkcję, gdzie ją przekazuje i gdzie następuje właściwe wywołanie. Jeśli starczy czasu, do programu `p3.c` dodaj dwie kolejne funkcje do wyboru.

## Przetwarzanie pomiarów temperatury

:::label Część 2 · ćwiczenie

Uzupełnij otrzymany szkielet programu. Tablica zawiera pomiary temperatury w stopniach Celsjusza. Rozwiązanie powinno wykorzystywać **wskaźniki do elementów tablicy**, a w ostatniej części również **wskaźnik na funkcję**.

:::download-primary Szkielet programu do uzupełnienia
Zapisz plik `LMP3_temperatury_dla_studentow.c` i uzupełnij wszystkie oznaczenia TODO.

file: downloads/LMP3_temperatury_dla_studentow.c
button: Pobierz plik .c ↓
:::

### TODO 1 — Wykrywanie skoków temperatury

Uzupełnij funkcję `policz_skoki`. Ma zliczać, ile razy **bezwzględna różnica dwóch kolejnych pomiarów jest większa od progu** podanego przez użytkownika.

:::note Przykład
Dla pomiarów `20; 20,5; 21; 29; 28` i progu `5` funkcja powinna zwrócić **1** (różnica między `21` i `29`). Porównanie jest ścisłe: `>`, a nie `>=`.
:::

### TODO 2 — Konwersja jednej temperatury

Uzupełnij deklaracje, parametry i definicje funkcji `konwertuj_na_fahrenheit` i `konwertuj_na_kelwin`. Każda z nich przyjmuje pojedynczą temperaturę w °C i zwraca jej wartość w nowej jednostce.

:::formulas
°C → °F | F = C × 9/5 + 32
°C → K | K = C + 273,15
:::

### TODO 3 — Konwersja całej tablicy

Uzupełnij deklarację, definicję oraz dwa wywołania funkcji `konwertuj_temperature`. Funkcja powinna przyjmować: wskaźnik na początek tablicy, jej długość i **wskaźnik na funkcję konwertującą pojedynczy pomiar**.

Przejdź po tablicy za pomocą wskaźnika i zastąp każdy pomiar wynikiem funkcji przekazanej jako argument. Ta sama funkcja `konwertuj_temperature` ma obsługiwać zarówno Fahrenheity, jak i kelwiny — zależnie od funkcji przekazanej przy wywołaniu.

:::warning Wymagania
Do iterowania po tablicy stosuj wskaźniki, nie indeksowanie (`v[i]`). Nie twórz dodatkowej tablicy. Konwersja ma zachodzić **w miejscu**, bez zmiany liczby pomiarów.
:::

### Przykładowe uruchomienie

```text Terminal
Podaj prog skoku temperatury w C (> 0): 5
Liczba skokow: 1
Wybierz jednostke docelowa (F - Fahrenheit, K - kelwin): F
Pomiary po konwersji: 68 68.9 69.8 84.2 82.4
```

## Notatki i kod

:::scratchpad
:::
