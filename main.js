
// Player/enemy state
function st(elem)
{
  this.e=(elem||null); // DOM element

  this.keystate=0; // keyboard bitfield [action][down][right][up][left]
  this.padstate=0; // gamepad bitfield [action][down][right][up][left]
}

// Game state
var gs={
  // entities
  player:new st(),
  enemies:[],

  // level related
  level:1,
  tiles:[],
  tilerows:14,
  tilecolumns:18,
  tilewidth:24,
  tileheight:32,
  things:[], // collectables
  score:0,
  scale:1,
};

// Clear both keyboard and gamepad input state
function clearinputstate(character)
{
  character.keystate=0;
  character.padstate=0;
}

// Check if an input is set in either keyboard or gamepad input state
function ispressed(character, keybit)
{
  return (((character.keystate&keybit)!=0) || ((character.padstate&keybit)!=0));
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
        gs.player.keystate|=1;
      else
        gs.player.keystate&=~1;
      e.preventDefault();
      break;

    case 38: // cursor up
    case 87: // W
    case 59: // semicolon
      if (dir==1)
        gs.player.keystate|=2;
      else
        gs.player.keystate&=~2;
      e.preventDefault();
      break;

    case 39: // cursor right
    case 68: // D
    case 88: // X
      if (dir==1)
        gs.player.keystate|=4;
      else
        gs.player.keystate&=~4;
      e.preventDefault();
      break;

    case 40: // cursor down
    case 83: // S
    case 190: // dot
      if (dir==1)
        gs.player.keystate|=8;
      else
        gs.player.keystate&=~8;
      e.preventDefault();
      break;

    case 13: // enter
    case 32: // space
      if (dir==1)
        gs.player.keystate|=16;
      else
        gs.player.keystate&=~16;
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
  document.getElementById("playfield").innerHTML="";
  document.getElementById("playfield").classList.remove("level"+gs.level);

  gs.level++;
  if (gs.level>32) gs.level=1;

  document.getElementById("playfield").classList.add("level"+gs.level);

  drawlevel();
}

function updateposition()
{
  var dbg="";

  dbg+="KEY:"+gs.player.keystate;

  document.getElementById("debug").innerHTML=dbg;
}

// Request animation frame callback
function rafcallback(timestamp)
{
  updateposition();

  window.requestAnimationFrame(rafcallback);
}

// Clear set of items from DOM and array
function clearobjects(items)
{
  for (var i=0; i<items.length; i++)
    items[i].e.remove(); // remove from DOM

  items.splice(0, items.length); // clear array
}

// Clear the playfield
function clearplayfield()
{
  // Clear any existing tiles
  clearobjects(gs.tiles);

  // Clear any existing collectables
  clearobjects(gs.things);

  // Clear any existing characters
  clearobjects(gs.enemies);
}

// Add a tile to the playfield
function addDOMtile(x, y, tileid)
{
  var tile=document.createElement("div");
  var tileobj={};

  // Set properties for DOM object
  tile.innerHTML="";
  tile.style.left=x+"px";
  tile.style.top=y+"px";
  tile.classList.add("tile");
  tile.classList.add("s"+tileid);

  // Set properties for tiles array entry
  tileobj.e=tile;
  tileobj.id=tileid;
  tileobj.offsetLeft=x;
  tileobj.offsetTop=y;
  tileobj.clientWidth=gs.tilewidth;
  tileobj.clientHeight=gs.tileheight;

  // Add to tiles array
  gs.tiles.push(tileobj);

  document.getElementById("playfield").appendChild(tile);
}

// Add a single collectable item to the DOM and things array
function addcollectable(x, y, tileid)
{
  var thing=document.createElement("div");
  var thingobj={};

  // Set properties for DOM object
  thing.innerHTML="";
  thing.style.left=x+"px";
  thing.style.top=y+"px";
  thing.classList.add("tile");
  thing.classList.add("s"+tileid);

  // Set properties for new things array item
  thingobj.e=thing;
  thingobj.id=tileid;
  thingobj.x=x;
  thingobj.y=y;
  thingobj.w=gs.tilewidth;
  thingobj.h=gs.tileheight;

  // Add to things array
  gs.things.push(thingobj);

  document.getElementById("playfield").appendChild(thing);
}

// Add a single enemy to the DOM and enemies array
function addenemy(x, y, tileid)
{
  var enemy=document.createElement("div");
  var enemyobj=new st(enemy);

  // Set DOM properties
  enemy.innerHTML="";
  enemy.style.left=x+"px";
  enemy.style.top=y+"px";
  enemy.classList.add("tile");
  enemy.classList.add("s"+tileid);

  // Set properties for entry in enemies array
  enemyobj.sx=enemyobj.x=x;
  enemyobj.sy=enemyobj.y=y;
  enemyobj.w=gs.tilewidth;
  enemyobj.h=gs.tileheight;

  // Add to enemies array
  gs.enemies.push(enemyobj);

  document.getElementById("playfield").appendChild(enemy);
}

// Add a character to the game
function addcharacter(x, y, tileid)
{
  switch (tileid)
  {
    case 4: // Player
      gs.player.x=x;
      gs.player.y=y;
      gs.player.e.style.left=gs.player.x+"px";
      gs.player.e.style.top=gs.player.y+"px";
      gs.player.e.classList.add("tile");
      gs.player.e.classList.add("s"+tileid);
      break;

    case 6: // Enemies
    case 7:
      addenemy(x, y, tileid);
      break;

    default:
      break;
  }
}

// Add a tile to the game
function addtile(x, y, tileid)
{
  switch (tileid)
  {
    case 0:
    case 1:
    case 8:
    case 9:
    case 10:
    case 11:
    case 12:
      addDOMtile(x, y, tileid);
      break;

    case 2:
      addDOMtile(x, y, 0); // Add a space underneath
      addcollectable(x, y, tileid);
      break;

    case 4:
    case 6:
    case 7:
      addDOMtile(x, y, 0); // Add a space underneath
      addcharacter(x, y, tileid);
      break;

    default: break;
  }
}

// All the processing required to load the current level into the playfield
function loadlevel()
{
  var x, y;
  var content="";

  // Set which level we are on
  document.getElementById("playfield").setAttribute("level", gs.level);

  // Clear the playfield of tiles, things and enemies
  clearplayfield();

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
        case 'B': sprite=12; break; // ?? Not sure ??
        default: sprite=levels[gs.level].data.charCodeAt((y*gs.tilecolumns)+x)-0x30; break;
      }

      addtile(x*gs.tilewidth, y*gs.tileheight, sprite);
    }
  }
}

// Start playing on current level
function launchgame()
{
  /////////////////////////////////////////////////////
  // Start game
  gs.player.e=document.getElementById("player");

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
