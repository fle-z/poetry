var chartRadius = 250;
var pieGraph = d3.select("#layoutContainer")
    .append("svg")
    .append("g");

pieGraph.append("g")
    .attr("class", "slices");
pieGraph.append("g")
    .attr("class", "labels");
pieGraph.append("g")
    .attr("class", "lines");
pieGraph.append('g')
    .attr("class", "circles")
    .attr({
        transform: 'translate(' + [-chartRadius, -chartRadius] + ')'
    });
pieGraph.append('g')
    .attr("class", "links")
    .attr({
        transform: 'translate(' + [-chartRadius, -chartRadius] + ')'
    });
pieGraph.append('g')
    .attr("class", "dimensions")
    .attr({
        transform: 'translate(' + [-chartRadius, -chartRadius] + ')'
    });


var pieGraph_width = 960,
    pieGraph_height = 450,
    radius = Math.min(pieGraph_width, pieGraph_height) / 2;

var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) {
        return 10;
    });

var arc = d3.svg.arc()
    .outerRadius(function(t){
        return radius * 0.7 + t.data.value/4;
    })
    .innerRadius(radius * 0.7);

var outerArc = d3.svg.arc()
    .innerRadius(radius * 0.9)
    .outerRadius(radius * 0.9);

pieGraph.attr("transform", "translate(" + pieGraph_width / 2 + "," + pieGraph_height / 2 + ")");

var key = function(d) {
    return d.data.emotion;
};

var color = d3.scale.category20();

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

//定义一个全局的过滤对象
var globalFilter = {
    'type': ['tang', 'song'],
    'emotion': dimension
};

emotionFilter(dimension);
render(dimension);

var clickedNode = "";

function render(data, clickedNode) {
    console.log(data);
    var theta = []; //每个维度的中心点的坐标
    /* ------- PIE SLICES -------*/
    var slice = pieGraph.select(".slices").selectAll("path.slice")
        .data(pie(data), key);

    slice.enter()
        .insert("path")
        .style("fill", function(d, i) {
            return color(i);
        })
        .attr("class", "slice")
        .on("click", function(d) {
            d3.select(this).classed("activeSlice", true);
            exchangeDimension(d.data, dimension);
        });

    slice
        .transition().duration(500)
        .attrTween("d", function(d) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                return arc(interpolate(t));
            };
        });

    slice.exit()
        .remove();

    /* ------- TEXT LABELS -------*/

    var text = pieGraph.select(".labels").selectAll("text")
        .data(pie(data), key);

    text.enter()
        .append("text")
        .attr("dy", ".35em")
        .text(function(d) {
            return d.data.emotion;
        });

    function midAngle(d) {
        return d.startAngle + (d.endAngle - d.startAngle) / 2;
    }

    text.transition().duration(500)
        .attrTween("transform", function(d) {
            this._current = this._current || d;
            //获取每段圆弧的中间点
            var emotion = d.data.emotion;
            theta.push({
                'name': emotion,
                'angle': midAngle(d)
            });

            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                var pos = outerArc.centroid(d2); //arc.centroid(d) 能算出弧线的中心
                pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
                return "translate(" + pos + ")";
            };
        })
        .styleTween("text-anchor", function(d) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                return midAngle(d2) < Math.PI ? "start" : "end";
            };
        });

    text.exit()
        .remove();

    /* ------- SLICE TO TEXT POLYLINES -------*/

    var polyline = pieGraph.select(".lines").selectAll("polyline")
        .data(pie(data), key);

    polyline.enter()
        .append("polyline");

    polyline.transition().duration(500)
        .attrTween("points", function(d) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                var pos = outerArc.centroid(d2);
                pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                return [arc.centroid(d2), outerArc.centroid(d2), pos];
            };
        });

    polyline.exit()
        .remove();

    renderForce(theta, clickedNode);
}

