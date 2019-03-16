var graph = {"nodes": [], "links": []},
    theme_node  = d3.select("#theme"),
    author_node = d3.select("#author"),
    yix_node    = d3.select("#yix");

function addTheme(){
    var a = theme_node.append("div").on("click", movenode);
    var theme = $('#select1 option:selected').val();
    a.attr("class", "tagit-choice")
    .attr("value", theme)
    .on("click", movenode)
    .text(theme);
}

function addAuthor(){
    var a = author_node.append("div");
    var author = $('#select2 option:selected').val();
    a.attr("class", "tagit-choice")
    .attr("value", author)
    .on("click", movenode)
    .text(author);
}

function addYix(){
    var a = yix_node.append("div");
    var yix = $('#select3 option:selected').val();
    a.attr("class", "tagit-choice")
    .attr("value", yix)
    .on("click", movenode)
    .text(yix);
}

$(".tagit-choice").bind("click", movenode);

function movenode(d) {
    d3.select(this).remove();
}

window.onload = function(){
    draw();
};

function draw(){
	graph = {"nodes": [], "links": []};
    var temp = [];//记录节点原来的序号
    //从数据中找出节点
    d3.json("Data/nodes.json", function(error, node_data){
        //根据从数据中找链接
        d3.json("Data/links.json", function(error, link_data){
            for(var i = 0; i < node_data.length; i++){
                for (var j = 0; j < theme_node[0][0].children.length; j++) {
                    if($("#theme")[0].children[j].outerText == node_data[i].name){
                        graph.nodes.push(node_data[i]);
                        temp.push(i);
                    }
                }
                for (j = 0; j < author_node[0][0].children.length; j++) {
                    if($("#author")[0].children[j].outerText == node_data[i].name){
                        graph.nodes.push(node_data[i]);
                        temp.push(i);
                    }
                }
                for (j = 0; j < yix_node[0][0].children.length; j++) {
                    if($("#yix")[0].children[j].outerText == node_data[i].name){
                        graph.nodes.push(node_data[i]);
                        temp.push(i);
                    }
                }
    	    }

            for(var x = 0; x < temp.length; x++){
                for(var y = 0; y < link_data.length; y++){
                    //判断是否是源节点
                    if(temp[x] == link_data[y].source){
                        for(var a = 0; a < temp.length; a++){
                            //判断是否是目标节点
                            if(temp[a] == link_data[y].target){
                                temp_link = link_data[y];
                                temp_link.source = x;
                                temp_link.target = a;
                                temp_link.value = link_data[y].value;
                                graph.links.push(temp_link);
                            }
                        }
                    }
                }
            }
            
            change(graph);//在chart.js文件里面
        });
    });

    //console.log(graph);
}
