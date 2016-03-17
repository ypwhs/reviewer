/**
 * A single object that will be globla exposed and house various sub objects
 */
var myGlobal = {
  stats: {},
  staticStats: {},
  timerTimeout: null,
  resizeTimeout: null,
  searchTimeout: null,
  spinner: new Spinner(),
  loadingNow: false
};

/**
 * options for listjs including an ugly html template to use
 * for the list itself when parsing in items from Udacity data
 */
var options = {
  valueNames: [ 'id',
                { name: 'notes', attr: 'data-content'},
                { name: 'duration', attr: 'data-content'},
                'completedDate', 'earned', 'result', 'name', ],
  page: 5,
  plugins: [ ListPagination({outerWindow: 1}),
             ListFuzzySearch() ],
  item: '<li class="list-group-item"><div class="row">' +
        '<div class="cell col-sm-2 col-xs-2">' +
        '<a href="javascript:;" class="link"><span class="id"></span></a>' +
        '</div><div class="cell col-sm-2 col-xs-2">' +
        '<span class="completedDate duration" data-placement="auto top" ' +
        'data-toggle="popover"' +
        'data-trigger="hover"></span>' +
        '</div><div class="cell col-sm-2 col-xs-2">' +
        '<span class="earned"></span>' +
        '</div><div class="cell col-sm-2 col-xs-2">' +
        '<span class="result notes" data-placement="auto top" ' +
        'data-toggle="popover"' +
        'data-trigger="hover"></span>' +
        '</div><div class="cell col-sm-4 col-xs-4">' +
        '<span class="name"></span>' +
        '</div></div>' +
        '</li>'
};

resetStats(); //initial fill of our stats object

/**
 * sets myGlobal.stats back to clean values
 */
function resetStats() {
  myGlobal.stats = {
    throttled: true,
    reviewCount: 0,
    earned: 0,
    avgEarned: 0,
    startDate: moment('2999-01-01'),
    recentDate: moment('1980-01-01'),
    duration: moment.duration(0),
    avgDuration: 0,
    projects: []
  };
}

/**
 * parses a javascrip object and manipulates it some for use
 * in the searchable list
 * @param  {object} vals javascript object containing Udacity data from JSON
 * @return {object} parsed and somewhat modified javascript object
 */
var parseVals = function(vals) {
  var ret = JSON.parse(JSON.stringify(vals));
  myGlobal.stats.reviewCount += ret.length; //total reviews
  ret.forEach(function(review){
    //linkify id
    review.link = "https://review.udacity.com/#!/reviews/" + review.id;
    //pull the project name to the top level
    review.name = review.project.name;
    review.earned = numToMoney(+review.price);
    review.completedDate = moment(review.completed_at).format("L");
    //date stuff
    var dateAssn = moment(review.assigned_at);
    var dateComp = moment(review.completed_at);
    var tempDur = moment.duration(dateComp.diff(dateAssn));

    review.duration = "Time to finish: " + pad(tempDur.hours()) + ":" +
                      pad(tempDur.minutes()) + ":" + pad(tempDur.seconds());
    review.rawDur = tempDur;

    parseReviewStats(review);

  });

  //some format cleanup on stats to make them presentable
  cleanStats(); //needs to be first as it relies on unmutated numbers

  return ret;
};

/**
 * parses the searchable list's current visible JS object to recalculate stats
 */
var reCalcStats = function() {
  var curItems = userList.matchingItems;

  resetStats();
  myGlobal.stats.reviewCount = curItems.length;

  curItems.forEach(function(reviewParent){
    parseReviewStats(reviewParent.values());
  });

  //some format cleanup on stats to make them presentable
  cleanStats(); //needs to be first as it relies on unmutated numbers
};

/**
 * Parses stats out of a single review and adjusts the stats object
 * @param  {object} review A single review object
 */
