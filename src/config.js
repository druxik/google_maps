export default {
	api: {
		url: "http://www.barhopping.richcode.ru/maps/api/query.php"
	},
	viewport: {
		lat: 48.740,
		lng: 19.140,
		zoom: 14,
		mapTypeId: "roadmap"
	},
	project: {
		name: "Untitled map",
		description: "This is sample description",
		layers: [{
			name: "Untitled layer1111",
			isVisible: true,
			isExpanded: true,
			shapesIds: []
		},{
			name: "Layer 2",
			isVisible: true,
			isExpanded: true,
			shapesIds: []
		}]
	},
	dot: {
		icon: {
            url: "https://developers.google.com/maps/documentation/javascript/images/custom-marker.png?hl=ru",
            scaledSize: {}
		},
		name: "Untitled marker"
	},
	route: {
		waypoints: ["",""]
	},
	polygon: {
		name: "Untitled polygon",
		color: "#ff0000"
	},
	colors: ["#ff0000","#23c8c6","#ffffbf","#4fb7f9"]
};
