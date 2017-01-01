//Shows the Balance of Payments between Imports and Exports (AKA trade deficit) and the value of the GBP against the USD, during 2008-2016.
var createBalanceGraph = function () {
    //Based on http://bl.ocks.org/d3noob/e34791a32a54e015f57d
    var margin = {top: 30, right: 40, bottom: 30, left: 50},
        width = 900 - margin.left - margin.right,
        height = 470 - margin.top - margin.bottom;

    var parseDate = d3.timeParse("%d/%m/%Y");

    var x = d3.scaleTime().range([0, width]);
    //var y0 = d3.scaleLinear().range([height, 0]);     //Consider reversing or not the left axis, at it has only negative values.
    var y0 = d3.scaleLinear().range([0, height]);
    var y1 = d3.scaleLinear().range([height, 0]);

    var xAxis = d3.axisBottom(x);
    var yAxisLeft = d3.axisLeft(y0);
    var yAxisRight = d3.axisRight(y1);

    var lineEUBalance = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y0(d.euBalance); });
        
    var lineNoEUBalance = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y0(d.noeuBalance); });

    var lineGBP = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y1(d.GBPperUSD); });
      
    var svg = d3.select("body")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", 
                  "translate(" + margin.left + "," + margin.top + ")");

    // Get the data
    d3.csv("data/BalanceOfPayment_Goods_and_GBP_Value.csv", function(error, data) {

        data.forEach(function(d) {
            d.date = parseDate(d.date);
            d.euBalance = +d.EU_Balance;
            d.noeuBalance = +d.NonEU_Balance;
            d.gbp = +d.GBPperUSD;
        });

        // Scale the range of the data
        x.domain(d3.extent(data, function(d) { return d.date; }));
        y0.domain([0, d3.min(data, function(d) {
    		return Math.min(d.euBalance); }) - 2000]); //Some amount of padding. TODO take into acound the noneuBalance here
        y1.domain([0.8, 2.2]);

        svg.append("path")        // Add the lineEUBalance line.
            .style("stroke", "blue")
            .attr("d", lineEUBalance(data));

        svg.append("path")        // Add the lineNoEUBalance line.
            .style("stroke", "orange")
            .style("fill", "none")
            .attr("d", lineNoEUBalance(data));

        svg.append("path")        // Add the lineGBP line.
            .style("stroke", "red")
            .attr("d", lineGBP(data));

        //--Axis adding
        svg.append("g")            
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
        
        //Add Left axis, Millions of GBP
        svg.append("g")             
            .call(yAxisLeft)
            .append("text")
            .attr("y", 10)
            .attr("x", 140)
            .attr("dy", "0.71em")
            .attr("fill", "#000")
            .text("Balance of Trade (Millions of £)");

        //Add Right axis, number of GBP per USD
        svg.append("g")
            .attr("transform", "translate(" + width + " ,0)")	
            .style("fill", "red")
            .call(yAxisRight)
            .append("text")
            .attr("y", 10)
            .attr("x", -65)
            .attr("font-weight", "bold")
            //.attr("dy", "0.71em")
            .attr("fill", "red")
            .text("GBP per USD");

    });
};