function parseReviewStats(review) {
  myGlobal.stats.duration.add(review.rawDur);
  var dateComp = moment(review.completed_at);
  if (myGlobal.stats.startDate.isAfter(dateComp, 'day')) myGlobal.stats.startDate = dateComp;
  if (myGlobal.stats.recentDate.isBefore(dateComp, 'day')) myGlobal.stats.recentDate = dateComp;

  if (!nameInArr(review.name, myGlobal.stats.projects)) {
    myGlobal.stats.projects.push({name: review.name, earned: 0,
                         count: 0, duration: moment.duration(0)});
  }
  //money stuff
  var proj = findNameInArr(review.name, myGlobal.stats.projects);
  proj[0].duration.add(review.rawDur);
  proj[0].earned += +review.price;
  proj[0].count += 1;
  myGlobal.stats.earned += +review.price;
}

/**
 * do some formatting on the stats.project subobject so
 * it is easier to display in the DOM
 */
function cleanStats() {
  //projects
  myGlobal.stats.projects.forEach(function(project) {
    project.earnedPerc = '' + Math.round(project.earned / myGlobal.stats.earned * 1000) / 10 + '%';
    project.countPerc = '' + Math.round(project.count / myGlobal.stats.reviewCount * 1000) / 10 + '%';
    project.durationPerc = '' + Math.round(project.duration / myGlobal.stats.duration * 1000) / 10 + '%';
    project.earned = numToMoney(project.earned);
    var pDur = moment.duration((project.duration/project.count));
    project.avgDuration = pad(pDur.hours()) + ":" + pad(pDur.minutes()) + ":" + pad(pDur.seconds());
    project.count = numWithComs(project.count);
  });
  //other
  myGlobal.stats.reviewCount = numWithComs(myGlobal.stats.reviewCount);
  myGlobal.stats.avgEarned = numToMoney(myGlobal.stats.earned / myGlobal.stats.reviewCount);
  myGlobal.stats.earned = numToMoney(myGlobal.stats.earned);
  myGlobal.stats.startDate = myGlobal.stats.startDate.format("l");
  myGlobal.stats.recentDate = myGlobal.stats.recentDate.format("l");
  var dur = moment.duration((myGlobal.stats.duration/myGlobal.stats.reviewCount));
  myGlobal.stats.avgDuration = pad(dur.hours()) + ":" + pad(dur.minutes()) + ":" + pad(dur.seconds());
}

//Instantiate the listjs list
var userList = new List('reviews', options, '');

/**
 * userList events that fire on a lot of updates
 * There is a shared throttle when used to avoid rapid duplicate events
 */
userList.on('searchComplete', listUpdate);
userList.on('filterComplete', listUpdate);
userList.on('sortComplete', listUpdate);

/**
 * Handle items that should be run whne the list updates
 */
function listUpdate() {
  if(!myGlobal.stats.throttled) {
    reCalcStats();
    updateStats();
    handleHover();
    setTimeout(function(){myGlobal.stats.throttled = false;}, 100);
  }
}

/**
 * update the various navbar dom elements with stat information
 */
