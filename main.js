// Game state
var gs={
  // animation frame of reference
  step:(1/6), // target step time @ 60 fps
  acc:0, // accumulated time since last frame
  lasttime:0, // time of last frame

  // Player state
  keystate:0, // keyboard bitfield [action][down][right][up][left]
  padstate:0, // gamepad bitfield [action][down][right][up][left]
  prevtile:0, // previous tile under player
  startx:0, // player x position at start of level
  starty:0, // player y position at start of level

  gamepad:-1,
  gamepadbuttons:[], // Button mapping
  gamepadaxes:[], // Axes mapping
  gamepadaxesval:[], // Axes values

  // level related
  playfield:null,
  level:1, // current level
  grid:[], // x*y tile ids
  gridelem:[], // x*y tile elements
  tilerows:14, // tiles in a row for level
  tilecolumns:18, // tiles in a column for a level
  tilewidth:24, // pixel width of tile
  tileheight:32, // pixel height of tile
  score:0, // current score
  lives:5, // remaining lives
  shields:0, // shields
  scale:1, // scale factor
  timeout:0, // epoch when level timer expires
  supp:0, // supplementary tile id
  extra:0, // bitfield for tile 10/11 behaviour
};

// Clear both keyboard and gamepad input state
function clearinputstate()
{
  gs.keystate=0;
  gs.padstate=0;
}

// Check if an input is set in either keyboard or gamepad input state
function ispressed(keybit)
{
  return (((gs.keystate&keybit)!=0) || ((gs.padstate&keybit)!=0));
}

// Update the player key state
function updatekeystate(e, dir)
{
  switch (e.which)
  {
    case 37: // cursor left
    case 65: // A
    case 90: // Z
      if (dir==1)
        gs.keystate|=1;
      else
        gs.keystate&=~1;
      e.preventDefault();
      break;

    case 38: // cursor up
    case 87: // W
    case 59: // semicolon
      if (dir==1)
        gs.keystate|=2;
      else
        gs.keystate&=~2;
      e.preventDefault();
      break;

    case 39: // cursor right
    case 68: // D
    case 88: // X
      if (dir==1)
        gs.keystate|=4;
      else
        gs.keystate&=~4;
      e.preventDefault();
      break;

    case 40: // cursor down
    case 83: // S
    case 190: // dot
      if (dir==1)
        gs.keystate|=8;
      else
        gs.keystate&=~8;
      e.preventDefault();
      break;

    case 13: // enter
    case 32: // space
      if (dir==1)
        gs.keystate|=16;
      else
        gs.keystate&=~16;
      e.preventDefault();
      break;

    case 27: // escape
      e.preventDefault();
      break;

    default:
      break;
  }
}

