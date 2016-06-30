$(function () {
  var map = initializeMap();

  var containerToInfo={hotelOptionsContainer:["hotels", "hotelListId"],restaurantOptionsContainer:["restaurants","restaurantListId"],activitiesOptionsContainer:["activities","activitiesListId"]};
  var days=1;
  var itemId = 0;
  //var currentDay = 1;
  var dayArr = [{}, {}];
  // [{hotels: [hotel1, hotel2], restaurants: []...}, {hotels...}]

//Helper function adding element to parent

  function addElement(elementType,text,idOfParent,classes){
      var element = document.createElement(elementType);
      var textnode = document.createTextNode(text);
      element.appendChild(textnode);
      for(var i=0;i<classes.length;i++){
        $(element).addClass(classes[i]);
      }
      document.getElementById(idOfParent).appendChild(element);
      return element;
  }

  //Adding options - creates the dropdown menues
  // loop through each of the categories and create an option element, then append it to the appropriate parent, ie hotels, restaurants etc. 
  function addOptions (category, id) {
    for(var i = 0; i < category.length; i++) {
      addElement('OPTION',category[i].name,id,[]);
    }
  }
  addOptions(hotels, 'hotel-choices');
  addOptions(restaurants, 'restaurant-choices');
  addOptions(activities, 'activity-choices');

  function getCoordinates (category, val) {
  	for(var i = 0; i < category.length; i++) {
	  	if(category[i].name === val) {
	  		return category[i].place.location;
	  	}
    }
  }

  function addToItinerary (category, item, dayIndex) {
  	item.id = itemId;
  	itemId++;
  	if (dayArr[dayIndex][category]) {
  		dayArr[dayIndex][category].push(item);
  	} else {
  		dayArr[dayIndex][category] = [item];
  	}
  }

 function removeFromItinerary (category, item, dayIndex) {
 	var listOfAttractions = dayArr[dayIndex][category];
 	for(var i = 0; i < listOfAttractions.length; i++) {
 		if (listOfAttractions[i].id === item.id) {
 			dayArr[dayIndex][category].splice(i, 1);
 			break;
 		}
 	}
  }

  //Event Handlers - adds items to itinerary
  $(".btn").on("click",function(){
    var optionsContainer;
    var select;
    var val;
    //check that it's an add button
    if($(this).data("action")==="add"){
      //Get the data that we clicked on
      optionsContainer=$(this).parent(); 
      select=$(optionsContainer).children()[1];
      val=$(select).val(); // a string e.g. 'Andaz Wall Street'
      //Create the list item, including its children
      var element = document.createElement('DIV');
      $(element).addClass('itinerary-item');
      var spanElement = document.createElement('SPAN');
      var textnode = document.createTextNode(val);
      spanElement.appendChild(textnode);
      $(spanElement).addClass('title');
      var newButton = document.createElement('BUTTON');
      textnode = document.createTextNode('x');
      newButton.appendChild(textnode);
      $(newButton).addClass('btn btn-xs btn-danger remove btn-circle');
      element.appendChild(spanElement);
      element.appendChild(newButton);
      //Append the list item to the correct category in itinerary
      var info = containerToInfo[$(optionsContainer).attr('id')];
      var listId=info[1];
      // coordinates come from Place.location plus the category it belongs to
      var coordinates = getCoordinates(window[info[0]], val);
      var markerObj = drawMarker(info[0], coordinates, map);
      $(element).data('marker', markerObj);
      $(element).data('category', info[0]); //category = 'hotels'
      document.getElementById(listId).appendChild(element);
      //Add to itinerary
      var currentDay=getCurrentDay();
      addToItinerary(info[0],element,currentDay);
    } 

  });

  function getCurrentDay(){
  	return Number($('.current-day').text());
  }

  // Removes items from itinerary and from map
  $('.list-group').on('click', '.remove', function () {
  // handle it here        
  	  var category=$(this).parent().data('category');
  	  var currentDay=getCurrentDay();
  	  removeFromItinerary(category,$(this).parent()[0],currentDay);
      $(this).parent().data('marker').setMap(null);
  	  $(this).parent().remove();
  });

  //Switching days
  function switchDay (targetDay) {
  	//Sets the current-day class
	$('.current-day').removeClass('current-day');
	$(targetDay).addClass('current-day');
	//Displaying the correct itinerary
	//Empty the itinerary
	$('#hotelListId').empty();
	$('#restaurantListId').empty();
	$('#activitiesListId').empty();
	//Add the new stuff
	var currentDay=getCurrentDay();
	// hotels
	var hotelsArr=dayArr[currentDay]['hotels'] || [];
	for(var i=0;i<hotelsArr.length;i++){
		document.getElementById('hotelListId').appendChild(hotelsArr[i]);
	}
	// restaurants
	var restaurantsArr=dayArr[currentDay]['restaurants'] || [];
	for(var i=0;i<restaurantsArr.length;i++){
		document.getElementById('restaurantListId').appendChild(restaurantsArr[i]);
	}
	// activities
	var activitiesArr=dayArr[currentDay]['activities'] || [];
	for(var i=0;i<activitiesArr.length;i++){
		document.getElementById('activitiesListId').appendChild(activitiesArr[i]);
	}
	$('#displayed-day').text("Day "+$(targetDay).text());
  }


  $('#day-buttons').on('click','.day-btn',function(){
  	if(this.id!=="day-add"){
  		switchDay(this);
    }
  })


  // Adding days to itinerary - clicking on '+' button
  $('#day-add').on('click', function () {
  	days++;
  	//var element=addElement('BUTTON',days.toString(),'day-buttons',['btn btn-circle day-btn current-day']);
  	if (!dayArr[days]) {
  		dayArr[days] = {};	
  	} 
	var element = document.createElement('BUTTON');
    var textnode = document.createTextNode(days.toString());
    element.appendChild(textnode);
    $(element).addClass('btn btn-circle day-btn');
    switchDay(element);
  	$(element).insertBefore($(this));
  });

//Remove a day
 $('#day-killer').on('click', function () {
 	if (days >= 1) {
 		days--;
 	}
 	//remove the actual button
 	//grab the thing before it
 	var target;
 	var dayToDelete=getCurrentDay();
 	if($('.current-day').prev()[0]){
 		console.log('there are previous buttons');
 		target=$('.current-day').prev();
 	}
 	else{
 		if($('.current-day').next().id !== 'day-add'){
 			console.log('there is no prev but there are next');
 			target=$('.current-day').next();
 		}
 		else{
 			console.log('there is only the add button')
 			target=$('.current-day');
 		}
 	}
 	$('.day-btn:nth-last-child(2)').remove();
 	//switch the view to another day & display

 	//set the array for that day to {}
 	dayArr.splice(dayToDelete,1);

 	switchDay(target);



 });



})


//marker.setMap(null)


