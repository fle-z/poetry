function allFilter(query){
    console.log(query);
    $.ajax({
        url: "http://127.168.0.1/poetry/Experiment/getAuthorEmotion.php",
        type: "post",
        data: query,
        dataType: 'json',
        success: function(result) {
            return result;
        },
        error: function(data, err) {
            console.log(data.responseText);
        }
    });
}

function yixFilter(nodes) {
    var container = $("#yix-tagit");
    container.children().remove();
    nodes.forEach(function(list) {
        var html = '<div class="tagit-choice active"><span class="tagit-label">' + list.name + '</span></div>';
        container.append(html);
    });

    container.on("click", ".tagit-choice", function(d) {
        reverseActive($(this));
    });
}

function reverseActive(self) {
    if (self.hasClass("active")) {
        self.removeClass("active");
    } else {
        self.addClass("active");
    }
}

function emotionFilter(dimensions) {
    var container = $("#emotion-tagit");
    container.children().remove();
    dimensions.forEach(function(list) {
        var html = '<label>' + list.emotion + '</label><input name="chkItem" type="checkbox" value="' + list.emotion + '" />';
        container.append(html);
    });
}
