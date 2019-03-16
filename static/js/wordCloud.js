function showWordCloud(node, id) {
    $.ajax({
        url: "http://127.168.0.1/poetry/Experiment/wordLikeQuery.php",
        type: "post",
        data: {
            node: node[0]
        },
        dataType: 'json',
        success: function(result) {
            drawWordCloud(result);
        },
        error: function(data, err) {
            console.log(data.responseText);
        }
    });
}

function getMaxSize(poetryCount) {
    var max = 0;
    poetryCount.forEach(function(list) {
        if (list.size > max)
            max = list.size;
    });
    return max;
}

function drawWordCloud(data, id) {
    id = id || "#wordCloudContainer";
    $(id+" svg").remove();
    var fill = d3.scale.category20();
    var maxSize = getMaxSize(data);
    var size = d3.scale.sqrt().domain([0, maxSize]).range([5, 40]);

    var layout = d3.layout.cloud()
        .size([300, 400])
        .words(data.map(function(d, i) {
            return {
                text: d.name,
                size: size(d.size),
            };
        }))
        .padding(5)
        .rotate(function() {
            return (~~(Math.random() * 2) - 1) * 90;
        })
        .font("Impact")
        .fontSize(function(d) {
            return d.size;
        })
        .on("end", draw);

    layout.start();

    function draw(words) {
        d3.select(id).append("svg")
            .attr("width", layout.size()[0])
            .attr("height", layout.size()[1])
            .attr("class", "wordCloud")
            .append("g")
            .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
            .selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", function(d) {
                return d.size + "px";
            })
            .style("fill", function(d, i) {
                return fill(i);
            })
            .attr("text-anchor", "middle")
            .attr("transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function(d) {
                return d.text;
            });
    }
}