// Scan for any connected gamepads
function gamepadscan()
{
  var gamepads=navigator.getGamepads();
  var found=0;

  var gleft=false;
  var gright=false;
  var gup=false;
  var gdown=false;
  var gjump=false;

  for (var padid=0; padid<gamepads.length; padid++)
  {
    // Only support first found gamepad
    if ((found==0) && (gamepads[padid] && gamepads[padid].connected))
    {
      found++;

      // If we don't already have this one, add mapping for it
      if (gs.gamepad!=padid)
      {
        console.log("Found new gamepad "+padid+" '"+gamepads[padid].id+"'");

        gs.gamepad=padid;

        if (gamepads[padid].mapping==="standard")
        {
          gs.gamepadbuttons[0]=14; // left (left) d-left
          gs.gamepadbuttons[1]=15; // right (left) d-right
          gs.gamepadbuttons[2]=12; // top (left) d-up
          gs.gamepadbuttons[3]=13; // bottom (left) d-down
          gs.gamepadbuttons[4]=0;  // bottom button (right) x

          gs.gamepadaxes[0]=0; // left/right axis
          gs.gamepadaxes[1]=1; // up/down axis
          gs.gamepadaxes[2]=2; // cam left/right axis
          gs.gamepadaxes[3]=3; // cam up/down axis
        }
        else
        if (gamepads[padid].id=="054c-0268-Sony PLAYSTATION(R)3 Controller")
        {
          // PS3
          gs.gamepadbuttons[0]=15; // left (left) d-left
          gs.gamepadbuttons[1]=16; // right (left) d-right
          gs.gamepadbuttons[2]=13; // top (left) d-up
          gs.gamepadbuttons[3]=14; // bottom (left) d-down
          gs.gamepadbuttons[4]=0;  // bottom button (right) x

          gs.gamepadaxes[0]=0; // left/right axis
          gs.gamepadaxes[1]=1; // up/down axis
          gs.gamepadaxes[2]=3; // cam left/right axis
          gs.gamepadaxes[3]=4; // cam up/down axis
        }
        else
        if (gamepads[padid].id=="045e-028e-Microsoft X-Box 360 pad")
        {
          // XBOX 360
          gs.gamepadbuttons[0]=-1; // left (left) d-left
          gs.gamepadbuttons[1]=-1; // right (left) d-right
          gs.gamepadbuttons[2]=-1; // top (left) d-up
          gs.gamepadbuttons[3]=-1; // bottom (left) d-down
          gs.gamepadbuttons[4]=0;  // bottom button (right) x

          gs.gamepadaxes[0]=6; // left/right axis
          gs.gamepadaxes[1]=7; // up/down axis
          gs.gamepadaxes[2]=3; // cam left/right axis
          gs.gamepadaxes[3]=4; // cam up/down axis
        }
        else
        if (gamepads[padid].id=="0f0d-00c1-  Switch Controller")
        {
          // Nintendo Switch
          gs.gamepadbuttons[0]=-1; // left (left) d-left
          gs.gamepadbuttons[1]=-1; // right (left) d-right
          gs.gamepadbuttons[2]=-1; // top (left) d-up
          gs.gamepadbuttons[3]=-1; // bottom (left) d-down
          gs.gamepadbuttons[4]=1;  // bottom button (right) x

          gs.gamepadaxes[0]=4; // left/right axis
          gs.gamepadaxes[1]=5; // up/down axis
          gs.gamepadaxes[2]=2; // cam left/right axis
          gs.gamepadaxes[3]=3; // cam up/down axis
        }
        else
        if (gamepads[padid].id=="054c-05c4-Sony Computer Entertainment Wireless Controller")
        {
          // PS4
          gs.gamepadbuttons[0]=-1; // left (left) d-left
          gs.gamepadbuttons[1]=-1; // right (left) d-right
          gs.gamepadbuttons[2]=-1; // top (left) d-up
          gs.gamepadbuttons[3]=-1; // bottom (left) d-down
          gs.gamepadbuttons[4]=0;  // bottom button (right) x

          gs.gamepadaxes[0]=0; // left/right axis
          gs.gamepadaxes[1]=1; // up/down axis
          gs.gamepadaxes[2]=3; // cam left/right axis
          gs.gamepadaxes[3]=4; // cam up/down axis
        }
        else
        {
          // Unknown non-"standard" mapping
          gs.gamepadbuttons[0]=-1; // left (left) d-left
          gs.gamepadbuttons[1]=-1; // right (left) d-right
          gs.gamepadbuttons[2]=-1; // top (left) d-up
          gs.gamepadbuttons[3]=-1; // bottom (left) d-down
          gs.gamepadbuttons[4]=-1;  // bottom button (right) x

          gs.gamepadaxes[0]=-1; // left/right axis
          gs.gamepadaxes[1]=-1; // up/down axis
          gs.gamepadaxes[2]=-1; // cam left/right axis
          gs.gamepadaxes[3]=-1; // cam up/down axis
        }
      }

      // Check analog axes
      for (var i=0; i<gamepads[padid].axes.length; i++)
      {
        var val=gamepads[padid].axes[i];

        if (i==gs.gamepadaxes[0])
        {
          gs.gamepadaxesval[0]=val;

          if (val<-0.5) // Left
            gleft=true;

          if (val>0.5) // Right
            gright=true;
        }

        if (i==gs.gamepadaxes[1])
        {
          gs.gamepadaxesval[1]=val;

          if (val<-0.5) // Up
            gup=true;

          if (val>0.5) // Down
            gdown=true;
        }

        if (i==gs.gamepadaxes[2])
          gs.gamepadaxesval[2]=val;

        if (i==gs.gamepadaxes[3])
          gs.gamepadaxesval[3]=val;
      }

      // Check buttons
      for (i=0; i<gamepads[padid].buttons.length; i++)
      {
        var val=gamepads[padid].buttons[i];
        var pressed=val==1.0;

        if (typeof(val)=="object")
        {
          pressed=val.pressed;
          val=val.value;
        }

        if (pressed)
        {
          switch (i)
          {
            case gs.gamepadbuttons[0]: gleft=true; break;
            case gs.gamepadbuttons[1]: gright=true; break;
            case gs.gamepadbuttons[2]: gup=true; break;
            case gs.gamepadbuttons[3]: gdown=true; break;
            case gs.gamepadbuttons[4]: gjump=true; break;
            default: break;
          }
        }
      }

      // Update padstate
      if (gup)
        gs.padstate|=2;
      else
        gs.padstate&=~2;

      if (gdown)
        gs.padstate|=8;
      else
        gs.padstate&=~8;

      if (gleft)
        gs.padstate|=1;
      else
        gs.padstate&=~1;

      if (gright)
        gs.padstate|=4;
      else
        gs.padstate&=~4;

      if (gjump)
        gs.padstate|=16;
      else
        gs.padstate&=~16;
    }
  }

  // Detect disconnect
  if ((found==0) && (gs.gamepad!=-1))
  {
    console.log("Disconnected gamepad "+padid);

    gs.gamepad=-1;
  }
}

