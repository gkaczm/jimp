#include "insort.h"

#include <stdio.h>
#include <stdlib.h>
#include <time.h>

void printv(double v[], int n)
{
    int i;
    int np = n > MAX_ELEM_2_PRINT ? MAX_ELEM_2_PRINT : n;

    printf("[");
    for (i = 0; i < np; i++)
        printf(" %g", v[i]);
    printf("%s ]\n", np < n ? " ..." : "");
}

int main(int argc, char **argv)
{
    int n = argc > 1 ? atoi(argv[1]) : 1000;
    int i;
    int poprawne = 1;
    double *v;

    if (n <= 0) {
        fprintf(stderr, "Liczba elementow musi byc dodatnia.\n");
        return 1;
    }

    v = malloc(n * sizeof *v);
    if (v == NULL) {
        fprintf(stderr, "Nie udalo sie przydzielic pamieci.\n");
        return 1;
    }

    srand(argc > 2 ? (unsigned)atoi(argv[2]) : (unsigned)time(NULL));

    for (i = 0; i < n; i++)
        v[i] = (2.0 * rand() / RAND_MAX - 1.0) * n;

    printf("Wygenerowany wektor: ");
    printv(v, n);

    insort(v, n);

    printf("Posortowany wektor:  ");
    printv(v, n);

    for (i = 1; i < n; i++) {
        if (v[i - 1] > v[i]) {
            fprintf(stderr, "Zly algorytm sortowania: v[%d] == %g > v[%d] == %g\n",
                    i - 1, v[i - 1], i, v[i]);
            poprawne = 0;
        }
    }

    if (poprawne)
        printf("Kontrola: OK\n");

    free(v);
    return poprawne ? 0 : 1;
}
