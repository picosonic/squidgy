#include <stdio.h>
#include <stdlib.h>

#define WIDTH 24
#define HEIGHT 32
#define SPRITES 12
#define planes 4

void pal(int c)
{
  unsigned int cc;

  cc=c>>4;

  switch (cc)
  {
    // Normal colours 4x
    case  0: printf("%c%c%c", 0, 0, 0 ); break; // ... Black
    case  1: printf("%c%c%c", 0, 0, 128 ); break; // ..+ Blue
    case  2: printf("%c%c%c", 0, 128, 0 ); break; // .+. Green
    case  3: printf("%c%c%c", 0, 128, 128 ); break; // .++ Cyan
    case  4: printf("%c%c%c", 128, 0, 0 ); break; // +.. Red
    case  5: printf("%c%c%c", 128, 0, 128 ); break; // +.+ Magenta
    case  6: printf("%c%c%c", 128, 128, 0 ); break; // ++. Yellow
    case  7: printf("%c%c%c", 192, 192, 192 ); break; // +++ White

    // Intense colours 10x
    case  8: printf("%c%c%c", 128, 128, 128 );  break; // ... Bright Black
    case  9: printf("%c%c%c", 0, 0, 255 );  break; // ..# Bright Blue
    case 10: printf("%c%c%c", 0, 255, 0 );  break; // .#. Bright Green
    case 11: printf("%c%c%c", 0, 255, 255 );  break; // .## Bright Cyan
    case 12: printf("%c%c%c", 255, 0, 0 );  break; // #.. Bright Red
    case 13: printf("%c%c%c", 255, 0, 255 );  break; // #.# Bright Magenta
    case 14: printf("%c%c%c", 255, 255, 0 );  break; // ##. Bright Yellow
    case 15: printf("%c%c%c", 255, 255, 255 );  break; // ### Bright White

    default: printf("%c%c%c", 0, 0, 0 ); break; // Black
  }
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
    }

    // Skip filler
    i+=636;
  }

  free(bitmap);

  return 0;
}
