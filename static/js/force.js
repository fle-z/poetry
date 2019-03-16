//意象的选择过滤
var node_clicked = [];            
$("#yixCompare-tagit .tagit-choice").on("click", function() {
    if (!$(this).hasClass("active")) {
        $(this).addClass("active");
        if ($(this).attr("name") == "1") {
            node_clicked = [''];
        } else {
            node_clicked = [node_clicked[0], ''];
        }
    }
    console.log(node_clicked);
    if ($(this).siblings().hasClass("active")) {
        $(this).siblings().removeClass("active");
    }
});

// Function for moving nodes to front
d3.selection.prototype.moveToFront = function() {
    return this.each(function() {
        this.parentNode.appendChild(this);
    });
};

// Function for moving to back
d3.selection.prototype.moveToBack = function() {
    return this.each(function() {
        var firstChild = this.parentNode.firstChild;
        if (firstChild) {
            this.parentNode.insertBefore(this, firstChild);
        }
    });
};

var scaleFactor = 1;
var translation = [0, 0];

var circleSize = 10;

var minWidthPoly1 = 0;
var minWidthPoly2 = 355;

var height = 0;
var width = 0;

var weight_limit = 10;

// Initialize Ordinal Colour Scale
var groupColor = d3.scale.ordinal()
    .domain([1, 3])
    .range([
        "#009933", //绿色
        "#e8941a", //黄色
        "#00ccff", //蓝色
    ]);

// 连线长度
var line_opacity = d3.scale.sqrt().domain([weight_limit, 300]).range([0.1, 1]);
var line_width = d3.scale.sqrt().domain([weight_limit, 300]).range([0.1, 3]);
var a = d3.rgb(255, 255, 255);
var b = d3.rgb(255, 0, 0); //红色

var compute = d3.interpolate(a, b);
var line_color = d3.scale.sqrt().domain([weight_limit, 300]).range([0, 1]);

// Initialize Ordinal Colour Scale
var color = d3.scale.category20();

// Configure force layout
var force = d3.layout.force();

queue()
    .defer(d3.json, "../../Data/nodes.json")
    .defer(d3.json, "../../Data/yix_relation.json")
    .await(ready);

