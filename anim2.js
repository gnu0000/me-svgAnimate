//
// svg animation example
//
// Craig Fitzgerald
//
// this is just a hack for now

$(function() {
   new PageHandler("#svg1");
});

function PageHandler(selector) {
   var self = this;

   this.Init = function(selector) {
      self.svg      = $(selector);
      self.timer    = null;
      self.color    = "#468bc9";
      self.offset   = {x:500, y:500}; 
      self.interval = 25;
      self.scene    = -1;
      self.scenes   = [
//       self.AnimationTest ,
         self.SwarmingBees  ,
         self.SpinningSwarm ,
         self.SpinningBalls ,
         self.GrantsScene   
      ]
      $(".scene"  ).click(self.Scene);
      $(".animate").click(self.Animate);
      $(".step"   ).click(self.Step);
      self.Scene();
      self.Animate();
   };

   this.Scene = function() {
      self.scene = (self.scene + 1) % self.scenes.length;
      self.svg.empty();
      PolygonIndex = 0; // for now....
      TransformIndex = 0; // for now....
      self.scenes[self.scene]();
   };

   // spinning pinwheels
   this.AnimationTest = function() {
      $("#title").text("SVG polygon animation test");
      self.objects   = [];
      let proto      = self.DecodePoints("5,0 10,15 5,10 0,15");
      let transforms = [
         new CircleTransform(325,  1/720),
         new CircleTransform(110, -1/120),
         new CircleTransform(20,   1/35 )
      ];
      let points = self.Offset(proto, self.offset);
      for (let t1=0; t1<1; t1+=1/7) {
         for (let t2=0; t2<1; t2+=1/9) {
            for (let t3=0; t3<1; t3+=1/6) {
               let poly = new Polygon(self.svg, points, transforms, self.color, [t1, t2, t3]);
               self.objects.push(poly);
            }   
         }   
      }   
   };

   // swarming bees
   this.SwarmingBees = function() {
      $("#title").text("Swarming Bees");
      self.objects   = [];
      let proto      = self.DecodePoints("5,0 10,15 5,10 0,15");
      let transforms = [
         new WalkTransform({x:500,y:500}, 1/10, 3)
      ];
      let points = self.Offset(proto, self.offset);
      for (let i=0; i<1; i+=1/1000) {
         let poly = new Polygon(self.svg, points, transforms, self.color, [i]);
         self.objects.push(poly);
      }
   };

   // spinning swarm
   this.SpinningSwarm = function() {
      $("#title").text("Spinning Swarm");
      self.objects   = [];
      let proto      = self.DecodePoints("5,0 10,15 5,10 0,15");
      let transforms = [
         new CircleTransform(200,  1/100),
         new WalkTransform({x:100,y:100}, 1/10, 2)
      ];
      let points = self.Offset(proto, self.offset);
      for (let i=0; i<1; i+=1/500) {
         let poly = new Polygon(self.svg, points, transforms, self.color, [i, i]);
         self.objects.push(poly);
      }
   };

   // spinning complicated balls
   this.SpinningBalls = function() {
      $("#title").text("Spinning complicated balls");
      self.objects   = [];
      let proto      = self.DecodePoints("5,0 10,15 5,10 0,15");
      let transforms = [
         new CircleTransform(30,  1/60),
         new CircleTransform(40, -1/120),
         new CircleTransform(400, 1/350 )
      ];
      let points = self.Offset(proto, self.offset);
      for (let t1=0; t1<1; t1+=1/7) {
         for (let t2=0; t2<1; t2+=1/9) {
            for (let t3=0; t3<1; t3+=1/12) {
               let poly = new Polygon(self.svg, points, transforms, self.color, [t1, t2, t3]);
               self.objects.push(poly);
            }   
         }   
      }   
   };

   this.GrantsScene = function() {
      $("#title").text("Grant's Scene");
      self.objects   = [];
      let proto      = self.DecodePoints("15,0 20,5 25,5 25,10 30,15 25,20 25,25 20,25 15,30 10,25 5,25 5,20 0,15 5,10 5,5 10,5");

      let transforms = [
         new CircleTransform(325,  1/720),
         new CircleTransform(110, -1/120),
         new CircleTransform(20,   1/35 )
      ];
      let points = self.Offset(proto, self.offset);
      for (let t1=0; t1<1; t1+=1/7) {
         for (let t2=0; t2<1; t2+=1/4) {
            for (let t3=0; t3<1; t3+=1/3) {
               let poly = new Polygon(self.svg, points, transforms, self.color, [t1, t2, t3]);
               self.objects.push(poly);
            }   
         }   
      }   
   };


   this.Offset = function(proto, offset) {
      let points = JSON.parse(JSON.stringify(proto));
      for (let point of points) {
         point.x += offset.x;
         point.y += offset.y;
      }
      return points;
   };

   this.Animate = function() {
      if (self.timer){
         clearInterval(self.timer);
         self.timer = null;
      } else {
         self.timer = setInterval(self.Step, self.interval);
      }
   };

   this.Step = function() {
      for (let obj of self.objects) {
         obj.Increment(obj);
         obj.Position(obj);
      }
   };

   this.DecodePoints = function(pointStr) {
      console.log("pointStr: " + pointStr);
      var points = [];
      $.each(pointStr.split(" "), function(){
         //console.log("a points str = " + this);
         let m = this.match(/^(\d+),(\d+)$/);
         points.push({x:m[1]-0, y:m[2]-0});
      });
      return points;
   };

   self.Init(selector);
}

