# Udacity Completed Review Viewer

### Steps to get this working

1. Download/clone this repository and open the index.html file or open the [live version here](https://simplydallas.github.io/udacityreviewparser/).  (live version is recommended)
  * If you have already used this in the past and there has been an update, remember to force a refresh without browser cache.  The method for that depends but it is generally one of the following:
  ```
  Windows: ctrl + F5 or shift + F5
  Mac/Apple: Apple + R or command + R
  Linux: F5
  ```
2. Open the [Udacity reviewer dashboard](https://review.udacity.com/#!/submissions/dashboard) and make sure you are logged in
3. In the dev console (with the udacity dashboard in focus) paste the following code:

 ```javascript
copy($.ajax({
	method: 'GET',
	url: 'https://review-api.udacity.com/api/v1/me/submissions/completed.json',
	headers: { Authorization: JSON.parse(localStorage.currentUser).token },
	async: false
})
.done(function(data){console.log('The data should now be in your clipboard and ready to paste into the tool');})
.responseJSON)
 ```
  * Note: There is a small button at the top right of the web tool that will copy this code for you so you don't have to always come to the readme to get it.
  * Note 2: opening the dev console changes based on your browser but for chrome it is `Control+Shift+J` in windows and `Command+Option+j` on a Mac.
  * If you prefer to use your token so that you don't have to keep doing this every time, instead paste this in the console:
  ```
  copy(JSON.parse(localStorage.currentUser).token)
  ```  
4. Wait for the console to print that data should be in the clipboard now. (no waiting is necessary for token use. It is instant)
5. In the webpage/tool paste the JSON into the text box
6. If you want to start over, just refresh the page by hitting F5.
  * If you used a token instead of JSON, there will be a small refresh icon in the top right that you can use to update data without reloading the page.
  * A refresh from a load page should load faster than the initial token page load as it only grabs data older than 30 days if you have not refreshed in the last 30 days.  The initial page load grabs your full history and after that it will only refresh new data.
7. Your data is stored locally on your pc.
  * If you refresh after the first use you should see a button that says `Load locally stored data you last used`.
  * This will not pull fresh data from Udacity but it will let you see your last loaded data without getting it and pasting it again.
  * If you are using the token method, you will see a button that says: `Get data from token you last used`.  This will fetch new data from Udacity without you having to go back to the site or reload.

### Theme

* The default theme can be toggled off to show a mostly white layout similar to the default Udacity or Bootstrap theme.  Just click the little paintbrush in the top right.  It will remember your preference for next time.

### Restoring Dates on Refresh

* You can toggle between three options for keeping your current date filter after a refresh by clicking the calendar icon in the top right in the navbar.
  * Calendar with &#10134; will save your from date but not your to date.  This is the default option and is good for if you want to see all of the newest data but you already selected a newer from date.  Example, if you want to see the current month but want all the newest reviews to show, this is the best option.
  * Calendar with &#10003; will save your current dates and use those after refreshign data.  This is good if you are looking at a specific week or month and don't want to select it again
  * Calendar with &#10006; will not save your dates and will reset to the max date range of the data on each refresh.  This ensures you see all of your reviews after every refresh.

### The following information is presented

* review id
  * id is the default sort item and is in descending order
  * a click on the id will opan a modal with detail information and links to the original review, zip file, and more.
* date of review completion
  * Dates are in local format thanks to momentjs
  * The completion time for this project shows as a popover on hovering over the completion date
* price associated with the review at the time it was completed
* result of the review
  * If the student left feedback, this will have a popover on hover containing the rating and any feedback note
* The name of the project reviewed

#### Basic overall stats are shown on the navbar / header

* Total count of reviews (dropdown menu shows total per project and %)
* Total earned amount
  * Dropdown menu shows total per project and %
* Average earned per review
* Average time from assigned to completion
  * Dropdown menu shows average per project and % comparison of averages
* Earliest review date
* Most recent review date.

note: stats are based off current search and date filter.  This is throttled a little but performance has bot been tested on slow devices when filtering large histories.  Feedback is welcome.

### Search and filter options

* There is a date filter.  This defaults to the earliest and most recent review seen but can be changed by clicking in the texbox and either typing a date or using the date picker.  All dates should be in your local format but bear in mind that the actual date information will be in Udacity's time-zone, which is Pacific US time.
* You can click on the earliest and latest dates in the navbar to set your to or from filter back to the unfiltered dates quickly.
* There are two search boxes where you can search for text from any of the visible data points to narrow down your results.
  * Strict Search is your standard search that will only show things with `excd` in a field if you search for `excd` (so probably nothing).
  * Fuzzy Search is a proximity search and works closer to what you see in a web search engine.  `excd` will return things like `exceeded` as well as anything that says `excd`.
  * The two types of search are exclusive and only one can be used at a time but either search will work on the current list filter so it will not break your date filter selections.

### known issues and caveats

* If you have a review without a valid completion date it will be filtered out regardless of your date range filter after the first change to the filter.  To get it back you have to refresh to see your list with no filter for now.
* The average completion time may be odd for some reviews.  This stat is based on the duration between assigned time and completed time.  I have at least one review that shows a huge duration (5+ days).  I am not sure how common this is or if it is caused by resubmits or possibly reviews unassigned and reclaimed later.  Whatever the case, it throws off the average quite a bit when it happens for obvious reasons.

### Possible enhancements (feel free to pull requests these or anything else you find useful and we will discuss it)

* Possibly change result column to feedback with result hover instead of the other way around once more than 30 days of history is enabled for feedback (supposed to be next week).
* Parse results to more reviewer familiar terms.  Meets instead of passes, etc.
* Use of D3 for graph of earnings or other interesting data.
* Possibly deprecate the manual JSON based load in favor of autoloading when there is a known token now that feedback will be included when pulled by token.
  * Would fall back to stored JSON when no connection is available.
  * note: currently set to autoload if token is available as a rouch temp approach to this now that the API has cors headers.

-Dallas Frank