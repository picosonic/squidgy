#include <stdio.h>
#include <stdlib.h>

#define WIDTH 24
#define HEIGHT 32
#define SPRITES 12
#define planes 4

void pal(int c)
{
  unsigned int cc;

  // ANSI Black,Red,Green,Yellow,Blue,Magenta,Cyan,White
  switch (c>>4)
  {
    // Normal colours 4x
    case  0: cc=40; break; // ... Black
    case  1: cc=44; break; // ..+ Blue
    case  2: cc=42; break; // .+. Green
    case  3: cc=46; break; // .++ Cyan
    case  4: cc=41; break; // +.. Red
    case  5: cc=45; break; // +.+ Magenta
    case  6: cc=43; break; // ++. Yellow
    case  7: cc=47; break; // +++ White

    // Intense colours 10x
    case  8: cc=100; break; // ... Bright Black
    case  9: cc=104; break; // ..# Bright Blue
    case 10: cc=102; break; // .#. Bright Green
    case 11: cc=106; break; // .## Bright Cyan
    case 12: cc=101; break; // #.. Bright Red
    case 13: cc=105; break; // #.# Bright Magenta
    case 14: cc=103; break; // ##. Bright Yellow
    case 15: cc=107; break; // ### Bright White

    default: cc=40; break; // Black
  }

  printf("%c[%dm ", 27, cc);
  printf("%c[%dm ", 27, cc);
}

int main(int argc, char **argv)
{
  FILE *fp;
  unsigned char buff[12288];
  unsigned int width;
  unsigned int height;

  unsigned char *bitmap;
  int i, x, y, s, c, d;

  if (argc!=2) return 1;

  fp=fopen(argv[1], "rb");
  if (fp==NULL) return 2;

  fread(buff, sizeof(buff), 1, fp);
  fclose(fp);

  i=0;

  bitmap=malloc(width*height);
  if (bitmap==NULL) return 3;

  for (s=0; s<SPRITES; s++)
  {
    width=(buff[i+1]<<8)+buff[i]+1;
    height=(buff[i+3]<<8)+buff[i+2]+1;
    x=0; y=0;

    i+=4;

    for (y=0; y<height; y++)
    {
      for (d=0; d<3; d++)
      {
        c=((buff[i]&0x80)   ) | ((buff[i+3]&0x80)>>1) | ((buff[i+6]&0x80)>>2) | ((buff[i+9]&0x80)>>3); pal(c);
        c=((buff[i]&0x40)<<1) | ((buff[i+3]&0x40)   ) | ((buff[i+6]&0x40)>>1) | ((buff[i+9]&0x40)>>2); pal(c);
        c=((buff[i]&0x20)<<2) | ((buff[i+3]&0x20)<<1) | ((buff[i+6]&0x20)   ) | ((buff[i+9]&0x20)>>1); pal(c);
        c=((buff[i]&0x10)<<3) | ((buff[i+3]&0x10)<<2) | ((buff[i+6]&0x10)<<1) | ((buff[i+9]&0x10)   ); pal(c);

        c=((buff[i]&0x08)<<4) | ((buff[i+3]&0x08)<<3) | ((buff[i+6]&0x08)<<2) | ((buff[i+9]&0x08)<<1); pal(c);
        c=((buff[i]&0x04)<<5) | ((buff[i+3]&0x04)<<4) | ((buff[i+6]&0x04)<<3) | ((buff[i+9]&0x04)<<2); pal(c);
        c=((buff[i]&0x02)<<6) | ((buff[i+3]&0x02)<<5) | ((buff[i+6]&0x02)<<4) | ((buff[i+9]&0x02)<<3); pal(c);
        c=((buff[i]&0x01)<<7) | ((buff[i+3]&0x01)<<6) | ((buff[i+6]&0x01)<<5) | ((buff[i+9]&0x01)<<4); pal(c);
        i++;
      }

      i+=9;
      printf("%c[%dm\n", 27, 40);
    }

    // Skip filler
    i+=636;
    printf("%c[%dm\n", 27, 40);
  }

  free(bitmap);

  return 0;
}
