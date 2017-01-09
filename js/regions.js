var createRegionGraph = function () {
    var svg = d3.select("svg.regions"),
        margin = {top: 20, right: 80, bottom: 30, left: 50},
        width = svg.attr("width") - 160 - margin.left - margin.right,
        height = svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var parseTime = d3.timeParse("%Y%m%d");

var x = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory10);

// test 
    
//var svg = d3.select("svg.regions")
//    .attr("width", width + margin.left + margin.right)
//    .attr("height", height + margin.top + margin.bottom)
//    .append("g")
//    .attr("transform", "translate(" + margin.left + ","  +margin.top+")");
    


var line = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.tonnes); });



d3.csv("/data/fish_tonnes.csv", type, function(error, data) {
  if (error) throw error;

  var regions = data.columns.slice(1).map(function(name) {
    return {
      name: name,
      values: data.map(function(d) {
        return {date: d.date, tonnes: d[name]};
      })
    };
  });

  x.domain(d3.extent(data, function(d) { return d.date; }));

  y.domain([
    d3.min(regions, function(c) { return d3.min(c.values, function(d) { return d.tonnes; }); }),
    d3.max(regions, function(c) { return d3.max(c.values, function(d) { return d.tonnes; }); })
  ]);

  z.domain(regions.map(function(c) { return c.name; }));

  svg.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  svg.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y))
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("fill", "#000")
      .text("Quantity, tonnes");
    
  var region = svg.selectAll(".region")
    .data(regions)
    .enter()
    .append("g")
    .attr("class", "region");

    
    // eu referendum vertical time 
    var refDate = new Date(2016, 05, 23);  
    svg.append("line")
      .attr("x1", x(refDate))
      .attr("y1", 20)
      .attr("x2", x(refDate))
      .attr("y2", height)
      .style("stroke-width", 2)
      .style("stroke", "black")
      .style("fill", "none")
    
   g.append("text")
      .attr("x", x(refDate) - margin.left - 200)
      .attr("y", 100)
      .style("font", "10px sans-serif")
      .text("EU Referendum Date 2016.06.23"); 
    
    
  // mouseover funciton show value in time 
  var mouseG = svg.append("g")
    .attr("class", "mouse-over-effects");
    
  mouseG.append("path")
    .attr("class", "mouse-line")
    .style("stroke", "black")
    .style("stroke-width","1px")
    .style("opacity", "0");

  var lines = document.getElementsByClassName('line');

  var mousePerLine = mouseG.selectAll('.mouse-per-line')
    .data(regions)
    .enter()
    .append("g")
    .attr("class", "mouse-per-line");
    
  mousePerLine.append("circle")
    .attr("r",7)
    .style("stroke", function(d){
      return z(d.name);
  })
    .style("fill","none")
    .style("stroke-width","1px")
    .style("opacity", "0");
  
  mousePerLine.append("text")
    .attr("transform", "translate(10,3)");
    

  
    mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
      .attr('width', width) // can't catch mouse events on a g element
      .attr('height', height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseout', function() { // on mouse out hide line, circles and text
        d3.select(".mouse-line")
          .style("opacity", "0");
        d3.selectAll(".mouse-per-line circle")
          .style("opacity", "0");
        d3.selectAll(".mouse-per-line text")
          .style("opacity", "0");
      })
      .on('mouseover', function() { // on mouse in show line, circles and text
        d3.select(".mouse-line")
          .style("opacity", "1");
        d3.selectAll(".mouse-per-line circle")
          .style("opacity", "1");
        d3.selectAll(".mouse-per-line text")
          .style("opacity", "1");
      })
      .on('mousemove', function() { // mouse moving over canvas
        var mouse = d3.mouse(this);
        d3.select(".mouse-line")
          .attr("d", function() {
            var d = "M" + mouse[0] + "," + height;
            d += " " + mouse[0] + "," + 0;
            return d;
          });

        d3.selectAll(".mouse-per-line")
          .attr("transform", function(d, i) {
            //console.log(width/mouse[0])
            var xDate = x.invert(mouse[0]),
                bisect = d3.bisector(function(d) { return d.date; }).right;
                idx = bisect(d.values, xDate);
            
            var beginning = 0,
                end = lines[i].getTotalLength(),
                target = null;

            while (true){
              target = Math.floor((beginning + end) / 2);
              pos = lines[i].getPointAtLength(target);
              if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                  break;
              }
              if (pos.x > mouse[0])      end = target;
              else if (pos.x < mouse[0]) beginning = target;
              else break; //position found
            }
            
            d3.select(this).select('text')
              .text(y.invert(pos.y).toFixed(2));
              
            return "translate(" + mouse[0] + "," + pos.y +")";
          });
      });
    
    

var legendRectSize = 9;
var legendSpacing = 2;
    
  var legend = svg.selectAll('.legend')
  .data(z.domain())
  .enter()
  .append('g')
  .attr('class', 'legend')
  .attr('transform', "translate(-140,10)")
  
  legend.append('rect')
  .attr('x',width-90)
  .attr('y',function(d,i){
      return i * 20;
  })
  .attr('width', 10)
  .attr('height', 10)
  .style('fill', z)
  .style('stroke', z);
  
  legend.append('text')
  .attr('x', width - 70)
  .attr('y', function(d, i){
      return (i * 20) + 9;
  })
  .text(function(d){return d;})
  .style("fontsize","5px");
    
    
  
  region.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return z(d.name); });

  region.append("text")
      .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
      .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.tonnes) + ")"; })
      .attr("x", 3)
      .attr("dy", "0.35em")
      .style("font", "10px sans-serif");
      //.text(function(d) { return d.name; });
});



    
    
    
    
    

    
    
    
    
    
    
    
    
function type(d, _, columns) {
  d.date = parseTime(d.date);
  for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];
  return d;
}


  
};
