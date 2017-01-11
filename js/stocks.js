var createStocksGraph = function () {
  var parseTime = d3.timeParse("%Y-%m-%d");
  var svg = d3.select("svg#stocks"),
      margin = {top: 20, right: 80, bottom: 30, left: 80},
      width = svg.attr("width") - margin.left - margin.right,
      height = svg.attr("height") - margin.top - margin.bottom,
      g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x = d3.scaleTime().range([0, width]),
      y0 = d3.scaleLinear().range([height, 0]),
      y1 = d3.scaleLinear().range([height, 0]),
      z = d3.scaleOrdinal(d3.schemeCategory10);

  var lineVolume = d3.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y0(d.volume); });

  var lineStockPrice = d3.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y1(d.stockPrice); });

  d3.csv("./data/stocks/scottish_salmon_company_prices.csv", row, function(error, data) {
    if (error) throw error;

    var volume = {id: "Volume", values: []};
    var stock_prices = {id: "Price", values: []};
    data.forEach(function (d) {
      var _date = parseTime(d.Date);
      volume.values.push({
        date: _date,
        volume: +d.Volume
      });

      stock_prices.values.push({
        date: _date,
        stockPrice: +d.Close
      });
    });

    x.domain(d3.extent(data, function(d) { return d.date; }));

    y0.domain([
      d3.min([volume], function(c) { return d3.min(c.values, function(d) { return d.volume; }); }),
      d3.max([volume], function(c) { return d3.max(c.values, function(d) { return d.volume; }); })
    ]);

    y1.domain([
      d3.min([stock_prices], function(c) { return d3.min(c.values, function(d) { return d.stockPrice; }); }),
      d3.max([stock_prices], function(c) { return d3.max(c.values, function(d) { return d.stockPrice; }); })
    ]);

    z.domain(data.map(function(c) { return c.id; }));

    // set up axes
    var yAxisLeft = d3.axisLeft(y0),
        yAxisRight = d3.axisRight(y1);

    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // draw axes
    g.append("g")
      .attr("class", "axis axis--y")
      .call(yAxisLeft)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("fill", "#000")
      .text("Volume Traded");

    g.append("g")
      .attr("class", "axis axis--y")
      .attr("transform", "translate(" + width + ", 0)")
      .call(yAxisRight)
      .append("text")
      .attr("transform", "rotate(90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("fill", "#000")
      .text("Stock Price (£)");

    // line for volume traded
    var vol_line = g.selectAll(".vol")
      .data([volume])
      .enter().append("g")
      .attr("class", "vol");

    vol_line.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return lineVolume(d.values); })
      .style("stroke", function(d) { return z(d.id); });

    vol_line.append("text")
      .datum(function(d) {
        return {id: d.id, value: d.values[0]};
      })
      .attr("transform", function(d) {
        return "translate(" + (x(d.value.date) - 80) + "," + y0(d.value.volume) + ")";
      })
      .attr("x", 3)
      .attr("dy", "0.35em")
      .style("font", "10px sans-serif")
      .text(function(d) { return d.id; });

    // line for price data
    var prc_line = g.selectAll(".prc")
      .data([stock_prices])
      .enter().append("g")
      .attr("class", "prc");

    prc_line.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return lineStockPrice(d.values); })
      .style("stroke", function(d) { return z(d.id); });

    prc_line.append("text")
      .datum(function(d) {
        return {id: d.id, value: d.values[0]};
      })
      .attr("transform", function(d) {
        return "translate(" + (x(d.value.date) - 80) + "," + y1(d.value.stockPrice) + ")";
      })
      .attr("x", 3)
      .attr("dy", "0.35em")
      .style("font", "10px sans-serif")
      .text(function(d) { return d.id; });

    // line for referendum date
    var refDate = parseTime("2016-06-23");
    svg.append("line")
      .attr("x1", x(refDate) + margin.left)
      .attr("x2", x(refDate) + margin.left)
      .attr("y1", margin.top)
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
