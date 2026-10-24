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
