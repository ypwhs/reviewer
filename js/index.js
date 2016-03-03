var options = {
  valueNames: [ 'id', 'completed_at', 'price' ],
  item: '<li>id: <span class="id"></span>' + 
        'completed: <span class="completed_at"></span>' + 
        'price: <span class="price"></span>' + 
        '</li>'
};

var values = [
  {
    "status": "completed",
    "result": "passed",
    "id": 1512,
    "project_id": 47,
    "grader_id": 64,
    "user_id": 1242,
    "notes": "I had trouble submitting the .ZIP file. Hopefully this worked.\nOther than that, I loved this project. What kept me motivated was my music and my focus to learn.",
    "repo_url": "https://github.com/Suhayl/Stage0",
    "created_at": "2015-03-10T00:26:40.860Z",
    "updated_at": "2015-03-11T21:18:20.040Z",
    "commit_sha": "b942a1955a6a7b0aac8f79019a5bd30020f497d2",
    "assigned_at": "2015-03-10T00:57:08.191Z",
    "price": "10.0",
    "completed_at": "2015-03-10T01:11:06.970Z",
    "archive_url": "https://udacity-github-sync-content.s3.amazonaws.com/1512_b942a1955a6a7b0aac8f79019a5bd30020f497d2.zip",
    "zipfile": {
      "url": null
    },
    "udacity_key": "5189535189434368",
    "held_at": null,
    "status_reason": null,
    "result_reason": null,
    "training_id": null,
    "files": [],
    "url": null,
    "annotation_urls": [],
    "general_comment": "",
    "hidden": false,
    "previous_submission_id": null,
    "nomination": null,
    "user": {
      "name": "Spider-Man"
    },
    "grader": {
      "name": "Dallas Frank"
    },
    "project": {
      "name": "Getting Started with HTML",
      "description": "Please carefully read the description and instructions to review this project [here](https://github.com/udacity/Project-Descriptions-for-Review/blob/master/Programming%20Foundations/Getting%20Started%20with%20HTML.md).",
      "nomination_eligible": false
    }
  }];

var userList = new List('reviews', options, values);

userList.add({
  completed_at: "Gustaf Lindqvist",
  id: 1983,
  price: ''
});