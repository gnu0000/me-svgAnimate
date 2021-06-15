//
// svg animation example
// This is an experiment using no plugins or libraries
//
// todo: break up classes to files, remove global index counters

$(function() {
   new PageHandler("#svg1");
});

   
// Give some initial saved states to play with
//
var INITIAL_STATES = [
   [{r:300,s:-500,c:5 },{r:120,s:200,c:6 },{r:48, s:-100,c:12}],
   [{r:300,s:-500,c:46},{r:120,s:200,c:5 },{r:48, s:-100,c:11}],
   [{r:199,s:-500,c:14},{r:108,s:200,c:15},{r:107,s:-100,c:12}],
   [{r:199,s:-500,c:14},{r:108,s:200,c:7 },{r:33, s:-100,c:12}],
   [{r:406,s:-252,c:22},{r:52,s:200 ,c:17},{r:0,  s:-23, c:1 }],
   [{r:406,s:-252,c:22},{r:327,s:200,c:17},{r:0,  s:-31, c:1 }],
   [{r:357,s:-252,c:35},{r:327,s:200,c:65},{r:0,  s:-31, c:1 }],
   [{r:357,s:-252,c:52},{r:327,s:200,c:65},{r:0,  s:-256,c:1 }],
   [{r:278,s:-252,c:52},{r:242,s:200,c:65},{r:0,  s:-256,c:1 }],
   [{r:52 ,s:-252,c:6 },{r:62,s:200 ,c:65},{r:0,  s:-256,c:1 }],
   [{r:52 ,s:-252,c:6 },{r:62,s:200 ,c:14},{r:0,  s:-256,c:3 }]
];