function updateStats() {
  var spnSt = '<span class="text-success">';
  var spanSt2 = '<span class="text-success notes" data-placement="auto bottom" ' +
        'data-toggle="popover" data-trigger="hover" data-content="';
  $('.statCnt').html('Reviews: ' + spnSt + myGlobal.stats.reviewCount + '</span>');
  $('.statEarned').html('Earned: ' + spnSt + myGlobal.stats.earned + '</span>');
  $('.statAvg').html('Average: ' + spnSt + myGlobal.stats.avgEarned + '</span>');
  $('.statStart').html('Earliest: ' + spanSt2 + "Overall Earliest: " +
                       myGlobal.staticStats.startDate + '">' + myGlobal.stats.startDate + '</span>');
  $('.statRecent').html('Latest: ' + spanSt2 + "Overall Latest: " +
                        myGlobal.staticStats.recentDate + '">' + myGlobal.stats.recentDate + '</span>');
  $('.statAvgTime').html('<span class="hidden-sm">Average </span>Time: ' + spnSt + myGlobal.stats.avgDuration + '</span>');

  //also apply dates to the date picker
  initDatePicker();
  var projStr = '';
  var projStr2 = '';
  var projStr3 = '';
  var projPre = '<li><a href="javascript:;">';
  var projSuf = '</a></li>';
  myGlobal.stats.projects.forEach(function(project) {
    //earned stuff
    projStr += projPre + project.name + ': ' + project.earned + ' (' +
    project.earnedPerc + ')' + projSuf;
    //count stuff
    projStr2 += projPre + project.name + ': ' + project.count + ' (' +
    project.countPerc + ')' + projSuf;
    //duration stuff
    projStr3 += projPre + project.name + ': ' + project.avgDuration + ' (' +
    project.durationPerc + ')' + projSuf;
  });
  $('.earnedDD').html(projStr);
  $('.countDD').html(projStr2);
  $('.avgTimeDD').html(projStr3);
}

/**
 * Keypress event to capture enter key in the textarea
 * that is used to input JSON data as text from Udacity
 */