function nextlevel()
{
  var now=new Date();
  var localtime=Math.floor(gs.timeout-(now.valueOf()/1000));

  // Add 10 points to score for each remaining second
  while (localtime>0)
  {
    gs.score+=10;
    localtime--;
  }

  gs.level++;
  if (gs.level>32) gs.level=1;

  loadlevel();

  document.getElementById("wrapper").setAttribute("level", gs.level);
  document.getElementById("wrapper").setAttribute("supp", gs.supp);
}

function getgrid(x, y)
{
  return gs.grid[(y*gs.tilecolumns)+x];
}

function setgrid(x, y, tileid)
{
  gs.grid[(y*gs.tilecolumns)+x]=tileid;
}

// Check for level completion - when all dots collected
function completed()
{
  // Find dots
  for (var y=0; y<gs.tilerows; y++)
    for (var x=0; x<gs.tilecolumns; x++)
      if (getgrid(x, y)==2) return false;

  return true;
}

// Can the player walk onto this square
function squashable(x, y)
{
  switch (getgrid(x, y))
  {
    case 0: // Space
    case 2: // Dot
      return true;
      break;

    case 10:
      if ((gs.extra&0x0f)!=0x01) return true;
      break;

    case 11:
      if ((gs.extra&0xf0)!=0x10) return true;
      break;

    case 12: // Supplemental (collectable)
      return true;
      break;

    case 8: // Exit
      if (completed()) return true;
      break;
  }

  return false;
}

// Diagnostic key/pad state
function updateposition()
{
  var dbg="";

  dbg+="KEY:"+gs.keystate;
  if (gs.gamepad!=-1) dbg+=" PAD:"+gs.padstate;

  document.getElementById("debug").innerHTML=dbg;
}

