MZ4 Levels
----------

Levels are 14x18 tiles, stored in columns

|OFFS       |Contents                                             |
|-----------|-----------------------------------------------------|
|0x00       | Supplementary tile (seen 1,2,3,4,5)
|0x01       | Enemy speed 1 to 9 (seen 1,2,3,4,5,8,9)
|0x02       | Tile 10/11 bitfield (seen 0,1,2,3,11,21)<br/>00=Non solid/collectable/death<br/>01=Tile 10 solid<br/>02=Tile 10 (5 points)<br/>03=Tile 10 kills<br/>10=Tile 11 solid<br/>20=Tile 11 (5 points)<br/>30=Tile 11 kills |
|0x03         |Level name length                                   |
|0x04..0x??   |Level name                                          |
|0x??..0x102  |?? Changing to all 00 or FF doesn't change anything |
|0x103..0x1fe |Level data                                          |

SYM Graphics
------------

Graphics are 24x32 pixels per tile, with 12 tiles per file
