var margin = {top: 20, right: 20, bottom: 70, left: 20},
    width = 600,
    height = 300 - margin.top - margin.bottom;

// Parse the date / time
var parseDate = d3.time.format("%Y-%m").parse;

var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);

var y = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
//    .tickFormat(d3.time.format("%Y-%m"));

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(10);

//var svg = d3.select("body").append("svg")
var svg = d3.select("#elapsedRuns").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

d3.json("http://localhost:8081/api/job/{{jobId}}/runs", function(error, data) {

  x.domain(data.map(function(d) { return d.id.split('-')[0]; }));
  y.domain([0, d3.max(data, function(d) { return d.elapsedTime / 1000; })]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.55em")
      .attr("dy", "-.55em")
      .attr("transform", "rotate(-90)" );

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("elapsedTime (s)");

  svg.selectAll("bar")
      .data(data)
    .enter().append("rect")
      .style("fill", "steelblue")
      .attr("x", function(d) { return x(d.id.split('-')[0]); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.elapsedTime / 1000); })
      .attr("height", function(d) { return height - y(d.elapsedTime / 1000); });

});
