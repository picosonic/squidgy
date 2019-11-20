MZ4 Levels
----------

Levels are 14x18 tiles, stored in columns

OFFS        Contents

0x00         Supplementary tile (seen 1,2,3,4,5)
0x01         Bitfield ?? (seen 1,2,3,4,5,8,9)
0x02         Tile 10/11 bitfield (seen 0,1,2,3,11,21)
               00=Non solid/collectable/death
               01=Tile 10 solid
               02=Tile 10 (5 points)
               03=Tile 10 kills
               10=Tile 11 solid
               20=Tile 11 (5 points)
               30=Tile 11 kills
0x03         Level name length
0x04..0x??   Level name
0x??..0x102  ?? Changing to all 00 or FF doesn't change anything
0x103..0x1fe Level data 

SYM Graphics
------------

Graphics are 24x32 pixels per tile, with 12 tiles per file