// Process all enemies for basic movement
function updateenemyai()
{
  var enemies=[];
  var x, y;

  // Find the enemies
  for (y=0; y<gs.tilerows; y++)
  {
    for (x=0; x<gs.tilecolumns; x++)
    {
      switch (getgrid(x, y))
      {
        case 6:
        case 7:
        case 106:
        case 107:
          enemies.push({x:x, y:y});
          break;

        default:
          break;
      }
    }
  }

  // Iterate through the enemies to see where they can move to
  for (var i=0; i<enemies.length; i++)
  {
    x=enemies[i].x; y=enemies[i].y;
    var tile=getgrid(x, y);

    switch (tile)
    {
      case 6: // right
        if (getgrid(x+1, y)==0)
        {
          setgrid(x, y, 0);
          setgrid(x+1, y, tile);
        }
        else
          setgrid(x, y, tile+100);
        break;

      case 106: // left
        if (getgrid(x-1, y)==0)
        {
          setgrid(x, y, 0);
          setgrid(x-1, y, tile);
        }
        else
          setgrid(x, y, tile-100);
        break;

      case 7: // down
        if (getgrid(x, y+1)==0)
        {
          setgrid(x, y, 0);
          setgrid(x, y+1, tile);
        }
        else
          setgrid(x, y, tile+100);
        break;

    case 107: // up
        if (getgrid(x, y-1)==0)
        {
          setgrid(x, y, 0);
          setgrid(x, y-1, tile);
        }
        else
          setgrid(x, y, tile-100);
        break;

      default:
        break;
    }
  }
}

function collision(x, y)
{
  var target=getgrid(x, y);
  var action=0;

  switch (target)
  {
    case 2: // Dot
      gs.score+=5;
      setgrid(x, y, 0);
      break;

    case 10: // Variable collectables
    case 11:
      action=(target==10?(gs.extra&0x0f):((gs.extra&0xf0)>>4));
      switch (action)
      {
        case 0: // Scenery
          break;

        case 1: // Solid
          break;

        case 2: // Score 5 points
          gs.score+=5;
          setgrid(x, y, 0);
          break;

        case 3: // Loose life
          if (gs.lives>0)
          {
            gs.lives--;

            return 1;
          }
          else
          {
            // TODO end the game
          }
          break;

        default:
          break;
      }
      break;

    case 12: // Supplemental special (collectable)
      switch (gs.supp)
      {
        case 1: // Bulb (extra life)
          gs.lives++;
          break;

        case 2: // 100 points cloud
          gs.score+=100;
          break;

        case 3: // 500 points coin
          gs.score+=500;
          break;

        case 4: // Shield (immortality)
          if (gs.shields==0)
            gs.shields=3;
          else
            gs.shields++;
          // TODO Original code sets this to random(3)+3
          // TODO One is lost each time you walk "through" an enemy
          break;

        case 5: // Clock - add 25 seconds (extra time)
          gs.timeout+=25;
          break;

        case 6: // Bomb
          // Does nothing in original game
          break;

        case 7: // 5 Bulb
          // Does nothing in original game
          break;

        default:
          break;
      }

      setgrid(x, y, 0);
      break;

    default:
      break;
  }

  return 0;
}

function domovement(x, y, oldx, oldy, character)
{
  var undertile=getgrid(x, y);

  // Check for level completed
  if (undertile==8)
  {
    setgrid(x, y, character);
    setgrid(oldx, oldy, gs.prevtile);

    nextlevel();
  }
  else
  {
    if (collision(x, y)==0)
    {
      undertile=getgrid(x, y);

      setgrid(x, y, character);
      setgrid(oldx, oldy, gs.prevtile);

      gs.prevtile=undertile;
    }
    else
    {
      // Place player back at starting point
      setgrid(oldx, oldy, gs.prevtile);
      setgrid(startx, starty, 4);

      gs.prevtile=0;
    }
  }
}

