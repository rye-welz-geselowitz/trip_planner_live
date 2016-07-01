$(function () {
  //Data
  var map = initializeMap();
  var containerToInfo={hotelOptionsContainer:["hotels", "hotelListId"],restaurantOptionsContainer:["restaurants","restaurantListId"],activitiesOptionsContainer:["activities","activitiesListId"]};
  var days=1;
  var itemId = 0;
  var dayArr = [{}, {}];
  var noDaySelected=false;

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

  //Helper function getting coordinates
  function getCoordinates (category, val) {
  	for(var i = 0; i < category.length; i++) {
	  	if(category[i].name === val) {
	  		return category[i].place.location;
	  	}
    }
  }
  //Helper function adding to itinerary object (dayArr)
  function addToItinerary (category, item, dayIndex) {
  	item.id = itemId;
  	itemId++;
  	if (dayArr[dayIndex][category]) {
  		dayArr[dayIndex][category].push(item);
  	} else {
  		dayArr[dayIndex][category] = [item];
  	}
  }

  //Helper function removing from itinerary object (dayArr)
 function removeFromItinerary (category, item, dayIndex) {
 	var listOfAttractions = dayArr[dayIndex][category] || [];
   	for(var i = 0; i < listOfAttractions.length; i++) {
   		if (listOfAttractions[i].id === item.id) {
   			dayArr[dayIndex][category].splice(i, 1);
   			break;
   		}
   	}
  }

  //Helper function generates appropriate element
  function generateElement(val){
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
      return element;
  }

  //Helper function: Adds an item to itinerary
   function addItemToItinerary(optionsContainer,val,shouldUpdateModel){
      element=generateElement(val);
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
      if(shouldUpdateModel){
        addToItinerary(info[0],element,currentDay);
      }
  }

  //Helper function: Removes item from itinerary
  function removeItemFromItinerary(item,category,currentDay){
      removeFromItinerary(category,item[0],currentDay);
      item.data('marker').setMap(null);
      item.remove();  
  }

  //Helper function that empties an itinerary category
  function empty(id,category,currentDay){
    var children=$(id).children();
    for(var i=0;i<children.length;i++){
      removeItemFromItinerary($(children[i]),category,currentDay);
    }
  }

  //Helper function that populates an itinerary category
  function populate(id,category,currentDay){
      var categoryArr=dayArr[currentDay][category] || [];
      var val;
      for(var i=0;i<categoryArr.length;i++){
         val=$(categoryArr[i]).find("span").text();
         addItemToItinerary($(id),val,false);
      }
  }
  //Helper function: switches days
  function switchDay (targetDay,add) {
      //Sets the current-day class
    $('.current-day').removeClass('current-day');
    $(targetDay).addClass('current-day');
    var currentDay=$(targetDay).text();

    //Empty the itinerary
    empty('#hotelListId','hotels',currentDay);
    empty('#restaurantListId','restaurants',currentDay);
    empty('#activitiesListId','activities',currentDay);
    //Add the new stuff
    if(add){
      populate('#hotelOptionsContainer','hotels',currentDay);
      populate('#restaurantOptionsContainer','restaurants',currentDay);
      populate('#activitiesOptionsContainer','activities',currentDay);
      $('#displayed-day').text("Day "+$(targetDay).text());
    }
  }

  //Helper function: gets current day
  function getCurrentDay(){
    return Number($('.current-day').text());
  }

  //Event Handlers

  //adds items to itinerary
  $(".btn").on("click",function(){
    var optionsContainer;
    var select;
    var val;
    //check that it's an add button
    if($(this).data("action")==="add"&&(!noDaySelected)){
      //Get the data that we clicked on
      optionsContainer=$(this).parent(); 
      select=$(optionsContainer).children()[1];
      val=$(select).val(); // a string e.g. 'Andaz Wall Street'
      addItemToItinerary(optionsContainer,val,true);
    } 
  });

  // Removes items from itinerary and from map
  $('.list-group').on('click', '.remove', function () {
  // handle it here        
  	  var category=$(this).parent().data('category');
  	  var item=$(this).parent();
  	  var currentDay=getCurrentDay();
  	  removeItemFromItinerary(item,category,currentDay);

  });


  //Switching days

  $('#day-buttons').on('click','.day-btn',function(){
  	if(this.id!=="day-add"){
  		switchDay(this,true);
    }
  })


  // Adding days to itinerary - clicking on '+' button
  $('#day-add').on('click', function () {
   	$('#day-killer').show();
  	days++;
    noDaySelected=false;
  	if (!dayArr[days]) {
  		dayArr[days] = {};	
  	} 
	var element = document.createElement('BUTTON');
    var textnode = document.createTextNode(days.toString());
    element.appendChild(textnode);
    $(element).addClass('btn btn-circle day-btn');
    switchDay(element,true);
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
 		target=$('.current-day').prev();
 	}
 	else{
 		target=$('.current-day');
 	}
 	$('.day-btn:nth-last-child(2)').remove();
 	//switch the view to another day & display

 	//set the array for that day to {}
  if(dayArr.length===2){
    noDaySelected=true;
    switchDay(target,false);
    $('#displayed-day').text("No Day Selected");
    $('#day-killer').hide();  
  }
  dayArr.splice(dayToDelete,1);
 	if(dayArr.length!==1){
    switchDay(target,true);
  }
 });
})



