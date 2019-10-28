var spritewidth=24;
var spriteheight=32;
var levelwidth=14;
var levelheight=18;

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

function drawlevel()
{
  var x, y;
  var content="";

  for (y=0; y<levelheight; y++)
  {
    for (x=0; x<levelwidth; x++)
    {
      var sprite=0;

      switch (levels[gs.level].data[(y*levelwidth)+x])
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
        default: sprite=levels[gs.level].data.charCodeAt((y*levelwidth)+x)-0x30; break;
      }

      content+="<div class='tile s"+sprite+"'></div>";
    }
  }

  document.getElementById("playfield").innerHTML=content;
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

  drawlevel();

  setInterval(nextlevel, 3*1000);

  // Start the game running
  window.requestAnimationFrame(rafcallback);
}

// Run the init() once page has loaded
window.onload=function() { init(); };
