function router() {
	

	var root = window.location.href; //fonctionne partout
	if (root.indexOf("#") !== -1) 
	{
		root = root.split('#')[0];
	}
	else
	{
		root = '';
	}
	var useHash = true; // Defaults to: false
	var hash = '#' // Defaults to: '#'
	
	router = new Navigo(root, useHash, hash); 
    
	router.on(function () {
		//console.log("Routeur RACINE");
		//console.log(router);
		//indexPage();
		loginPage();
	}).resolve();
	
	router.on(
		'Index', function () {
			if (element = document.getElementById("legend")) 
			{
				element.parentNode.removeChild(element);
			};
		indexPage();
	}).resolve();
	      
	router.on(
		'Maj_RPPS', function () {
			if (element = document.getElementById("legend")) 
			{
				element.parentNode.removeChild(element);
			};
			newRPPSPage();
	}).resolve();
	      
	router.on(
		'Filtrer_Specialites', function () {
			if (element = document.getElementById("legend")) 
			{
				element.parentNode.removeChild(element);
			};
			initDivFilterSpecialityManagement();
			}).resolve();

	router.on(
		'Cartographie', function () {
			if (element = document.getElementById("legend")) 
			{
				element.parentNode.removeChild(element);
			};
			initMapPage();
		}).resolve();
	
	router.on(
		'Creer_Commercial', function () {
			if (element = document.getElementById("legend")) 
			{
				element.parentNode.removeChild(element);
			};
			createSalesProPage();
		}).resolve();
	
	router.on(
		'Lien_Commercial', function () {
			if (element = document.getElementById("legend")) 
			{
				element.parentNode.removeChild(element);
			};
			createDoctorSalesProLinkPage();
		}).resolve();
	
	router.on(
			'Logout', function () {
				if (element = document.getElementById("legend")) 
				{
					element.parentNode.removeChild(element);
				};
				logoutPage();
			}).resolve();

	router.notFound(function () {
        window.alert("Router Not found");
    });
}