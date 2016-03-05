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
}).responseJSON)
 ```
 
4. Wait for the console to echo the word `undefined` which means your result is now in your clipboard
5. In the webpage/tool paste the JSON into the text box
6. If you want to start over, just refresh the page.  There is no clear function right now
7. Your data is stored locally on your pc.  If you refresh after the first use you should see a button that says `Load locally stored data from your last visit`.  This will not pull fresh data from Udacity but it will let you see your last loaded data without getting it and pasting it again.

### The following information is presented

* review id (this is the default sort item and links to the original review)
* date review completed
* price associated with the review
* result of the review (if the student left a note this will)
* The name of the project reviewed

#### Basic overall stats are shown on the navbar / header

* Total count of reviews (dropdown menu shows total per project and %)
* Total earned amount (dropdown menu shows total per project and %)
* Average earned per review
* Earliest review date
* Most recent review date.
* Total earned by reviews matching current search (and a count).

### Search and filter options

* There is a date filter.  This defaults to the earliest and most recent review seen but can be changed by clicking in the texbox and either typing a date or using the date picker.  All dates should be in your local format but bear in mind that the actual date information will be in Udacity's time-zone, which is Pacific US time.
* You can click on the earliest and latest dates in the navbar to set your to or from filter back to those dates quickly.
* There is a search box where you can search for text from any of the data points to narrow down your results.  Search works on the current list filter so it will not break your date selection.

### known issues and caveats

* The tool may find things that don't quite seem to make sense when you search.  For example, if your student's name was Jeff and you type `jeff` into the search it will find that review but you won't be able to see the student name.  This is probably not ideal behavior but I haven't decided if I want to restrict the searched fields yet and showing all data is not currently planned.
* If you have a review without a valid completion date it will be filtered out regardless of your date range filter after the first change to the filter.  To get it back you have to refresh to see your list with no filter for now.

### Possible enhancements (feel free to pull requests these or anything else you find useful and we will discuss it)

* Stats that update fully based on filter and search rather than just the Search sum.
* Show more data details as a modal popup or other measure outside of the column list.
* Use of D3 for graph of earnings or other interesting data.

-Dallas Frank