// Entry point
function init()
{
  // Stop things from being dragged around
  window.ondragstart=function(e)
  {
    e = e || window.event;
    e.preventDefault();
  };
}

// Run the init() once page has loaded
window.onload=function() { init(); };
