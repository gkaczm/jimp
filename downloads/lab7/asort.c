#include <stdio.h> // wiadomo po co
#include <stdlib.h> // qsort
#include <string.h> // strcmp

int
alphacmp( const void *a, const void *b ) {
    char **ca = (char**)a;
    char **cb = (char**)b;
    return strcmp( *ca, *cb );
}

int
main( int argc, char **argv ) {
    int i;

    qsort( argv+1, argc-1, sizeof *argv, alphacmp );

    for( i= 1; i < argc; i++ )
        printf( "%s\n", argv[i] );

    return 0;
}
