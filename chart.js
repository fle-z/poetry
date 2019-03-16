var units = "Widgets";

d3.select("#chart").style("width", document.getElementById("chart").offsetWidth);
d3.select("#titlebar").style("width", document.getElementById("titlebar").offsetWidth);
var margin = {
        top: 70,
        right: 10,
        bottom: 30,
        left: 40
    },
    width = document.getElementById("chart").offsetWidth - margin.left - margin.right,
    height = document.getElementById("chart").offsetHeight - margin.bottom - 90;


//初始数据变量
var formatNumber = d3.format(",.0f"), // zero decimal places
    format = function(d) {
        return formatNumber(d) + " " + units;
    },
    color = d3.scale.category20();

// append the svg canvas to the page
var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Set the sankey diagram properties
var sankey = d3.sankey()
    .nodeWidth(36)
    .nodePadding(10)
    .size([width, height]);

var path = sankey.link();

var change = function() {};
change = function(graph) {
    //初始化界面
    svg.selectAll("g").remove();

    sankey
        .nodes(graph.nodes)
        .links(graph.links)
        .layout(60);

    // add in the links
    var link = svg.append("g").selectAll(".link")
        .data(graph.links)
        .enter().append("path")
        .attr("class", "link")
        .style("stroke", "#000")
        .attr("d", path)
        .style("stroke-width", function(d) {
            return Math.max(1, d.dy);
        })
        .sort(function(a, b) {
            return b.dy - a.dy;
        });

    // add the link titles
    link.append("title")
        .text(function(d) {
            return d.source.name + " → " +
                d.target.name + "\n" + format(parseInt(d.value));
        });

    // add in the nodes
    var node = svg.append("g").selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        })
        .call(d3.behavior.drag()
            .origin(function(d) {
                return d;
            })
            .on("dragstart", function() {
                this.parentNode.appendChild(this);
            })
            .on("drag", dragmove));

    // add the rectangles for the nodes
    node.append("rect")
        .attr("class", "rect")
        .attr("width", sankey.nodeWidth())
        .attr("height", function(d) {
            return d.dy;
        })
        .style("fill", function(d) {
            return d.color = color(d.name.replace(/ .*/, ""));
        })
        .style("stroke", function(d) {
            return d3.rgb(d.color).darker(2);
        })
        .on("mouseover", function(d) {
            //相邻的节点和边高亮显示
            svg.selectAll(".link").filter(function(l) {
                    return l.source == d;
                })
                .style('opacity', 1)
                .style("stroke", "red");

            svg.selectAll(".link").filter(function(l) {
                    return l.target == d;
                })
                .style("opacity", 1)
                .style("stroke", "orange");

            //不相邻的节点和边隐藏
            svg.selectAll(".link").filter(function(l) {
                    return l.source != d && l.target != d;
                })
                .transition()
                .duration(400)
                .style("opacity", 0.05);
        }).on("mouseout", function(d) {
            //恢复
            svg.selectAll(".link").filter(function(l) {
                    return l.source == d || l.target == d;
                }).transition()
                .style("stroke", "#000");

            svg.selectAll(".link").filter(function(l) {
                    return l.source != d && l.target != d;
                })
                .transition()
                .style("stroke", "#000")
                .style("opacity", 1);
        })
        .on("click", function(d) {
            show(d);
        })
        .append("title")
        .text(function(d) {
            return d.name + "\n" + format(d.value);
        });

    // add in the title for the nodes
    node.append("text")
        .attr("x", -6)
        .attr("y", function(d) {
            return d.dy / 2;
        })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function(d) {
            return d.name;
        })
        .filter(function(d) {
            return d.x < width / 2;
        })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start");

    // the function for moving the nodes
    function dragmove(d) {
        d3.select(this).attr("transform",
            "translate(" + (
                d.x = Math.max(0, Math.min(width - d.dx, d3.event.x))
            ) + "," + (
                d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
            ) + ")");
        sankey.relayout();
        link.attr("d", path);
    }
};



