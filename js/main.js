/**
 * options for listjs including an ugly html template to use
 * for the list itself when parsing in items from Udacity data
 */
var options = {
  valueNames: [ 'id', { name: 'link', attr: 'href' },
                { name: 'notes', attr: 'data-content'},
                'completedDate', 'price', 'result', 'name', ],
  page: 15,
  plugins: [ ListPagination({outerWindow: 1}) ],  
  item: '<li class="list-group-item"><div class="row">' +
        '<div class="col-sm-2 col-xs-2">' +
        '<a class="link" target="_blank"><span class="id"></span></a>' + 
        '</div><div class="col-sm-2 col-xs-2">' +
        '<span class="completedDate"></span>' + 
        '</div><div class="col-sm-2 col-xs-2">' +
        '<span class="price"></span>' + 
        '</div><div class="col-sm-2 col-xs-2">' +
        '<span class="result notes" data-placement="auto top" ' +
        'data-toggle="popover"' +
        'data-trigger="hover"></span>' +
        '</div><div class="col-sm-4 col-xs-4">' +
        '<span class="name"></span>' + 
        '</div></div>' +
        '</li>'
};


/**
 * this holds our user stats while we work on them before displaying
 */
var stats = {
  reviewCount: 0,
  earned: 0,
  avgEarned: 0,
  startDate: moment('2999-01-01'),
  recentDate: moment('1980-01-01'),
  projects: []
};

/**
 * parses a javascrip object and manipulates it some for use
 * in the searchable list
 * @param  {object} vals javascript object containing Udacity data from JSON
 * @return {object} parsed and somewhat modified javascript object
 */
var parseVals = function(vals) {
  var ret = JSON.parse(JSON.stringify(vals));
  stats.reviewCount += ret.length; //total reviews
  ret.forEach(function(review){
    //linkify id
    review.link = "https://review.udacity.com/#!/reviews/" + review.id;
    //date stuff
    var dateComp = moment(review.completed_at);
    if (stats.startDate.isAfter(dateComp, 'day')) stats.startDate = dateComp;
    if (stats.recentDate.isBefore(dateComp, 'day')) stats.recentDate = dateComp;
    review.completedDate = dateComp.format("L");
    //pull the project name to top the top level
    review.name = review.project.name;
    if (!nameInArr(review.name, stats.projects)) {
      stats.projects.push({name: review.name, earned: 0, count: 0});
    }
    //money stuff
    var proj = findNameInArr(review.name, stats.projects);
    proj[0].earned += +review.price;
    proj[0].count += 1;
    stats.earned += +review.price;
    review.price = numToMoney(+review.price);
  });
  var earnedInt = parseInt(stats.earned);
  if (''+earnedInt.length > 3) {

  }
  //some format cleanup on stats to make them presentable
  cleanStatsProjects(); //needs to be first as it relies on unmutated numbers
  stats.reviewCount = numWithComs(stats.reviewCount);
  stats.avgEarned = numToMoney(stats.earned / stats.reviewCount);
  stats.earned = numToMoney(stats.earned);
  stats.startDate = stats.startDate.format("l");
  stats.recentDate = stats.recentDate.format("l");
  return ret;
};

/**
 * do some formatting on the stats.project subobject so
 * it is easier to display in the DOM
 */
function cleanStatsProjects() {
  stats.projects.forEach(function(project) {
    project.earnedPerc = '' + Math.round(project.earned / stats.earned * 1000) / 10 + '%';
    project.countPerc = '' + Math.round(project.count / stats.reviewCount * 1000) / 10 + '%';    
    project.earned = numToMoney(project.earned);
    project.count = numWithComs(project.count);
  });
}

var userList = new List('reviews', options, '');

userList.on('updated', listUpdate);

/**
 * Handle items that should be run whne the list updates
 * TODO: consider a short throttle to avoid double updates
 */
function listUpdate() {
  handleHover();
  updateSearchEarned();
}

/**
 * updates .statSearchEarned with the sum of matching projects
 */
function updateSearchEarned() {
  var sum = 0;
  userList.matchingItems.forEach(function(item) {
    sum += +item._values.price.substring(1);
  });
  var startStr = 'Search Sum: <span class="text-success">';
  var endStr = ' (' + userList.matchingItems.length + ')</span>';
  $('.statSearchEarned').html(startStr + numToMoney(sum) + endStr);
}

/**
 * update the various navbar dom elements with stat information
 */
