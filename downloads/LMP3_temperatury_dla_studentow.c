#include <stdio.h>

/* TODO 2 i 3: uzupelnij deklaracje funkcji */

/* Definicje funkcji do uzupelnienia */
int policz_skoki(const double *temperatury, int n, double prog)
{
    /* TODO 1: iteracja wskaznikowa, porownywanie sasiednich pomiarow */
    return 0;
}

double konwertuj_na_fahrenheit(/* TODO 2: parametr */)
{
    /* TODO 2: napisz funkcje konwertujaca z C na F */
    return 0.0;
}

double konwertuj_na_kelwin(/* TODO 2: parametr */)
{
    /* TODO 2: napisz funkcje konwertujaca z C na K */
    return 0.0;
}

void konwertuj_temperature(/* TODO 3: parametry */)
{
    /* TODO 3: przejdz po tablicy wskaznikiem, wykorzystujac */
    /* funkcje przekazana jako argument */
}

int main(void)
{
    double temperatury[] = {20.0, 20.5, 21.0, 29.0, 28.0};
    int n = 5; /* dlugosc tablicy */
    double prog;
    int skoki;
    char wybor;
    double *p;

    printf("Podaj prog skoku temperatury w C (> 0): ");
    if (scanf("%lf", &prog) != 1 || !(prog > 0.0)) {
        printf("Nieprawidlowy prog.\n");
        return 1;
    }

    /* Wywolanie gotowe: student implementuje cialo funkcji. */
    skoki = policz_skoki(temperatury, n, prog);
    printf("Liczba skokow: %d\n", skoki);

    printf("Wybierz jednostke docelowa (F - Fahrenheit, K - kelwin): ");
    fflush(stdout);
    if (scanf(" %c", &wybor) != 1)
        return 1;

    if (wybor == 'F' || wybor == 'f') {
        /* TODO 3: przekaz funkcje konwertuj_na_fahrenheit */
        konwertuj_temperature(/* ... */);
    } else if (wybor == 'K' || wybor == 'k') {
        /* TODO 3: przekaz funkcje konwertuj_na_kelwin */
        konwertuj_temperature(/* ... */);
    } else {
        printf("Nieznana jednostka. Wybierz F lub K.\n");
        return 1;
    }

    printf("Pomiary po konwersji: ");
    for (p = temperatury; p < temperatury + n; ++p)
        printf("%g ", *p);

    return 0;
}