$('#jsonInput').keypress(function(event) {
    // Check the keyCode and if the user pressed Enter (code = 13)
    if (event.keyCode == 13 && !myGlobal.loadingNow) {
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
 * Keypress event to capture enter key in the textarea
 * that is used to input api auth token as text from Udacity
 */
$('#tokenInput').keypress(function(event) {
    // Check the keyCode and if the user pressed Enter (code = 13)
    if (event.keyCode == 13 && !myGlobal.loadingNow) {
      handleToken(this.value);
      this.value = '';
    }
});

/**
 * Get JSON from a token using a CORS proxy
 * @param  {string} token user auth token from Udacity
 */
function handleToken(token) {
  startSpin(200);
  localStorage.setItem('lastToken', token);

  $.ajaxPrefilter(function(options) {
      if (options.crossDomain && jQuery.support.cors) {
          options.url = 'https://corsproxy-simplydallas.rhcloud.com/' + options.url;
      }
  });
  var startDate = moment().subtract(10,'days').format();
  $.ajax({method: 'GET',
    url: 'https://review-api.udacity.com/api/v1/me/submissions/completed.json',
    // data: { start_date: startDate},
    headers: { Authorization: token }
  })
  .done(function(data){
    stopSpin();
    var resJSON = JSON.stringify(data);
    if(isJson(resJSON)) {
      localStorage.setItem('lastJSON', resJSON);  
      if(userList.size()) {
        $('.search').val('');
        userList.clear();
        resetStats();
        userList.search();
      }
      handleData(resJSON);
    }
    else {
      $('#alert1').removeClass('hide');
      localStorage.removeItem('lastToken');
      $('#lastToken').addClass('hide');
    }
  })
  .fail(function(error){
    stopSpin();
    $('#alert3').removeClass('hide');
    //TODO, decide if this should be permanently removed or not
    //localStorage.removeItem('lastToken');
    $('#lastToken').addClass('hide');
  });
}

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
  $('.copyCode').addClass('hide');
  if(localStorage.getItem('lastToken') !== null) $('.refreshData').removeClass('hide');
  myGlobal.staticStats = JSON.parse(JSON.stringify(myGlobal.stats));
  updateStats();
  handleHover();
  //fit the list to our current page state
  userList.page = getPageSize();
  userList.update();

  //remove the throttle on filter updates to the navbar
  setTimeout(function(){myGlobal.stats.throttled = false;}, 100);
}

/**
 * tooltip/popover are only initialized for currently visible
 * dom elements.  So every time we update what is visible this
 * is run again to ensure new elements have their popover
 */
function handleHover() {
  $('.popover').remove(); //be sure no popovers are stuck open
  $('.notes:not([data-content="null"],[data-content=""])')
  .popover({container: 'body'}).addClass('hoverable');
  $('.duration').popover({container: 'body'}).addClass('hoverable');
}

/**
 * Fills the modal with review details and then shows it
 * @param  {int} The review id to show in the modal
 */
function handleModal(id) {
  var data = userList.get('id', id)[0].values();
  var list = $('.modal-list');
  var pre = '<li class="list-group-item">';
  var content = pre + 'Review ID: ' + '<a target="_blank" href="' +
                data.link + '">' + data.id + '</a></li>' +
    pre + 'Project Title: ' + data.project.name +
          ' (ID: ' + data.project_id + ')</li>' +
    pre + 'Project Status: ' + data.status +
          ' (Earned: ' + data.earned + ')</li>' +
    pre + 'Grader: ' + data.grader.name +
          ' (ID: ' + data.grader_id + ')</li>' +
    pre + 'User: ' + data.user.name +
          ' (ID: ' + data.user_id + ')</li>' +

    pre + 'Created: ' + moment(data.created_at).format('llll') + '</li>' +
    pre + 'Assigned: ' + moment(data.assigned_at).format('llll') + '</li>' +
    pre + 'Completed: ' + moment(data.completed_at).format('llll') + '</li>' +
    pre + 'Updated: ' + moment(data.updated_at).format('llll') + '</li>' +
    pre + data.duration + '</li>';
    if (data.repo_url) {
      content += pre + '<a target="_blank" href="' + data.repo_url + '">Student Repo</a></li>';
    }
    if (data.archive_url) {
      content += pre + '<a target="_blank" href="' + data.archive_url + '">Student Zip Archive</a></li>';
    }
    // Removed until I can figure out if this is a valid url still
    // and if so, what the prefix is.
    // if (data.zipfile.url) {
    //   content += pre + '<a target="_blank" href="' + data.zipfile.url + '">Zip File</a></li>';
    // }
    if (data.notes) {
      content += pre + 'Student General Note: ' + marked(data.notes) + '</li>';
    }
    if (data.general_comment) {
      content += pre + 'Grader General Comment: ' + marked(data.general_comment) + '</li>';
    }
    //start section that is likely to be null
    if (data.status_reason) {
      content += pre + 'Status Reason: ' + marked(data.status_reason) + '</li>';
    }
    if (data.result_reason) {
      content += pre + 'Result Reason: ' + marked(data.result_reason) + '</li>';
    }
    if (data.training_id) {
      content += pre + 'Training ID: ' + data.training_id + '</li>';
    }
    if (data.url) {
      content += pre + 'URL: ' + data.url + '</li>';
    }
    if (data.annotation_urls.length > 0) {
      content += pre + 'Annotation URLs: ' + annotation_urls + '</li>';
    }
    if (data.previous_submission_id) {
      content += pre + 'URL: ' + data.previous_submission_id + '</li>';
    }
    if (data.nomination) {
      content += pre + 'URL: ' + data.nomination + '</li>';
    }
    //end likely to be null section
    content += pre + 'Udacity Key: ' + data.udacity_key + '</li>';

  list.html(content);
  $('.modal').modal();
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
  var updated = false;
  var startNow = moment($('.fromDate').datepicker('getDate')).format("l");
  if (startNow !== myGlobal.stats.startDate) {
    $('.fromDate').datepicker('setDate', myGlobal.staticStats.startDate);
    updated = true;
  }
  var endNow = moment($('.toDate').datepicker('getDate')).format("l");
  if (endNow !== myGlobal.stats.recentDate) {
    $('.toDate').datepicker('setDate', myGlobal.staticStats.recentDate);
    updated = true;
  }
  //userList.filter() doesn't impact search but is useful if there are
  //invalid dates user may want to see still.  It should not be run if no
  //dates above were changed since it mucks with pagination.
  if(updated) {
    userList.filter();
    $('.input-daterange').datepicker({
        //this will get local date format pattern from moment
        format: moment.localeData().longDateFormat('l').toLowerCase(),
        todayHighlight: true,
        autoclose: true
    }).on('changeDate', function(e) {
        filterListDates();
    }); 
  }
}

/**
 * Filters the review history list based on dates in the datepicker
 */
function filterListDates(){
  var f = moment($('.fromDate').datepicker('getDate')).subtract(1, 'day');
  var t = moment($('.toDate').datepicker('getDate')).add(1, 'd');
  userList.filter(function(item) {
    return moment(item.values().completed_at).isBetween(f, t, 'day');
  });
}

/**
 * click handler for the button that loads previously saved
 * user data from localStorage
 */
$('#lastData').click(function(){
  if (!myGlobal.loadingNow) {
    var oldData = localStorage.getItem('lastJSON');
    if (isJson(oldData)) {
      handleData(oldData);
    }
    else {
      $('#alert2').removeClass('hide');
    }
  }
});

/**
 * click handler for the button that loads previously saved
 * user data from localStorage
 */
$('#lastToken').click(function(){
  if (!myGlobal.loadingNow) {
    var oldToken = localStorage.getItem('lastToken');
    handleToken(oldToken);
  }
});

/**
 * click handler for the earliest date in navbar
 */
$('.statStart').click(function() {
  $('.fromDate').datepicker('setDate', myGlobal.staticStats.startDate);
});

/**
 * click handler for the recent date in navbar
 */
$('.statRecent').click(function() {
  $('.toDate').datepicker('setDate', myGlobal.staticStats.recentDate);
});

/**
 * click handler for the helper code button in navbar
 */
$('.copyCode').click(function() {
  copyCodeToClipboard();
  $(this).find('.fa').addClass('pulse');
  setTimeout(function(){
    $('.copyCode').find('.fa').removeClass('pulse');
    }, 200);
});

/**
 * click handler for the data refresh in navbar
 */
$('.refreshData').click(function() {
  refreshData();
  $(this).find('.fa').addClass('pulse');
  setTimeout(function(){
    $('.refreshData').find('.fa').removeClass('pulse');
    }, 200);  
});

/**
 * click handler for id links to open modal for that id
 * set to inherit event from main list since these are
 * dynamic appends
 */
$('#main-list').on('click', '.id', function() {
  handleModal(this.innerHTML);
});

/**
 * Custom search keypress handler to allow restricting search
 * to specific fields only and throttle input
 */
$('.my-search').on('propertychange input', function() {
  $('.my-fuzzy-search').val("");
  clearTimeout(myGlobal.searchTimeout);
  //use 200ms timer to check when active typing has ended
  myGlobal.searchTimeout = setTimeout(function(){
    var filterArr = ['id', 'completedDate', 'earned', 'result', 'name'];
    userList.search($('.my-search').val(), filterArr);
  }, 200);
});

/**
 * Custom search keypress handler to allow restricting fuzzy-search
 * to specific fields only and throttle input
 */
$('.my-fuzzy-search').on('propertychange input', function() {
  $('.my-search').val("");
  clearTimeout(myGlobal.searchTimeout);
  //use 200ms timer to check when active typing has ended
  myGlobal.searchTimeout = setTimeout(function(){
    var filterArr = ['id', 'completedDate', 'earned', 'result', 'name'];
    userList.fuzzySearch.search($('.my-fuzzy-search').val(), filterArr);
  }, 200);  
});

/**
 * runs when the page loads and checks if there is user data
 * in localStorage.  If so, unhide a button element
 */
$(function() {
  var oldData = localStorage.getItem('lastJSON');
  if (oldData != null) {
    $('#lastData').removeClass('hide');
  }
  var oldToken = localStorage.getItem('lastToken');
  if (oldToken != null) {
    $('#lastToken').removeClass('hide');
  }  
});

/**
 * initialize popover for navbar help buttons here so they are only done once
 */
$('.help').popover({container: 'body'});

/**
 * pad a number to ensure it is 2 digits.
 * Important: Assumes 1 or 2 digit string format number.
 * @param  {string} str input string
 * @return {string}     padded output string
 */
function pad(str) {
  return ("0" + str).slice(-2);
}

/**
 * Copies the helper code to user's clipboard silently
 * No flash fallback or anything.  It is assumed reviewers
 * are using a decent modern browser, preferably chrome
 */
function copyCodeToClipboard() {

  //this works by adding a hidden element, copying from that
  //and then removing the element when done.  Clunky but silent.
    var aux = document.createElement("textarea");

    aux.cols = "400";
    aux.rows = "100";

    aux.value = "copy($.ajax({" +
      "method: 'POST'," +
      "url: 'https://review-api.udacity.com/api/v1/me/submissions/completed.json'," +
      "headers: { Authorization: JSON.parse(localStorage.currentUser).token }," +
      "async: false" +
      "}).done(function(data){console.log('The data should now be in your clipboard " +
      "and ready to paste into the tool');}).responseJSON)";

    document.body.appendChild(aux);
    aux.select();
    document.execCommand("copy");
    document.body.removeChild(aux);
}

function refreshData() {
  if (!myGlobal.loadingNow) {
    var oldToken = localStorage.getItem('lastToken');
    if (oldToken != null) {
      handleToken(oldToken);
    }
    else{
      var oldData = localStorage.getItem('lastData');
      if (oldData != null) {
        userList.clear();
        resetStats();
        handleData(oldData);
      }
      else {
        window.alert("No valid token or data found in localStorage!");
      }      
    }
  }
}

/**
 * Begins an AJAX loading spinner after a set delay
 * The delay is to avoid flashing it for very fast responses
 * Also prevents further clicking actions on input boxes/buttons
 * @param  {number} delay number of milliseconds to delay before spinning
 */
function startSpin(delay) {
    myGlobal.loadingNow = true;

    if (myGlobal.spinner == undefined ) {
        myGlobal.spinner = new Spinner();
    }
    myGlobal.timerTimeout = setTimeout(function() { 
        myGlobal.spinner.spin(document.getElementById('spin-target'));
    }, delay);
}

/**
 * Stops the AJAX loading spinner and removes any pending spin timeout
 * Also restores clicking actions on input boxes/buttons
 */
function stopSpin() {
    clearTimeout(myGlobal.timerTimeout);
    myGlobal.spinner.stop();
    myGlobal.loadingNow = false;
}

/**
 * decides the number of items to show based on the current window
 * innerHeight
 * @return {number} the number of items to show
 */
function getPageSize() {
  //assume a height of 32, but if we already have renderred items
  //use their height since zoom throws it off
  var itemSize = $('.list-group-item:first').outerHeight(true);
  itemSize = Math.max(itemSize, 32);
  var filterSize = $('.filter-row').outerHeight(true);
  var buttonSize = $('.button-row').outerHeight(true);  
  var pageSize = $('.pagination').outerHeight(true);
  var navSize = $('#navbar').outerHeight(true);
  var listMargins = 22;
  var wiggleRoom = 25;
  var baseSize = filterSize + buttonSize + pageSize +
                 navSize + listMargins + wiggleRoom;

  var rawNum = (window.innerHeight - baseSize) / itemSize;
  return Math.max(rawNum, 5)  //show 5 items or more always
}

/**
 * window resize event so that we can adjust list item number per
 * page to fit any size window within reason
 */
window.onresize = function(){
  clearTimeout(myGlobal.resizeTimeout);
  //prevent scrollbar on resize and restore after resize ends
  $('html, body').css('overflow-y', 'hidden');
  //use 100ms timer to check when active resizing has ended
  myGlobal.resizeTimeout = setTimeout(function(){
    $('html, body').css('overflow-y', 'visible');
    userList.page = getPageSize();
    userList.update();
    userList.show(1, userList.page);
  }, 100);
};
