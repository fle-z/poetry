function getClickedNode(node_clicked) {
    console.log(node_clicked);
    var poetryCount = [];
    if (node_clicked.length >= 3) {
        node_clicked.shift();
    }
    if (node_clicked.length == 1) {
        data = {
            "yix1": node_clicked[0],
        };
    }
    if (node_clicked.length == 2) {
        data = {
            "yix1": node_clicked[0],
            "yix2": node_clicked[1],
        };
    }

    showPoetry(data);
    $.ajax({
        url: "http://127.168.0.1/poetry/Experiment/getTwoYixInDiffEmotion.php",
        type: "post",
        data: data,
        dataType: 'json',
        success: function(result) {
            result.forEach(function(list) {
                poetryCount.push({
                    name: list.emotion,
                    value: parseInt(list.count)
                });
            });
            
            drawEmotion(poetryCount);
        },
        error: function(data, err) {
            console.log(data.responseText);
        }
    });

}

function getMaxValue(poetryCount) {
    var max = 0;
    poetryCount.forEach(function(list) {
        if (list.value > max)
            max = list.value;
    });
    return max;
}

function drawEmotion(poetryCount) {
    $("#emotionContainer svg").remove();
    var emotion_width = $("#emotionContainer").width();
    var emotion_height = 190;
    var offWidth = 5;
    var offHeight = 20;
    var maxHeight = getMaxValue(poetryCount);

    var svg = d3.select("#emotionContainer").append("svg")
        .attr("width", emotion_width)
        .attr("height", emotion_height);

    var xAxisScale = d3.scale.ordinal()
        .domain(d3.range(poetryCount.length))
        .rangeRoundBands([0, emotion_width - offWidth]);

    var yAxisScale = d3.scale.linear()
        .domain([0, maxHeight])
        .range([emotion_height - offHeight, 0]);

    var xScale = d3.scale.ordinal()
        .domain(d3.range(poetryCount.length))
        .rangeRoundBands([0, emotion_width - offWidth], 0.05);
    var yScale = d3.scale.linear()
        .domain([0, maxHeight])
        .range([0, emotion_height - offHeight]);

    svg.selectAll("rect")
        .data(poetryCount)
        .enter()
        .append("rect")
        .attr("x", function(d, i) {
            return offWidth + xScale(i);
        })
        .attr("y", function(d, i) {
            return emotion_height - yScale(d.value);
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
        .data(poetryCount)
        .enter().append("text")
        .attr("x", function(d, i) {
            return xScale(i) - xScale.rangeBand() / 6;
        })
        .attr("y", function(d, i) {
            return emotion_height - yScale(d.value) - 20;
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