var record = 0; //设置下拉列表的append次数
function renderForce(theta, clickedNode) {
    console.log(clickedNode);
    var zoomFactor = 0.68;

    var dataFilter = function(data) {
        var dataChange = [];
        var n = 0;
        data.forEach(function(d) {
            var tmp = {};
            var size = 0;
            var record = 0;
            theta.forEach(function(dimension) {
                var emotion = dimension.name;
                if (d[emotion]) {
                    tmp[emotion] = d[emotion];
                    size += d[emotion];
                    record = 1;
                }
            });
            if (record == 1) {
                tmp['name'] = d['name'];
                tmp['class'] = d['class'];
                tmp['size'] = size;
                dataChange.push(tmp);
            }
        });

        return dataChange;
    }

    /**标准化的方法，原来的 radviz方法 基于径向坐标系，
     * 所以标准化是将每个坐标上的最大最小值映射到【0,1】上
     *
     * 在本例中是对每个球的不同坐标上的值标准化
     *
     * 选取不同的标准化尺度也对结果有很大影响，是【0， max】到【0， 1】还是【min， max】到【0.01/0.1， 1】
     */
    var addNormalizedValuesBy = function(data) {
        data.forEach(function(d, i) {
            var max = 0,
                min = 500;
            for (var item in d) {
                if (item != "class" && item != "name" && item != "size") {
                    if (d[item] > max) {
                        max = d[item];
                    }
                    if (d[item] < min) {
                        min = d[item];
                    }
                }
            }

            var normalizationScales = d3.scale.linear().domain([0, max]).range([0, 1]);
            for (var it in d) {
                if (it != "class" && it != "name" && it != "size") {
                    d[it + '_normalized'] = normalizationScales(d[it])*normalizationScales(d[it]);
                }
            }
        });
        return data;
    };

    var addNormalizedValues = function(data) {
        data.forEach(function(d) {
            theta.forEach(function(dimension) {
                var emotion = dimension.name;
                if (d[emotion])
                    d[emotion] = +d[emotion];
            });
        });

        var normalizationScales = {};
        theta.forEach(function(dimension) {
            var emotion = dimension.name;
            normalizationScales[emotion] = d3.scale.linear().domain(d3.extent(data.map(function(d, i) {
                return d[emotion];
            }))).range([0, 1]);
        });

        data.forEach(function(d) {
            theta.forEach(function(dimension) {
                var emotion = dimension.name;
                if (d[emotion])
                    d[emotion + '_normalized'] = normalizationScales[emotion](d[emotion]);
            });
        });

        return data;
    };

    var force = d3.layout.force()
        .chargeDistance(20)
        .charge(-30)
        .friction(0.5)
        .size([2 * chartRadius, 2 * chartRadius]);

    queue()
        .defer(d3.json, "../../Data/fenci/allYixPie.json")
        .await(pieReady);

    function pieReady(error, data) {
        var nodeSize = d3.scale.linear().domain([3, 20]).range([3, 8]);

        data = dataFilter(data); //针对图中存在的维度，去除数据中不存在的维度
        var nodeCount = data.length;
        console.log(nodeCount);
        data = addNormalizedValuesBy(data);
        // data = addNormalizedValues(data);
        var normalizeSuffix = '_normalized';
        var dimensionNamesNormalized = theta.map(function(d) {
            return d.name + normalizeSuffix;
        });

        var dimensionNodes = theta.map(function(d, i) {
            var x = chartRadius + Math.cos(d.angle - Math.PI / 2) * chartRadius * zoomFactor;
            var y = chartRadius + Math.sin(d.angle - Math.PI / 2) * chartRadius * zoomFactor;
            return {
                index: nodeCount + i,
                x: x,
                y: y,
                fixed: true,
                name: d.name
            };
        });

        var linksData = [];
        data.forEach(function(d, i) {
            dimensionNamesNormalized.forEach(function(dB, iB) {
                if (d[dB]) {
                    linksData.push({
                        source: i,
                        target: nodeCount + iB,
                        value: d[dB]
                    });
                }
            });
        });

        force.linkStrength(function(d) {
                return d.value;
            })
            .nodes(data.concat(dimensionNodes))
            .links(linksData)
            .start();

        // Links
        if (true) {
            d3.selectAll("line.link").remove();
            var links = pieGraph.select('.links').selectAll("line.link")
                .data(linksData);

            links.enter()
                .append('line')
                .classed('link', true)
                .style("stroke-width", function(d) {
                    return d.value * 2;
                })
                .style("stroke", "silver")
                .style("stroke-opacity", 0);

            if (clickedNode) {
                links.style("stroke-opacity", function(o) {
                    return clickedNode.index == o.source.index | clickedNode.index == o.target.index ? 1 : 0;
                });
            }
        }

        //Nodes
        var circle = pieGraph.select(".circles").selectAll("circle.node")
            .data(data);

        circle.enter()
            .append("circle")
            .attr('class', 'node')
            .attr({
                r: function(d) {
                    return nodeSize(d.size);
                },
                fill: function(d) {
                    return color(d.name);
                }
            })
            .on('click', function(d) {
                getConnection(d, dimensionNodes);
            })
            .append("title")
            .text(function(d) {
                return d.name;
            });

        // Labels
        var labelNodes = pieGraph.select(".dimensions").selectAll('circle.label-node')
            .data(dimensionNodes);

        labelNodes.enter()
            .append('circle')
            .classed('label-node', true);

        // Update force
        force.on('tick', function() {
            if (true) {
                links.attr({
                    x1: function(d) {
                        return d.source.x;
                    },
                    y1: function(d) {
                        return d.source.y;
                    },
                    x2: function(d) {
                        return d.target.x;
                    },
                    y2: function(d) {
                        return d.target.y;
                    }
                });
            }

            circle.attr({
                cx: function(d) {
                    return d.x;
                },
                cy: function(d) {
                    return d.y;
                }
            });

            labelNodes.attr({
                cx: function(d) {
                    return d.x;
                },
                cy: function(d) {
                    return d.y;
                },
                r: 4
            });
        });

        circle.exit()
            .remove();
        labelNodes.exit()
            .remove();

        if (record < 1) {
            renderSelection(data, dimensionNodes);
            $("#wordCloudContainer").append('<input name="circleAreaSelect" type="checkbox" /><label>选择区域</label>');
        }
        record++;

        $('input:checkbox[name=circleAreaSelect]').change(function() {
            var self = this;
            var radius = 20;
            d3.select(".circleArea").remove();
            d3.select("svg g")
                .on("click", function() {
                    if (self.checked) {
                        d3.select(".circleArea").remove();
                        var position = d3.mouse(pieGraph.node());
                        var circleArea = pieGraph.append("circle")
                            .attr("class", "circleArea")
                            .attr("cx", position[0])
                            .attr("cy", position[1])
                            .attr("r", radius)
                            .style("stroke", "#ddd")
                            .style("stroke-width", 1)
                            .style("fill-opacity", 0);

                        wordCloudArea(position, radius);
                    }
                });
        });

        var wordCloudArea = function(position, r) {
            var word = [];
            data.forEach(function(d) {
                var distance = Math.pow(d.x - chartRadius - position[0], 2) + Math.pow(d.y - chartRadius - position[1], 2);
                if (distance < r * r) {
                    word.push(d);
                }
            });

            drawWordCloud(word);
        };
    };

}

