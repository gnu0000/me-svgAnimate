$(function() {
   new PageHandler("#obj1");
});

function PageHandler(selector) {
   var self = this;

   this.Init = function(selector) {
      self.obj = $(selector);
      self.iter = 0;
      self.delta = 1.0/100.0;
      self.center = {x:150,y:100};
      self.scale = 100;
      self.interval = 20;
      self.points = self.DecodePoints(self.obj.attr("points"));
      self.timer = null;

      $(".test").click(self.Test);
   };

   this.DecodePoints = function(pointStr) {
      console.log("pointStr: " + pointStr);
      var points = [];
      $.each(pointStr.split(" "), function(){
         console.log("a points str = " + this);
         let m = this.match(/^(\d+),(\d+)$/);
         points.push({x:m[1]-0, y:m[2]-0});
      });
      console.log("points: ", points);
      return points;
   };

   this.EncodePoints = function(points) {
      var pointStr = "";
      $.each(points, function(){
         pointStr += this.x + "," + this.y + " ";
      });
      //console.log("new pointStr: " + pointStr);
      return pointStr.trim();
   };

   this.Test = function() {
      if (self.timer){
         clearInterval(self.timer);
         self.timer = null;
      } else {
         self.timer = setInterval(self.Step, self.interval);
      }
   };

   this.Step = function() {
      self.points[2] = self.CirclePos(self.center, self.scale, self.iter);
      self.iter += self.delta;
      self.obj.attr("points", self.EncodePoints(self.points));
   };

   this.CirclePos = function(center, scale, i){
      let r = i * 2 * Math.PI;
      let x = center.x + Math.cos(r) * scale;
      let y = center.x + Math.sin(r) * scale;
       return {x:x, y:y};
   };

   self.Init(selector);
}