function PageHandler(selector) {
   var self = this;

   this.Init = function(selector) {
      self.InitAttributes(selector);
      self.InitEvents();
      self.InitState();
   };

   this.InitAttributes = function(selector) {
      self.svg      = $(selector);
      self.timer    = null;
      self.offset   = {x:500, y:500}; 
      self.interval = 25;
      self.states   = [];
      self.storeId  = "states0";
      self.vals = [
         {r:300, s:-500, c:5},
         {r:120, s:200 , c:6},
         {r: 48, s:-100, c:12}
      ];
   };

   this.InitEvents = function() {
      $(".animate").click(self.Animate);
      $(".step"   ).click(self.Step);
      $(".save"   ).click(self.SaveState);
      $("input[type='range']").on("change", self.SliderChange);
      $(".state-buttons").on("click contextmenu", "button", self.RestoreState);
   };

   this.InitState = function() {
      //self.CreateAxes();
      self.InitSliders();
      self.CreateObjects();
      self.LoadStates();
   };

   this.InitSliders = function() {
      $("input[type='range']").each(function() {
         let match = $(this).data("e").match(/(\d)(.)/);
         let val = self.vals[match[1]][match[2]];
         $(this).val(val).closest(".slider").find("p span").text(`[${val}]`);
      });
   }

   this.CreateAxes = function() {
      let ns   = 'http://www.w3.org/2000/svg';
      self.svg.append($(document.createElementNS(ns,'polygon')).attr({points: "0,499 1000,499 1000,501 0,501"}));
      self.svg.append($(document.createElementNS(ns,'polygon')).attr({points: "499,0 501,0 501,1000 499,1000"}));
   }

   this.CreateObjects = function() {
      self.objects = [];
      self.svg.empty();
      PolygonIndex = 0; // for now....
      TransformIndex = 0; // for now....

      let v = self.vals;
      let transforms = [
         new CircleTransform2(v[0].r, 1/v[0].s),
         new CircleTransform2(v[1].r, 1/v[1].s),
         new CircleTransform2(v[2].r, 1/v[2].s)

      ];
      for (let t1=0; t1<1; t1+=1/v[0].c) {
         for (let t2=0; t2<1; t2+=1/v[1].c) {
            for (let t3=0; t3<1; t3+=1/v[2].c) {
               let opts = {
                  vertices:   "5,0 10,15 5,10 0,15",
                  anchor:     "5,7.5",
                  offset:     "500,500",
                  scale:      1.25,
                  transforms: transforms, 
                  color:      "#468bc9",
                  start:      [t1, t2, t3]
               };
               self.objects.push(new Polygon(self.svg, opts));
            }   
         }   
      }   
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

   this.SliderChange = function(ev) {
      let val   = +$(this).val();
      let match = $(this).data("e").match(/(\d)(.)/);
      let row   = match[1];
      let attr  = match[2];
      self.vals[row][attr] = val;
      self.InitSliders();
      self.CreateObjects();
   };

   this.SaveState = function() {
      self.states.push(JSON.parse(JSON.stringify(self.vals)));
      localStorage.setItem(self.storeId, JSON.stringify(self.states));
      self.GenStateButtons();
   };

   this.LoadStates = function() {
      self.states = JSON.parse(localStorage.getItem(self.storeId));
      if (!self.states || !self.states.length) self.states = INITIAL_STATES;
      self.GenStateButtons();
   };

   this.RestoreState = function(ev) {
      ev.preventDefault();
      let idx = +$(this).data("i");
      if (ev.which == 3) return self.DeleteState(idx);
      self.vals = JSON.parse(JSON.stringify(self.states[idx]))
      self.InitSliders();
      self.CreateObjects();
   };

   this.DeleteState = function(idx) {
      self.states.splice(idx,1);
      localStorage.setItem(self.storeId, JSON.stringify(self.states));
      self.GenStateButtons();
   };

   this.GenStateButtons = function() {
      let div = $(".state-buttons").empty();
      let i=0;
      for (let state of this.states) {
         div.append($("<button>").text(i).attr("data-i", i++));
      }
   };

   self.Init(selector);
}



//================================================================

var PolygonIndex = 0; // for now....

function Polygon(svg, opts) {
   var self = this;

   this.Init = function(svg, opts) {
      self.idx      = PolygonIndex++;
      self.svg      = svg;
      Object.assign(self, opts); // points, offset, transforms, color, start

      self.vertices = self.ParsePoints(self.vertices);
      self.center   = self.ParsePoint(self.anchor);
      self.offset   = self.ParsePoint(self.offset);
      self.CenterAnchor(); // adjust points so anchor is 0,0
      self.ScalePoints(self.vertices, self.scale);
      self.PrepMetrics();
      self.points   = self.vertices.map(v => ({x:v.x, y:v.y}));
      self.points   = self.CalcPosition();
      self.dom      = self.CreateDom();
   };

   this.PrepMetrics = function() {
      for (let p of self.vertices) {
         p.d   = Math.sqrt(Math.pow(p.x, 2) + Math.pow(p.y, 2));
         let a = Math.asin(p.y / p.d);
         p.a = (p.x>=0 && p.y>=0) ? a               :
               (p.x< 0 && p.y>=0) ? Math.PI - a     :
               (p.x>=0 && p.y< 0) ? Math.PI * 2 + a :
                                    Math.PI - a     ;
      }
   };

   this.CreateDom = function() {
      let ns  = "http://www.w3.org/2000/svg";
      let dom = $(document.createElementNS(ns,'polygon')).attr({
         points: self.EncodePoints(self.points),
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
      self.loc = {x:0, y:0, a:0};
      //self.transforms.map((t)=>t.CalcPosition(self));
      for (var transform of self.transforms){
         transform.CalcPosition(self);
      }
      this.ApplyPosition(self.loc)
      return self.points;
   };

   this.ApplyPosition = function(loc) {
      for (let i=0; i<self.vertices.length; i++) {
         let v = self.vertices[i];
         self.points[i].x = Math.cos(v.a + loc.a) * v.d + self.offset.x + loc.x;
         self.points[i].y = Math.sin(v.a + loc.a) * v.d + self.offset.y + loc.y;   
      }
   };

   this.EncodePoints = function(points) {
      var pointStr = "";
      for (var p of points){
         pointStr += self.Round(p.x) + "," + self.Round(p.y) + " ";
      }
      return pointStr.trim();
   };

   this.ParsePoints = function(str) {
      return str.split(" ").map(pStr => self.ParsePoint(pStr))

   };

   this.ParsePoint = function(str) {
      let m = str.match(/^([\d.]+),([\d.]+)$/);
      return {x:m[1]-0, y:m[2]-0};
   };

   this.CenterAnchor = function() {
      self.OffsetPoints(self.vertices, {x:-self.center.x,y:-self.center.y});
   };

   this.OffsetPoints = function(points, offset) {
      for (let p of points){
         p.x += offset.x;
         p.y += offset.y;
      }
   };

   this.ScalePoints = function(points, scale) {
      for (let p of points) {
         p.x *= scale;
         p.y *= scale;
      }
      return points;
   };

   this.Round = function(n) {
      return (n * 10 | 0) / 10;
   };

   this.DumpPoints = function(message, points) {
      console.log(`${message}: ` + points.map(p => `[${self.Round(p.x)},${self.Round(p.y)}]`).join(" "), points);
   };

   self.Init(svg, opts);
}



//================================================================

var TransformIndex = 0; // for now....

function CircleTransform2(radius, delta) {
   var self = this;

   this.Init = function(radius, delta) {
      self.id     = `${Math.random() * 10000000 | 0}`;
      self.tIndex = TransformIndex++;
      self.radius = radius;
      self.delta  = delta ;
   };

   this.CalcPosition = function(obj) {
      let a = obj.start[self.tIndex] * 2 * Math.PI;
      obj.loc.x += Math.cos(a) * self.radius;
      obj.loc.y += Math.sin(a) * self.radius;
      obj.loc.a = a; //obj.loc.a += a;
   };

   this.Increment = function(obj) {
      obj.start[self.tIndex] += self.delta;
   };

   self.Init(radius, delta);
}

