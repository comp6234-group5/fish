//Shows the Balance of Payments between Imports and Exports (AKA trade deficit) and the value of the GBP against the USD, during 2008-2016.
var createBalanceGraph = function () {
    //Dual axis based on http://bl.ocks.org/d3noob/e34791a32a54e015f57d
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
            .attr("class", "balanceOfPay")
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
    		return Math.min(d.euBalance); }) - 4000]); //Some amount of padding. TODO take into acound the noneuBalance here?
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
            .attr("x", 150)
            .attr("dy", "0.71em")
            .attr("font-weight", "bold")
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
            .attr("dy", "0.71em")
            .attr("font-weight", "bold")
            .attr("fill", "red")
            .text("GBP per USD");

        //Mouseover text box
        var msgBox = svg.append("g")
            .attr("class", "msgBox")
            .style("display", "none");

        var txt = msgBox.append("text")
            .attr("y",  height*0.6)
            .attr("dy", ".35em");
        //These tspans are like this to be able to have multiline messages.
        var noOfLines = 10;
        for (var i = 0; i < noOfLines; i++){
            txt.append("tspan")     
            .attr("id", "mline"+i)
            .attr("x", 12)
            .attr("dy", "1.2em");
        }

        //Add highlight zones (unsightly code repetition ahead)
        var startDate = parseDate("01/06/2008"),
            endDate = parseDate("01/09/2009");
        var extraYMargin = 6;
        //Highlight 1
        var highlight1 = svg.append('rect')
                .attr("id", "highlight1")
                .attr('x', x(startDate))
                .attr('y', 0 + extraYMargin)
                .attr('width', x(endDate) - x(startDate))
                .attr('height', height )
                .attr("fill", mOutColor)
                .on("mouseover", function(){ mOverFunction(highlight1, text1);})
                .on("mouseout", function(){ mOutFunction(highlight1);});
        
        //Highlight 2
        startDate = parseDate("01/01/2014");
        endDate = parseDate("01/03/2016");
        var highlight2 = svg.append('rect')
                .attr('x', x(startDate))
                .attr('y', 0 + extraYMargin)
                .attr('width', x(endDate) - x(startDate))
                .attr('height', height)
                .attr("fill", mOutColor)
                .on("mouseover", function(){ mOverFunction(highlight2, text2);})
                .on("mouseout", function(){ mOutFunction(highlight2);});
        //Highlight 3
        startDate = parseDate("23/06/2016");
        endDate = parseDate("01/10/2016");
        var highlight3 = svg.append('rect')
                .attr('x', x(startDate))
                .attr('y', 0 + extraYMargin)
                .attr('width', x(endDate) - x(startDate))
                .attr('height', height)
                .attr("fill", mOutColor)
                .on("mouseover", function(){ mOverFunction(highlight3, text3);})
                .on("mouseout", function(){ mOutFunction(highlight3);});
        
        //Conclusion text
        //TODO text4

        function mOverFunction(highlightZone, textToDisplay){
            msgBox.style("display", null);
            setMsg(textToDisplay);
            highlightZone.attr("fill", mOverColor);
            //highlight1.transition().attr("height", height*0.6 - extraYMargin);
        };
        function mOutFunction(highlightZone){
            msgBox.style("display", "none"); 
            highlightZone.attr("fill", mOutColor)
            //highlight1.transition().duration(1000).attr("height", height - extraYMargin)
        };

        function setMsg(stringArray){
            var txt = msgBox.select("text");
            for (var i = 0; i < noOfLines; i++) {
                if (i < stringArray.length){
                    d3.select("#mline"+i).text(stringArray[i]);
                } else {
                    d3.select("#mline"+i).text("");
                }
            }
        }

    });

    //Colors and opacity gradient for highlight zones
    var highlightColorBase = "#B7B7B7",
        mOutColor = "url(#gradient1)",
        mOverColor = "url(#gradient2)";

    var defs = svg.append("defs");
    var gradient = defs.append("linearGradient")
       .attr("id", "gradient1")
       .attr("x1", "0%")
       .attr("y1", "0%")
       .attr("x2", "0%")
       .attr("y2", "100%");
    gradient.append("stop")
       .attr("offset", "0%")
       .attr("stop-color", "#E5E5E5")
       .attr("stop-opacity", 0.25*0.2353);
    gradient.append("stop")
       .attr("offset", "70%")
       .attr("stop-color", "#E5E5E5")
       .attr("stop-opacity", 0);
    gradient.append("stop")
       .attr("offset", "100%")
       .attr("stop-color", highlightColorBase)
       .attr("stop-opacity", 0.2353);

    var gradient = defs.append("linearGradient")
       .attr("id", "gradient2")
       .attr("x1", "0%")
       .attr("y1", "0%")
       .attr("x2", "0%")
       .attr("y2", "100%");
    gradient.append("stop")
       .attr("offset", "0%")
       .attr("stop-color", highlightColorBase)
       .attr("stop-opacity", 0.2353*0.5);
    gradient.append("stop")
       .attr("offset", "50%")
       .attr("stop-color", "#FFFFFF")
       .attr("stop-opacity", 0);
    gradient.append("stop")
       .attr("offset", "100%")
       .attr("stop-color", highlightColorBase)
       .attr("stop-opacity", 0.2353*0.5);
    
    //Accompanying Text
    var title = "Balance of Payments in Goods, the EU and the pound (think of a better title?)"
    var text1 = ["Global financial crisis of 2008", 
        "Despite the value of the pound falling, trade balance improved within EU trade.",
        "This, unlike in 2016, happened due to the global nature of the event."];
    var text2 = ["From 2014 onwards",
        "The changes in the value of the pound are followed (with some delay)",
        "by matching fluctuations in the EU imbalance, showcasing their close relationship.",
        "Meanwhile, the non-EU balance fluctuates independently of the sterling."];
    var text3 = ["Referendum 2016 and beyond",
        "As the value of the sterling fell, the imbalance of payments widened.",
        "Most notably, however, it was the non-EU imbalance that worsened dramatically.",
        "Why is that? Since importing is more costly to do outside the EU Single Market a fall in the",
        "pound affects these imports harder. Their cost increases more dramatically and although ",
        "exporting becomes more profitable both inside and outside the single market, the UK’s goods",
        "exporting is far overshadowed by its goods importing. Tade deficit is increasing, but mostly due to non-EU imports."];
    var text4 = ["Now consider how much greater the deficit would be if all imports were non-EU imports, ",
        "as they would be if the UK loses access to the Single Market."];
};