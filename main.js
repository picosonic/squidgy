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

  // level related
  playfield:null,
  level:1,
  grid:[], // x*y tile ids
  gridelem:[], // x*y tile elements
  tilerows:14,
  tilecolumns:18,
  tilewidth:24,
  tileheight:32,
  score:0,
  lives:5,
  scale:1,
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

function nextlevel()
{
  document.getElementById("wrapper").classList.remove("level"+gs.level);

  gs.level++;
  if (gs.level>32) gs.level=1;

  document.getElementById("wrapper").classList.add("level"+gs.level);
}

function getgrid(x, y)
{
  return gs.grid[(y*gs.tilecolumns)+x];
}

function setgrid(x, y, tileid)
{
  gs.grid[(y*gs.tilecolumns)+x]=tileid;
}

function squashable(x, y)
{
  switch (getgrid(x, y))
  {
    case 0: // Space
    case 2: // Dot
    case 10: // Wall curved top
    case 11: // Wall curved bottom
    case 12: // Bulb (extra life)
      return true;
      break;
  }

  return false;
}

function updateposition()
{
  var dbg="";

  dbg+="KEY:"+gs.keystate;
  dbg+=" PAD:"+gs.padstate;

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
          setgrid(x+1, y, 6);
        }
        else
          setgrid(x, y, 106);
        break;

      case 106: // left
        if (getgrid(x-1, y)==0)
        {
          setgrid(x, y, 0);
          setgrid(x-1, y, 106);
        }
        else
          setgrid(x, y, 6);
        break;

      case 7: // down
        if (getgrid(x, y+1)==0)
        {
          setgrid(x, y, 0);
          setgrid(x, y+1, 7);
        }
        else
          setgrid(x, y, 107);
        break;

    case 107: // up
        if (getgrid(x, y-1)==0)
        {
          setgrid(x, y, 0);
          setgrid(x, y-1, 107);
        }
        else
          setgrid(x, y, 7);
        break;

      default:
        break;
    }
  }
}

function collision(x, y)
{
  switch (getgrid(x, y))
  {
    case 2: // Dot
      gs.score++;
      setgrid(x, y, 0);
      break;

    case 12: // Bulb (extra life)
      gs.lives++;
      setgrid(x, y, 0);
      break;

    default:
      break;
  }
}

// Update the position of players/enemies
function updatemovements()
{
  var found=0;
  var undertile=0;

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
                collision(x-1, y);
                undertile=getgrid(x-1, y);
                setgrid(x-1, y, 3);
                setgrid(x, y, gs.prevtile);
                gs.prevtile=undertile;
            }
            else
            // Right key
            if ((ispressed(4)) && (!ispressed(1)) && (squashable(x+1, y)))
            {
                collision(x+1, y);
                undertile=getgrid(x+1, y);
                setgrid(x+1, y, 5);
                setgrid(x, y, gs.prevtile);
                gs.prevtile=undertile;
            }
            else
            // Up key
            if ((ispressed(2)) && (!ispressed(8)) && (squashable(x, y-1)))
            {
                collision(x, y-1);
                undertile=getgrid(x, y-1);
                setgrid(x, y-1, 4);
                setgrid(x, y, gs.prevtile);
                gs.prevtile=undertile;
            }
            else
            // Down key
            if ((ispressed(8)) && (!ispressed(2)) && (squashable(x, y+1)))
            {
                collision(x, y+1);
                undertile=getgrid(x, y+1);
                setgrid(x, y+1, 4);
                setgrid(x, y, gs.prevtile);
                gs.prevtile=undertile;
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

    // Update the score
    updatescore();
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

  // Set which level we are on
  gs.playfield.setAttribute("level", gs.level);

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
        case '.': sprite=2; break; // Dot
        case 'S': sprite=4; break; // Squidgy
        case 'H': sprite=6; break; // Horizontal enemy
        case 'V': sprite=7; break; // Vertical enemy
        case 'X': sprite=8; break; // Exit
        case 'w': sprite=9; break; // Bomb
        case '^': sprite=10; break; // Wall curved top
        case 'v': sprite=11; break; // Wall curved bottom
        case 'B': sprite=12; break; // Bulb (extra life)
        default: sprite=levels[gs.level].data.charCodeAt((y*gs.tilecolumns)+x)-0x30; break;
      }

      setgrid(x, y, sprite);
    }
  }
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