// Update the position of player
function updatemovements()
{
  var found=0;
  var moved=0;

  // Find the player
  for (var y=0; y<gs.tilerows; y++)
  {
    for (var x=0; x<gs.tilecolumns; x++)
    {
      // If this is the player, check the keystate/padstate
      switch (getgrid(x, y))
      {
        case 3:
        case 4:
        case 5:
          found=1;

          // Move player when a key is pressed
          if ((gs.keystate!=0) || (gs.padstate!=0))
          {
            // Left key
            if ((ispressed(1)) && (!ispressed(4)) && (squashable(x-1, y)))
            {
              domovement(x-1, y, x, y, 3);
              moved=1;
            }
            else
            // Right key
            if ((ispressed(4)) && (!ispressed(1)) && (squashable(x+1, y)))
            {
              domovement(x+1, y, x, y, 5);
              moved=1;
            }
            else
            // Up key
            if ((ispressed(2)) && (!ispressed(8)) && (squashable(x, y-1)))
            {
              domovement(x, y-1, x, y, 4);
              moved=1;
            }
            else
            // Down key
            if ((ispressed(8)) && (!ispressed(2)) && (squashable(x, y+1)))
            {
              domovement(x, y+1, x, y, 4);
              moved=1;
            }

            if (moved==1) return;

            // Allow diagonal movement
            // Left+Up
            if ((ispressed(1)) && (ispressed(2)) && (squashable(x-1, y-1)))
            {
              domovement(x-1, y-1, x, y, 3);
              moved=1;
            }
            else
            // Right+Up
            if ((ispressed(4)) && (ispressed(2)) && (squashable(x+1, y-1)))
            {
              domovement(x+1, y-1, x, y, 5);
              moved=1;
            }
            else
            // Right+Down
            if ((ispressed(4)) && (ispressed(8)) && (squashable(x+1, y+1)))
            {
              domovement(x+1, y+1, x, y, 5);
              moved=1;
            }
            else
            // Left+Down
            if ((ispressed(1)) && (ispressed(8)) && (squashable(x-1, y+1)))
            {
              domovement(x-1, y+1, x, y, 3);
              moved=1;
            }
          }
          else
            setgrid(x, y, 4);
          break;

        default:
          break;
      }

      if (found==1) return;
    }
  }
}

// Update the sprite ids
function drawlevel()
{
  for (var y=0; y<gs.tilerows; y++)
    for (var x=0; x<gs.tilecolumns; x++)
      gs.gridelem[(y*gs.tilecolumns)+x].setAttribute("tile", gs.grid[(y*gs.tilecolumns)+x]%100);
}

// Update game state
function update()
{
  // Update the game state prior to rendering
  updatemovements();
  updateenemyai();
}

// Update the display of the score
function updatescore()
{
  var text="";
  var localscore=gs.score;

  for (var i=0; i<8; i++)
  {
    var scorechar=localscore%10;

    text="<div class=\"tile\" tile=\""+scorechar+"\"></div>"+text;

    localscore=Math.floor(localscore/10);
  }

  document.getElementById("score").innerHTML=text;
}

// Update the display of the lives
function updatelives()
{
  var text="";
  var locallives=gs.lives;

  for (var i=0; i<3; i++)
  {
    var lifechar=locallives%10;

    text="<div class=\"tile\" tile=\""+lifechar+"\"></div>"+text;

    locallives=Math.floor(locallives/10);
  }

  document.getElementById("lives").innerHTML=text;
}

// Update the display of the time remaining
function updatetime()
{
  var text="";
  var now=new Date();
  var localtime=Math.floor(gs.timeout-(now.valueOf()/1000));

  if (localtime<0) localtime=0;

  for (var i=0; i<3; i++)
  {
    var timechar=localtime%10;

    text="<div class=\"tile\" tile=\""+timechar+"\"></div>"+text;

    localtime=Math.floor(localtime/10);
  }

  document.getElementById("time").innerHTML=text;
}

// Update the display of the shields
function updateshields()
{
  var text="";

  for (var i=0; i<gs.shields; i++)
    text+="<div class=\"tile\"></div>";

  document.getElementById("shields").innerHTML=text;
}