var show = function(d) {
    $('#code').center();
    $('#goodcover').show();
    $('#code').fadeIn();

    var data = {
        "nodes": [],
        "value": []
    };
    d3.json("Data/nodes.json", function(error, node_data) {
        d3.json("Data/links.json", function(error, link_data) {
            for (i = 0; i < node_data.length; i++) {
                if (d.name == node_data[i].name) {
                    if (i >= 78) {//判断是否是emotion节点
                        for (j = 0; j < link_data.length; j++) {
                            if (link_data[j].target == i) {
                                data.value.push(link_data[j].value);
                                data.nodes.push(node_data[link_data[j].source].name);
                            }
                        }
                    } else {
                        for (j = 0; j < link_data.length; j++) {
                            if (link_data[j].source == i) {
                                data.value.push(link_data[j].value);
                                data.nodes.push(node_data[link_data[j].target].name);
                            }
                        }
                    }
                    break;
                }
            }
            draw_pie(data);
            //console.log(data);
        });
    });
};


var draw_pie = function() {};

draw_pie = function(data) {
    //svg.selectAll("g").remove();
    var labels = data.nodes;
    //console.log(data.nodes);
    data = labels.map(function(index, i) {
        return {
            labels: index,
            value: data.value[i]
        };
    });

    var width_pie = 400,
        height_pie = 400,
        radius = Math.min(width_pie, height_pie) / 2;

    var color = d3.scale.category20();

    var arc = d3.svg.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    var labelArc = d3.svg.arc()
        .outerRadius(radius - 40)
        .innerRadius(radius - 40);

    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) {
            return d.value;
        });

    d3.select(".pie_chart").select('svg').remove();

    var svg = d3.select(".pie_chart").append("svg")
        .attr("width", width_pie)
        .attr("height", height_pie)
        .append("g")
        .attr("transform", "translate(" + width_pie / 2 + "," + height_pie / 2 + ")");

    var g = svg.selectAll(".arc")
        .data(pie(data))
        .enter().append("g")
        .attr("class", "arc");

    g.append("path")
        .attr("d", function(d) {
            return arc(d);
        })
        .attr("fill", function(d) {
            return color(d.data.value);
        });

    g.append("text")
        .attr("transform", function(d) {
            return "translate(" + labelArc.centroid(d) + ")";
        })
        .attr("text-anchor", "middle")
        .attr("dy", ".35em")
        .text(function(d) {
            return d.data.labels;
        });
};


$(function() {
    $('#closebt').click(function() {
        $('#code').hide();
        $('#goodcover').hide();
    });
    $('#goodcover').click(function() {
        $('#code').hide();
        $('#goodcover').hide();
    });
    /*var val=$(window).height();
    var codeheight=$("#code").height();
    var topheight=(val-codeheight)/2;
    $('#code').css('top',topheight);*/
    jQuery.fn.center = function(loaded) {
        var obj = this;
        body_width = parseInt($(window).width());
        body_height = parseInt($(window).height());
        block_width = parseInt(obj.width());
        block_height = parseInt(obj.height());

        left_position = parseInt((body_width / 2) - (block_width / 2) + $(window).scrollLeft());
        if (body_width < block_width) {
            left_position = 0 + $(window).scrollLeft();
        }

        top_position = parseInt((body_height / 2) - (block_height / 2) + $(window).scrollTop());
        if (body_height < block_height) {
            top_position = 0 + $(window).scrollTop();
        }

        if (!loaded) {

            obj.css({
                'position': 'absolute'
            });
            obj.css({
                'top': ($(window).height() - $('#code').height()) * 0.5,
                'left': left_position
            });
            $(window).bind('resize', function() {
                obj.center(!loaded);
            });
            $(window).bind('scroll', function() {
                obj.center(!loaded);
            });

        } else {
            obj.stop();
            obj.css({
                'position': 'absolute'
            });
            obj.animate({
                'top': top_position
            }, 200, 'linear');
        }
    };

});

//});
