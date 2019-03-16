var margin = {
        top: 15,
        right: 0,
        bottom: 50,
        left: 50
    },
    width = 1000 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom,
    gridSize = Math.floor(width / 24),
    legendElementWidth = gridSize * 2,
    buckets = 6,
    colors = ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"], // alternatively colorbrewer.YlGnBu[9]
    authors = ['李白', '杜甫', '白居易', '王维', '吴文英', '辛弃疾',
        '苏轼', '李商隐', '岑参', '晏几道', '陆游', '高适',
        '孟浩然', '柳宗元', '柳永', '杜牧', '李清照', '韦庄',
        '刘禹锡', '李贺', '晏殊', '温庭筠', '周邦彦', '欧阳修',
        '王昌龄', '秦观', '韦应物'],
    emotions = [];

function getDimension() {
    var data;
    $.ajax({
        url: "http://127.168.0.1/poetry/Experiment/getEmotionNum.php",
        type: 'post',
        dataType: 'json',
        async: false,
        success: function(result) {
            data = result;
        },
        error: function() { //出错处理
            alert('数据获取失败');
        }
    });

    return data;
}
var dimension = getDimension();
dimension.forEach(function(d) {
    emotions.push(d.emotion);
});

var svg = d3.select("#yixContainer").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var authorLabels = svg.selectAll(".authorLabel")
    .data(authors)
    .enter().append("text")
    .text(function(d) {
        return d;
    })
    .attr("x", 0)
    .attr("y", function(d, i) {
        return i * gridSize / 6;
    })
    .style("text-anchor", "end")
    .attr("transform", "translate(-3," + gridSize / 6 + ")")
    .attr("class", "authorLabel mono axis");

var emotionLabels = svg.selectAll(".emotionLabel")
    .data(emotions)
    .enter().append("text")
    .text(function(d) {
        return d.substr(0, 2);
    })
    .attr("x", function(d, i) {
        return i * gridSize;
    })
    .attr("y", 0)
    .style("text-anchor", "middle")
    .attr("transform", "translate(" + gridSize / 6 + ", -6)")
    .attr("class", "emotionLabel mono axis");

var normalizeData = function(data) {
    var normalizationScales = {};
    authors.forEach(function(author) {
        normalizationScales[author] = d3.scale.linear().domain(d3.extent(data.map(function(d, i) {
            if (d['author'] == author){
                return parseInt(d['size']);
            }
        }))).range([0, 1]);
    });

    data.forEach(function(d) {
        d['value'] = 10*normalizationScales[d['author']](d['size']);
    });

    return data;
}
var heatmapChart = function(jsonFile) {
    d3.json(jsonFile,
        function(error, data) {
            var data = normalizeData(data);

            var colorScale = d3.scale.quantile()
                .domain([0, buckets - 1, d3.max(data, function(d) {
                    return d.value;
                })])
                .range(colors);

            var cards = svg.selectAll(".emotion")
                .data(data);

            var getPosition = function(tmp, emotion) {
                for (var i = 0; i < tmp.length; i++) {
                    if (tmp[i] == emotion)
                        return i;
                }
            };

            cards.enter().append("rect")
                .attr("x", function(d, i) {
                    return getPosition(emotions, d.emotion) * gridSize;
                })
                .attr("y", function(d, i) {
                    return getPosition(authors, d.author) * gridSize/6;
                })
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("class", "emotion bordered")
                .attr("width", gridSize)
                .attr("height", gridSize/5)
                .style("fill", colors[0]);

            cards.transition().duration(1000)
                .style("fill", function(d) {
                    return colorScale(d.value);
                });

            cards.append("title").text(function(d) {
                return d.author+"/"+d.emotion+"/"+d.size+"首";
            });

            cards.exit().remove();
        });
};

heatmapChart("../../Data/authorEmotion.json");
