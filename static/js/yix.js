function getActiveNode() {
    var partLink = [];
    var baseNode;
    d3.selectAll(".baseNode")
        .each(function(d) {
            baseNode = d.name;
        });

    partLink = getLinkWeight(partLink, baseNode);
    drawYix(partLink);
}

function getLinkWeight(partLink, baseNode) {
    $(".link").each(function() {
        if ($(this).css("stroke-opacity") != 0) {
            if ($(this).attr("source") != baseNode) {
                partLink.push({
                    name: $(this).attr("source"),
                    value: parseInt($(this).attr("weight"))
                });
            } else if ($(this).attr("target") != baseNode) {
                partLink.push({
                    name: $(this).attr("target"),
                    value: parseInt($(this).attr("weight"))
                });
            }
        }
    });
    return partLink;
}

function getMaxValue(partLink) {
    var max = 0;
    partLink.forEach(function(link) {
        if (link.value > max)
            max = link.value;
    });
    return max;
}

// Pinned tooltip
var pinnedTooltip = d3.select("#yixContainer").append("div")
    .attr("class", "tooltip pinned")
    .style("opacity", 0);

function drawYix(partLink) {
    $("#yixContainer svg").remove();
    var yix_width = $("#yixContainer").width();
    var yix_height = 160;
    var offWidth = 5;
    var offHeight = 20;
    var maxHeight = getMaxValue(partLink);

    var svg = d3.select("#yixContainer").append("svg")
        .attr("width", yix_width)
        .attr("height", yix_height);

    var xAxisScale = d3.scale.ordinal()
        .domain(d3.range(partLink.length))
        .rangeRoundBands([0, yix_width - offWidth]);

    var yAxisScale = d3.scale.linear()
        .domain([0, maxHeight])
        .range([yix_height - offHeight, 0]);

    var xScale = d3.scale.ordinal()
        .domain(d3.range(partLink.length))
        .rangeRoundBands([0, yix_width - offWidth], 0.05);
    var yScale = d3.scale.linear()
        .domain([0, maxHeight])
        .range([0, yix_height - offHeight]);

    svg.selectAll("rect")
        .data(partLink)
        .enter()
        .append("rect")
        .attr("x", function(d, i) {
            return offWidth + xScale(i);
        })
        .attr("y", function(d, i) {
            return yix_height - yScale(d.value);
        })
        .on("click", function(d) {
            node_clicked.pop();
            node_clicked.push(d.name);
            getClickedNode(node_clicked);
            pinnedTooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            pinnedTooltip.html(d.name) // Pin tooltip with name of clicked on node
                .style("right", "20px")
                .style("top", "520px");
        })
        .style("filter", "drop-shadow( -1.5px -1.5px 1.5px #000 )")
        .attr("width", function(d, i) {
            return xScale.rangeBand() / 2;
        })
        .transition()
        .duration(function(d, i) {
            return i * 40;
        })
        .style("fill", "#ff2222")
        .attr("height", function(d) {
            return yScale(d.value);
        });

    svg.selectAll("text")
        .data(partLink)
        .enter().append("text")
        .attr("x", function(d, i) {
            return xScale(i) - xScale.rangeBand() / 6;
        })
        .attr("y", function(d, i) {
            return yix_height - yScale(d.value) - 20;
        })
        .attr("dx", function(d, i) {
            return xScale.rangeBand() / 3;
        })
        .attr("dy", 15)
        .attr("text-anchor", "begin")
        .attr("font-size", 10)
        .attr("fill", "#ddd")
        .text(function(d, i) {
            return d.name;
        });

    // Animation functions for mouse on and off events.
    svg.selectAll("rect")
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);

    function handleMouseOver(d) {
        var rect = d3.select(this);

        rect.attr("stroke", "#ffee00")
            .attr("stroke-width", "1")
            .attr("stroke-opacity", "0.6");
    }

    function handleMouseOut() {
        var rect = d3.select(this);

        rect.attr("stroke-width", "0");
    }

}