function updateStats() {
  var spnSt = '<span class="text-success">';
  $('.statCnt').html('Reviews: ' + spnSt + stats.reviewCount + '</span>');
  $('.statEarned').html('Earned: ' + spnSt + stats.earned + '</span>');
  $('.statAvg').html('Average: ' + spnSt + stats.avgEarned + '</span>');
  $('.statStart').html('Earliest: ' + spnSt + stats.startDate + '</span>');
  $('.statRecent').html('Latest: ' + spnSt + stats.recentDate + '</span>');
  //also apply dates to the date picker
  initDatePicker();
  var projStr = '';
  var projStr2 = '';
  var projPre = '<li><a href="#">';
  var projSuf = '</a></li>';
  stats.projects.forEach(function(project) {
    //earned stuff
    projStr += projPre + project.name + ': ' + project.earned + ' (' +
    project.earnedPerc + ')' + projSuf;
    //count stuff
    projStr2 += projPre + project.name + ': ' + project.count + ' (' +  
    project.countPerc + ')' + projSuf;    
  });
  $('.earnedDD').html(projStr);
  $('.countDD').html(projStr2);
}

/**
 * Keypress event to capture enter key in the textarea
 * that is used to input JSON data as text from Udacity
 */
$('#jsonInput').keypress(function(event) {
    // Check the keyCode and if the user pressed Enter (code = 13) 
    if (event.keyCode == 13) {
      if(isJson(this.value)) {
        //store this data in case we want to reload it
        localStorage.setItem('lastJSON', this.value);
        handleData(this.value);
        this.value = '';
      }
      else {
        this.value = '';
        $('#alert1').removeClass('hide');
      }
    }
});

/**
 * initialization function that kicks off various tasks
 * once varified data has been fed in from user input or local storage
 * @param  {string} dataStr [the JSON data in string format]
 */
function handleData(dataStr) {
  userList.add(parseVals(JSON.parse(dataStr)));
  userList.sort('id', { order: "desc" });
  $('.jumbotron').addClass('hide');
  $('#reviewsRow').removeClass('hide');
  $('.dropdown').removeClass('hide');
  $('.navbar-brand').addClass('visible-xs');
  $('.search').focus();
  updateStats();
  handleHover();
}

/**
 * tooltip/popover are only initialized for currently visible
 * dom elements.  So every time we update what is visible this
 * is run again to ensure new elements have their popover
 */
function handleHover() {
  $('.notes:not([data-content="null"],[data-content=""])')
  .popover({container: 'body'}).addClass('hoverable');
}


/**
 * Check if an object is valid Udacity JSON in string format
 * @param  {string} item [object to test]
 * @return {Boolean}
 */
function isJson(item) {
    item = typeof item !== "string" ?
        JSON.stringify(item) :
        item;

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


/**
 * convert a number to monetary format with $ and commas
 * will also work with a number parsable string as input
 * @param  {number} num [number to convert to money string]
 * @return {string}   [string in format of $1,000.00]
 */
function numToMoney(num) {
    num = Math.round(num*100)/100;
    return '$' + numWithComs(num);
}

/**
 * add commas to numbers at 3 character intervals
 * also works with a number parsable string
 * @param  {number} num [number to convert to string]
 * @return {string}     [number with commas added]
 */
function numWithComs(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


/**
 * look for a given name in an array.  return true if found
 * @param  {string} name string to look for
 * @param  {array} arr  array to look for a string in
 * @return {boolean}
 */
function nameInArr(name, arr)
{
    var test = findNameInArr(name, arr);
    return (test.length > 0);
}


/**
 * look for a given name in an array.  The format of the array
 * is taken for granted to include a name as a first level key
 * @param  {string} name string to look for
 * @param  {array} arr  array to look for a string in
 * @return {object} object containing the name or a 0 length object
 */
function findNameInArr(name, arr) {
  return $.grep(arr, function(e){ return e.name == name; });
}

/**
 * initialize the datepicker for date filtering and add an event listener
 */
function initDatePicker() {
  $('.fromDate').val(stats.startDate);
  $('.toDate').val(stats.recentDate);
  $('.input-daterange').datepicker({
      //this will get local date format pattern from moment
      format: moment.localeData().longDateFormat('L').toLowerCase(),
      todayHighlight: true
  }).on('changeDate', function(e) {
      filterListDates();
  });;
}

function filterListDates(){
  var f = moment($('.fromDate').datepicker('getDate')).subtract(1, 'day');
  var t = moment($('.toDate').datepicker('getDate')).add(1, 'd');
  userList.filter(function(item) {
    return moment(item.values().completed_at).isBetween(f, t);
  });
}

/**
 * click handler for the button that loads previously saved
 * user data from localStorage
 */
$('#lastData').click(function(){
  var oldData = localStorage.getItem('lastJSON');
  if (isJson(oldData)) {
    handleData(oldData);
  }
  else {
    $('#alert2').removeClass('hide');    
  }
});

/**
 * click handler for the earliest date in navbar
 */
$('.statStart').click(function(){
  $('.fromDate').datepicker('setDate', stats.startDate);
});

/**
 * click handler for the recent date in navbar
 */
$('.statRecent').click(function(){
  $('.toDate').datepicker('setDate', stats.recentDate);
});

/**
 * runs when the page loads and checks if there is user data
 * in localStorage.  If so, unhide a button element
 */
$(function(){
  var oldData = localStorage.getItem('lastJSON');
  if (oldData != null) {
    $('#lastData').removeClass('hide');
  }
});