function ready(error, data_nodes, data_links) {
    if (error) throw error;

    // The 'data_nodes' variable refers to data from the nodes.json file
    // The 'data_links' variable refers to data from the yix_relation.json file

    var allShowing = true;
    var nodeHighlighted = false;
    var timeout;

    var mousePos = [0, 0];
    var newMousePos = [0, 0];

    /*** Configure zoom(整体放大) behaviour ***/
    var zoomer = d3.behavior.zoom()
        .scaleExtent([0.1, 10])
        //allow 10 times zoom in or out
        .on("zoom", zoom);
    //define the event handler function

    function zoom(d) {

        if (d3.event.sourceEvent && !nodeHighlighted) {
            d3.event.sourceEvent.stopPropagation();
        }
        scaleFactor = d3.event.scale;
        translation = d3.event.translate;
        tick(); //update positions
    }

    /*** Configure drag(整体拖动) behaviour ***/
    var isDrag = false;
    var drag = d3.behavior.drag()
        .origin(function(d) {
            return d;
        }) //center of circle
        .on("dragstart", dragstarted)
        .on("drag", dragged)
        .on("dragend", dragended);

    var getMousePos;

    function dragstarted(d) {
        if (d3.select(this).classed("activeNode")) {
            getMousePos = d3.mouse(vis.node());
            mousePos[0] = getMousePos[0];
            mousePos[1] = getMousePos[1];
            d3.select(this).moveToFront();
            d3.event.sourceEvent.stopPropagation();
            d3.select(this).classed("dragging", true);
            force.stop(); //stop ticks while dragging
            isDrag = true;
            //d3.select(this).classed("fixed", d.fixed = true);
        }
    }

    function dragged(d) {
        if (d3.select(this).classed("activeNode")) {
            //if (d.fixed) return; //root is fixed

            //get mouse coordinates relative to the visualization
            //coordinate system:
            var mouse = d3.mouse(vis.node());
            d.x = (mouse[0] - translation[0]) / scaleFactor;
            d.y = (mouse[1] - translation[1]) / scaleFactor;
            tick(); //re-position this node and any links
        }
    }

    function dragended(d) {
        if (d3.select(this).classed("activeNode")) {
            getMousePos = d3.mouse(vis.node());
            newMousePos[0] = getMousePos[0];
            newMousePos[1] = getMousePos[1];
            var shortDrag = Math.abs(newMousePos[0] - mousePos[0]) < 5 && Math.abs(newMousePos[1] - mousePos[1]) < 5;
            if (shortDrag) { // Short drag means click
                connectedNodes(d, allShowing, this); // else highlight connected nodes
            }

            d3.select(this).classed("dragging", false);
            if (!shortDrag) {
                force.resume();
            } // Resume force layout only if not a short drag
            isDrag = false;
        }
    }

    //Initialize SVG
    var graph = d3.select("#layoutContainer").append("svg")
        .append("g")
        .attr("class", "graph")
        .on("mousedown", function() {
            mousePos = d3.mouse(this);
            //Only clicks no drag or pan on menu area
            if (mousePos[0] < minWidthPoly1 && mousePos[1] < height) d3.event.stopImmediatePropagation();
        })
        .call(zoomer);

    // Rectangle to catch mouse events for zoom
    var rect = graph.append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .style("margin", "0 auto")
        .style("fill", "none")
        .style("pointer-events", "all")
        .style("cursor", "move")
        .on("click", function() {
            if (d3.event.defaultPrevented) return;
            showAllNodes();
        });

    // Create a group that will hold all content to be zoomed
    var vis = graph.append("svg:g")
        .attr("class", "plotting-area");

    // Pinned tooltip
    var pinnedTooltip = d3.select("#layoutContainer").append("div")
        .attr("class", "tooltip pinned")
        .style("opacity", 0);

    // Tooptip in top left corner
    var tooltip = d3.select("#layoutContainer").append("div")
        .attr("class", "tooltip")
        .style("opacity", "0");

    //处理数据
    var nodes = [];
    for (i = 0; i < 47; i++) {
        nodes.push({
            id: i,
            name: data_nodes[i].name,
            group: data_nodes[i].group,
        });
    }
    var links = [];
    data_links.forEach(function(link, index, list) {
        if (typeof nodes[link.source] === 'undefined') {
            console.log('undefined source', index);
        } else if (typeof nodes[link.target] === 'undefined') {
            console.log('undefined target', index);
        } else {
            if(data_links[index].weight > weight_limit){
                links.push({
                    source: data_links[index].source,
                    target: data_links[index].target,
                    weight: data_links[index].weight
                });
            }
        }
    });

    /**
     *调用filter中的函数
     */
    yixFilter(nodes);

    // Start the force layout.
    force
        .nodes(nodes)
        .links(links)
        .size([width, height])
        .linkDistance(function(link){
            return (350 - link.weight);
        })
        .charge(-300)
        .on("tick", function() {
            tick();
        })
        .on("end", function() {
            //drawVoronoi();
        })
        .start();

    /*graph
        .on("mouseleave", function() {
            force.resume();
        })
        .on("mouseover", function() {
            force.stop();
        });*/

    // Create the link lines.
    var link = vis.selectAll(".link")
        .data(links)
        .enter().append("line")
        .attr("class", "link")
        .attr("weight", function(d) {
            return d.weight;
        })
        .attr("source", function(d) {
            return d.source.name;
        })
        .attr("target", function(d) {
            return d.target.name;
        })
        .style("stroke-opacity", function(d) { //设置线的宽度
            return line_opacity(d.weight);
        })
        .style("stroke-width", function(d) { //设置线的宽度
            return line_width(d.weight);
        })
        .style("stroke", function(d) {
            return compute(line_color(d.weight));
        });

    // Create the node circles.
    var node = vis.selectAll(".node")
        .data(nodes)
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", function(d) {
            return circleSize;
        })
        .style("fill", function(d) {
            return groupColor(d.group);
        })
        .classed("activeNode", true)
        .on("mouseover", function(d) {
            if (d3.select(this).classed("activeNode") && !d3.select(this).classed("baseNode")) {
                //force.stop();
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                tooltip.html(d.name)
                    .style("right", "20px")
                    .style("top", (nodeHighlighted ? "65px" : "20px"));
            }
        })
        .on("mouseout", function(d) {
            /*if (!isDrag && !nodeHighlighted) {
                force.resume();
            }*/
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .call(drag);

    var text = vis.selectAll(".text")
        .data(nodes)
        .enter().append("text")
        .attr("class", function(d){
            return d.name;
        })
        .attr("text-anchor", "middle");

    /* Configure highlighting of connected nodes */
    var toggle = 0;

    //Create an array logging what is connected to what
    var linkedByIndex = {};
    for (i = 0; i < nodes.length; i++) {
        linkedByIndex[i + "," + i] = 1;
    }
    links.forEach(function(link, index) {
        linkedByIndex[link.source.id + "," + link.target.id] = 1;
    });

    //This function looks up whether a pair are neighbours
    function neighboring(a, b) {
        return linkedByIndex[a.index + "," + b.index];
    }

    // Change opacity to highlight connected nodes
    function connectedNodes(clickedOn, firstClick, nodeClicked) {
        nodeHighlighted = true;
        if (d3.select(nodeClicked).classed("baseNode")) { // Base node was clicked, show all
            showAllNodes();
            return;
        }
        force.stop(); // Stop moving
        tooltip.style("opacity", 0); // Clear unpinned tooltip (because it is the same as the pinned)
        pinnedTooltip.transition()
            .duration(200)
            .style("opacity", 0.9);
        pinnedTooltip.html(clickedOn.name) // Pin tooltip with name of clicked on node
            .style("right", "20px")
            .style("top", "20px");
        node.each(function(d) { // Allow for clicking back on previous baseNodes
            d3.select(this).classed("baseNode", false);
        });
        d3.select(nodeClicked).classed("baseNode", true);
        node.classed("activeNode", function(o) {
            return neighboring(clickedOn, o) | neighboring(o, clickedOn) ? true : false;
        });
        node.style("stroke-opacity", function(o) {
            return (neighboring(clickedOn, o) | neighboring(o, clickedOn)) ? 1 : 0;
        });
        node.style("fill-opacity", function(o) {
            return (neighboring(clickedOn, o) | neighboring(o, clickedOn)) ? 1 : 0;
        });
        link.style("stroke-opacity", function(o) {
            return clickedOn.index == o.source.index | clickedOn.index == o.target.index ? line_opacity(o.weight) : 0;
        });
        d3.select("activeNode").moveToFront(); // Brings activeNode nodes to front
        allShowing = false;
        facultySelected = false;
        getActiveNode();
        //console.log(clickedOn.name);
        node_clicked.shift();
        node_clicked.unshift(clickedOn.name);
        getClickedNode(node_clicked);
        showWordCloud(node_clicked[0]);
        d3.select("wordCloud").moveToFront();
    }

    // Show all nodes on click in empty space
    function showAllNodes() {
        if (d3.event.stopPropagation) {
            d3.event.stopPropagation();
        }
        force.resume();
        //Put them back to opacity=1
        node
            .style("stroke-opacity", 1)
            .style("fill-opacity", 1)
            .classed("activeNode", true)
            .classed("clickedNode", false)
            .classed("baseNode", false)
            .transition().duration(300)
            .attr("r", circleSize);
        link.style("stroke-opacity", function(d) {
            return line_opacity(d.weight);
        });
        allShowing = true;
        facultySelected = false;
        nodeHighlighted = false;
        pinnedTooltip.style("opacity", 0);
    }

    // Update positions of nodes and links
    function tick() {
        link.attr("x1", function(d) {
                return translation[0] + scaleFactor * d.source.x;
            })
            .attr("y1", function(d) {
                return translation[1] + scaleFactor * d.source.y;
            })
            .attr("x2", function(d) {
                return translation[0] + scaleFactor * d.target.x;
            })
            .attr("y2", function(d) {
                return translation[1] + scaleFactor * d.target.y;
            });

        node.attr("cx", function(d) {
                return translation[0] + scaleFactor * d.x;
            })
            .attr("cy", function(d) {
                return translation[1] + scaleFactor * d.y;
            });

        text.attr("x", function(d) {
                return translation[0] + scaleFactor * d.x;
            })
            .attr("y", function(d) {
                return translation[1] + scaleFactor * d.y;
            });
    }

    resize();
    d3.select(window).on("resize", resize);

    function resize() {
        width = $("#layoutContainer").width();
        height = 496;
        console.log("this is width: " + width);
        d3.select("svg").attr("width", width).attr("height", height);
        force.size([width, height]).resume();

        rect.attr("x", minWidthPoly1);
    }

    function drawVoronoi() {
        width = $("#layoutContainer").width();
        height = 496;
        console.log(width);
        var circle = $(".node");
        var data = [];

        circle.each(function(d, i){
            data.push({"x": $(this).attr("cx"), "y": $(this).attr("cy")});
        });

        var voronoi = d3.geom.voronoi()
            .x(function(d) {
                return d.x;
            })
            .y(function(d) {
                return d.y;
            })
            .clipExtent([[0, 0], [width, height]]);//从画面左上角到右下角为显示区间

        var polygons = voronoi(data);

        var path = vis.selectAll("path")
            .data(polygons)
            .enter()
            .append("path")
            .attr("fill", "none")
            .attr("d", function(d) {
                return "M" + d.join("L") + "Z";
            })
            .attr("stroke", "#fff")
            .attr("stroke-width", 1);

        vis.append('g').selectAll('circle')
        .data(nodes)
        .enter()
        .append('circle')
        .attr('cx', function(d,i){
          return d.x;
        })
        .attr('cy', function(d,i){
          return d.y;
        })
        .attr('r', 5)
        .attr('fill','#fff');
    }

}
