var createImportExportGraphs = function () {
    //Reference https://bl.ocks.org/RandomEtc/cff3610e7dd47bef2d01
    //Here are specified 2 graphs, G1 and G2.
    var svg1 = d3.select("svg.importExport1"),
        svg2 = d3.select("svg.importExport2"),
        margin = {top: 20, right: 10, bottom: 30, left: 100},
        width = svg1.attr("width") - 160 - margin.left - margin.right,
        height = svg1.attr("height") - margin.top - margin.bottom,
        g1 = svg1.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //Radio Button Listener
    d3.selectAll('input[name="industry"]').on("click", onRBClick);

    //Scales G2
    /*var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
        .range([height, 0]);*/

    var mData;
    var xG1, yG1;

    //Data loading
    d3.csv("data/DeficitAcrossIndustry.csv", function(error, data) {

        data.forEach(function(d) {
            d.industry = d.Industry;
            d.percntDff = +d.Percentage_Diff;   //E.g.: Imports were larger than eports by 5.32%
            d.imp = +d.Imports;
            d.exp = +d.Exports;
        });

        mData = data;

        setUpG1();
        drawG1("Goods and Services", 0);
        //drawG1("Food, Brevages and Tobacco", 800);
        //drawG1("Fish", 1000);
        //drawG2(data);
    });

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
        /*.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .style("text-anchor", "end")
          .text("Value in Millions of £");*///Doesn't work dont know why
        g1.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", -60)
          .attr("x", -160)
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
    function drawG1(selectedIndustry, animationTime){
        //Prepare data
        var selectedData; 
        for (var i = 0; i < mData.length; i++){
            if (mData[i].industry === selectedIndustry){
                selectedData = mData[i];
                break;
            }
        };
        if (!selectedData){
            console.log("Selected data was: "+selectedData);
            return; 
        }

        //Refresh the axes, making them change if necessary.
        xG1.domain(["Imports", "Exports"]).padding(0.3);
        var yMax = Math.max(selectedData.imp, selectedData.exp);
        yG1.domain([0, yMax*1.1]);//Aesthetic, want import bar to remain static when data changes.
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

    function onRBClick(){
        //This will redraw the G1 bar chart depending on the selected industry.
        var selection = d3.select('input[name = "industry"]:checked').node().value;
        drawG1(selection, 800);
    }
};