//定义一个比较器
function compare(propertyName) {
    return function(object1, object2) {
        var value1 = object1[propertyName];
        var value2 = object2[propertyName];
        if (value2 < value1) {
            return 1;
        } else if (value2 > value1) {
            return -1;
        } else {
            return 0;
        }
    };
}

var clickedNodeRecord = ["柳色"];
var getConnection = function(clickedNode, dimensionNodes) {
    var dimensionConnected = [];
    dimensionNodes.forEach(function(d, i) {
        var tmp = [];
        if (clickedNode[d.name]) {
            tmp.name = d.name;
            tmp.value = clickedNode[d.name];
            dimensionConnected.push(tmp);
        }
    });

    drawEmotion(dimensionConnected);
    showPoetry([clickedNode.name]);
    dimensionConnected.sort(compare('value')); //从小到大排序

    dimensionConnected.forEach(function(o, j) {
        dimension.forEach(function(d, i) {
            if (d.emotion == o.name) {
                var tmp = dimension.splice(i, 1);
                if (j % 2 === 0) {
                    dimension.unshift(tmp[0]);
                } else {
                    dimension.push(tmp[0]);
                }
            }
        });
    });

    render(dimension, clickedNode);
};

var exchange = []; //将要交换的两个主题维度
var exchangeDimension = function(data, dimensionNodes) {
    exchange.push(data);
    console.log(exchange);
    //console.log(data);
    if (exchange.length == 2) {
        var dimension = dimensionNodes;
        dimension.forEach(function(d, i) {
            if (d.emotion == exchange[0].emotion) {
                dimension.forEach(function(o, j) {
                    if (o.emotion == exchange[1].emotion) {
                        var tmp = dimensionNodes[i];
                        dimensionNodes[i] = dimensionNodes[j];
                        dimensionNodes[j] = tmp;
                    }
                });
            }
        });
        exchange = [];
        render(dimensionNodes);
    }
};

resize();
d3.select(window).on("resize", resize);

function resize() {
    d3.select("svg").attr("width", pieGraph_width).attr("height", pieGraph_height);
}

var renderSelection = function(node, dimensionNodes) {
    $("#wordCloudContainer").append("<select></select>");
    node.forEach(function(d) {
        var html = " <option value=" + d.name + ">" + d.name + "</option>";
        $("#wordCloudContainer > select").append(html);
    });

    $('#wordCloudContainer > select').searchableSelect();

    $(".searchable-select-item").on("click", function() {
        var holder = $(".searchable-select-holder").text();
        node.forEach(function(d) {
            if (d.name == holder) {
                getConnection(d, dimensionNodes);
            }
        });
    });

};



function clone(obj) {
    var o, i, j, k;
    if (typeof(obj) != "object" || obj === null) return obj;
    if (obj instanceof(Array)) {
        o = [];
        i = 0;
        j = obj.length;
        for (; i < j; i++) {
            if (typeof(obj[i]) == "object" && obj[i] != null) {
                o[i] = arguments.callee(obj[i]);
            } else {
                o[i] = obj[i];
            }
        }
    } else {
        o = {};
        for (i in obj) {
            if (typeof(obj[i]) == "object" && obj[i] != null) {
                o[i] = arguments.callee(obj[i]);
            } else {
                o[i] = obj[i];
            }
        }
    }

    return o;
}

//主题的选择过滤
var allDimension = clone(dimension); //js对象的浅拷贝和深拷贝问题！！！
