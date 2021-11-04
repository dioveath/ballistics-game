window.onload = function(){

  var canvas = document.getElementById("canvas"),
  context = canvas.getContext("2d"),
  width = canvas.width = window.innerWidth,
  height = canvas.height = window.innerHeight;


  //GAME_STATES
  var LOADING = 0,
      PRESS_TO_START = 1,
      PLAYING = 2,
      GAME_OVER;
  var current_state = LOADING;



  var currentScore = 0,
      scoreIncrement = 300;
  var messages = [
    {
      score: 100,
      message: "Why are you so bad at this?"
    },
    {
      score: 500,
      message: "You could have done more, you know!"
    },
    {
      score: 1000,
      message: "You are something! "
    },
    {
      score: 1500,
      message: "You are mind blowing"
    },
    {
      score: 2000,
      message: "Are you god?"
    }
  ];

  var gun = {
    x: width/8,
    y: height,
    angle: -Math.PI / 4
  };
  var NUM_BALLS = 5;
  var cannonball = particle.create(gun.x, gun.y - 7, 15, gun.angle, 0.4),
  currentNumBall = NUM_BALLS,
  isShooting = false;
  cannonball.radius = 7;

  var target = {};
      currentExplosionParticles = [],
      allExplosion = [];
      numParticles = 50,
      exploding = false;

  //Power guage
  var powerAngle = 0,
      powerSpeed = 0.05,
      rawPower = 0;

  //sounds effects
  var assets = [],
      loadedAssets = 0;
  var player_shot = document.getElementById("shot");
  player_shot.addEventListener("canplaythrough", loadHandler);
  player_shot.load();
  player_shot.volume = 0.2;
  assets.push(player_shot);

  var explosion_sound = document.getElementById("explosion");
  explosion_sound.addEventListener("canplaythrough", loadHandler);
  explosion_sound.load();
  assets.push(explosion_sound);

  var background_music = document.getElementById("background_music");
  background_music.addEventListener("canplaythrough", loadHandler);
  background_music.load();
  background_music.volume = 0.5;
  assets.push(background_music);

  function loadHandler(){
    background_music.play();
    loadedAssets++;
    if(loadedAssets == assets.length){
      setTarget();
      update();
      render();
      current_state = PRESS_TO_START;
    }
  }

  document.body.addEventListener("keyup", function(event){
    switch(current_state){
      case PLAYING:
      switch(event.keyCode){
        case 32:
        if(!isShooting){
          shoot();
        }
        break;
      }
      break;
      case PRESS_TO_START:
      current_state = PLAYING;
      break;
      case GAME_OVER:
      resetGame();
      break;
    }
  });

  document.body.addEventListener("mousedown", function(event){
    switch(current_state){
      case PLAYING:
      document.body.addEventListener("mousemove", onMouseMove);
      document.body.addEventListener("mouseup", onMouseUp);
      aimGun(event.clientX, event.clientY);
      break;
      case PRESS_TO_START:
      current_state = PLAYING;
      break;
      case GAME_OVER:
      resetGame();
      break;
    }
  });

  function resetGame(){
    if(typeof(Storage) != undefined){
      if(localStorage.highestScore_ballistics){
        if(localStorage.highestScore_ballistics < currentScore){
          localStorage.highestScore_ballistics = currentScore;
        }
      } else {
        localStorage.highestScore_ballistics = currentScore;
      }
    } else {
      console.log("Sorry boy!, couldn't save your file!");
    }
    currentNumBall = NUM_BALLS;
    currentScore = 0;
    allExplosion.length = 0;
    setTarget();
    current_state = PRESS_TO_START;
  }

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
    player_shot.volume = Math.min(0.4, Math.max(0.1, utils.norm(rawPower, -1, 1)));
    player_shot.currentTime = 0;
    player_shot.play();
    isShooting = true;
    cannonball.x = gun.x + Math.cos(gun.angle) * 15;
    cannonball.y = gun.y + Math.sin(gun.angle) * 15;
    cannonball.setSpeed(utils.map(rawPower, -1, 1, 0, 30));
    cannonball.setHeading(gun.angle);
  }

  function setTarget(){
    target.x = utils.randomRange(width/4, width -50);
    target.y = utils.randomRange(100, height - 100);
    target.radius = utils.randomRange(20, 60);
  }

  function checkTarget(){
    if(utils.circleCollision(cannonball, target)){
      exploding = true;

      var dist = utils.distanceXY(gun.x, gun.y, target.x, target.y);
      currentScore += Math.floor(((1 - target.radius/ 60)/2 + dist/width/2)  * scoreIncrement);

      var newExplosionParticles = [];
      newExplosionParticles.timeOut = 12;
      for(var i = 0; i < numParticles; i++){
        var p = particle.create(target.x , target.y, utils.randomRange(5, 10), utils.randomRange(0, Math.PI * 2), 0.4);
        p.vx += cannonball.vx * 0.5;
        p.vy += cannonball.vy * 0.5;
        p.radius = utils.randomRange(2, 10);
        p.bounce = (1 - p.radius/10) * -1;
        p.friction = 0.99;
        newExplosionParticles.push(p);
      }
      currentExplosionParticles = newExplosionParticles;
      allExplosion.push(newExplosionParticles);

      cannonball.x = gun.x;
      cannonball.y = gun.y - cannonball.radius * 2;
      cannonball.setSpeed(0);
      isShooting = false;
      setTarget();
    }
  }

  function getMessage(score){
    var total = 0;
    for(var i = 0; i < messages.length; i++){
      total += messages.score;
    }

    for(var i = 0; i < messages.length; i++){
      if(score < messages[i].score)
        return messages[i].message;
      score-=messages[i].score;
    }
    return "I shouldn't be here!";
  }

  var previousTime = Date.now(),
      deltaTime = 0;

  function update(){
    deltaTime = (Date.now() - previousTime)/1000;
    previousTime = Date.now();

    if(current_state == PLAYING){
      if(currentNumBall <= 0){
        current_state = GAME_OVER;
      }
      if(!isShooting){
        powerAngle += powerSpeed;
        rawPower = Math.sin(powerAngle);
      }
      if(isShooting){
        cannonball.update();
        checkTarget();
      }

      if(exploding){
        explosion_sound.play();
        exploding = false;
      }
      for(var i = allExplosion.length - 1; i >= 0; i--){
        var currentExplosion = allExplosion[i];
        currentExplosion.timeOut -= deltaTime;
        if(currentExplosion.timeOut > 0){
          for(var j = 0; j < currentExplosion.length; j++){
            var p = currentExplosion[j];
            p.update();
            if(p.x > width - p.radius){
              p.x = width - p.radius;
              p.vx *= p.bounce;
            } else if(p.x < width/4 + p.radius){
              p.x = width/4 + p.radius;
              p.vx *= p.bounce;
            }
            if(p.y > height - p.radius){
              p.y = height - p.radius;
              p.vy *= p.bounce;
            } else if(p.y < p.radius){
              p.y = p.radius;
              p.vy *= p.bounce;
            }
            // for(var k = j + 1; k < currentExplosion.length; k++){
            //   utils.blockCircle(p, currentExplosion[k]);
            // }
          }
        } else {
          allExplosion.splice(i, 1);
        }
      }

      if(cannonball.y > height - cannonball.radius){
        cannonball.y = height - cannonball.radius;
        isShooting = false;
        currentNumBall--;
      }
    }

    render();
    requestAnimationFrame(update);
  }

  function render(){
    context.clearRect(0, 0, width, height);
    if(current_state == LOADING){
      context.font = "20px Verdana";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText("LOADING....", width/2, height/2);
    }
    if(current_state == PRESS_TO_START){
      context.fillStyle = "#222";
      context.fillText("INSTRUNCTIONS", width/2, height/2 - 90);
      context.fillText("AIM THE CANNON WITH MOUSE BY DRAGGING", width/2, height/2 - 50);
      context.fillText("PRESS 'SACE' TO SHOOT", width/2, height/2 - 25);
      context.fillText("PRESS ANY KEY TO START", width/2, height/2 + 50);
    }
    if(current_state == GAME_OVER){
      context.fillStyle = "#222";
      context.fillText("Your Final Score: " + currentScore, width/2, height/2 - 50);
      var message = getMessage(currentScore);
      context.fillText(message, width/2, height/2);
    }
    //UI Elements
    //power guage
    context.fillStyle = "#aaa";
    context.fillRect(18, height - 18, 14, -54);
    context.fillStyle = "#222";
    context.fillRect(20, height - 20, 10, utils.map(rawPower, -1, 1, 0, -50));
    context.beginPath();
    context.fillStyle = "#999";
    context.arc(60, height - 30, cannonball.radius + 2, 0, Math.PI * 2, false);
    context.fill();
    context.beginPath();
    context.fillStyle = "#222";
    context.arc(60, height - 30, cannonball.radius, 0, Math.PI * 2, false);
    context.fill();
    context.fillText("" + currentNumBall, 60, height - 50);
    context.fillText("Your Score: " + currentScore, width/2, 50);

    if(typeof(Storage) != undefined){
      if(localStorage.highestScore_ballistics){
        context.fillText("Highest Score: " + localStorage.highestScore_ballistics, width/2, 25);
      } else {
        context.fillText("Highest Score: " + 0000 + "" , width/2, 25);
      }
    } else {
      context.fillText("Highest Score: " + 0000 + "" , width/2, 25);
    }


    //Game elelments
    //cannonball
    context.beginPath();
    context.fillStyle = "#999";
    context.arc(cannonball.x, cannonball.y, cannonball.radius + 2, 0, Math.PI * 2, false);
    context.fill();
    context.beginPath();
    context.fillStyle = "#222";
    context.arc(cannonball.x, cannonball.y, cannonball.radius, 0, Math.PI * 2, false);
    context.fill();

    //gun
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

    //target
    // if(!exploding){
      context.fillStyle = "000";
      context.arc(target.x, target.y, target.radius, 0, Math.PI* 2, false);
      context.fill();
    // }

    //explosionParticles
    context.fillStyle = "#444";
    for(var i = 0; i < allExplosion.length; i++){
      var currentExplosion = allExplosion[i];
      for(var j = 0; j < currentExplosion.length; j++){
        context.beginPath();
        context.arc(currentExplosion[j].x, currentExplosion[j].y, currentExplosion[j].radius,
        0, Math.PI * 2, false);
        context.fill();
      }
    }
  }

};
