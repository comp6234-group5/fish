var createImportExportGraphs = function () {
    //Reference https://bl.ocks.org/RandomEtc/cff3610e7dd47bef2d01
    //Here are specified 2 graphs, G1 and G2.
    var svg1 = d3.select("svg.importExport1"),
        svg2 = d3.select("svg.importExport2"),
        margin = {top: 20, right: 80, bottom: 30, left: 50},
        width = svg1.attr("width") - 160 - margin.left - margin.right,
        height = svg1.attr("height") - margin.top - margin.bottom,
        g1 = svg1.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //Scales G2
    /*var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
        .range([height, 0]);*/

    //Data loading
    d3.csv("data/DeficitAcrossIndustry.csv", function(error, data) {

        data.forEach(function(d) {
            d.industry = d.Industry;
            d.percntDff = +d.Percentage_Diff;   //E.g.: Imports were larger than eports by 5.32%
            d.imp = +d.Imports;
            d.exp = +d.Exports;
        });

        setUpG1();
        drawG1(data, "Goods and Services", 0);
        drawG1(data, "Goods", 800);
        //drawG1(data, "Food, Brevages and Tobacco", 800);
        //drawG1(data, "Fish", 1000);
        //drawG2(data);
    });

    var xG1, yG1;

    function setUpG1(){
        //Scales
        xG1 = d3.scaleBand().rangeRound([0, width], .1)
                .paddingInner(0.1);
        yG1 = d3.scaleLinear()
                .range([height, 0]);

        //Add axes
        g1.append("g")
          .attr("class", "g1Axis x")
          .attr("transform", "translate(0," + height + ")");
        //
        g1.append("g")
          .attr("class", "g1Axis y")
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Value in Millions of £");

        //Add Bars, will be filled with data on draw.
        g1.append("rect")
          .attr("class", "ImportBar")
          .attr("fill", "red")
          .attr("width", xG1.bandwidth())
          .attr("x", function() { return xG1("Imports"); })
          .attr("height", function() { return height; });

        g1.append("rect")
          .attr("class", "ExportBar")
          .attr("fill", "green")
          .attr("width", xG1.bandwidth())
          .attr("x", function() { return xG1("Imports"); })
          .attr("height", function() { return height; });
    }

    //Takes in the selected industry as a string. Must be the same string as in the csv file.
    function drawG1(data, selectedIndustry, animationTime){
        //Prepare data
        var selectedData; 
        for (var i = 0; i < data.length; i++){
            if (data[i].industry === selectedIndustry){
                selectedData = data[i];
                break;
            }
        };
        if (!selectedData){
            console.log("Prepared data was: "+selectedData);
            return; 
        }

        //Refresh the axes, making them change if necessary.
        xG1.domain(["Imports", "Exports"]);
        yG1.domain([0, Math.max(selectedData.imp, selectedData.exp)]);
        //Axes
        var xAxis = d3.axisBottom().scale(xG1);
        var yAxis = d3.axisLeft().scale(yG1);
        g1.select(".g1Axis.x").transition().duration(animationTime).call(xAxis);
        g1.select(".g1Axis.y").transition().duration(animationTime).call(yAxis);

        //Get data into IMPORT Bar
        g1.select(".ImportBar")
        .transition()
        .duration(animationTime)
          .attr("x", function() { return xG1("Imports"); })
          .attr("width", xG1.bandwidth())
          .attr("y", function() { return yG1(selectedData.imp); })
          .attr("height", function() { return height - yG1(selectedData.imp); });
        //Get data into EXPORT Bar
        g1.select(".ExportBar")
        .transition()
        .duration(animationTime)
          .attr("x", function() { return xG1("Exports"); })
          .attr("width", xG1.bandwidth())
          .attr("y", function() { return yG1(selectedData.exp); })
          .attr("height", function() { return height - yG1(selectedData.exp); });
    }
};