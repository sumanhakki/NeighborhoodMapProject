        //Data 
        var skiResorts = [{
                name: "Breckenridge Ski Resort",
                lat: 39.4776043,
                lng: -106.1135843,
                id: "49da5cd2f964a5207b5e1fe3"
            },
            {
                name: "Arapahoe Basin",
                lat: 38.9455926,
                lng: -106.758959,
                id: "4acf609ef964a5204cd320e3"
            },

            {
                name: "Copper Mountain",
                lat: 38.8430784,
                lng: -107.7956032,
                id: "4ae47be5f964a520dc9a21e3"
            },
            {
                name: "Aspen Mountain Lodge",
                lat: 39.1794709,
                lng: -106.8606954,
                id: "4bc3eefddce4eee1b5d2719d"
            },
            {
                name: "Ski Silverthorn Lodge",
                lat: 39.6188501,
                lng: -106.0774067,
                id: "53971521498ea18b1cb06405"
            }
        ];

        /* Initialize map with specific region and load it in the window */
        var map;
        var markers = [];


        var initMap = function() {
            try {
                map = new google.maps.Map(document.getElementById('map-canvas'), {
                    center: {
                        lat: 39.6335721,
                        lng: -106.4303007
                    },
                    zoom: 8,
                    disableDefaultUI: true
                });
            } catch (error) {
                window.alert(" Google did not load");


            }
            ko.applyBindings(new ViewModel());
        };



        //Resort Constructor that creates custom objects 
        var Resort = function(data) {
            "use strict";
            this.name = ko.observable(data.name);
            this.lat = ko.observable(data.lat);
            this.lng = ko.observable(data.lng);
            this.id = ko.observable(data.id);
            this.marker = ko.observable();
            this.infoContent = ko.observable('');
            this.phone = ko.observable('');
            this.address = ko.observable('');
            this.url = ko.observable('');
            this.canonicalUrl = ko.observable('');
            this.photoPrefix = ko.observable('');
            this.photoSuffix = ko.observable('');

        };


        // ViewModel 
        var ViewModel = function() {

            var self = this;


            self.markers = ko.observableArray([]);

            // Load observable array with our data
            self.skiList = ko.observableArray([]);
            skiResorts.forEach(function(resortItem) {
                self.skiList.push(new Resort(resortItem));


            });
            // Initialize the infowindow
            var Linfowindow = new google.maps.InfoWindow({
                maxWidth: 200,
            });


            //Initialize Marker
            var marker;

            // For each resort, set markers, request Foursquare data, and set event listeners for the infowindow
            // Credit https://github.com/kacymckibben/project-5-app.git
            self.skiList().forEach(function(resortItem) {


                // Initialize Markers for each data object 
                marker = new google.maps.Marker({
                    position: new google.maps.LatLng(resortItem.lat(), resortItem.lng()),
                    map: map,
                    setTitle: "marker",
                    animation: google.maps.Animation.DROP
                });
                resortItem.marker = marker;

                // Show foursquare content when a resort item marker is clicked
                self.setResort = function(resortItem) {
                    google.maps.event.trigger(resortItem.marker, 'click');
                    self.populateInfoWindow(this, infowindow);

                }
                // Close previous marker's infowindow if another one is clicked
                populateInfoWindow = function(marker, infowindow) {

                    if (infowindow.marker != marker) {
                        infowindow.marker = marker;
                        infowindow.setContent(self.infoContent());
                        infowindow.open(map, marker);

                        infowindow.addListener('closeclick', function() {
                            infowindow.marker = null;
                        });
                    }
                }
                // FOURSQUARE
                // Make AJAX request to Foursquare and only load properties that are available
                $.ajax({
                    url: 'https://api.foursquare.com/v2/venues/' + resortItem.id() +
                        '?client_id=OMUWHCHUEZIQVSP01OWPVUE502ZAQ35BT5NYZ3VLTAYZREQC&client_secret=Q2GMO43U1J0A5MUBMADA5P3UA3RI2Y3U5QKVCX0GNUQZPQXL&v=20130815',
                    dataType: "json",
                    success: function(data) {

                        var result = data.response.venue;

                        var contact = result.hasOwnProperty('contact') ? result.contact : '';
                        if (contact.hasOwnProperty('formattedPhone')) {
                            resortItem.phone(contact.formattedPhone || '');
                        }

                        var location = result.hasOwnProperty('location') ? result.location : '';
                        if (location.hasOwnProperty('address')) {
                            resortItem.address(location.address || '');
                        }

                        var bestPhoto = result.hasOwnProperty('bestPhoto') ? result.bestPhoto : '';
                        if (bestPhoto.hasOwnProperty('prefix')) {
                            resortItem.photoPrefix(bestPhoto.prefix || '');
                        }

                        if (bestPhoto.hasOwnProperty('suffix')) {
                            resortItem.photoSuffix(bestPhoto.suffix || '');
                        }


                        var url = result.hasOwnProperty('url') ? result.url : '';
                        resortItem.url(url || '');

                        resortItem.canonicalUrl(result.canonicalUrl);


                        // Content of the infowindow
                        var infoContent = '<div id="infoWindow"><h4>' + resortItem.name() + '</h4><div id="fsqpic"><img src="' +
                            resortItem.photoPrefix() + '130x100' + resortItem.photoSuffix() +
                            '" alt="Image Location"></div><p>' +
                            resortItem.phone() + '</p><p>' + resortItem.address() + '</p>' +
                            '<p><a href=' + resortItem.url() + '>' + resortItem.url() +
                            '</a></p><p><a target="_blank" href=' + resortItem.canonicalUrl() +
                            '>Foursquare Page</a></p><p><a target="_blank" href=https://www.google.com/maps/dir/Current+Location/' +
                            resortItem.lat() + ',' + resortItem.lng() + '>Directions</a></p></div>';




                        /*Open info window when a marker is clicked and populate it with foursquare content
                        / Add bounce animation to clicked marker and center it
                        */
                        google.maps.event.addListener(resortItem.marker, 'click', function() {

                            Linfowindow.open(map, this);


                            resortItem.marker.setAnimation(google.maps.Animation.BOUNCE);
                            setTimeout(function() {
                                resortItem.marker.setAnimation(null);
                            }, 1900);
                            Linfowindow.setContent(infoContent);


                            map.setCenter(resortItem.marker.getPosition());

                        });



                    }, //success

                    error: function(e) {

                        Linfowindow.setContent('<h5>Foursquare data is unavailable. Please try refreshing later.</h5>');
                        document.getElementById("error").innerHTML = "<h4>Foursquare data is unavailable. Please try refreshing later.</h4>";

                    }




                }); //foursquare




            }); //resortItem

            // RESORT LIST
            // Create Resort List and Add a click event that corresponds with the appropriate marker
            // Open info window that corresponds to correct marker when a list item in info box is clicked 
            // and populate it with foursquare content


            self.showListItem = ko.observableArray();
            self.skiList().forEach(function(resort) {
                self.showListItem.push(resort);
            });

            self.showInfo = function(resortItem) {
                google.maps.event.trigger(resortItem.marker, 'click');

            };




            // FILTER USER INPUT
            // Match characters of user input with the resort name and make Resort item and it's corresponding marker visible
            // Otherwise, remove the resort & marker
            self.resortNameFilter = ko.observable('');


            self.filterMarkers = function() {

                var searchInput = self.resortNameFilter().toLowerCase();

                self.showListItem.removeAll();
                self.skiList().forEach(function(resort) {
                    resort.marker.setVisible(false);
                    Linfowindow.close(this, resort);

                    // Compare the name of each resort to user input
                    // If user input is included in the name, set the resort and marker as showListItem
                    if (resort.name().toLowerCase().indexOf(searchInput) !== -1) {

                        self.showListItem.push(resort);
                    }
                });
                self.showListItem().forEach(function(resort) {

                    resort.marker.setVisible(true);
                });
            };



        }; //ViewModel