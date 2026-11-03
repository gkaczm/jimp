#include "q_sort.h"

int divide(double v[], int f, int l);

void qsort_rec(double v[], int first, int last)
{
    if (first < last) {
        int m = divide(v, first, last);
        qsort_rec(v, first, m - 1);
        qsort_rec(v, m + 1, last);
    }
}

void q_sort(double v[], int n)
{
    qsort_rec(v, 0, n - 1);
}

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
