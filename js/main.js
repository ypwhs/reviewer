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

var stats = {
  reviewCount: 0,
  earned: 0,
  avgEarned: 0,
  startDate: moment('2999-01-01'),
  recentDate: moment('1980-01-01')
}

var parseVals = function(vals) {
  var ret = JSON.parse(JSON.stringify(vals));
  stats.reviewCount += ret.length; //total reviews
  ret.forEach(function(review){
    //date stuff
    var dateComp = moment(review.completed_at);
    if (stats.startDate.isAfter(dateComp, 'day')) stats.startDate = dateComp;
    if (stats.recentDate.isBefore(dateComp, 'day')) stats.recentDate = dateComp;
    review.completed_at = dateComp.format("L");
    //pull the project name to top the top level
    review.name = review.project.name;
    //money stuff
    stats.earned += +review.price;
    review.price = numToMoney(+review.price);
  })
  var earnedInt = parseInt(stats.earned);
  if (''+earnedInt.length > 3) {

  }
  //some format cleanup on stats to make them presentable
  stats.avgEarned = numToMoney(stats.earned / stats.reviewCount);
  stats.earned = numToMoney(stats.earned);
  stats.startDate = stats.startDate.format("L");
  stats.recentDate = stats.recentDate.format("L");
  return ret;
}

var userList = new List('reviews', options, '');

function updateStats() {
  $('.statCnt').text('Reviews: ' + stats.reviewCount);
  $('.statEarned').text('Earned: ' + stats.earned);
  $('.statAvg').text('Average Earned: ' + stats.avgEarned);
  $('.statStart').text('Earliest Review: ' + stats.startDate);
  $('.statRecent').text('Latest Review: ' + stats.recentDate);
}

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
        updateStats();
      }
      else {
        this.value = '';
        $('#alert1').removeClass('hide');
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
      if (item[0].completed_at !== undefined) {
        return true;
      }
    }

    return false;
}

function numToMoney(x) {
    x = Math.round(x*100)/100;
    return '$' + x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}