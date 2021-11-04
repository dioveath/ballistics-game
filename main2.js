window.onload = function(){

  var canvas = document.getElementById("canvas"),
  context = canvas.getContext("2d"),
  width = canvas.width = window.innerWidth,
  height = canvas.height = window.innerHeight;

  var c0 = {
    x: width/2,
    y: height/2,
    radius: 20
  };
  var c1 = {
    x: 0,
    y: 0,
    radius: 20
  };


  render();

  function render(){
    context.clearRect(0, 0, width, height);

    utils.blockCircle(c0, c1);

    context.beginPath();
    context.arc(c0.x, c0.y, c0.radius, 0, Math.PI * 2,false);
    context.fill();

    context.beginPath();
    context.arc(c1.x, c1.y, c1.radius, 0, Math.PI * 2,false);
    context.fill();
  }

  document.body.addEventListener("mousemove", function(event){
    c1.x = event.clientX;
    c1.y = event.clientY;
    render();
  });

};