//================================================================

var PolygonIndex = 0; // for now....

function Polygon(svg, points, transforms, color, iter) {
   var self = this;

   this.Init = function(svg, points, transforms, color, iter) {
      self.svg        = svg;
      self.idx        = PolygonIndex++;
      self.start      = points;
      self.points     = JSON.parse(JSON.stringify(self.start));
      self.transforms = transforms;
      self.iter       = iter;
      self.color      = color;

      self.dom = self.CreateDom();
   };

   this.CreateDom = function() {
      let ns   = 'http://www.w3.org/2000/svg';
      let dom = $(document.createElementNS(ns,'polygon')).attr({
         id:     "poly_" + self.idx,
         points: self.EncodePoints(self.CalcPosition()),
         style:  "fill:" + self.color
      });
      self.svg.append(dom);
      return dom;
   };

   this.Increment = function() {
      for (var transform of self.transforms){
         transform.Increment(self);
      }
   };

   this.Position = function() {
      self.CalcPosition();
      self.dom.attr("points", self.EncodePoints(self.points));
   };

   this.CalcPosition = function() {
      self.InitPoints();
      for (var transform of self.transforms){
         transform.CalcPosition(self);
      }
      return self.points;
   };

   this.InitPoints = function() {
      for (let i=0; i<self.start.length; i++) {
         self.points[i].x = self.start[i].x;
         self.points[i].y = self.start[i].y;
      }                     
   };

   this.EncodePoints = function(points) {
      var pointStr = "";
      for (var point of points){
         pointStr += self._rnd(point.x) + "," + self._rnd(point.y) + " ";
      }
      return pointStr.trim();
   };

   this._rnd = function(n) {
      return Math.floor(n * 10) / 10;
   };

   this.Dump = function(pre) {
      console.log(`${pre} ${self.idx} : ${self.iter[0]} ${self.iter[1]}`);
   }

   self.Init(svg, points, transforms, color, iter);
}

//================================================================

var TransformIndex = 0; // for now....

function CircleTransform(radius, delta) {
   var self = this;

   this.Init = function(radius, delta) {
      self.tIndex = TransformIndex++;
      self.radius = radius;
      self.delta  = delta ;
   };

   this.CalcPosition = function(obj) {
      let r = obj.iter[self.tIndex] * 2 * Math.PI;
      for (let point of obj.points) {
         point.x += Math.cos(r) * this.radius;
         point.y += Math.sin(r) * this.radius;
      }
   };

   this.Increment = function(obj) {
      obj.iter[self.tIndex] += self.delta;
   };

   self.Init(radius, delta);
}


//================================================================

function WalkTransform(limit, delta, speed) {
   var self = this;

   this.Init = function(limit, delta, speed) {
      self.id     = `${Math.random() * 10000000 | 0}`;
      self.tIndex = TransformIndex++;
      self.limit  = limit;
      self.delta  = delta ;
      self.speed  = speed ;
   };

   this.CalcPosition = function(obj) {
      let ctx = self.Ctx(obj);

      for (let point of obj.points) {
         point.x += ctx.dx;
         point.y += ctx.dy;
      }
   };

   this.Increment = function(obj) {
      let ctx = self.Ctx(obj);

      ctx.dir = ctx.dir + (Math.random() * delta * 2) - delta;
      let r   = ctx.dir * 2 * Math.PI;
      ctx.dx += Math.cos(r) * this.speed;
      ctx.dy += Math.sin(r) * this.speed;
   };

   this.Ctx = function(obj) {
      let ctx = obj[self.id];
      if (ctx) return ctx;
      return obj[self.id] = {
         dir: obj.iter[self.tIndex],
         dx : 0,
         dy : 0
      };
   };

   self.Init(limit, delta, speed);
}