// Request animation frame callback
function rafcallback(timestamp)
{
  // First time round, just save epoch
  if (gs.lasttime>0)
  {
    // Determine accumulated time since last call
    gs.acc+=((timestamp-gs.lasttime) / 1000);

    // If it's more than 15 seconds since last call, reset
    if ((gs.acc>gs.step) && ((gs.acc/gs.step)>(60*15)))
      gs.acc=gs.step*2;

    // Gamepad support
    if (!!(navigator.getGamepads))
      gamepadscan();

    // Process "steps" since last call
    while (gs.acc>gs.step)
    {
      update();
      gs.acc-=gs.step;
    }

    // Update debug
    updateposition();

    // Update the tiles to match the grid
    drawlevel();

    // Update the score, lives, time and shields
    updatescore();
    updatelives();
    updatetime();
    updateshields();
  }

  // Remember when we were last called
  gs.lasttime=timestamp;

  // Request we are called on the next frame
  window.requestAnimationFrame(rafcallback);
}

// All the processing required to load the current level into the playfield
function loadlevel()
{
  var x, y;
  var content="";

  // Add the tiles for the level
  for (y=0; y<gs.tilerows; y++)
  {
    for (x=0; x<gs.tilecolumns; x++)
    {
      var sprite=0;

      switch (levels[gs.level].data[(y*gs.tilecolumns)+x])
      {
        case ' ': sprite=0; break; // Space
        case 'W': sprite=1; break; // Wall
        case '.': sprite=2; break; // Dot / collectable
        case 'S': sprite=4; break; // Squidgy forward
        case 'H': sprite=6; break; // Horizontal enemy (type 1)
        case 'V': sprite=7; break; // Vertical enemy (type 2)
        case 'X': sprite=8; break; // Exit
        case 'w': sprite=9; break; // Bomb / static enemy
        case '^': sprite=10; break; // Selectable tile A
        case 'v': sprite=11; break; // Selectable tile B
        case 'B': sprite=12; break; // Supplemental (collectable)
        default: sprite=levels[gs.level].data.charCodeAt((y*gs.tilecolumns)+x)-0x30; break;
      }

      // Remember player start position for this level
      if (sprite==4)
      {
        startx=x;
        starty=y;
      }

      setgrid(x, y, sprite);
    }
  }

  // Set the supplemental tile
  gs.supp=levels[gs.level].supp;

  // Set the tile bitfield
  gs.extra=levels[gs.level].extra;

  // Clear tile cache
  gs.prevtile=0;

  // Set countdown timer
  var now=new Date();
  gs.timeout=(now.valueOf()/1000)+90;
}

// Start playing on current level
function launchgame()
{
  /////////////////////////////////////////////////////
  // Start game
  gs.playfield=document.getElementById("playfield");

  // Add blank tiles
  for (var y=0; y<gs.tilerows; y++)
  {
    for (var x=0; x<gs.tilecolumns; x++)
    {
      var tile=document.createElement("div");

      // Set properties for DOM object
      tile.innerHTML="";
      tile.style.left=(x*gs.tilewidth)+"px";
      tile.style.top=(y*gs.tileheight)+"px";
      tile.style.width=gs.tilewidth+"px";
      tile.style.height=gs.tileheight+"px";
      tile.classList.add("tile");
      tile.setAttribute("tile", "0");

      gs.gridelem[(y*gs.tilecolumns)+x]=tile;

      gs.playfield.appendChild(tile);
    }
  }

  // Load everything for "current" level
  loadlevel();

  // Start the game running
  window.requestAnimationFrame(rafcallback);
}

// Resize the playfield to the browser size
function playfieldsize()
{
  // TODO
}

// Entry point
function init()
{
  // Handle keyboard interaction
  document.onkeydown=function(e)
  {
    e = e || window.event;
    updatekeystate(e, 1);
  };

  document.onkeyup=function(e)
  {
    e = e || window.event;
    updatekeystate(e, 0);
  };

  // Stop things from being dragged around
  window.ondragstart=function(e)
  {
    e = e || window.event;
    e.preventDefault();
  };

  // Handle resizing
  window.addEventListener("resize", function()
  {
    playfieldsize();
  });

  playfieldsize();

  launchgame();
}

// Run the init() once page has loaded
window.onload=function() { init(); };
