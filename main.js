window.onload = function(){

  var canvas = document.getElementById("canvas"),
  context = canvas.getContext("2d"),
  width = canvas.width = window.innerWidth,
  height = canvas.height = window.innerHeight;

  var gun = {
    x: width/8,
    y: height,
    angle: -Math.PI / 4
  };
  var cannonball = particle.create(gun.x, gun.y, 15, gun.angle, 0.4),
  isShooting = false;
  cannonball.radius = 7;

  var target = {};
      explosionParticles = [],
      numParticles = 50,
      exploding = false,
      outOfRangeParticles = 0;


  //Power guage
  var powerAngle = 0,
      powerSpeed = 0.05,
      rawPower = 0;

  setTarget();
  update();
  render();

  document.body.addEventListener("keyup", function(event){
    switch(event.keyCode){
      case 32:
      if(!isShooting){
        shoot();
      }
      break;
    }
  });

  document.body.addEventListener("mousedown", function(event){
    document.body.addEventListener("mousemove", onMouseMove);
    document.body.addEventListener("mouseup", onMouseUp);
    aimGun(event.clientX, event.clientY);
  });

  function onMouseMove(event){
    aimGun(event.clientX, event.clientY);
  }

  function onMouseUp(event){
    document.body.removeEventListener("mousemove", onMouseMove);
    document.body.removeEventListener("mouseup", onMouseUp);
    aimGun(event.clientX, event.clientY);
  }

  function aimGun(x, y){
    gun.angle = utils.clamp(Math.atan2(y - gun.y, x - gun.x), -Math.PI / 2, -0.3);
    render();
  }

  function shoot(){
    isShooting = true;
    cannonball.x = gun.x + Math.cos(gun.angle) * 15;
    cannonball.y = gun.y + Math.sin(gun.angle) * 15;
    cannonball.setSpeed(utils.map(rawPower, -1, 1, 0, 25));
    cannonball.setHeading(gun.angle);
  }

  function setTarget(){
    target.x = utils.randomRange(width/4, width -50);
    target.y = utils.randomRange(100, height - 100);
    target.radius = utils.randomRange(20, 60);
    for(var i = 0; i < numParticles; i++){
      var p = particle.create(target.x, target.y, utils.randomRange(5, 10), utils.randomRange(0, Math.PI * 2), 0.4);
      p.radius = utils.randomRange(2, 10);
      explosionParticles.push(p);
    }
  }

  function checkTarget(){
    if(utils.circleCollision(cannonball, target)){
      exploding = true;
      for(var i = 0; i < numParticles; i++){
        explosionParticles[i].vx += cannonball.vx * 0.5;
        explosionParticles[i].vy += cannonball.vy * 0.5;
      }
      cannonball.x = gun.x;
      cannonball.y = gun.y;
      cannonball.setSpeed(0);
    }
  }

  function update(){
    if(!isShooting){
      powerAngle += powerSpeed;
      rawPower = Math.sin(powerAngle);
    }

    if(isShooting){
      cannonball.update();
      checkTarget();
    }

    if(exploding){
      for(var i = explosionParticles.length - 1; i >= 0; i--){
        explosionParticles[i].update();
        if(explosionParticles[i].y > height){
          outOfRangeParticles++;
          explosionParticles.splice(i, 1);
        }
      }
      if(outOfRangeParticles == numParticles){
        outOfRangeParticles = 0;
        exploding = false;
        setTarget();
      }
    }

    if(cannonball.y > height - cannonball.radius){
      cannonball.y = height - cannonball.radius;
      isShooting = false;
    }

    render();
    requestAnimationFrame(update);
  }

  function render(){
    context.clearRect(0, 0, width, height);
    //cannonball
    context.beginPath();
    context.fillStyle = "#999";
    context.arc(cannonball.x, cannonball.y, cannonball.radius + 2, 0, Math.PI * 2, false);
    context.fill();
    context.beginPath();
    context.fillStyle = "#222";
    context.arc(cannonball.x, cannonball.y, cannonball.radius, 0, Math.PI * 2, false);
    context.fill();

    //cannonball
    context.save();
    context.translate(gun.x, gun.y);
    context.rotate(gun.angle);
    context.fillStyle = "#999";
    context.fillRect(-2, -10, 54, 20);
    context.fillStyle = "#222";
    context.fillRect(0, -8, 50, 16);
    context.restore();
    context.beginPath();
    context.fillStyle = "#999";
    context.arc(gun.x, gun.y, 34, 0, Math.PI * 2, false);
    context.fill();
    context.beginPath();
    context.fillStyle = "#222";
    context.arc(gun.x, gun.y, 30, 0, Math.PI * 2, false);
    context.fill();

    //power guage
    context.fillStyle = "#aaa";
    context.fillRect(18, height - 18, 14, -54);
    context.fillStyle = "#222";
    context.fillRect(20, height - 20, 10, utils.map(rawPower, -1, 1, 0, -50));

    //target
    if(!exploding){
      context.fillStyle = "000";
      context.arc(target.x, target.y, target.radius, 0, Math.PI* 2, false);
      context.fill();
    }

    //explosionParticles
    if(exploding){
      context.fillStyle = "e33";
      for(var i = 0; i < explosionParticles.length; i++){
        context.beginPath();
        context.arc(explosionParticles[i].x, explosionParticles[i].y, explosionParticles[i].radius,
          0, Math.PI * 2, false);
          context.fill();
        }
    }
  }

};
