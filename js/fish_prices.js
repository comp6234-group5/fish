var createPricesGraph = function () {
  var parseTime = d3.timeParse("%d/%m/%y");
  var svg = d3.select("svg#prices"),
      margin = {top: 20, right: 80, bottom: 30, left: 50},
      width = svg.attr("width") - margin.left - margin.right,
      height = svg.attr("height") - margin.top - margin.bottom,
      g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x = d3.scaleTime().range([0, width]),
      y = d3.scaleLinear().range([height, 0]),
      z = d3.scaleOrdinal(d3.schemeCategory10);

  var line = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.price); });

  d3.csv("./data/fish_prices/grimsby_2016.csv", row, function(error, data) {
    if (error) throw error;

    var fish_prices = data.columns.slice(1).map(function(id) {
      return {
        id: id,
        values: data.map(function(d) {
          return {date: d.date, price: d[id]};
        })
      };
    });

    x.domain(d3.extent(data, function(d) { return d.date; }));

    y.domain([
      d3.min(fish_prices, function(c) { return d3.min(c.values, function(d) { return d.price; }); }),
      d3.max(fish_prices, function(c) { return d3.max(c.values, function(d) { return d.price; }); })
    ]);

    z.domain(fish_prices.map(function(c) { return c.id; }));

    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("fill", "#000")
      .text("Price (£/kg)");

    var price = g.selectAll(".price")
      .data(fish_prices)
      .enter().append("g")
      .attr("class", "price");

    price.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return z(d.id); });

    price.append("text")
      .datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
      .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.price) + ")"; })
      .attr("x", 3)
      .attr("dy", "0.35em")
      .style("font", "10px sans-serif")
      .text(function(d) { return d.id; });

    // line for referendum date
    var refDate = new Date(2016, 05, 23);  // june 23rd
    svg.append("line")
      .attr("x1", x(refDate) + margin.left)
      .attr("y1", margin.top)
      .attr("x2", x(refDate) + margin.left)
      .attr("y2", height + margin.top)
      .style("stroke-width", 2)
      .style("stroke", "black")
      .style("fill", "none")

    g.append("text")
      .attr("x", x(refDate) + 20)
      .attr("y", margin.top)
      .style("font", "10px sans-serif")
      .text("EU Referendum Date 2016.06.23");
  });

  function row(d, _, columns) {
    d.date = parseTime(d["Date"]);
    for (var i = 1, n = columns.length, c; i < n; ++i) {
      d[c = columns[i]] = +d[c];
    }
    return d;
  }
};
