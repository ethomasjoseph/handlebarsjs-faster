"use strict"

var hello = function(hb) {
    //alert("Peppa Pig");
}

var getFakeData = function() {
    var people = [];
    people.push({"name": "Tom", "role": "Director"});
    people.push({"name" : "Gill", "role": "Producer"});
    people.push({"name" : "Nonny", "role": "Actor"});
    return { "people" : people };
}

hbfaster.isEnabled();
hbfaster.registerPreInitCallbacks("hello");
hbfaster.init();