#include <stdio.h>
#include <stdlib.h>

#define LEVELOFFS 259
#define WIDTH 14
#define HEIGHT 18

int main(int argc, char **argv)
{
  FILE *fp;
  unsigned char buff[511];
  unsigned char lnl;
  int i;
  int x;
  int y;
  unsigned char c;

  if (argc!=2) return 1;

  fp=fopen(argv[1], "rb");
  if (fp==NULL) return 2;

  fread(buff, sizeof(buff), 1, fp);
  fclose(fp);

  lnl=buff[3];

  printf("\"");
  for (i=0; i<lnl; i++)
  {
    printf("%c", buff[4+i]);
  }
  printf("\"\n");

  for (x=0; x<WIDTH; x++)
  {
    for (y=0; y<HEIGHT; y++)
    {
      switch (buff[LEVELOFFS+((y*WIDTH)+x)])
      {
        case 0:
          c=' ';
          break;

        case 1:
          c='W';
          break;

        case 2:
          c='.';
          break;

        case 4:
          c='S';
          break;

        case 6:
          c='H';
          break;

        case 7:
          c='V';
          break;

        case 8:
          c='X';
          break;

        case 9:
          c='w';
          break;

        case 10:
          c='^';
          break;

        case 11:
          c='v';
          break;

        case 12:
          c='B';
          break;

        default:
          c=buff[LEVELOFFS+((y*WIDTH)+x)]+'0';
          break;
      }

      printf("%c", c);
    }
    printf("\n");
  }

  return 0;
}
