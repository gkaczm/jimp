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
