var createVesselGraph = function () {
    var svg = d3.select("svg.vessels"),
        margin = {top: 20, right: 80, bottom: 30, left: 50},
        width = svg.attr("width") - 160 - margin.left - margin.right,
        height = svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var parseTime = d3.timeParse("%d%m%Y");

    var x = d3.scaleTime().range([0, width]),
        y = d3.scaleLinear().range([height, 0]),
        z = d3.scaleOrdinal(d3.schemeCategory10);

    var line = d3.line()
        .curve(d3.curveBasis)
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.tonnes); });

d3.csv("./data/vessels.csv", type, function (error, data) {
        if (error) throw error;

        var landings = data.columns.slice(1).map(function(id) {
            return {
                id: id,
                values: data.map(function(d) {
                    return {date: d.date, tonnes: d[id]};
                })
            };
        });

        x.domain(d3.extent(data, function(d) { return d.date; }));

        y.domain([
            d3.min(landings, function(c) { return d3.min(c.values, function(d) { return d.tonnes; }); }),
            d3.max(landings, function(c) { return d3.max(c.values, function(d) { return d.tonnes; }); })
        ]);

        z.domain(landings.map(function(c) { return c.id; }));

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
            .text("Quantity (tonnes)");

        var landing = svg.selectAll(".landing")
            .data(landings)
            .enter()
            .append("g")
            .attr("class", "landing");
        
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
          .attr("y", margin.top)
          .style("font", "10px sans-serif")
          .text("EU Referendum Date 2016.06.23");  

      // mouseover funciton show value in time 

  var mouseG = svg.append("g")
    .attr("class", "mouse-over-effects");
    
  mouseG.append("svg:path")
    .attr("class", "mouse-line2")
    .style("stroke", "black")
    .style("stroke-width","1px")
    .style("opacity", "0");

        var lines = document.getElementsByClassName('line');

        var mousePerLine = mouseG.selectAll('.mouse-per-line')
            .data(landings)
            .enter()
            .append("g")
            .attr("class", "mouse-per-line");    
        
        
        mousePerLine.append("circle")
            .attr("r",7)
            .style("stroke", function(d){
                return z(d.id);
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
                d3.select(".mouse-line2")
                    .style("opacity", "0");
                d3.selectAll(".mouse-per-line circle")
                    .style("opacity", "0");
                d3.selectAll(".mouse-per-line text")
                    .style("opacity", "0");
      })
      .on('mouseover', function() { // on mouse in show line, circles and text
        d3.select(".mouse-line2")
          .style("opacity", "1");
        d3.selectAll(".mouse-per-line circle")
          .style("opacity", "1");
        d3.selectAll(".mouse-per-line text")
          .style("opacity", "1");
      })
      .on('mousemove', function() { // mouse moving over canvas
        var mouse = d3.mouse(this);
        d3.select(".mouse-line2")
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
        
        

        
        
        
        landing.append("path")
            .attr("class", "line")
            .attr("d", function(d) { return line(d.values); })
            .style("stroke", function(d) { return z(d.id); });

        landing.append("text")
            .datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
            .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.tonnes) + ")"; })
            .attr("x", 3)
            .attr("dy", "0.35em")
            .style("font", "10px sans-serif")
            .text(function(d) { return d.id; });
      
    });

    function type(d, _, columns) {
        d.date = parseTime(d.date);
        for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];
        return d;
    }
};
