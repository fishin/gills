var elapsedTimeTestsGraph = function (jobId, runId, element) {

    d3.json('http://localhost:8081/api/job/'+ jobId + '/run/' + runId + '/stats', function(error, data) {

        var tests = data.tests;
        var margin = { top: 0, right: 0, bottom: 0, left: 0 };
        var width = 0;
        var height = 0;
        if (Object.keys(tests).length !== 0) {
            margin = { top: 40, right: 20, bottom: 70, left: 50 };
            width = 900 - margin.right - margin.left;
            height = 300 - margin.top - margin.bottom;
        }

        // Parse the date / time
        var parseDate = d3.time.format("%Y-%m").parse;

        var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);
        var y = d3.scale.linear().range([height, 0]);

        var xAxis = d3.svg
                      .axis()
                      .scale(x)
                      .orient("bottom");
//    .tickFormat(d3.time.format("%Y-%m"));

        var yAxis = d3.svg
                      .axis()
                      .scale(y)
                      .orient("left")
                      .ticks(10);

        var svg = d3.select(element)
                    .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
//                    .style("border", '1px solid')
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        x.domain(tests.map(function(d) { return d.num; }));
        y.domain([0, d3.max(tests, function(d) { return (d.duration / 1000); })]);

        svg.append("g")
           .attr("class", "x axis")
           .attr("transform", "translate(0," + height + ")")
           .call(xAxis)
           .selectAll("text")
           .style("text-anchor", "end")
           // x offset
           .attr("dx", "-.55em")
           // y offset from right side
           .attr("dy", "-.55em")
           .attr("transform", "rotate(-90)" );

        svg.append("g")
           .attr("class", "y axis")
           .call(yAxis)
           .append("text")
           .attr("transform", "rotate(-90)")
           .attr("y", 6)
//           .attr("dy", ".71em")
           .attr("dy", "-4em")
           .style("text-anchor", "end")
           .text("elapsedTime (s)");

        svg.append("g")
           .append("text")
           .attr("x", (width / 2))             
           .attr("y", 0 - (margin.top / 2))
           .attr("text-anchor", "middle")  
           .style("font-size", "8") 
//       .style("text-decoration", "underline")  
          .text("Elapsed Time (s) / Test");

        svg.selectAll("bar")
           .data(tests)
           .enter()
           .append("rect")
           .style("fill", function(d) {

               if (d.status === 'failed') {
                   // red
                   return "#d9534f";
               } else {
                   // green
                   return "#5cb85c";
               }
           })
           .attr("x", function(d) { return x(d.num); })
           .attr("width", x.rangeBand())
           .attr("y", function(d) { return y(d.duration / 1000); })
           .attr("height", function(d) { return height - y(d.duration / 1000); });
    });
};
