var Explosion = Explosion || {

  x: 0,
  y: 0,
  allParticles: [],

  create: function(x, y, numParticles){
    for(var i = 0; i < numParticles; i++){
      var p = particle.create(x, y, utils.randomRange(5, 10), utils.randomRange(0, Math.PI * 2), 0.4);
      p.radius = utils.randomRange(2, 10);
      this.allParticles.push(p);
    }
  },

  update: function(){
    for(var i = 0; i < allParticles.length; i++){
      allParticles[i].update();
    }
  },

  solveConstraints: function(width, height){
    for(var i = 0; i < allParticles.length; i++){
      var p = allParticles[i].update();
      if(p.x > p.width - p.radius){
        p.x = p.width - p.radius;
        p.vx *= p.bounce;
      } else if(p.x < p.radius){
        p.x = p.radius;
        p.vx *= p.bounce;
      }
      if(p.y > p.height - p.radius){
        p.y = p.height - p.radius;
        p.vy *= p.bounce;
      } else if(p.y < p.radius){
        p.y = p.radius;
        p.vy *= p.bounce;
      }
    }
  }
}
