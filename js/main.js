var options = {
  valueNames: [ 'id', 'completed_at', 'price', 'result', 'name', ],
  page: 15,
  plugins: [ ListPagination({outerWindow: 1}) ],  
  item: '<li class="list-group-item"><div class="row"><div class="col-md-2">' +
        '<span class="id"></span>' + 
        '</div><div class="col-md-2">' +
        '<span class="completed_at"></span>' + 
        '</div><div class="col-md-2">' +
        '<span class="price"></span>' + 
        '</div><div class="col-md-2">' +
        '<span class="result"></span>' +        
        '</div><div class="col-md-4">' +
        '<span class="name"></span>' + 
        '</div></div>' +
        '</li>'
};

var parseVals = function(vals) {
  var ret = JSON.parse(JSON.stringify(vals));
  ret.forEach(function(review){
    review.completed_at = moment(review.completed_at).format("L");
    review.name = review.project.name;
    review.price = '$' + (+review.price).toFixed(2);
  })
  return ret;
}

var userList = new List('reviews', options, '');

$('#jsonInput').keypress(function(event) {
    // Check the keyCode and if the user pressed Enter (code = 13) 
    if (event.keyCode == 13) {
      if(isJson(this.value)) {
        userList.add(parseVals(JSON.parse(this.value)));
        userList.sort('id', { order: "desc" });
        this.value = '';
        $('.jumbotron').addClass('hide');
        $('#reviewsRow').removeClass('hide');
        $('.search').focus();
      }
      else {

      }
    }
});


function isJson(item) {
    item = typeof item !== "string"
        ? JSON.stringify(item)
        : item;

    try {
        item = JSON.parse(item);
    } catch (e) {
        return false;
    }

    if (typeof item === "object" && item !== null) {
        return true;
    }

    return false;
}