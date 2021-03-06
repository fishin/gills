var elapsedTimeTestsGraph = function (jobId, runId, element) {

    d3.json('http://localhost:8081/api/job/'+ jobId + '/run/' + runId + '/stats', function(error, data) {

        var tests = data.tests;
        // get just the top 20 longest duration
        tests.sort(function (a, b){

            return b.duration - a.duration;
        });
        // cut out after 20
        tests.splice(20, tests.length);
        var margin = { top: 0, right: 0, bottom: 0, left: 0 };
        var width = 0;
        var height = 0;
        if (Object.keys(tests).length !== 0) {
            margin = { top: 40, right: 20, bottom: 70, left: 50 };
            width = 400 - margin.right - margin.left;
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
        y.domain([0, d3.max(tests, function(d) { return (d.duration); })]);

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
           .text("elapsedTime (ms)");

        svg.append("g")
           .append("text")
           .attr("x", (width / 2))             
           .attr("y", 0 - (margin.top / 2))
           .attr("text-anchor", "middle")  
           .style("font-size", "8") 
//       .style("text-decoration", "underline")  
          .text("Top 20 Elapsed Time (ms) / Test");

        svg.selectAll("bar")
           .data(tests)
           .enter()
           .append("rect")
           .style("fill", function(d) {

               if (!d.err) {
                   // green
                   return "#5cb85c";
               } else {
                   // red
                   return "#d9534f";
               }
           })
           .on("click", function(d) {

               if (d.num > 2) {
                   window.location.href='#' + (d.num - 2);
               }
           })
           .attr("x", function(d) { return x(d.num); })
           .attr("width", x.rangeBand())
           .attr("y", function(d) { return y(d.duration); })
           .attr("height", function(d) { return height - y(d.duration); });
    });
};
