/* JIMP / Laboratorium 3 - program demonstracyjny p3.c
   Na podstawie programu p3 z materialow do cwiczenia o wskaznikach.
*/
#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <string.h>

void tabelka(double (*f)(double), double a, double b, int n, FILE *out)
{
    int i;
    double dx = (b - a) / (n - 1);
    for (i = 0; i < n; i++)
        fprintf(out, "%g %g\n", a + i * dx, f(a + i * dx));
}

double moja(double x)
{
    return 3 * x * x + 2 * x + 1;
}

int main(int argc, char **argv)
{
    char *fun_name = argc > 1 ? argv[1] : "";
    double a = argc > 2 ? atof(argv[2]) : 0.0;
    double b = argc > 3 ? atof(argv[3]) : 1.0;
    int n = argc > 4 ? atoi(argv[4]) : 50;
    int i;
    FILE *out = argc > 5 ? fopen(argv[5], "w") : stdout;
    double (*wybrana_fun)(double) = NULL;
    double (*funkcje[5])(double) = {cos, sin, tan, moja, atan};
    char *nazwy[5] = {"cos", "sin", "tan", "moja", "atan"};

    if (argc < 2) {
        printf("\n%s: tablicuje wybrana funkcje w zadanym przedziale.\n", argv[0]);
        printf("Wywolanie: %s <nazwa-funkcji> [ <start> [ <stop> [ <n> [ <plik> ] ] ] ]\n", argv[0]);
        printf("Dostepne funkcje:");
        for (i = 0; i < 5; ++i)
            printf(" %s", nazwy[i]);
        printf("\n");
        if (out != NULL && out != stdout)
            fclose(out);
        return 0;
    }

    if (out == NULL) {
        fprintf(stderr, "Nie mozna otworzyc pliku wyjsciowego.\n");
        return 1;
    }
    if (n < 2) {
        fprintf(stderr, "Liczba punktow musi wynosic co najmniej 2.\n");
        if (out != stdout) fclose(out);
        return 1;
    }

    for (i = 0; i < 5; ++i)
        if (strcmp(nazwy[i], fun_name) == 0)
            wybrana_fun = funkcje[i];

    if (wybrana_fun != NULL)
        tabelka(wybrana_fun, a, b, n, out);
    else
        fprintf(stderr, "Nie znam funkcji \"%s\"\n", fun_name);

    if (out != stdout) fclose(out);
    return wybrana_fun == NULL ? 1 : 0;
}
