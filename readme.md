# Udacity Completed Review Viewer

### Steps to get this working

1. Download/clone this repository and open the index.html file or open the [live version here](https://simplydallas.github.io/udacityreviewparser/).  (live version is recommended)
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
4. Wait for the console to print that data should be in the clipboard now.
5. In the webpage/tool paste the JSON into the text box
6. If you want to start over, just refresh the page by hitting F5.
  * There is no clear function right now.
7. Your data is stored locally on your pc.
  * If you refresh after the first use you should see a button that says `Load locally stored data from your last visit`.
  * This will not pull fresh data from Udacity but it will let you see your last loaded data without getting it and pasting it again.

### The following information is presented

* review id
  * id is the default sort item and is in descending order
  * a click on the id will opan a modal with detail information and links to the original review, zip file, and more.
* date of review completion
  * Dates are in local format thanks to momentjs
  * The completion time for this project shows as a popover on hovering over the completion date
* price associated with the review at the time it was completed
* result of the review
  * If the student left an initial note this will have a popover on hover containing that note
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
* There is a search box where you can search for text from any of the visible data points to narrow down your results.  Search works on the current list filter so it will not break your date selection.

### known issues and caveats

* If you have a review without a valid completion date it will be filtered out regardless of your date range filter after the first change to the filter.  To get it back you have to refresh to see your list with no filter for now.
* The average completion time may be odd for some reviews.  This stat is based on the duration between assigned time and completed time.  I have at least one review that shows a huge duration (5+ days).  I am not sure how common this is or if it is caused by resubmits or possibly reviews unassigned and reclaimed later.  Whatever the case, it throws off the average quite a bit when it happens for obvious reasons.

### Possible enhancements (feel free to pull requests these or anything else you find useful and we will discuss it)

* Make data refresh without pasting JSON all the time.
  * Need Udacity to add CORs headers first, then a token could be saved and reused instead.
* Use of D3 for graph of earnings or other interesting data.
* Decide max number of list items per page based on window height.

-Dallas Frank