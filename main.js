var spritewidth=24;
var spriteheight=32;
var levelwidth=14;
var levelheight=18;

var level=1;

function drawlevel()
{
  var x, y;
  var content="";

  for (y=0; y<levelheight; y++)
  {
    for (x=0; x<levelwidth; x++)
    {
      var sprite=0;

      switch (levels[level].data[(y*levelwidth)+x])
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
        default: sprite=levels[level].data.charCodeAt((y*levelwidth)+x)-0x30; break;
      }

      content+="<div class='tile s"+sprite+"'></div>";
    }
  }

  document.getElementById("playfield").innerHTML=content;
}

function nextlevel()
{
  document.getElementById("playfield").innerHTML="";
  document.getElementById("playfield").classList.remove("level"+level);

  level++;
  if (level>32) level=1;

  document.getElementById("playfield").classList.add("level"+level);

  drawlevel();
}

// Entry point
function init()
{
  // Stop things from being dragged around
  window.ondragstart=function(e)
  {
    e = e || window.event;
    e.preventDefault();
  };

  drawlevel();

  setInterval(nextlevel, 3*1000);
}

// Run the init() once page has loaded
window.onload=function() { init(); };
