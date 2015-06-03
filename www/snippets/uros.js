var maplayer = L.tileLayer('http://tiles.lyrk.org/ls/{z}/{x}/{y}?apikey=87be57815cf747a58ec5d84d8e64ccfa', {
            detectRetina: true,
			reuseTiles: true,
			//updateWhenIdle: false,
        });

        //this.map = new leaflet.Map(this.domElement, options);
        this.map = new L.Map("map", {
            center: new L.LatLng(44.8167, 20.4667),
            zoom: 13,
            zoomControl:false,
            maxZoom: 17,
            layers: [maplayer], // add multiple layers here [layer1,layer2...]
        });
