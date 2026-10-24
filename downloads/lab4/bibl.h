#ifndef BIBL_H
#define BIBL_H

#include <stdio.h>

/* Wczytuje wektor z pliku. Zwraca liczbe elementow lub -1 przy bledzie. */
int read(FILE *p, double v[], int max_n);

/* Oblicza norme euklidesowa wektora. */
double L2(double v[], int n);

/* Oblicza iloczyn skalarny dwoch wektorow. */
double dot_product(double v[], double u[], int n);

#endif
