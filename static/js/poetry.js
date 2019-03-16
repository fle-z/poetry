function showPoetry(data) {
    console.log(data);
    if(typeof data != "undefined"){
        data = {"yix1" : data[0]};
    }
    $.ajax({
        url: "http://127.168.0.1/poetry/Experiment/getPoetryOfTwoYix.php",
        type: "post",
        data: data,
        dataType: 'json',
        success: function(result) {
            console.log(result);
            var container = $("#poetryContainer");
            container.children().remove();
            result.forEach(function(list){
                var html = getHtml(list);
                container.append(html);
            });
        },
        error: function(data, err) {
            console.log(err);
        }
    });
}

function getHtml(list){
    var html = '<div class="panel panel-default">'+
                    '<div class="panel-heading" data-target="#target'+list.id+'">'+
                        '<h4 class="panel-title">'+
                            '<label>标题：'+list.title+'</label><br/>'+
                            '<label>作者：'+list.author+'</label>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'+
                            '<label>朝代：'+list.dynasty+'</label>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'+
                            '<label>主题：'+list.emotion+'</label>'+
                        '</h4>'+
                    '</div>'+
                    '<div id="target'+list.id+'" class="panel-collapse collapse">'+
                        '<div class="panel-body">'+
                            '<label>内容：</label><br/>'+list.content +
                        '</div>'+
                    '</div>'+
                '</div>';
    return html;
}
