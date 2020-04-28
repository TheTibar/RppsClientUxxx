//'use strict';
//RPPS
//var host = 'http://localhost/RppsServeur/';
//LOCAL
var host = 'http://192.168.0.19/RppsServeurUxxx/'
//OVH
//var host = 'https://reivaxweb.me/RppsServeur/'

//var token = '';
var user_data = ''; //données de l'utilisateur connecté
var user_token = ''; //token de l'utilisateur connecté
var process_id = 0; //process en cours
var modif_doctor_sales_pro_link = {};
var html_menu = '';


//var selected_agency_token = 0; //agence selectionnée pour la création ou la consulation des utilisateurs

//Regle : on ne masque pas un DIV dans la fonction qui l'utilise mais dans la fonction suivante
//Lorsque l'on entre dans une fonction, on affiche le DIV dont on a besoin
//Lorsque l'on entre dans une fonction, on masque tous les DIV qui suivent dans la liste 
//Oh, and paths need to be relative to the path of the main HTML page, not the JavaScript file
/*
function indexPage()
{
	document.getElementById("header").innerHTML = 'Gestion des fichiers RPPS';
	document.getElementById("footer").innerHTML = "Gestion des fichiers RPPS";
	document.getElementById("mail_rpps").innerHTML = '<A HREF="mailto:baert.xavier@gmail.com">Envoyez nous un email</A>';
	var htmlRender = '' 
		+ '<div id = "left_menu">'
			+ 'Menu'
			+ '<div style="cursor: pointer;" onclick="initDivNewRpps()" id = "new">Nouveau RPPS</div>'
			+ '<div id = "consult">Consulter Données</div>'
			+ '<div style="cursor: pointer;" onclick="initDivFilterSpecialityManagement()" id = id = "filter_management">Gérer les filtres par défaut</div>'
			+ '<div style="cursor: pointer;" onclick="initDivGetRppsFile()" id = "get_new_rpps">Télécharger un RPPS</div>'
			+ '<div style="cursor: pointer;" onclick="initDivRppsMap()" id = "rpps_map">Cartographie</div>'
		+ '</div>'
		+ '<div id = "content">Mode d emploi</div>';
	
	document.getElementById("app").innerHTML = htmlRender;
}
*/

//Début Fonctions génériques
function alreadyConnected() { //Retourne VRAI si l'utilisateur est connecté, FAUX sinon
	//window.alert("Entre check");
	if(! localStorage.getItem('token') || ! localStorage.getItem('user_data')) {
		//window.alert("check erreur");
		//le navigateur ne connait pas l'utilisateur, on se connecte
		return false;
	}
	else {
		if(! user_data)
		{
			//window.alert("empty_ud");
			user_token = localStorage.getItem('token');
			user_data = JSON.parse(localStorage.getItem('user_data'));
		}
		return true;
	}
		
}

function toggleDiv(divId) {
	  var x = document.getElementById(divId);
	  if (x.style.display === "none") {
	    x.style.display = "block";
	  } else {
	    x.style.display = "none";
	  }
}

function capitalizeWords(str) {
 return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function hideDivId(div_name) {
	var x = document.getElementById(div_name);
	x.style.display = "none"; 
}
//Fin Fonctions génériques

//Début CONNEXION / DECONNEXION
function loginPage() { //OK Uxxx
	if (! alreadyConnected()) //Si pas connecté, 
	{ //à mettre au début de chaque fonction Page
		var htmlRender = ''
			+ '<form method="post" action="">'
			+ '<div id = "login_page">'
			+ '<label class="titre">Connexion<br><br></label>'
			+ '<table border-style="INSET" width="90%" align="center">'
			+ '<tr>'
			+ '<td width="50%" align="right">Email : </td>'
			+ '<td width="50%" align="left">'
			+ '<input id="email" type="text" class="form-control" autocomplete="email">'
			+ '</tr>'
			+ '<tr>'
			+ '<td width="50%" align="right">Mot de passe : </td>'
			+ '<td width="50%" align="left">'
			+ '<input id="password" type="password" class="form-control" autocomplete="current-password">'
			+ '</td>'
			+ '</table>'
			+ '</div>'
			+ '<div class = "inter_error" id="email_or_password_error"></div>'
			+ '<div>'
			+ '<table border-style="INSET" width="90%" align="center">'
			+ '<tr>'
			+ '<td width="100%" onclick="login()" style="cursor:pointer" align="center">'
			+ 'Se connecter'
			+ '</td>'
			+ '</tr>'
			+ '<tr>'
			+ '<td width="100%" onclick="onclick="forgottenPasswordPage()" style="cursor:pointer" align="center">'
			+ 'Mot de passe oublié'
			+ '</td>'
			+ '</tr>'
			+ '</table>'
			+ '</div>'
			+ '</form>';
		document.getElementById("app").innerHTML = htmlRender;
	}
	else
	{
		router.navigate('Index');
	}
	
}

function login() { //OK Uxxx
	var email = document.getElementById("email");
    var password = document.getElementById("password");
    var email_or_password_error = '';
    var no_empty = true;
	
    if (email.value === "") 
    {
    	no_empty = false;
    	email.style.borderColor = "red";
    	email_or_password_error = email_or_password_error + 'Email vide<br>';
    }
	else 
	{
		email.style.borderColor = "";
	}
    
    if (password.value === "") 
    {
    	no_empty = false;
    	password.style.borderColor = "red";
    	email_or_password_error = email_or_password_error + 'Mot de passe vide';
    }
	else 
	{
		password.style.borderColor = "";
	}
    
    document.getElementById("email_or_password_error").innerHTML = email_or_password_error;
    
    if(no_empty) {
    	email_uri = encodeURIComponent(email.value);
    	password_uri = encodeURIComponent(password.value);

	    var url = host + "WebServices/User/WS_User_Login.php?email=" + email_uri + "&password=" + password_uri;
	    console.log(url);
	    var xhr = new XMLHttpRequest();
	    xhr.timeout = 2000;
	    xhr.onload = function (e) {
	        if (xhr.readyState === 4) {
				//console.log(xhr);
				var response = JSON.parse(xhr.responseText);
				switch(response.status_message) {
					case "user_connected":
						$("#email_or_password_error").html("Connexion ok");
						localStorage.setItem('token', response.data.token);
						first_login = response.data.first_login;
						if(first_login == "1") 
						{
							firstLogin();
						}
						else 
						{
							getUserData();
						}
						break;
					case "login_error":
						$("#email_or_password_error").html("Erreur de connexion");
						break;
					case "database_error":
						$("#email_or_password_error").html("Erreur de base de données");
						break;
				}
	        }
	    };
	    xhr.ontimeout = function () {
	    	$("#alert_insee_code").html("fatal_error_connect_database");
	    };
	    xhr.open("GET", url, true);
	    xhr.send();
    }
}

function firstLogin() { //à faire
	//window.alert(token);
}

function getUserData() { //OK Uxxx
	
	user_token_uri = encodeURIComponent(localStorage.getItem('token')); 
	
	var url = host + "WebServices/User/WS_Get_User_Data.php?user_token=" + user_token_uri;
	console.log(url);
    var xhr = new XMLHttpRequest();
    xhr.timeout = 2000;
    xhr.onload = function (e) {
		//console.log(xhr);
		var response = JSON.parse(xhr.responseText);
		switch(response.status_message) {
			case "user_data":
				console.log(response.data);
				localStorage.setItem('user_data', JSON.stringify(response.data));
				user_token = localStorage.getItem('token');
				user_data = JSON.parse(localStorage.getItem('user_data'));
				//console.log(user_data);
				router.navigate('Index');
				break;
			case "unknown_token":
				$("#email_or_password_error").html("Erreur utilisateur inconnu");
				break;
			case "database_error":
				$("#email_or_password_error").html("Erreur de base de données");
				break;
		}
    };
    xhr.ontimeout = function () {
    	$("#alert_insee_code").html("fatal_error_connect_database");
    };
    xhr.open("GET", url, true);
    xhr.send();
}

function renderMenu() { //OK Uxxx
	console.log('render_menu');
	
	user_token_uri = encodeURIComponent(user_token);
	var htmlRender = '' ;
	
    var url = host + "WebServices/Interface/WS_Get_Menu.php?user_token=" + user_token_uri;
    //console.log(url);
    xhr = new XMLHttpRequest();
    xhr.timeout = 3000;
    xhr.open("GET", url, true);
    xhr.onload = function() {
    	//console.log(xhr.readyState);
    	//console.log(xhr.status);
   		//console.log('loaded');
    	//console.log(xhr.responseText);
        var response = JSON.parse(xhr.responseText);
        //console.log(response);
        switch(response.status_message) {
    	case "unknown_user": //le token utilisateur n'est pas connu
    		logout();
    		break;
        default:
        	//on est en erreur, on propose de relancer
        	htmlResultMenu = '' 
        		+ '<div id = "left_menu">Menu&nbsp;<img id="renderMenu" title="Relancer" class = "img_in_table" style="cursor: pointer;" src="img/retry.png"/>'
        		+ '</div>'
        	htmlResultContent = ''
        		+ '<div id = "content">Erreur de récupération du menu</div>';
        	document.getElementById("left_menu").innerHTML = htmlResultMenu;
        	document.getElementById("content").innerHTML = htmlResultContent;
        	
        	$("#renderMenu").click(function(){
        		renderMenu();
				//https://stackoverflow.com/questions/34176882/onclick-is-triggered-twice-after-changing-the-value-manually-in-jquery
			});
        	
        
			break;
		case "user_menu":
			//console.log('render_menu_ok');
			htmlResult = '';
			menu_orig = response.data;
			domain = [];
			menu_disp = [];
			for(var i = 0; i < menu_orig.length; i++) {
				domain.push(menu_orig[i].dom_label);
			}
			//console.log(menu_orig);
			//console.log(domain);
			domain_list = [...new Set(domain)];
			//console.log(domain_list[1]);
			htmlMenu = ''
				+ '<ul>'
			for(var i = 0; i < domain_list.length; i++) {
				htmlMenu = htmlMenu
					+ '<li>' + domain_list[i] 
					+ '<ul>';
				for(var j = 0; j < menu_orig.length; j++) {
					if (domain_list[i] == menu_orig[j].dom_label) {
						htmlMenu = htmlMenu 
							+ '<li style="cursor: pointer;" onclick = router.navigate("' + menu_orig[j].page_route + '")>' + menu_orig[j].page_label + '</li>';
					}
				}
				htmlMenu = htmlMenu
					+ '</ul>'
					+ '</li>';
			}
			
			//ajout de la deconnexion en dur
			htmlMenu = htmlMenu 
				+ '</ul>'
				+ '<ul><li style="cursor: pointer;" onclick="router.navigate(\'Logout\')">Déconnexion</li></ul>'; 
			
			html_menu = htmlMenu;
			
        	document.getElementById("left_menu").innerHTML = html_menu;
			
			break;
	    }
    }
    xhr.send();
    /**/
    xhr.ontimeout = function () {
    	//On est en timeout, on propose de relancer la recherche des données
    	htmlResult = '' 
    		+ '<ul>'
    		+ '<li>Recharger&nbsp;'
    		+ '<img title="Relancer" onclick = "renderMenu()" class = "img_in_table" style="cursor: pointer;" src="img/retry.png"/>'
    		+ '</li>'
    		+ '</ul>';
    	document.getElementById("left_menu").innerHTML = htmlResult;
    };

	
}

function populateApp() { //OK Uxxx
	//console.log("populate_app");
	var htmlRender = '' 
		+ '<div id = "left_menu"></div>'
		+ '<div id = "content"></div>';
		//+ '</div>';
	document.getElementById("app").innerHTML = htmlRender;
	
	if (html_menu != '') {
		console.log('menu_ok');
		document.getElementById("left_menu").innerHTML = html_menu;
	}
	else {
		//console.log('menu_ko');
		renderMenu();
	}

}

function indexPage() { //OK Uxxx
	if (alreadyConnected()) 
	{ //à mettre au début de chaque fonction Page
		populateApp(); //on crée les div Menu et Content dans App
		//renderMenu(); //on crée le menu à partir du token
		index();
		
	}
	else 
	{
		router.navigate('');
	}
}

function index() { //OK Uxxx
	//console.log('index');
	//window.alert(user_data.first_name);
	//ou pourra ajouter des informations ici, comme la liste des départements, le rôle, les infos de mise à jour etc.
	var htmlRender = ''
		+ '<p>Bienvenue '
		+ user_data.first_name
		+ ' '
		+ user_data.last_name
		+ '</p>';
	document.getElementById("content").innerHTML = htmlRender;
		 
}

function logoutPage() { //OK Uxxx
	if (alreadyConnected()) 
	{ //à mettre au début de chaque fonction Page
		//populateApp();
		var htmlRender = '' 
			+ '<p>'
			+ user_data.first_name
			+ ' '
			+ user_data.last_name
			+ ', '
			+ 'se déconnecter ?'
			+ '</p>'
			+ '<div style="cursor: pointer;" onclick="logout()" id = "logout">Valider</div>';
		document.getElementById("content").innerHTML = htmlRender;
	}
	else
	{
		router.navigate('');
	}
}

function logout() { //OK Uxxx
	localStorage.clear();
	router.navigate('');
}
//Fin CONNEXION / DECONNEXION

//DEBUT Gérer les filtres par défaut
//Vérifier les DIV dans initDiv
function initDivFilterSpecialityManagement() { //A supprimer Uxxx ?
	if (alreadyConnected()) 
	{ //à mettre au début de chaque fonction Page
		if (! document.getElementById("#content") || ! document.getElementById("#left_menu")) {
			populateApp();
		}
		var htmlRender = ''
			+ '<div class="action" id="action_choix_specialites"></div>'
			+ '<div class="alert" id="alert_choix_specialites"></div>'
			+ '<div class="alert" id="alert_filtre_choix_specialite"></div>';
		document.getElementById("content").innerHTML = htmlRender;
		
		filterSpecialityManagement();
	}
	else {
		router.navigate('');
	}

}

function filterSpecialityManagement() { //A supprimer Uxxx ?
	//Récupération de la liste des spécialités et de leur filtre par défaut
    var url = host + "WebServices/SpecialityManagement/WS_Get_New_Data_Speciality_List.php";
    var xhr = new XMLHttpRequest();
    xhr.timeout = 2000;
    xhr.onreadystatechange = function (e) {
        if (xhr.readyState === 4) {
			//console.log(xhr);
			var response = JSON.parse(xhr.responseText);
			switch(response.status_message) {
				case "error_retrieving_data_from_new_data":
					$("#alert_choix_specialites").html("Impossible de récupérer les spécialités : " + response.status_message).fadeIn();
					var x = document.getElementById("alert_choix_specialites");
					break;
				case "database_connection_fatal_error":
					$("#alert_choix_specialites").html("fatal_error_connect_database");
					break;
				case "specialities_from_new_data_with_default_filter":
					html_result = "Filtre sur les spécialités (" + response.data.length + ") : <br>";
					
					//Affichage liste, choix et mise à jour
					console.log(response.data);
					
					nb_row = 15;
					
					//arrondi à l'entier supérieur, ou garde la valeur si c'est un entier.
					nb_col = Math.ceil(response.data.length / nb_row);
					console.log(nb_col);
					
					html_current_result = '';
					for (var i = 0; i < response.data.length; i++) {
						switch(response.data[i].keep) {
							case "0":
								is_checked = "";
								txt_color = "black";
								break;
							case "1":
								is_checked = "checked";
								txt_color = "black";
								break;
							case "2":
								is_checked = "";
								txt_color = "blue";
								break;
						}
					}
						
						htmlDetail = '<tr>';
						htmlHeader = '';
						htmlResult = '';
						htmlResult = htmlResult
							+ '<table class="rwd-table2">'

						for (var i = 0; i < nb_row + 1; i++) { //+ 1 pour gérer la ligne d'entête
							console.log(i + ' ligne');
							for (var j = 0; j < nb_col; j++) {
								console.log(j + ' colonne');
								if (i == 0) {
									console.log('entête');
									htmlHeader = htmlHeader
										+ '<th>Spécialité</th>';
								} 
								else {
									console.log('detail');
									/* ordre alpha en ligne
									if (((i - 1) * nb_col + j) <  response.data.length) {
										libelle = response.data[(i - 1) * nb_col + j].Libelle_savoir_faire;
									}
									else {
										libelle = '';
									}
									*/
									if ((j * nb_row + (i - 1)) <  response.data.length) {
										libelle = response.data[(j * nb_row + (i - 1))].Libelle_savoir_faire;
										/*
										switch(response.data[(j * nb_row + (i - 1))].keep) {
										case "0":
											is_checked = "";
											txt_color = "black";
											break;
										case "1":
											is_checked = "checked";
											txt_color = "black";
											break;
										case "2":
											is_checked = "";
											txt_color = "blue";
											break;
										}
										*/
									}
									else {
										libelle = false;
									}
									
									if (libelle) {
										console.log(libelle);
										htmlDetail = htmlDetail
											+ '<td data-th="Spécialité">'
												+ '<input type = "checkbox" name = "speciality" value = "'
												+ libelle
												+ '" '
												+ 'id = "'
												+ libelle
												+ '" '
												+ ' onclick="'
												+ 'saveDefaultSpeciality(' 
												+ '\'' 
												+ libelle
												+ '\''
												+ ');">'
												/*+ libelle*/
												+ '<label for = "'
												+ libelle
												+ '">'
												+ libelle
												+ '</label>'
											+ '</td>';
									}
									
								}
							}
							htmlDetail = htmlDetail
								+ '</tr>'
								+ '<tr>';
						}
						
						htmlHeader = 
							'<tr>'
							+ htmlHeader
							+ '</tr>';
						
						htmlResult = htmlResult
							+ htmlHeader
							+ htmlDetail
							+ '</table>';
						

						
						//console.log(htmlResult);

					//$("#action_choix_specialites").html(html_result).fadeIn();
					$("#action_choix_specialites").html(htmlResult).fadeIn();
					break;
			}
        }
    };
    xhr.ontimeout = function () {
    	$("#alert_choix_specialites").html("fatal_error_connect_database");
    	var x = document.getElementById("alert_choix_specialites");
		x.style.backgroundColor = 'red';
    };
    xhr.open("GET", url, true);
    xhr.send();
}

function saveDefaultSpeciality(Libelle_savoir_faire) { //A supprimer Uxxx ?
	var x = document.getElementById(Libelle_savoir_faire).checked;
	if (x) {
		keep = 1;
	}
	else
	{
		keep = 0;
	}
	
	speciality_uri = encodeURIComponent(Libelle_savoir_faire);
	keep_uri = encodeURIComponent(keep);
	
    var url = host + "WebServices/SpecialityManagement/WS_Update_Speciality_Keep.php?speciality=" + speciality_uri + "&keep=" + keep_uri;
    console.log(url);
    var xhr = new XMLHttpRequest();
    xhr.timeout = 2000;
	
    xhr.onreadystatechange = function (e) {
        if (xhr.readyState === 4) {
			//console.log(xhr);
			var response = JSON.parse(xhr.responseText);
			//console.log(response.status_message);
			switch(response.status_message) {
				case "update_speciality_keep_ok":
					if (response.data.keep == "0") {
						action = " non gardé ";
					}
					else
					{
						action = " gardé ";
					}
					$("#alert_filtre_choix_specialite").html("Mise à jour Ok : " + response.data.speciality + action + response.status_message).fadeIn();
					break;
				case "error_update_speciality_keep":
					$("#alert_filtre_choix_specialite").html("Impossible de mettre à jour : " + response.status_message).fadeIn();
					break;
				case "create_speciality_keep_ok":
					$("#alert_filtre_choix_specialite").html("Création Ok : " + response.data.speciality + ' sélectionné ' + response.status_message).fadeIn();
					break;
				case "error_create_speciality_keep":
					$("#alert_filtre_choix_specialite").html("Impossible de créer : " + response.status_message).fadeIn();
					break;
				case "error_retrieving_speciality_keep":
					$("#alert_filtre_choix_specialite").html("Impossible de récupérer les spécialités par défaut : " + response.status_message).fadeIn();
					break;
				case "database_connection_fatal_error":
					$("#alert_filtre_choix_specialite").html("fatal_error_connect_database");
					break;
				case "error_updating_keep_no_data":
					$("#alert_filtre_choix_specialite").html("Erreur technique, données incomplètes : " + response.status_message).fadeIn();
					var x = document.getElementById("alert_filtre_choix_specialite");
					x.style.backgroundColor = 'red';
					break;
			}
        }
    };
    xhr.ontimeout = function () {
    	$("#alert_filtre_choix_specialite").html("fatal_error_connect_database");
    	var x = document.getElementById("alert_filtre_choix_specialite");
		x.style.backgroundColor = 'red';
    };
    xhr.open("GET", url, true);
    xhr.send();
    
}
//FIN Gérer les filtres par défaut

//DEBUT Nouveau RPPS
function newRPPSPage() { //OK Uxxx
	if (alreadyConnected()) 
	{ //à mettre au début de chaque fonction Page
		if (! document.getElementById("#content") || ! document.getElementById("#left_menu")) {
			populateApp();
		}
			//window.alert("newrppspage");
			var htmlRender = ''
				+ '<div class = "action" id="action_choix_agence"></div>'
				+ '<div class = "action" id="action_choix_region"></div>'
				+ '<div class = "action" id="action_init_region"></div>'
				+ '<div class = "action" id="action_comptage_apres_init_region"></div>'
				+ '<div class = "action" id="action_verif_coherence_avant"></div>'
				+ '<div class = "action" id="action_comptage_depart_medecins"></div>'
				+ '<div class = "action" id="action_depart_medecins"></div>'
				+ '<div class = "action" id="action_comptage_arrivee_medecins"></div>'
				+ '<div class = "action" id="action_arrivee_medecins"></div>'
				+ '<div class = "action" id="action_bilan_arrivee_medecins"></div>'
				+ '<div class = "action" id="action_verif_coherence_apres"></div>'
				+ '<div class = "action" id="action_bilan_mises_a_jour"></div>'
				+ '<div class = "action" id="action_coherence_finale"></div>'
				+ '<div class = "action" id="action_import_termine"></div>'
				;
					
			document.getElementById("content").innerHTML = htmlRender;

	/*	
	}
		else {
		*/
			currentUserAgencySelectRPPS();
			//chooseRegionAction();
			
			/*
		}
*/


	}
	else
	{
		router.navigate('');
	}
}

function currentUserAgencySelectRPPS() { //OK Uxxx
	htmlRender = '';
	htmlRender = htmlRender 
		+ '<div class = "agency_list" id = "agency_list" style="cursor: pointer;" onclick = "toggleDiv(\'agency_list_result\');">Choisir une agence'
		+ '</div>'
		+ '<div class = "agency_list_result" id = "agency_list_result">'
		+ '</div>'
		;
	
	document.getElementById("action_choix_agence").innerHTML = htmlRender;
	
	
	htmlResult = ''
		+ '<table class="rwd-table">'
		+ '<tr>'
			+ '<th>Agence</th>'
			+ '<th>Action</th>'
		+ '</tr>';
	htmlResultDetail = '';
	for (var i = 0; i < user_data.agency_array.length; i++) {
		htmlResultDetail = htmlResultDetail
			+ '<tr>'
				+ '<td data-th="Agence">' + user_data.agency_array[i].agency_name + '</td>'
				+ '<td data-th="Action">Sélectionner&nbsp;<img id="currentUserAgencySelectRPPS_' + user_data.agency_array[i].agency_id + '" onclick = "chooseRegionAction(' + '\'' + user_data.agency_array[i].agency_id + '\'' + ');" title="Sélectionner" class = "img_in_table" style="cursor: pointer;" src="img/next_step.png"/></td>'
			+ '</tr>';
	}
	htmlResult = htmlResult
		+ htmlResultDetail
		+ '</table>';
	$("#agency_list_result").html(htmlResult).fadeIn();
}

function chooseRegionAction(agency_id) { //OK Uxxx

	console.log(agency_id);
	var region_array = user_data.region_array.filter(x => x.agency_id == agency_id);
	console.log(region_array);
	
	var htmlRender = '<div class = "region_liste" id = "region_liste">';
	for(var i = 0; i < region_array.length; i++) {
		htmlRender = htmlRender 
			//+ '<div class="region_comptage" id = "region_comptage_' + user_data.region_array[i].region_id + '">'
			+ '<div class="region_comptage" id = "region_comptage_' + i + '">'
			+ capitalizeWords(region_array[i].libelle)
			/*
			+ '<table>'
				+ '<tr>'
					+ '<td width = "400px">' + capitalizeWords(user_data.region_array[i].libelle) + '</td>'
					+ '<td width = "50px"><img class = "img_in_table" src="img/loader.gif"/></td>'
					+ '<td width = "50px"><img class = "img_in_table" src="img/loader.gif"/></td>'
				+ '</tr>'
			+ '</table>'
			*/
			+ '</div>'
			//+ '<div class = "region_comptage_result" id = "region_comptage_result_' + user_data.region_array[i].region_id + '">'
			+ '<div class = "region_comptage_result" id = "region_comptage_result_' + i + '">'
				+ '<table class="rwd-table">'
					+ '<tr>'
						+ '<th>Information</th>'
						+ '<th>Action</th>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Information">Récupération des données</td>'
						+ '<td data-th="Action">En cours</td>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Information"></td>'
						+ '<td data-th="Action"><img class = "img_in_table" src="img/loader.gif"/></td>'
					+ '</tr>'
				+ '</table>'
			+ '</div>'
			;
	}
	htmlRender = htmlRender + '</div>';
	document.getElementById("action_choix_region").innerHTML = htmlRender;
	window.setTimeout(function (){ chooseRegions(region_array) }, 0); //permet de forcer la récupération de l'image avant de lancer les appels XHR -- https://stackoverflow.com/questions/779379/why-is-settimeoutfn-0-sometimes-useful
}

function chooseRegions(region_array) { //ok region_token; OK Uxxx	
	xhr = new Array(region_array.length);
	for (let i = 0; i < region_array.length; i++) {
		//region_id = user_data.region_array[i].region_id;
		region_token = region_array[i].region_token;
		region_token_uri = encodeURIComponent(region_token);
		user_token_uri = encodeURIComponent(user_token);
	    var url = host + "WebServices/NewRPPS/WS_Get_RPPS_Detail_By_Region.php?region_token=" + region_token_uri + "&user_token=" + user_token_uri;
	    console.log(url);
	    xhr[i] = new XMLHttpRequest();
	    xhr[i].timeout = 2000;
	    xhr[i].open("GET", url, true);
	    xhr[i].onload = function() {
	        var response = JSON.parse(xhr[i].responseText);
	        console.log(response);
	        switch(response.status_message) {
			case "RPPS_overview_data":
				//on a des données, on propose de vérifier la cohérence
				htmlResult = ''
					+ '<table class="rwd-table">'
						+ '<tr>'
							+ '<th>Donnée</th>'
							+ '<th>Valeur actuelle</th>'
							+ '<th>Nouvelle valeur</th>'
							+ '<th vertical-align="right">Action</th>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Donnée">Nombre de lignes : </td>'
							+ '<td data-th="Valeur actuelle">' + response.data.current_line_count + '</td>'
							+ '<td data-th="Nouvelle valeur">' + response.data.new_data_line_count + '</td>'
							+ '<td data-th="Action"></td>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Donnée">Nombre de médecins : </td>'
							+ '<td data-th="Valeur actuelle">' + response.data.current_distinct_count + '</td>'
							+ '<td data-th="Nouvelle valeur">' + response.data.new_data_distinct_count + '</td>'
							+ '<td data-th="Action"></td>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Donnée">Date de mise à jour : </td>'
							+ '<td data-th="Valeur actuelle">' + response.data.current_last_update + '</td>'
							+ '<td data-th="Nouvelle valeur">' + response.data.new_data_last_update + '</td>'
							+ '<td data-th="Action"></td>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Donnée"></td>'
							+ '<td data-th="Valeur actuelle"></td>'
							+ '<td data-th="Nouvelle valeur"></td>'
							+ '<td data-th="Action">Vérifier&nbsp;<img id="chooseRegion_' + i + '" title="Vérifier" class = "img_in_table" style="cursor: pointer;" src="img/check_consistency.png"/></td>'
						+ '</tr>'
					+ '</table>';
				

				$("#region_comptage_result_" + i).html(htmlResult).fadeIn();
				$("#chooseRegion_" + i).click(function() {
					checkDataConsistencyBefore(region_array[i].region_token);
				})
				break;
				default:
					htmlResult = ''
						+ '<table class="rwd-table">'
							+ '<tr>'
								+ '<th>Information</th>'
								+ '<th>Action</th>'
							+ '</tr>'
							+ '<tr>'
								+ '<td data-th="Information">' + response.status_message + '</td>'
								+ '<td data-th="Action"></td>'
							+ '</tr>'
							+ '<tr>'
								+ '<td data-th="Information"></td>'
								+ '<td data-th="Action">Relancer&nbsp;<img id="chooseRegion_' + i + '" title="Relancer" class = "img_in_table" style="cursor: pointer;" src="img/retry.png"/></td>'
							+ '</tr>'
						+ '</table>';
					$("#region_comptage_result_" + i).html(htmlResult).fadeIn();
					$("#chooseRegion_" + i).click(function() {
						refreshRegion(region_array[i].region_token, i)
					})
					break;
	        }
	    }
	    xhr[i].send();
	    xhr[i].ontimeout = function () {
	    	//On est en timeout, on propose de relancer
	    	htmlResult = ''
				+ '<table class="rwd-table">'
					+ '<tr>'
						+ '<th>Information</th>'
						+ '<th>Action</th>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Information">Timeout</td>'
						+ '<td data-th="Action"></td>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Information"></td>'
						+ '<td data-th="Action">Relancer&nbsp;<img id="chooseRegion_' + i + '" title="Relancer" class = "img_in_table" style="cursor: pointer;" src="img/retry.png"/></td>'
					+ '</tr>'
				+ '</table>';
			$("#region_comptage_result_" + i).html(htmlResult).fadeIn();
			$("#chooseRegion_" + i).click(function() {
				refreshRegion(region_array[i].region_token, i)
			})
	    };
	}
}

function refreshRegion(region_token, i) { //i en paramètre correspond au div_id ; OK Uxxx

	/*on met le gif d'attente dans la table qui relance*/
	htmlResult = ''
		+ '<table class="rwd-table">'
			+ '<tr>'
				+ '<th>Information</th>'
				+ '<th>Action</th>'
			+ '</tr>'
			+ '<tr>'
				+ '<td data-th="Information">Récupération des données</td>'
				+ '<td data-th="Action"></td>'
			+ '</tr>'
			+ '<tr>'
				+ '<td data-th="Information"></td>'
				+ '<td data-th="Action">En cours&nbsp;<img class = "img_in_table" src="img/loader.gif"/></td>'
			+ '</tr>'
		+ '</table>'
	$("#region_comptage_result_" + i).html(htmlResult).fadeIn();

	region_token_uri = encodeURIComponent(region_token);
	user_token_uri = encodeURIComponent(user_token);
    var url = host + "WebServices/NewRPPS/WS_Get_RPPS_Detail_By_Region.php?region_token=" + region_token_uri + "&user_token=" + user_token_uri;
    //console.log(url);
    xhr = new XMLHttpRequest();
    xhr.timeout = 2000;
    xhr.open("GET", url, true);
    xhr.onload = function() {
        var response = JSON.parse(xhr.responseText);
        console.log(response);
        switch(response.status_message) {
    	case "fatal_error_region_code": //le code région a été modifié à la main
    		logout();
    		break;
        default:
        	//on est en erreur, on propose de relancer
        	htmlResult = ''
				+ '<table class="rwd-table">'
					+ '<tr>'
						+ '<th>Information</th>'
						+ '<th>Action</th>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Information">' + response.status_message + '</td>'
						+ '<td data-th="Action">Relancer&nbsp;</td>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Information"></td>'
						+ '<td data-th="Action"><img id="chooseRegion_' + i + '" title="Relancer" class = "img_in_table" style="cursor: pointer;" src="img/retry.png"/></td>'
				+ '</tr>'
				+ '</table>';
			$("#region_comptage_result_" + i).html(htmlResult).fadeIn();
			$("#chooseRegion_" + i).click(function() {
				refreshRegion(region_token, i)
			})
			break;
		case "RPPS_overview_data":
			htmlResult = ''
				+ '<table class="rwd-table">'
					+ '<tr>'
						+ '<th>Donnée</th>'
						+ '<th>Valeur actuelle</th>'
						+ '<th>Nouvelle valeur</th>'
						+ '<th>Action</th>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Donnée">Nombre de lignes : </td>'
						+ '<td data-th="Valeur actuelle">' + response.data.current_line_count + '</td>'
						+ '<td data-th="Nouvelle valeur">' + response.data.new_data_line_count + '</td>'
						+ '<td data-th="Action"></td>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Donnée">Nombre de médecins : </td>'
						+ '<td data-th="Valeur actuelle">' + response.data.current_distinct_count + '</td>'
						+ '<td data-th="Nouvelle valeur">' + response.data.new_data_distinct_count + '</td>'
						+ '<td data-th="Action"></td>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Donnée">Date de mise à jour : </td>'
						+ '<td data-th="Valeur actuelle">' + response.data.current_last_update + '</td>'
						+ '<td data-th="Nouvelle valeur">' + response.data.new_data_last_update + '</td>'
						+ '<td data-th="Action">Vérifier&nbsp;<img id="chooseRegion_' + i + '" title="Vérifier" class = "img_in_table" style="cursor: pointer;" src="img/check_consistency.png"/></td>'
					+ '</tr>'
				+ '</table>';
			

			$("#region_comptage_result_" + i).html(htmlResult).fadeIn();
			$("#chooseRegion_" + i).click(function() {
				checkDataConsistencyBefore(region_token)
			})
			break;
	    }
    }
    xhr.send();
    xhr.ontimeout = function () {
    	//On est en timeout, on propose de relancer la recherche des données
    	htmlResult = ''
			+ '<table class="rwd-table">'
				+ '<tr>'
					+ '<th>Information</th>'
					+ '<th>Action</th>'
				+ '</tr>'
				+ '<tr>'
					+ '<td data-th="Information">Timeout</td>'
					+ '<td data-th="Action"></td>'
				+ '</tr>'
				+ '<tr>'
					+ '<td data-th="Information"></td>'
					+ '<td data-th="Action">Relancer&nbsp<img id="chooseRegion_' + i + '" title="Relancer" class = "img_in_table" style="cursor: pointer;" src="img/retry.png"/></td>'
				+ '</tr>'
			+ '</table>';
		$("#region_comptage_result_" + i).html(htmlResult).fadeIn();
		$("#chooseRegion_" + i).click(function() {
			refreshRegion(region_token, i)
		})
    };
}

function checkDataConsistencyBefore(region_token) { //OK Uxxx
	region_token_uri = encodeURIComponent(region_token);
	user_token_uri = encodeURIComponent(user_token);
	//On supprime tous les div des autres régions pour ne garder que le div sur lequel on a cliqué
	for (i = 0; i < user_data.region_array.length; i++) {
		if(user_data.region_array[i].region_token != region_token)
		{
			$("#region_comptage_" + i).remove();
			$("#region_comptage_result_" + i).remove();
			
		}
	}
	
	//On prépare le div de vérification de la cohérence des données
	htmlRender = '';
	htmlRender = htmlRender 
		+ '<div class = "region_verif" id = "region_verif" style="cursor: pointer;" onclick = "toggleDiv(\'region_verif_result\');">Vérification des données'
		+ '</div>'
		+ '<div class = "region_verif_result" id = "region_verif_result">'
		+ '</div>'
		;
	
	document.getElementById("action_verif_coherence_avant").innerHTML = htmlRender;
	
	
    var url = host + "WebServices/NewRPPS/WS_Check_Data_Consistency.php?region_token=" + region_token_uri + "&user_token=" + user_token_uri;
    console.log(url);
    var xhr = new XMLHttpRequest();
    xhr.timeout = 2000;
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
			
			var response = JSON.parse(xhr.responseText);
			console.log(response);
			switch(response.status_message) {
				case "fatal_error_region_code":
	        		logout();
	        		break;
				default:
					htmlResult = ''
						+ '<table class="rwd-table">'
						+ '<tr>'
							+ '<th>Information</th>'
							+ '<th>Action</th>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Information">' + response.status_message + '</td>'
							+ '<td data-th="Action"></td>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Information"></td>'
							+ '<td data-th="Action">Relancer&nbsp;<img id="consistencyBefore" title="Relancer" class = "img_in_table" style="cursor: pointer;" src="img/retry.png"/></td>'
						+ '</tr>'
					+ '</table>';
					$("#region_verif_result").html(htmlResult).fadeIn();
					$("#consistencyBefore").click(function() {
						checkDataConsistencyBefore(region_token)
					})
					break;
				case "data_base_not_consistent_counts":
					htmlResult = ''
						+ '<table class="rwd-table">'
						+ '<tr>'
							+ '<th>Comptage</th>'
							+ '<th>Valeur</th>'
							+ '<th>Action</th>'
						+ '</tr>'
						+ '<tr>'
						+ '<tr>'
							+ '<td data-th="Comptage">CD distincts</td>'
							+ '<td data-th="Valeur">' + response.data['distinct_cd'] + '</td>'
							+ '<td data-th="Action"></td>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Comptage">DSP distincts</td>'
							+ '<td data-th="Valeur">' + response.data['distinct_dsp'] + '</td>'
							+ '<td data-th="Action"></td>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Comptage">DSP</td>'
							+ '<td data-th="Valeur">' + response.data['dsp'] + '</td>'
							+ '<td data-th="Action"></td>'
						+ '</tr>'
							+ '<td data-th="Comptage">Base de données non cohérente</td>'
							+ '<td data-th="Valeur"></td>'
							+ '<td data-th="Action"></td>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Comptage"></td>'
							+ '<td data-th="Valeur"></td>'
							+ '<td data-th="Action">Email&nbsp;<img id="consistencyBefore" title="Envoyer un email" class = "img_in_table" src="img/message.png"/></td>'
						+ '</tr>'
					+ '</table>';
					$("#region_verif_result").html(htmlResult).fadeIn();
					/*
					$("#consistencyBefore").click(function() {
						checkDataConsistencyBefore(region_token)
					})
					*/
					break;
				case "data_base_not_consistent_CD_DSP":
					htmlResult = ''
					+ '<table class="rwd-table">'
						+ '<tr>'
							+ '<th>Comptage</th>'
							+ '<th>Valeur</th>'
							+ '<th>Action</th>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Comptage">Base de données non cohérente</td>'
							+ '<td data-th="Valeur"></td>'
							+ '<td data-th="Action"></td>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Comptage">CD pas dans DSP</td>'
							+ '<td data-th="Valeur">' + response.data['nb_cd_not_in_dsp'] + '</td>'
							+ '<td data-th="Action"></td>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Comptage">DSP pas dans CD</td>'
							+ '<td data-th="Valeur">' + response.data['nb_dsp_not_in_cd'] + '</td>'
							+ '<td data-th="Action"></td>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Comptage"></td>'
							+ '<td data-th="Valeur"></td>'
							+ '<td data-th="Action">Email&nbsp;<img id="consistencyBefore" title="Envoyer un email" class = "img_in_table" src="img/message.png"/></td>'
						+ '</tr>'
					+ '</table>';
					$("#region_verif_result").html(htmlResult).fadeIn();
					/*
					$("#consistencyBefore").click(function() {
						checkDataConsistencyBefore(region_token)
					})
					*/
					break;
				case "all_data_ok":
					htmlResult = ''
					+ '<table class="rwd-table">'
						+ '<tr>'
							+ '<th>Information</th>'
							+ '<th>Action</th>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Information">Base cohérente</td>'
							+ '<td data-th="Action"></td>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Information"></td>'
							+ '<td data-th="Action">Départs&nbsp;<img id="consistencyBefore" title="Synchroniser" class = "img_in_table" style="cursor: pointer;" src="img/next_step.png"/></td>' //createRemoveCreateDoctors
						+ '</tr>'
					+ '</table>';
					$("#region_verif_result").html(htmlResult).fadeIn();
					$("#consistencyBefore").click(function() {
						toggleDiv("region_verif_result");
						createRemoveDoctors(region_token);
					})
					break;
			}
        }
    };
    xhr.ontimeout = function () {
		htmlResult = ''
			+ '<table class="rwd-table">'
			+ '<tr>'
				+ '<th>Information</th>'
				+ '<th>Action</th>'
			+ '</tr>'
			+ '<tr>'
				+ '<td data-th="Information">Impossible de se connecter à la base de données</td>'
				+ '<td data-th="Action"></td>'
			+ '</tr>'
			+ '<tr>'
				+ '<td data-th="Information"></td>'
				+ '<td data-th="Action">Relancer&nbsp;<img id="consistencyBefore" title="Réessayer" class = "img_in_table" style="cursor: pointer;" src="img/retry.png"/></td>'
			+ '</tr>'
		+ '</table>';
		$("#region_verif_result").html(htmlResult).fadeIn();
		$("#consistencyBefore").click(function() {
			checkDataConsistencyBefore(region_token)
		})
    };
    xhr.open("GET", url, true);
    xhr.send();
	
}

function createRemoveDoctors(region_token) { //OK Uxxx, no_remove OK

	//On prépare le div de synthèse des suppressions
	htmlRender = '';
	htmlRender = htmlRender 
		+ '<div class = "region_remove_synthesis" id = "region_remove_synthesis" style="cursor: pointer;" onclick = "toggleDiv(\'region_remove_synthesis_result\');">Synthèse des départs'
		+ '</div>'
		+ '<div class = "region_remove_synthesis_result" id = "region_remove_synthesis_result">'
		+ '</div>'
		;
	
	document.getElementById("action_comptage_depart_medecins").innerHTML = htmlRender;

	region_token_uri = encodeURIComponent(region_token);
	user_token_uri = encodeURIComponent(user_token);
	
    var url = host + "WebServices/NewRPPS/WS_Remove_Doctors.php?region_token=" + region_token_uri + "&user_token=" + user_token_uri;
    console.log(url);
    var xhr = new XMLHttpRequest();
    xhr.timeout = 2000;
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
			//console.log(xhr);
			var response = JSON.parse(xhr.responseText);
			console.log(response);
			switch(response.status_message) {
				case "fatal_error_region_code":
	        		logout();
	        		break;
				default:
					htmlResult = ''
						+ '<table class="rwd-table">'
						+ '<tr>'
							+ '<th>Information</th>'
							+ '<th>Action</th>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Information">' + response.status_message + '</td>'
							+ '<td data-th="Action"></td>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Information"></td>'
							+ '<td data-th="Action">Relancer&nbsp;<img id="createRemoveDoctors" title="Relancer" class = "img_in_table" style="cursor: pointer;" src="img/remove_listing_retry.png"/></td>'
						+ '</tr>'
					+ '</table>';
					$("#region_remove_synthesis_result").html(htmlResult).fadeIn();
					$("#createRemoveDoctors").click(function() {
						createRemoveDoctors(region_token)
					})
					break;
				case "no_remove":
					htmlResult = ''
						+ '<table class="rwd-table">'
						+ '<tr>'
							+ '<th>Information</th>'
							+ '<th>Action</th>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Information">' + response.status_message + '</td>'
							+ '<td data-th="Action"></td>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Information"></td>'
							+ '<td data-th="Action">Créations&nbsp;<img id="createRemoveDoctors" title="Créations" class = "img_in_table" style="cursor: pointer;" src="img/next_step.png"/></td>'
						+ '</tr>'
					+ '</table>';
					$("#region_remove_synthesis_result").html(htmlResult).fadeIn();
					$("#createRemoveDoctors").click(function() {
						toggleDiv("region_remove_synthesis_result");
						createCreateDoctors(region_token);
					})
					break;
				case "remove_count":
					process_id = response.data.process_id;
					htmlResult = ''
						+ '<table class="rwd-table">'
						+ '<tr>'
							+ '<th>Information</th>'
							+ '<th>Action</th>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Information">Nombre de départs de médecins : ' + response.data.nb_remove + '</td>'
							+ '<td data-th="Action"></td>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Information"></td>'
							+ '<td data-th="Action">Détail&nbsp;<img id="createRemoveDoctors" title="Détail" class = "img_in_table" style="cursor: pointer;" src="img/next_step.png"/></td>'
						+ '</tr>'
					+ '</table>';
					$("#region_remove_synthesis_result").html(htmlResult).fadeIn();
					$("#createRemoveDoctors").click(function() {
						toggleDiv("region_remove_synthesis_result");
						doctorDeleteManagement(region_token);
					})
					break;
			}
        }
    };
    xhr.ontimeout = function () {
    	htmlResult = ''
			+ '<table class="rwd-table">'
			+ '<tr>'
				+ '<th>Information</th>'
				+ '<th>Action</th>'
			+ '</tr>'
			+ '<tr>'
				+ '<td data-th="Information">Timeout</td>'
				+ '<td data-th="Action"></td>'
			+ '</tr>'
			+ '<tr>'
				+ '<td data-th="Information"></td>'
				+ '<td data-th="Action">Relancer&nbsp;<img id="createRemoveDoctors" title="Réessayer" class = "img_in_table" style="cursor: pointer;" onclick="createRemoveDoctors(' + '\'' + region_token + '\'' + ');"  src="img/proceed_retry.png"/></td>'
			+ '</tr>'
		+ '</table>';
    	$("#region_remove_synthesis_result").html(htmlResult);
    	$("#createRemoveDoctors").click(function() {
    		createRemoveDoctors(region_token)
		})
    };
    xhr.open("GET", url, true);
    xhr.send();
}

function doctorDeleteManagement(region_token) { //OK Uxxx

	region_token_uri = encodeURIComponent(region_token);
	process_id_uri = encodeURIComponent(process_id);
	user_token_uri = encodeURIComponent(user_token);

	//On prépare le div de vérification de synthèse des créations / suppressions
	htmlRender = '';
	htmlRender = htmlRender 
		+ '<div class = "region_leaving" id = "region_leaving" style="cursor: pointer;" onclick = "toggleDiv(\'region_leaving_result\');">Détail des suppressions'
		+ '</div>'
		+ '<div class = "region_leaving_result" id = "region_leaving_result">'
		+ '</div>'
		;
	
	document.getElementById("action_depart_medecins").innerHTML = htmlRender;
	
    var url = host + "WebServices/NewRPPS/WS_Get_Leaving_Doctors_Number_By_Sales_Pro.php?region_token=" + region_token_uri + "&process_id=" + process_id_uri + "&user_token=" + user_token_uri;
    //console.log(url);
    var xhr = new XMLHttpRequest();
    xhr.timeout = 2000;
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
			//console.log(xhr);
			var response = JSON.parse(xhr.responseText);
			console.log(response);
			switch(response.status_message) {
				case "fatal_error_region_code":
	        		logout();
	        		break;
				default:
					htmlResult = ''
						+ '<table class="rwd-table">'
						+ '<tr>'
							+ '<th>Information</th>'
							+ '<th>Action</th>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Information">' + response.status_message + '</td>'
							+ '<td data-th="Action"></td>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Information"></td>'
							+ '<td data-th="Action">Relancer&nbsp;<img id="doctorDeleteManagement" title="Relancer" class = "img_in_table" style="cursor: pointer;" src="img/retry.png"/></td>'
						+ '</tr>'
					+ '</table>';
					$("#region_leaving_result").html(htmlResult).fadeIn();
					$("#doctorDeleteManagement").click(function() {
						doctorDeleteManagement(region_token)
					})
					break;
				case "leaving_doctors_number_by_sales_pro":
					htmlResult = ''
						+ '<table class="rwd-table">'
						+ '<tr>'
							+ '<th>Commercial</th>'
							+ '<th>Perd</th>'
							+ '<th>Action</th>'
						+ '</tr>';
					htmlResultDetail = '';
					for (i = 0; i < response.data.length; i++) {
						htmlResultDetail = htmlResultDetail
							+ '<tr>'
								+ '<td data-th="Commercial">' + response.data[i].first_name + " " + response.data[i].last_name + '</td>'
								+ '<td data-th="Départs">' + response.data[i].nb_leaving_doctors + '</td>'
								+ '<td id="dDMSP_' + response.data[i].token + '" data-th="Action"><img title="Détails" class = "img_in_table" style="cursor: pointer;" onclick="getDetailDeleteDoctors(' + '\'' + region_token + '\'' + ', ' + '\'' + response.data[i].token + '\'' + ');" src="img/get_details.png"/></td>'
							+ '</tr>';
					}
					htmlResult = htmlResult
					+ htmlResultDetail
					+ '</table>';
					$("#region_leaving_result").html(htmlResult).fadeIn();
					break;
				case "no_more_leaving_doctors" : 
					htmlResult = ''
						+ '<table class="rwd-table">'
						+ '<tr>'
							+ '<th>Information</th>'
							+ '<th>Action</th>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Information">' + response.status_message + '</td>'
							+ '<td data-th="Action"></td>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Information"></td>'
							+ '<td data-th="Action">Créations&nbsp;&nbsp;<img id="doctorDeleteManagement" title="Relancer" class = "img_in_table" style="cursor: pointer;" src="img/next_step.png"/></td>'
						+ '</tr>'
					+ '</table>';
					$("#region_leaving_result").html(htmlResult).fadeIn();
					$("#doctorDeleteManagement").click(function() {
						toggleDiv("region_leaving_result");
						createCreateDoctors(region_token);
					})
					break;
			}
        }
    };
    xhr.ontimeout = function () {
    	htmlResult = ''
			+ '<table class="rwd-table">'
			+ '<tr>'
				+ '<th>Information</th>'
				+ '<th>Action</th>'
			+ '</tr>'
			+ '<tr>'
				+ '<td data-th="Information">Impossible de récupérer la liste des médecins partants</td>'
				+ '<td data-th="Action"></td>'
			+ '</tr>'
			+ '<tr>'
				+ '<td data-th="Information"></td>'
				+ '<td data-th="Action">Relancer&nbsp;<img id="doctorDeleteManagement" title="Relancer" class = "img_in_table" style="cursor: pointer;" src="img/retry.png"/></td>'
			+ '</tr>'
		+ '</table>';
		$("#region_leaving_result").html(htmlResult).fadeIn();
		$("#doctorDeleteManagement").click(function() {
			doctorDeleteManagement(region_token)
		})
    };
    xhr.open("GET", url, true);
    xhr.send();
	
}

function getDetailDeleteDoctors(region_token, sales_pro_token) { //OK Uxxx
	process_id_uri = encodeURIComponent(process_id);
	sales_pro_token_uri = encodeURIComponent(sales_pro_token);
	region_token_uri = encodeURIComponent(region_token);
	user_token_uri = encodeURIComponent(user_token);
	//réécrire le WS
    var url = host + "WebServices/NewRPPS/WS_Get_Detail_Leaving_Doctors_By_Sales_Pro.php?sales_pro_token=" + sales_pro_token_uri + "&process_id=" + process_id_uri + "&region_token=" + region_token_uri + "&user_token=" + user_token_uri ;
    console.log(url);
    var xhr = new XMLHttpRequest();
    
    xhr.timeout = 2000;
    xhr.onload = function (e) {
		//console.log(xhr);
		var response = JSON.parse(xhr.responseText);
		console.log(response);
		switch(response.status_message) {
			case "fatal_error_region_code":
        		logout();
        		break;
			default:
				htmlResult = ''
					+ '<table class="rwd-table">'
					+ '<tr>'
						+ '<th>Information</th>'
						+ '<th>Action</th>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Information">' + response.status_message + '</td>'
						+ '<td data-th="Action"></td>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Information"></td>'
						+ '<td data-th="Action">Relancer&nbsp;<img id="doctorDeleteManagement" title="Relancer" class = "img_in_table" style="cursor: pointer;" src="img/retry.png"/></td>'
					+ '</tr>'
				+ '</table>';
				$("#region_leaving_result").html(htmlResult).fadeIn();
				$("#doctorDeleteManagement").click(function() {
					doctorDeleteManagement(region_token)
				})
				break;
			case "leaving_doctors_detail_by_sales_pro":
				htmlResult = ''
					+ '<table class="rwd-table min-text-size">'
					+ '<tr>'
						+ '<th>Nom</th>'
						+ '<th>Prénom</th>'
						+ '<th>Spécialité</th>'
						+ '<th>Ville</th>'
						+ '<th>Action</th>'
					+ '</tr>';
				htmlResultDetail = '';
				for (i = 0; i < response.data.length; i++) {
					htmlResultDetail = htmlResultDetail
					/* sur 1 ligne */
						+ '<tr>'
							+ '<td data-th="Nom">' + response.data[i].name + '</td>'
							+ '<td data-th="Prénom">' + capitalizeWords(response.data[i].first_name) + '</td>'
							+ '<td data-th="Spécialité">' + response.data[i].speciality + '</td>'
							+ '<td data-th="Ville">' + response.data[i].city + '</td>'
							+ '<td data-th="Action"></td>'
						+ '</tr>';
					 
				}
				htmlResult = htmlResult
				+ htmlResultDetail
				
				+ '<tr>'
					+ '<td data-th="Nom"></td>'
					+ '<td data-th="Prénom"></td>'
					+ '<td data-th="Spécialité"></td>'
					+ '<td data-th="Ville"></td>'
					+ '<td id="dDMSP_' + sales_pro_token + '_supp" data-th="Action">Supprimer tous&nbsp;<img title="Supprimer" class = "img_in_table" style="cursor: pointer;" onclick="deleteDoctors(' + '\'' + region_token + '\'' + ', ' + '\'' + sales_pro_token + '\'' + ');" src="img/next_step.png"/></td>'
				+ '</tr>'
				+ '<tr>'
					+ '<td data-th="Nom"></td>'
					+ '<td data-th="Prénom"></td>'
					+ '<td data-th="Spécialité"></td>'
					+ '<td data-th="Ville"></td>'
					+ '<td id="dDMSP_' + sales_pro_token + '_refresh" data-th="Action">Retour&nbsp;<img title="Retour" class = "img_in_table" style="cursor: pointer;" onclick="doctorDeleteManagement(' + '\'' + region_token + '\'' + ');" src="img/refresh.png"/></td>'
				+ '</tr>';
				+ '</table>';
				$("#region_leaving_result").html(htmlResult).fadeIn();
				break;
			}
    };
    xhr.ontimeout = function () {
    	htmlResult = ''
			+ '<table class="rwd-table">'
			+ '<tr>'
				+ '<th>Information</th>'
				+ '<th>Action</th>'
			+ '</tr>'
			+ '<tr>'
				+ '<td data-th="Information">Impossible de récupérer la liste des médecins partants</td>'
				+ '<td data-th="Action"></td>'
			+ '</tr>'
			+ '<tr>'
				+ '<td data-th="Information"></td>'
				+ '<td data-th="Action">Relancer&nbsp;<img id="doctorDeleteManagement" title="Relancer" class = "img_in_table" style="cursor: pointer;" src="img/retry.png"/></td>'
			+ '</tr>'
		+ '</table>';
		$("#region_leaving_result").html(htmlResult).fadeIn();
		$("#doctorDeleteManagement").click(function() {
			doctorDeleteManagement(region_token)
		})
    };
    xhr.open("GET", url, true);
    xhr.send();
    
    
}

function deleteDoctors(region_token, sales_pro_token) { //sales pro token est le user token du commercial ; //OK Uxxx
	sales_pro_token_uri = encodeURIComponent(sales_pro_token);
	region_token_uri = encodeURIComponent(region_token);
	process_id_uri = encodeURIComponent(process_id);
	user_token_uri = encodeURIComponent(user_token_uri);
	
	/*on supprime commercial par commercial pour pouvoir normalement envoyer un mail par personne pour indiquer les changements*/
	
	
	/*
    on ne supprime pas le contenu de la table tmp_identifiant_pp
    on sauvegarde les données identifiant_pp <-> sales_pro_id que l'on va devoir supprimer
	on écrit les données de current_data dans histo_data
	on écrit les données de doctor_sales_pro_link dans histo_doctor_sales_pro_link
	on supprime les données de current_data
	on supprime les données de doctor_sales_pro_link
	 */
	

    var url = host + "WebServices/NewRPPS/WS_Delete_Doctors_By_Sales_Pro_Id.php?sales_pro_token=" + sales_pro_token_uri + "&process_id=" + process_id_uri + "&user_token=" + user_token_uri + "&region_token=" + region_token_uri;
    console.log(url);

    var xhr = new XMLHttpRequest();
    xhr.timeout = 2000;
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
			var response = JSON.parse(xhr.responseText);
			console.log(response);
			switch(response.status_message) {
			case "fatal_error_region_code" : 
				logout();
        		break;
			default :  //on met à jour uniquement la ligne concernée
				htmlResult = ''
					+ 'Relancer&nbsp;<img id="doctorDeleteManagement" title="Erreur" class = "img_in_table" style="cursor: pointer;" onclick="doctorDeleteManagement(' + '\'' + region_token + '\'' + ');" src="img/retry.png"/>';
				$("#dDMSP_" + sales_pro_token + "_supp").html(htmlResult).fadeIn();
				break;
			case "deleting_doctors_completed":
				doctorDeleteManagement(region_token);
				break;
			}
        }
    };
    xhr.ontimeout = function () {
    	//console.log("timeout");
    	htmlResult = ''
			+ 'Réessayer<img id="doctorDeleteManagement" title="Réessayer" class = "img_in_table" style="cursor: pointer;" onclick="doctorDeleteManagement(' + '\'' + region_token + '\'' + ');" src="img/retry.png"/>';
		$("#dDMSP_" + sales_pro_token).html(htmlResult).fadeIn();
    };
    xhr.open("GET", url, true);
    xhr.send();

}

function createCreateDoctors(region_token) { //OK Uxxx
	//On prépare le div de synthèse des créations
	htmlRender = '';
	htmlRender = htmlRender 
		+ '<div class = "region_create_synthesis" id = "region_create_synthesis" style="cursor: pointer;" onclick = "toggleDiv(\'region_create_synthesis_result\');">Synthèse des arrivées'
		+ '</div>'
		+ '<div class = "region_create_synthesis_result" id = "region_create_synthesis_result">'
		+ '</div>'
		;
	
	document.getElementById("action_comptage_arrivee_medecins").innerHTML = htmlRender;
	
	region_token_uri = encodeURIComponent(region_token);
	user_token_uri = encodeURIComponent(user_token);
	
	var url = host + "WebServices/NewRPPS/WS_Create_Doctors.php?region_token=" + region_token_uri + "&user_token=" + user_token_uri;
    console.log(url);
    var xhr = new XMLHttpRequest();
    xhr.timeout = 2000;
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
			//console.log(xhr);
			var response = JSON.parse(xhr.responseText);
			console.log(response);
			switch(response.status_message) {
				case "fatal_error_region_code":
	        		logout();
	        		break;
				default:
					htmlResult = ''
						+ '<table class="rwd-table">'
						+ '<tr>'
							+ '<th>Information</th>'
							+ '<th>Action</th>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Information">' + response.status_message + '</td>'
							+ '<td data-th="Action"></td>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Information"></td>'
							+ '<td data-th="Action">Relancer&nbsp;<img id="createCreateDoctors" title="Relancer" class = "img_in_table" style="cursor: pointer;" src="img/retry.png"/></td>'
						+ '</tr>'
					+ '</table>';
					$("#region_create_synthesis_result").html(htmlResult).fadeIn();
					$("#createCreateDoctors").click(function() {
						createCreateDoctors(region_token)
					})
					break;
				case "no_create":
					htmlResult = ''
						+ '<table class="rwd-table">'
						+ '<tr>'
							+ '<th>Information</th>'
							+ '<th>Action</th>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Information">' + response.status_message + '</td>'
							+ '<td data-th="Action"></td>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Information"></td>'
							+ '<td data-th="Action">Comptages&nbsp;<img id="createCreateDoctors" title="Vérification" class = "img_in_table" style="cursor: pointer;" src="img/next_step.png"/></td>'
						+ '</tr>'
					+ '</table>';
					$("#region_create_synthesis_result").html(htmlResult).fadeIn();
					$("#createCreateDoctors").click(function() {
						//on passe à la vérification de la cohérence de la base de données
						toggleDiv("region_create_synthesis_result");
						checkDataConsistencyAfter(region_token);
					})
					break;
				case "create_count":
					process_id = response.data.process_id;
					htmlResult = ''
						+ '<table class="rwd-table">'
						+ '<tr>'
							+ '<th>Information</th>'
							+ '<th>Action</th>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Information">Nombre d\'arrivées de médecins : ' + response.data.nb_create + '</td>'
							+ '<td data-th="Action"></td>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Information"></td>'
							+ '<td data-th="Action">Détail&nbsp;<img id="createCreateDoctors" title="Détail" class = "img_in_table" style="cursor: pointer;" src="img/next_step.png"/></td>'
						+ '</tr>'
					+ '</table>';
					$("#region_create_synthesis_result").html(htmlResult).fadeIn();
					$("#createCreateDoctors").click(function() {
						toggleDiv("region_create_synthesis_result");
						doctorCreateManagement(region_token);
					})
					break;
			}
        }
    };
    xhr.ontimeout = function () {
    	htmlResult = ''
			+ '<table class="rwd-table">'
			+ '<tr>'
				+ '<th>Information</th>'
				+ '<th>Action</th>'
			+ '</tr>'
			+ '<tr>'
				+ '<td data-th="Information">Timeout</td>'
				+ '<td data-th="Action"></td>'
			+ '</tr>'
			+ '<tr>'
				+ '<td data-th="Information"></td>'
				+ '<td data-th="Action">Relancer&nbsp;<img id="createCreateDoctors" title="Réessayer" class = "img_in_table" style="cursor: pointer;" onclick="createCreateDoctors(' + '\'' + region_token + '\'' + ');"  src="img/retry.png"/></td>'
			+ '</tr>'
		+ '</table>';
    	$("#region_create_synthesis_result").html(htmlResult);
    	$("#createCreateDoctors").click(function() {
    		createRemoveDoctors(region_token)
		})
    };
    xhr.open("GET", url, true);
    xhr.send();
	
	
}

function doctorCreateManagement(region_token) { //OK Uxxx
	
	process_id_uri = encodeURIComponent(process_id);
	region_token_uri = encodeURIComponent(region_token);
	user_token_uri = encodeURIComponent(user_token);
	
	htmlRender = '';
	htmlRender = htmlRender 
		+ '<div class = "region_arriving" id = "region_arriving" style="cursor: pointer;" onclick = "toggleDiv(\'region_arriving_result\');">Détail des arrivées'
		+ '</div>'
		+ '<div class = "region_arriving_result" id = "region_arriving_result">'
		+ '</div>'
		;
	
	document.getElementById("action_arrivee_medecins").innerHTML = htmlRender;
	
    var url = host + "WebServices/NewRPPS/WS_Get_New_Doctors_List_By_Speciality.php?process_id=" + process_id_uri + "&region_token=" + region_token_uri + "&user_token=" + user_token_uri;
    //console.log(url);
    var xhr = new XMLHttpRequest();
    xhr.timeout = 2000;
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
        	var response = JSON.parse(xhr.responseText);
			console.log(response);
			switch(response.status_message) {
			case "fatal_error_region_code":
        		logout();
        		break;
			default:
				htmlResult = ''
					+ '<table class="rwd-table">'
					+ '<tr>'
						+ '<th>Information</th>'
						+ '<th>Action</th>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Information">' + response.status_message + '</td>'
						+ '<td data-th="Action"></td>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Information"></td>'
						+ '<td data-th="Action">Relancer&nbsp;<img id="doctorCreateManagement" title="Relancer" class = "img_in_table" style="cursor: pointer;" src="img/retry.png"/></td>'
					+ '</tr>'
				+ '</table>';
				$("#region_arriving_result").html(htmlResult).fadeIn();
				$("#doctorCreateManagement").click(function() {
					doctorCreateManagement(region_token);
				})
				break;
			case "new_doctor_speciality_count":
				htmlResult = ''
					+ '<table class="rwd-table">'
					+ '<tr>'
						+ '<th>Spécialité</th>'
						+ '<th>Arrivées</th>'
						+ '<th>Action</th>'
					+ '</tr>';
				htmlResultDetail = '';
				for (i = 0; i < response.data.length; i++) {
					htmlResultDetail = htmlResultDetail
						+ '<tr id="TR_dCM_' + response.data[i].profession_id + '">'
							+ '<td data-th="Spécialité">' + response.data[i].libelle_savoir_faire + '</td>'
							+ '<td data-th="Arrivées">' + response.data[i].nb_new_doctors + '</td>'
							+ '<td id="TD_dCM_' + response.data[i].profession_id + '" data-th="Action"><img title="Détails" class = "img_in_table" style="cursor: pointer;" onclick="getDetailNewDoctors(' + '\'' + region_token + '\'' + ', ' + '\'' + response.data[i].profession_id + '\'' + ');" src="img/add_doctors_detail.png"/></td>'
						+ '</tr>';

				}
				htmlResult = htmlResult
				+ htmlResultDetail
				+ '<tr>'
					+ '<td data-th="Spécialité">Ajouter tous</td>'
					+ '<td data-th="Arrivées"></td>'
					+ '<td id="dCM_add_all" data-th="Action"><img id="doctorCreateManagement" title="Ajouter" class = "img_in_table" style="cursor: pointer;" src="img/next_step.png"/></td>'
				+ '</tr>';
				+ '</table>';
				$("#region_arriving_result").html(htmlResult).fadeIn();
				$("#doctorCreateManagement").click(function() {
					toggleDiv("region_arriving_result");
					addAllDoctors(region_token);
				})
			
				break;
			case "no_new_doctor" : 
				htmlResult = ''
					+ '<table class="rwd-table">'
					+ '<tr>'
						+ '<th>Information</th>'
						+ '<th>Action</th>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Information">' + response.status_message + '</td>'
						+ '<td data-th="Action"></td>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Information"></td>'
						+ '<td data-th="Action">Comptage&nbsp;<img id="doctorCreateManagement" title="Vérifier" class = "img_in_table" style="cursor: pointer;" src="img/next_step.png"/></td>'
					+ '</tr>'
				+ '</table>';
				$("#region_arriving_result").html(htmlResult).fadeIn();
				$("#doctorCreateManagement").click(function() {
					toggleDiv("region_arriving_result");
					checkDataConsistencyAfter(region_token);
				})
				break;
			}
			
        }
    };
    xhr.ontimeout = function () {
    	htmlResult = ''
			+ '<table class="rwd-table">'
			+ '<tr>'
				+ '<th>Information</th>'
				+ '<th>Action</th>'
			+ '</tr>'
			+ '<tr>'
				+ '<td data-th="Information">Impossible de se connecter à la base de données</td>'
				+ '<td data-th="Action"></td>'
			+ '</tr>'
			+ '<tr>'
				+ '<td data-th="Information"></td>'
				+ '<td data-th="Action">Relancer&nbsp;<img id="doctorCreateManagement" title="Relancer" class = "img_in_table" style="cursor: pointer;" src="img/add_doctors_retry.png"/></td>'
			+ '</tr>'
		+ '</table>';
		$("#region_leaving_result").html(htmlResult).fadeIn();
		$("#doctorCreateManagement").click(function() {
			doctorCreateManagement(region_token)
		})
    };
    xhr.open("GET", url, true);
    xhr.send();
} 

function getDetailNewDoctors(region_token, profession_id) {//OK Uxxx
	
	process_id_uri = encodeURIComponent(process_id);
	profession_id_uri = encodeURIComponent(profession_id);
	region_token_uri = encodeURIComponent(region_token);
	user_token_uri = encodeURIComponent(user_token);
	//réécrire le WS
    var url = host + "WebServices/NewRPPS/WS_Get_New_Doctors_List_Detail_By_Speciality.php?profession_id=" + profession_id_uri + "&process_id=" + process_id_uri + "&region_token=" + region_token_uri + "&user_token=" + user_token_uri ;
    //console.log(url);
    var xhr = new XMLHttpRequest();

    
    xhr.timeout = 2000;
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
			//console.log(xhr);
        	var response = JSON.parse(xhr.responseText);
        	console.log(response);
			switch(response.status_message) {
			case "fatal_error_region_code":
        		logout();
        		break;
			default:
				htmlResult = ''
					+ '<table class="rwd-table">'
					+ '<tr>'
						+ '<th>Information</th>'
						+ '<th>Action</th>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Information">' + response.status_message + '</td>'
						+ '<td data-th="Action">Retour</td>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Information"></td>'
						+ '<td data-th="Action"><img id="doctorDetail" title="Listing" class = "img_in_table" style="cursor: pointer;" src="img/retry.png"/></td>'
					+ '</tr>'
				+ '</table>';
				$("#region_arriving_result").html(htmlResult).fadeIn();
				$("#doctorDetail").click(function() {
					doctorCreateManagement(region_token)
				})
				break;
			case "new_doctor_speciality_detail":
				htmlResult = ''
					+ '<table class="rwd-table">'
					+ '<tr>'
						+ '<th>Civilite</th>'
						+ '<th>Nom</th>'
						+ '<th>Prenom</th>'
						+ '<th>Commune</th>'
						+ '<th>Action</th>'
					+ '</tr>';
				htmlResultDetail = '';
				for (var i = 0; i < response.data.length; i++) {
					htmlResultDetail = htmlResultDetail
					+ '<tr>'
						+ '<td data-th="Civilite">' + response.data[i].libelle_civilite + '</td>'
						+ '<td data-th="Nom">' + response.data[i].nom_exercice + '</td>'
						+ '<td data-th="Prenom">' + capitalizeWords(response.data[i].prenom_exercice) + '</td>'
						+ '<td data-th="Commune">' + response.data[i].commune + '</td>'
						+ '<td data-th="Action"></td>'
					+ '</tr>';
				}
				
				htmlResult = htmlResult + htmlResultDetail
						+ '<tr>'
							+ '<td data-th="Civilite"></td>'
							+ '<td data-th="Nom"></td>'
							+ '<td data-th="Prenom"></td>'
							+ '<td data-th="Commune"></td>'
							+ '<td data-th="Action">Retour<img id="doctorDetail" title="Listing" class = "img_in_table" style="cursor: pointer;" src="img/refresh.png"/></td>'
						+ '</tr>';
					+ '</table>';

				$("#region_arriving_result").html(htmlResult).fadeIn();
				$("#doctorDetail").click(function() {
					doctorCreateManagement(region_token)
				})
				break;
			}
        }
    };
    xhr.ontimeout = function () {htmlResult = ''
		+ '<table class="rwd-table">'
		+ '<tr>'
			+ '<th>Information</th>'
			+ '<th>Action</th>'
		+ '</tr>'
		+ '<tr>'
			+ '<td data-th="Information">Timeout</td>'
			+ '<td data-th="Action"></td>'
		+ '</tr>'
		+ '<tr>'
			+ '<td data-th="Information"></td>'
			+ '<td data-th="Action">Relancer&nbsp;<img id="doctorDetail" title="Listing" class = "img_in_table" style="cursor: pointer;" src="img/retry.png"/></td>'
		+ '</tr>'
	+ '</table>';
	$("#region_arriving_result").html(htmlResult).fadeIn();
	$("#doctorDetail").click(function() {
		doctorCreateManagement(region_token)
	})
    };
    xhr.open("GET", url, true);
    xhr.send();
}

function addAllDoctors(region_token) {//OK Uxxx + Transaction sur la chaîne complète (histo + données)
	
	process_id_uri = encodeURIComponent(process_id);
	region_token_uri = encodeURIComponent(region_token);
	user_token_uri = encodeURIComponent(user_token);
	
	htmlRender = '';
	htmlRender = htmlRender 
		+ '<div class = "region_sumup_arriving" id = "region_sumup_arriving" style="cursor: pointer;" onclick = "toggleDiv(\'region_sumup_arriving_result\');">Résultat des créations'
		+ '</div>'
		+ '<div class = "region_sumup_arriving_result" id = "region_sumup_arriving_result">'
		+ '</div>'
		;
	
	document.getElementById("action_bilan_arrivee_medecins").innerHTML = htmlRender;
	
	/*
	 on ne supprime pas le contenu de la table tmp_identifiant_pp, ça peut servir d'historique des mouvements
	 on sauvegarde les données identifiant_pp que l'on va devoir créer, liées au commercial "is_new" (fait dans doctorAddManagement pour éviter au maximum 
	 les requêtes sur new_data qui n'est pas indexée
	 on écrit les données de new_data dans histo_data en type 'CREATE'
	 on écrit les données de tmp_identifiant_pp dans histo_doctor_sales_pro_link en type 'CREATE'
	 on écrit les données de histo_data dans current_data
	 on écrit les données de histo_doctor_sales_pro_link dans doctor_sales_pro_link
	 */
    var url = host + "WebServices/NewRPPS/WS_Create_New_Doctors.php?process_id=" + process_id_uri + "&region_token=" + region_token + "&user_token=" + user_token;
    console.log(url);

    var xhr = new XMLHttpRequest();
    xhr.timeout = 5000;
    xhr.onreadystatechange = function (e) {
        if (xhr.readyState === 4) {
			console.log(xhr);
			var response = JSON.parse(xhr.responseText);
			console.log(response);
			switch(response.status_message) {
			case "fatal_error_region_code":
        		logout();
        		break;
			default:
				htmlResult = ''
					+ '<table class="rwd-table">'
					+ '<tr>'
						+ '<th>Information</th>'
						+ '<th>Action</th>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Information">' + response.status_message + '</td>'
						+ '<td data-th="Action"></td>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Information"></td>'
						+ '<td data-th="Action">Réessayer&nbsp;<img id="doctorCreateResult" title="Listing" class = "img_in_table" style="cursor: pointer;" src="img/retry.png"/></td>'
					+ '</tr>'
				+ '</table>';
				$("#region_sumup_arriving_result").html(htmlResult).fadeIn();
				$("#doctorCreateResult").click(function() {
					addAllDoctors(region_token)
				})
				break;
			case "new_doctors_creation_ok":
				htmlResult = ''
					+ '<table class="rwd-table">'
					+ '<tr>'
						+ '<th>Information</th>'
						+ '<th>Action</th>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Information">Création Ok</td>'
						+ '<td data-th="Action"></td>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Information"></td>'
						+ '<td data-th="Action">Vérifier&nbsp;<img id="doctorCreateResult" title="Vérifier" class = "img_in_table" style="cursor: pointer;" src="img/next_step.png"/></td>'
					+ '</tr>'
				+ '</table>';
				$("#region_sumup_arriving_result").html(htmlResult).fadeIn();
				$("#doctorCreateResult").click(function() {
					toggleDiv("region_sumup_arriving_result");
					checkDataConsistencyAfter(region_token);
				})
				break;
			}
        }
    };
    xhr.ontimeout = function () {
    	htmlResult = ''
			+ '<table class="rwd-table">'
			+ '<tr>'
				+ '<th>Information</th>'
				+ '<th>Action</th>'
			+ '</tr>'
			+ '<tr>'
				+ '<td data-th="Information">Impossible de se connecter à la base de données</td>'
				+ '<td data-th="Action">Réessayer</td>'
			+ '</tr>'
			+ '<tr>'
				+ '<td data-th="Information"></td>'
				+ '<td data-th="Action"><img id="doctorCreateResult" title="Listing" class = "img_in_table" style="cursor: pointer;" src="img/add_doctors_retry.png"/></td>'
			+ '</tr>'
		+ '</table>';
		$("#region_sumup_arriving_result").html(htmlResult).fadeIn();
		$("#doctorCreateResult").click(function() {
			addAllDoctors(region_token)
		})
    };
    xhr.open("GET", url, true);
    xhr.send();
}

function checkDataConsistencyAfter(region_token) {//OK Uxxx
	
	region_token_uri = encodeURIComponent(region_token);
	user_token_uri = encodeURIComponent(user_token);

	
	//On prépare le div de vérification de la cohérence des données
	htmlRender = '';
	htmlRender = htmlRender 
		+ '<div class = "region_verif_apres" id = "region_verif_apres" style="cursor: pointer;" onclick = "toggleDiv(\'region_verif_apres_result\');">Vérification des données'
		+ '</div>'
		+ '<div class = "region_verif_apres_result" id = "region_verif_apres_result">'
		+ '</div>'
		;
	
	document.getElementById("action_verif_coherence_apres").innerHTML = htmlRender;
	
	
    var url = host + "WebServices/NewRPPS/WS_Check_Data_Consistency.php?region_token=" + region_token_uri + "&user_token=" + user_token_uri;
    //console.log(url);
    var xhr = new XMLHttpRequest();
    xhr.timeout = 2000;
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
			
			var response = JSON.parse(xhr.responseText);
			console.log(response);
			switch(response.status_message) {
				case "fatal_error_region_code":
	        		logout();
				default:
					htmlResult = ''
						+ '<table class="rwd-table">'
						+ '<tr>'
							+ '<th>Information</th>'
							+ '<th>Action</th>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Information">' + response.status_message + '</td>'
							+ '<td data-th="Action"></td>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Information"></td>'
							+ '<td data-th="Action">Relancer&nbsp;<img id="consistencyAfter" title="Relancer" class = "img_in_table" style="cursor: pointer;" src="img/retry.png"/></td>'
						+ '</tr>'
					+ '</table>';
					$("#region_verif_apres_result").html(htmlResult).fadeIn();
					$("#consistencyAfter").click(function() {
						checkDataConsistencyAfter(region_token)
					})
					break;
				case "data_base_not_consistent_counts":
					htmlResult = ''
						+ '<table class="rwd-table">'
						+ '<tr>'
							+ '<th>Comptage</th>'
							+ '<th>Valeur</th>'
							+ '<th>Action</th>'
						+ '</tr>'
						+ '<tr>'
						+ '<tr>'
							+ '<td data-th="Comptage">CD distincts</td>'
							+ '<td data-th="Valeur">' + response.data['distinct_cd'] + '</td>'
							+ '<td data-th="Action"></td>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Comptage">DSP distincts</td>'
							+ '<td data-th="Valeur">' + response.data['distinct_dsp'] + '</td>'
							+ '<td data-th="Action"></td>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Comptage">DSP</td>'
							+ '<td data-th="Valeur">' + response.data['dsp'] + '</td>'
							+ '<td data-th="Action"></td>'
						+ '</tr>'
							+ '<td data-th="Comptage">Base de données non cohérente</td>'
							+ '<td data-th="Valeur"></td>'
							+ '<td data-th="Action"></td>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Comptage"></td>'
							+ '<td data-th="Valeur"></td>'
							+ '<td data-th="Action">Email&nbsp;<img id="consistencyAfter" title="Envoyer un email" class = "img_in_table" src="img/message.png"/></td>'
						+ '</tr>'
					+ '</table>';
					$("#region_verif_apres_result").html(htmlResult).fadeIn();
					/*
					$("#consistencyBefore").click(function() {
						checkDataConsistencyBefore(region_token)
					})
					*/
					break;
				case "data_base_not_consistent_CD_DSP":
					htmlResult = ''
					+ '<table class="rwd-table">'
						+ '<tr>'
							+ '<th>Comptage</th>'
							+ '<th>Valeur</th>'
							+ '<th>Action</th>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Comptage">Base de données non cohérente</td>'
							+ '<td data-th="Valeur"></td>'
							+ '<td data-th="Action"></td>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Comptage">CD pas dans DSP</td>'
							+ '<td data-th="Valeur">' + response.data['nb_cd_not_in_dsp'] + '</td>'
							+ '<td data-th="Action"></td>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Comptage">DSP pas dans CD</td>'
							+ '<td data-th="Valeur">' + response.data['nb_dsp_not_in_cd'] + '</td>'
							+ '<td data-th="Action"></td>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Comptage"></td>'
							+ '<td data-th="Valeur"></td>'
							+ '<td data-th="Action">Email&nbsp;<img id="consistencyAfter" title="Envoyer un email" class = "img_in_table" src="img/message.png"/></td>'
						+ '</tr>'
					+ '</table>';
					$("#region_verif_apres_result").html(htmlResult).fadeIn();
					/*
					$("#consistencyBefore").click(function() {
						checkDataConsistencyBefore(region_token)
					})
					*/
					break;
				case "all_data_ok":
					htmlResult = ''
					+ '<table class="rwd-table">'
						+ '<tr>'
							+ '<th>Information</th>'
							+ '<th>Action</th>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Information">Base cohérente</td>'
							+ '<td data-th="Action"></td>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Information"></td>'
							+ '<td data-th="Action">Mises à jour&nbsp;<img id="consistencyAfter" title="Changements" class = "img_in_table" style="cursor: pointer;" src="img/next_step.png"/></td>' //createRemoveCreateDoctors
						+ '</tr>'
					+ '</table>';
					$("#region_verif_apres_result").html(htmlResult).fadeIn();
					$("#consistencyAfter").click(function() {
						toggleDiv("region_verif_apres_result");
						doctorsDataChange(region_token);
					})
					break;
			}
        }
    };
    xhr.ontimeout = function () {
		htmlResult = ''
			+ '<table class="rwd-table">'
			+ '<tr>'
				+ '<th>Information</th>'
				+ '<th>Action</th>'
			+ '</tr>'
			+ '<tr>'
				+ '<td data-th="Information">Timeout</td>'
				+ '<td data-th="Action"></td>'
			+ '</tr>'
			+ '<tr>'
				+ '<td data-th="Information"></td>'
				+ '<td data-th="Action">Relancer&nbsp;<img id="consistencyAfter" title="Réessayer" class = "img_in_table" style="cursor: pointer;" src="img/consistency_retry.png"/></td>'
			+ '</tr>'
		+ '</table>';
		$("#region_verif_apres_result").html(htmlResult).fadeIn();
		$("#consistencyAfter").click(function() {
			checkDataConsistencyAfter(region_token)
		})
    };
    xhr.open("GET", url, true);
    xhr.send();
}

function doctorsDataChange(region_token) {//OK Uxxx, vérifier quand plusieurs régions seront dans les tables histo_data et histo_doctor
	
	//process_id_uri = encodeURIComponent(process_id);
	//on crée un nouveau process pour gérer le cas ou il n'y aurait que des mises à jour, et donc pas de process déjà créé par createRemoveDoctors ou createCreateDoctors
	
	region_token_uri = encodeURIComponent(region_token);
	user_token_uri = encodeURIComponent(user_token);
	
	htmlRender = '';
	htmlRender = htmlRender 
		+ '<div class = "doctor_data_change" id = "doctor_data_change" style="cursor: pointer;" onclick = "toggleDiv(\'doctor_data_change_result\');">Mises à jour'
		+ '</div>'
		+ '<div class = "doctor_data_change_result" id = "doctor_data_change_result">'
		+ '</div>'
		;
	
	document.getElementById("action_bilan_mises_a_jour").innerHTML = htmlRender;
	
	
	
    var url = host + "WebServices/NewRPPS/WS_Make_Coherent_Data.php?region_token=" + region_token_uri + "&user_token=" + user_token_uri;
    console.log(url);

    var xhr = new XMLHttpRequest();
    xhr.timeout = 5000;
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
			//console.log(xhr);
			var response = JSON.parse(xhr.responseText);
			console.log(response);
			switch(response.status_message) {
			case "fatal_error_region_code":
        		logout();
        		break;
			default:
				htmlResult = ''
					+ '<table class="rwd-table">'
					+ '<tr>'
						+ '<th>Information</th>'
						+ '<th>Action</th>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Information">' + response.status_message + '</td>'
						+ '<td data-th="Action"></td>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Information"></td>'
						+ '<td data-th="Action">Relancer&nbsp;<img id="doctorsDataChange" title="Relancer" class = "img_in_table" style="cursor: pointer;" src="img/retry.png"/></td>'
					+ '</tr>'
				+ '</table>';
				$("#doctor_data_change_result").html(htmlResult).fadeIn();
				$("#doctorsDataChange").click(function() {
					doctorsDataChange(region_token)
				})
				break;
			case "no_data_in_counts":
				htmlResult = ''
					+ '<table class="rwd-table">'
						+ '<tr>'
							+ '<th>Information</th>'
							+ '<th>Action</th>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Information">' + response.status_message + '</td>'
							+ '<td data-th="Action"></td>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Information"></td>'
							+ '<td data-th="Action">Comptage&nbsp;<img id = "doctorsDataChange" title="Vérifier" class = "img_in_table" style="cursor: pointer;" src="img/next_step.png"/></td>'
						+ '</tr>'
					+ '</table>';
				$("#doctor_data_change_result").html(htmlResult).fadeIn();
				$("#doctorsDataChange").click(function() {
					toggleDiv("doctor_data_change_result");
					checkFinalConsistency(region_token);
				})
				break;
			case "updates_counts":
				htmlResult = ''
					+ '<table class="rwd-table">'
						+ '<tr>'
							+ '<th>Information</th>'
							+ '<th>Comptages</th>'
							+ '<th>Action</th>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Information">Changements effectués lors de cette mise à jour</td>'
							+ '<td data-th="Comptages"></td>'
							+ '<td data-th="Action"></td>'
						+ '</tr>';
				htmlResultDetail = '';
				for (var i = 0; i < response.data.length; i++) {
					htmlResultDetail = htmlResultDetail 
						+ '<tr>'
							+ '<td data-th="Information">' + response.data[i]['histo_type'] + '</td>' 
							+ '<td data-th="Comptages">' + response.data[i]['nb_movement'] + '</td>'
						+ '</tr>';
				}
				htmlResult = htmlResult 
					+ htmlResultDetail
						+ '<tr>'
							+ '<td data-th="Information"></td>'
							+ '<td data-th="Comptages"></td>'
							+ '<td data-th="Action">Comptage<img id = "doctorsDataChange" title="Vérifier" class = "img_in_table" style="cursor: pointer;" src="img/next_step.png"/></td>'
						+ '</tr>'
					+ '</table>';
				$("#doctor_data_change_result").html(htmlResult).fadeIn();
				$("#doctorsDataChange").click(function() {
					toggleDiv("doctor_data_change_result");
					checkFinalConsistency(region_token);
				})
				break;
			}
        }
    };
    xhr.ontimeout = function () {
    	htmlResult = ''
			+ '<table class="rwd-table">'
				+ '<tr>'
					+ '<th>Information</th>'
					+ '<th>Action</th>'
				+ '</tr>'
				+ '<tr>'
					+ '<td data-th="Information">Timeout</td>'
					+ '<td data-th="Action"></td>'
				+ '</tr>'
				+ '<tr>'
					+ '<td data-th="Information"></td>'
					+ '<td data-th="Action">Relancer&nbsp;<img id = "doctorsDataChange" title="Relancer" class = "img_in_table" style="cursor: pointer;" src="img/retry.png"/></td>'
				+ '</tr>'
			+ '</table>';
		$("#doctor_data_change_result").html(htmlResult).fadeIn();
		$("#doctorsDataChange").click(function() {
			doctorsDataChange(region_token)
		})
    };
    xhr.open("GET", url, true);
    xhr.send();
}

function checkFinalConsistency(region_token) {//OK Uxxx
	
	htmlRender = '';
	htmlRender = htmlRender 
		+ '<div class = "region_final_consistency" id = "region_final_consistency" style="cursor: pointer;" onclick = "toggleDiv(\'region_final_consistency_result\');">Comparaison globale'
		+ '</div>'
		+ '<div class = "region_final_consistency_result" id = "region_final_consistency_result">'
		+ '</div>'
		;
	
	document.getElementById("action_coherence_finale").innerHTML = htmlRender;
	
	region_token_uri = encodeURIComponent(region_token);
	user_token_uri = encodeURIComponent(user_token);

	
    var url = host + "WebServices/NewRPPS/WS_Get_RPPS_Detail_By_Region.php?region_token=" + region_token_uri + "&user_token=" + user_token_uri;
    //console.log(url);
    xhr = new XMLHttpRequest();
    xhr.timeout = 2000;
    xhr.open("GET", url, true);
    xhr.onload = function() {
        var response = JSON.parse(xhr.responseText);
        console.log(response);
        switch(response.status_message) {
    	case "fatal_error_region_code": //le code région a été modifié à la main
    		logout();
    		break;
        default:
        	//on est en erreur, on propose de relancer
        	htmlResult = ''
				+ '<table class="rwd-table">'
					+ '<tr>'
						+ '<th>Information</th>'
						+ '<th>Action</th>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Information">' + response.status_message + '</td>'
						+ '<td data-th="Action"></td>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Information"></td>'
						+ '<td data-th="Action">Relancer&nbsp;<img id="checkFinalConsistency" title="Relancer" class = "img_in_table" style="cursor: pointer;" src="img/retry.png"/></td>'
				+ '</tr>'
				+ '</table>';
			$("#region_final_consistency_result").html(htmlResult).fadeIn();
			$("#checkFinalConsistency").click(function() {
				checkFinalConsistency(region_token)
			})
			break;
		case "incomplete_region_tables":
			//on est en erreur, on propose un init
			htmlResult = ''
				+ '<table class="rwd-table">'
					+ '<tr>'
						+ '<th>Information</th>'
						+ '<th>Action</th>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Information">Région non initialisée</td>'
						+ '<td data-th="Action"></td>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Information"></td>'
						+ '<td data-th="Action">Initialiser&nbsp;<img id="checkFinalConsistency" title="Relancer" class = "img_in_table" style="cursor: pointer;" src="img/create.png"/></td>'
					+ '</tr>'
					+ '</table>';
				$("#region_final_consistency_result").html(htmlResult).fadeIn();
				$("#checkFinalConsistency").click(function() {
					initRegion(region_token)
				})
			break;
		case "RPPS_overview_data":
			htmlResult = ''
				+ '<table class="rwd-table">'
					+ '<tr>'
						+ '<th>Donnée</th>'
						+ '<th>Valeur actuelle</th>'
						+ '<th>Nouvelle valeur</th>'
						+ '<th>Action</th>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Donnée">Nombre de lignes : </td>'
						+ '<td data-th="Valeur actuelle">' + response.data.current_line_count + '</td>'
						+ '<td data-th="Nouvelle valeur">' + response.data.new_data_line_count + '</td>'
						+ '<td data-th="Action"></td>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Donnée">Nombre de médecins : </td>'
						+ '<td data-th="Valeur actuelle">' + response.data.current_distinct_count + '</td>'
						+ '<td data-th="Nouvelle valeur">' + response.data.new_data_distinct_count + '</td>'
						+ '<td data-th="Action"></td>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Donnée">Date de mise à jour : </td>'
						+ '<td data-th="Valeur actuelle">' + response.data.current_last_update + '</td>'
						+ '<td data-th="Nouvelle valeur">' + response.data.new_data_last_update + '</td>'
						+ '<td data-th="Action">Terminer&nbsp;<img id="checkFinalConsistency" title="Vérifier" class = "img_in_table" style="cursor: pointer;" src="img/next_step.png"/></td>'
					+ '</tr>'
				+ '</table>';
			

			$("#region_final_consistency_result").html(htmlResult).fadeIn();
			$("#checkFinalConsistency").click(function() {
				toggleDiv("region_final_consistency_result");
				createLastUpdateProcess(region_token);
			})
			break;
	    }
    }
    xhr.send();
    xhr.ontimeout = function () {
    	//On est en timeout, on propose de relancer la recherche des données
    	htmlResult = ''
			+ '<table class="rwd-table">'
				+ '<tr>'
					+ '<th>Information</th>'
					+ '<th>Action</th>'
				+ '</tr>'
				+ '<tr>'
					+ '<td data-th="Information">Impossible de se connecter à la base de données</td>'
					+ '<td data-th="Action"></td>'
				+ '</tr>'
				+ '<tr>'
					+ '<td data-th="Information"></td>'
					+ '<td data-th="Action">Relancer&nbsp;<img id="checkFinalConsistency" title="Relancer" class = "img_in_table" style="cursor: pointer;" src="img/retry.png"/></td>'
				+ '</tr>'
			+ '</table>';
		$("#region_final_consistency_result" + i).html(htmlResult).fadeIn();
		$("#checkFinalConsistency").click(function() {
			checkFinalConsistency(region_token)
		})
    };
}

function createLastUpdateProcess(region_token) {//OK Uxxx
	region_token_uri = encodeURIComponent(region_token);
	user_token_uri = encodeURIComponent(user_token);
	
	var url = host + "WebServices/NewRPPS/WS_Create_Last_Update_Process.php?region_token=" + region_token_uri + "&user_token=" + user_token_uri;
    console.log(url);
    xhr = new XMLHttpRequest();
    xhr.timeout = 2000;
    xhr.open("GET", url, true);
    xhr.onload = function() {
        var response = JSON.parse(xhr.responseText);
        console.log(response);
        switch(response.status_message) {
    	case "fatal_error_region_code": //le code région a été modifié à la main
    		logout();
    		break;
        default:
        	newRPPSPage(); //on ne fait rien si erreur, à voir à l'usage
        	break;
	    }
    }
    xhr.send();
    xhr.ontimeout = function () {
    	newRPPSPage();
    };
	
}

//FIN Nouveau RPPS

//DEBUT Cartographie
//source : https://github.com/akq/Leaflet.DonutCluster/blob/master/README.md

function initMapPage() { //OK Uxxx
	if (alreadyConnected()) 
	{ //à mettre au début de chaque fonction Page
		if (! document.getElementById("#content") || ! document.getElementById("#left_menu")) {
			populateApp();
		}
		var htmlRender = ''
			+ '<div class="action" id="action_choix_agence"></div>'
			+ '<div class="action" id="action_choix_region"></div>'
			+ '<div class="action" id="action_choix_specialite"></div>'
			+ '<div id="map_render"></div>'
			+ '<div class="alert" id="alert_recup_donnees_carto"></div>';
		document.getElementById("content").innerHTML = htmlRender;
		//generateMapv4();
		currentUserAgencySelectMAP();
	}
	else
	{
		router.navigate('');
	}
}

function currentUserAgencySelectMAP() { //OK Uxxx
	htmlRender = '';
	htmlRender = htmlRender 
		+ '<div class = "agency_list" id = "agency_list" style="cursor: pointer;" onclick = "toggleDiv(\'agency_list_result\');">Choisir une agence'
		+ '</div>'
		+ '<div class = "agency_list_result" id = "agency_list_result">'
		+ '</div>'
		;
	
	document.getElementById("action_choix_agence").innerHTML = htmlRender;
	
	
	htmlResult = ''
		+ '<table class="rwd-table">'
		+ '<tr>'
			+ '<th>Agence</th>'
			+ '<th>Action</th>'
		+ '</tr>';
	htmlResultDetail = '';
	for (var i = 0; i < user_data.agency_array.length; i++) {
		htmlResultDetail = htmlResultDetail
			+ '<tr>'
				+ '<td data-th="Agence">' + user_data.agency_array[i].agency_name + '</td>'
				+ '<td data-th="Action">Sélectionner&nbsp;<img id="currentUserAgencySelectMAP_' + user_data.agency_array[i].agency_id + '" onclick = "chooseRegionMap(' + '\'' + user_data.agency_array[i].agency_id + '\'' + ');" title="Sélectionner" class = "img_in_table" style="cursor: pointer;" src="img/next_step.png"/></td>'
			+ '</tr>';
	}
	htmlResult = htmlResult
		+ htmlResultDetail
		+ '</table>';
	$("#agency_list_result").html(htmlResult).fadeIn();
}

function updateMapOptionArray(data_type) { //OK Uxxx, permet de générer un tableau d'éléments passés en paramètre basé sur un form ayant pour nom data_type_list

	//console.log(data_type);
	var values = [];
	var cbs = document.forms[data_type + "_list"].elements[data_type];
	for(var i = 0; i<cbs.length; i++){
	  if(cbs[i].checked){
		values.push(cbs[i].value);
	  } 
	}
	//console.log(values);
	return values;
}

function updateMapOptionArrayUnselectAll(data_type) { //OK Uxxx, même fonctionnement que updateMapOptionArray mais force la désélection de tous les éléments
	var values = [];
	var cbs = document.forms[data_type + "_list"].elements[data_type];
	for(var i = 0; i<cbs.length; i++){
		x = document.getElementById(cbs[i].value);
		//console.log(x);
		x.checked = false;
	}
	document.getElementById('speciality_all').checked = false;
	//console.log(values);
	document.getElementById('speciality_all').disabled = false;
	document.getElementById('speciality_none').disabled = true;
	updateMapOptionArray(data_type);
}

function updateMapOptionArraySelectAll(data_type) { //OK Uxxx, même fonctionnement que updateMapOptionArray mais force la sélection de tous les éléments
	var values = [];
	var cbs = document.forms[data_type + "_list"].elements[data_type];
	for(var i = 0; i<cbs.length; i++){
		//document.getElementById(cbs[i]).checked = false;
		x = document.getElementById(cbs[i].value);
		x.checked = true;
		//console.log(x);
	}
	document.getElementById('speciality_none').checked = false;
	document.getElementById('speciality_all').disabled = true;
	document.getElementById('speciality_none').disabled = false;
	//console.log(values);
	updateMapOptionArray(data_type);
}

function chooseRegionMap(agency_id) { //OK Uxxx
	//console.log(agency_id);
	region_array = user_data.region_array.filter(x => x.agency_id == agency_id);
	//console.log(region_array);
	
	htmlRender = '';
	htmlRender = htmlRender 
		+ '<div class = "region_list" id = "region_list" style="cursor: pointer;" onclick = "toggleDiv(\'region_list_result\');">Choisir les régions'
		+ '</div>'
		+ '<div class = "region_list_result" id = "region_list_result">'
		+ '</div>'
		;
	
	document.getElementById("action_choix_region").innerHTML = htmlRender;
	
	htmlResult = '';
	htmlResult = htmlResult 
			+ '<table class="rwd-table">'
				+ '<tr>'
					+ '<th>Région</th>'
					+ '<th>Action</th>'
				+ '</tr>';
	
	region_map = [];
	htmlSelectRegion = ''
		+ '<form id = "region_list">';
	is_checked = ""; //non coché par défaut
	
	for(var i = 0; i < region_array.length; i++) {
		htmlSelectRegion = htmlSelectRegion
			+ '<input type = "checkbox" name = "region" value = "'
			+ region_array[i].region_id
			+ '" '
			//+ 'id = "region_'
			//+ user_data.region_array[i].region_id 
			//+ '" '
			+ is_checked
			+ ' onclick="'
			+ 'region_map = updateMapOptionArray(' + '\'' + 'region' + '\'' + ');">'
			+ capitalizeWords(region_array[i].libelle)
			+ '<br>';
	}
		
		
	htmlResult = htmlResult 
	
			+ '<tr>'
				+ '<td data-th="Région">' + htmlSelectRegion + '</td>'
				+ '<td data-th="Action"></td>'
			+ '</tr>'
			+ '<tr>'
				+ '<td data-th="Région"></td>'
				//+ '<td data-th="Action">Carte&nbsp<img class = "img_in_table" style="cursor: pointer;" onclick="generateMapv4(region_map);" src="img/next_step.png"/></td>'
				+ '<td data-th="Action">Spécialités&nbsp<img class = "img_in_table" style="cursor: pointer;" onclick="chooseSpecialityMap(region_map,' + '\'' +  agency_id + '\'' + ');" src="img/next_step.png"/></td>'
			+ '</tr>'
		+ '</table>'
	;

	//window.alert(agency_id);
	//console.log(agency_id);
	document.getElementById("region_list_result").innerHTML = htmlResult;

}

function chooseSpecialityMap(region_map, agency_id) { //OK Uxxx
	//Récupération de la liste des spécialités et de leur filtre par défaut
	//console.log(agency_id);
	
	region_map_json = JSON.stringify(region_map);
	region_map_uri = encodeURIComponent(region_map_json);
	
	
	htmlRender = '';
	htmlRender = htmlRender 
		+ '<div class = "speciality_list" id = "speciality_list" style="cursor: pointer;" onclick = "toggleDiv(\'speciality_list_result\');">Choisir les spécialités'
		+ '</div>'
		+ '<div class = "speciality_list_result" id = "speciality_list_result">'
		+ '</div>'
		;
	
	document.getElementById("action_choix_specialite").innerHTML = htmlRender;
	
	
    var url = host + "WebServices/MapRPPS/WS_Get_All_Speciality_List_For_Map.php";
    console.log(url);
    

    var xhr = new XMLHttpRequest();
    xhr.timeout = 2000;
    xhr.onreadystatechange = function (e) {
        if (xhr.readyState === 4) {
			//console.log(xhr);
			var response = JSON.parse(xhr.responseText);
			console.log(response);
			switch(response.status_message) {
			default:
				htmlResult = ''
					+ '<table class="rwd-table">'
					+ '<tr>'
						+ '<th>Information</th>'
						+ '<th>Action</th>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Information">' + response.status_message + '</td>'
						+ '<td data-th="Action"></td>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Information"></td>'
						+ '<td data-th="Action">Relancer&nbsp;<img id="chooseSpecialityMap" title="Relancer" class = "img_in_table" style="cursor: pointer;" src="img/retry.png"/></td>'
					+ '</tr>'
				+ '</table>';
				$("#speciality_list_result").html(htmlResult).fadeIn();
				$("#chooseSpecialityMap").click(function() {
					chooseSpecialityMap(region_map, agency_id);
				})
				break;
				case "data_speciality":
					html_result = "Filtre sur les spécialités (" + response.data.length + ") : <br>";
					
					//Affichage liste, choix et mise à jour
					//console.log(response.data);
					
					nb_row = 15;
					
					//arrondi à l'entier supérieur, ou garde la valeur si c'est un entier.
					nb_col = Math.ceil(response.data.length / nb_row);
					//console.log(response.data.length);
					//console.log(nb_col);
					


					speciality_map = [];
					htmlDetail = '<tr>';
					htmlHeader = '';
					htmlResult = '';
					htmlLastRow = '';
					is_checked = "checked"; //coché par défaut
					
					htmlSelectSpeciality = ''
						+ '<form id = "speciality_list">';
					
					htmlResult = htmlResult
						+ '<table class="rwd-table2">'

					for (var i = 0; i < nb_row + 1; i++) { //+ 1 pour gérer la ligne d'entête
						//console.log(i + ' ligne');
						for (var j = 0; j < nb_col; j++) {
							//console.log(j + ' colonne');
							if (i == 0) {
								//console.log('entête');
								htmlHeader = htmlHeader
									+ '<th>Spécialité</th>';

								if (j == 0) {
									htmlLastRow = htmlLastRow
										+ '<td data-th="Spécialité">'
										+ '<input type = "checkbox" name = "speciality_all" value = "'
										+ 'speciality_all'
										+ '" '
										+ 'id = "'
										+ 'speciality_all'
										+ '" '
										+ is_checked
										+ ' onclick="'
										+ 'speciality_map = updateMapOptionArraySelectAll(' + '\'' + 'speciality' + '\'' + ');">'
										/*+ libelle*/
										+ '<label for = "'
										+ 'all'
										+ '">'
										+ 'Toutes'
										+ '</label>'
									+ '</td>';
								} else {
									if (j == 1) {
										htmlLastRow = htmlLastRow
										+ '<td data-th="Spécialité">'
										+ '<input type = "checkbox" name = "speciality_none" value = "'
										+ 'speciality_none'
										+ '" '
										+ 'id = "'
										+ 'speciality_none'
										+ '" '
										+ '' //is checked à vide par défaut
										+ ' onclick="'
										+ 'speciality_map = updateMapOptionArrayUnselectAll(' + '\'' + 'speciality' + '\'' + ');">'
										/*+ libelle*/
										+ '<label for = "'
										+ 'none'
										+ '">'
										+ 'Aucune'
										+ '</label>'
									+ '</td>';
									}
									else {
										htmlLastRow = htmlLastRow
										+ '<td data-th="Spécialité"></td>';
									}
								}
								

							} 
							else {
								//console.log('detail');
								/* ordre alpha en ligne*/
								//if (((i - 1) * nb_col + j) <  response.data.length) {
								//	libelle = response.data[(i - 1) * nb_col + j].Libelle_savoir_faire;
								//}
								//else {
								//	libelle = '';
								//}
								/*ordre alpha en colonne*/
								if ((j * nb_row + (i - 1)) <  response.data.length) {
									libelle = response.data[(j * nb_row + (i - 1))].label;
								}
								else {
									libelle = false;
								}
								
								if (libelle) {
									//console.log(libelle);
									htmlDetail = htmlDetail
										+ '<td data-th="Spécialité">'
											+ '<input type = "checkbox" name = "speciality" value = "'
											+ libelle
											+ '" '
											+ 'id = "'
											+ libelle
											+ '" '
											+ is_checked
											+ ' onclick="'
											+ 'speciality_map = updateMapOptionArray(' + '\'' + 'speciality' + '\'' + ');">'
											/*+ libelle*/
											+ '<label for = "'
											+ libelle
											+ '">'
											+ libelle
											+ '</label>'
										+ '</td>';
										
								}
								
							}
						}
						htmlDetail = htmlDetail
							+ '<td data-th="Action"></td>'
							+ '</tr>'
							+ '<tr>';
					}
					
					htmlHeader = 
						'<tr>'
						+ htmlHeader
						+ '<th>Action</th>' 
						+ '</tr>';
					
					htmlLastRow = htmlLastRow
						+ '<td data-th="Action">Carte&nbsp<img class = "img_in_table" style="cursor: pointer;" onclick="generateMapv4(region_map, speciality_map, ' + '\'' +  agency_id + '\'' + ');" src="img/next_step.png"/></td>';
					
					//console.log(htmlHeader);
					
					htmlResult = htmlResult
						+ htmlHeader
						+ htmlDetail
						+ htmlLastRow
						+ '</table>';
					
					htmlSelectSpeciality = htmlSelectSpeciality
						+ htmlResult
						+ '</form>';
						

						
					//console.log(htmlSelectSpeciality);

					//$("#action_choix_specialites").html(html_result).fadeIn();
					$("#speciality_list_result").html(htmlSelectSpeciality).fadeIn();
					
					speciality_map = updateMapOptionArray('speciality'); //pour avoir un tableau rempli dès le premier passage
					
					break;
			}
        }
    };
    xhr.ontimeout = function () {
		htmlResult = ''
			+ '<table class="rwd-table">'
			+ '<tr>'
				+ '<th>Information</th>'
				+ '<th>Action</th>'
			+ '</tr>'
			+ '<tr>'
				+ '<td data-th="Information">' + response.status_message + '</td>'
				+ '<td data-th="Action"></td>'
			+ '</tr>'
			+ '<tr>'
				+ '<td data-th="Information"></td>'
				+ '<td data-th="Action">Relancer&nbsp;<img id="chooseSpecialityMap" title="Relancer" class = "img_in_table" style="cursor: pointer;" src="img/retry.png"/></td>'
			+ '</tr>'
		+ '</table>';
		$("#speciality_list_result").html(htmlResult).fadeIn();
		$("#chooseSpecialityMap").click(function() {
			chooseSpecialityMap(region_map, agency_id);
		})
    };
    xhr.open("GET", url, true);
    xhr.send();
}

function generateMapv4(region_map, speciality_map, agency_id) { //avec pondération ; OK Uxxx
	//console.log('entrée generateMapv4');
	//réécrire en classe
	
	toggleDiv('speciality_list_result');
	
	region_map_json = JSON.stringify(region_map);
	region_map_uri = encodeURIComponent(region_map_json);
	
	speciality_map_json = JSON.stringify(speciality_map);
	speciality_map_uri = encodeURIComponent(speciality_map_json);
	
	//console.log(region_map_uri);
	console.log(speciality_map_uri);
	
    var url = host + "WebServices/MapRPPS/WS_Get_Map_RPPS_Data_v5.php?region_map=" + region_map_uri + '&speciality_map=' + speciality_map_uri + '&agency_id=' + agency_id; 
    console.log(url);
    var xhr = new XMLHttpRequest();
    xhr.timeout = 5000;
    xhr.onreadystatechange = function (e) {
        if (xhr.readyState === 4) {
			//console.log(xhr);
			var response = JSON.parse(xhr.responseText);
			console.log(response);
			switch(response.status_message) {
				default:
					$("#alert_recup_donnees_carto").html(response.status_message).fadeIn();
				case "error_getting_geo_data_for_map":
					$("#alert_recup_donnees_carto").html("Impossible de récupérer les données pour la carte : " + response.status_message).fadeIn();
					break;
				case "no_data_for_map_creation":
					$("#alert_recup_donnees_carto").html("Aucune donnée localisée : " + response.status_message).fadeIn();
					break;
				case "no_details_for_map_creation":
					$("#alert_recup_donnees_carto").html("Aucune donnée localisée : " + response.status_message).fadeIn();
					break;
				case "error_getting_color_data_for_map":
					$("#alert_recup_donnees_carto").html("Impossible de récupérer les données pour la carte : " + response.status_message).fadeIn();
					break;
				case "no_color_array":
					$("#alert_recup_donnees_carto").html("Aucune donnée couleur : " + response.status_message).fadeIn();
					break;
				case "data_for_map_creation":
					//console.log('appel v4');
					htmlRender = '<div id="map"></div>';
					document.getElementById("map_render").innerHTML = htmlRender;
					displayMapv5(response.data, region_map);
				break;	
        }
    };
    }
    xhr.ontimeout = function () {
    	$("#alert_recup_donnees_carto").html("fatal_error_connect_database");
    };
    xhr.open("GET", url, true);
    xhr.send();
}

function displayMapv5(data, region_map) { //OK Uxxx (pas de boucle sur région), Uxxx n'a qu'une table avec la clé region_id plutôt qu'une table par région
	//https://github.com/akq/Leaflet.DonutCluster/blob/master/README.md
	console.log(data);
	//console.log(region_map);
	//console.log(region_map.length);
	//console.log(data.color);
	var dictOrder = [];
	for (var i = 0; i < data.order.length; i++) {
		dictOrder[i] = data.order[i].display_order;
	}
	

	//console.log(dictOrder);
	var dictTitle = data.title.reduce((map, obj) => (map[obj.display_order] = obj.first_name + ' ' + obj.name, map), {});
	//console.log(dictTitle);
	var dictColor = data.color.reduce((map, obj) => (map[obj.display_order] = obj.color, map), {});
	//console.log(dictColor);
	
	//si on veut modifier :
		// - la taille du cercle central : dans Leaflet.DonutCluser.js, ligne 302
		// - la formule de calcul de la taille du donut : dans Leaflet.DonutCluser.js, ligne 303
	var markers = L.DonutCluster({
        chunkedLoading: true
    }, {
        key: 'type', //évo 1 : permet de regrouper par display_order et plus par nom, ce qui revient au même puisqu'on a un nom = un display_order, mais qui permet d'afficher les noms sur les points
        sumField: 'value'
        , order: dictOrder
        , title: dictTitle
        , arcColorDict: dictColor
    })
	
	var types = dictOrder;
	var points = [];
	

	//console.log(data.geo[region_map[i]].length);
	for (var j = 0; j < data.geo.length; j++) {
		
		var w = data.geo[j].weight;
		var pIcon = L.icon({
		    iconUrl: 		host +  'Img/' + data.geo[j].color.substr(1, 6) + '.png', //on supprime les # à cause du routeur
		    iconSize:     	[w > 0 ? 12 + Math.sqrt(w) : 0, w > 0 ? 12 + Math.sqrt(w) : 0], // size of the icon
		    iconAnchor:   	[0, 0], // point of the icon which will correspond to marker's location
		    popupAnchor:  	[0, -5] // point from which the popup should open relative to the iconAnchor
		});

		var lat = data.geo[j].y;
		var long = data.geo[j].x;
		var type = data.geo[j].display_order;
		var title = data.geo[j].first_name + ' ' + data.geo[j].name  + ' : ' + parseInt(data.geo[j].weight);
		var weight = parseInt(data.geo[j].weight);
		var marker = L.marker(L.latLng(lat, long), {
			icon: pIcon,
			type: type,
			title: title,
			value: weight
		});
		

			
		if (w > 0) {
			var arrayCurrentUser = [];
			
			//users = users.filter(obj => obj.name == filter.name && obj.address == filter.address)
			arrayCurrentUser = data.detail_geo.filter(obj => obj.code_commune == data.geo[j].code_commune && obj.display_order == data.geo[j].display_order);
			console.log(arrayCurrentUser);
			console.log(arrayCurrentUser.length);
			
			var htmlPopup = '';
			var htmlDetailPopup = '';
			/**/
			htmlPopup = htmlPopup
				+ '<table>'
					+ '<tr>'
						+ '<th>Spécialité</th>'
						+ '<th>Nombre</th>'
					+ '</tr>';
			
			for(var k = 0; k < arrayCurrentUser.length; k++) {
				htmlDetailPopup = htmlDetailPopup
				+ '<tr>'
					+ '<td>' + arrayCurrentUser[k].speciality + '</td>'
					+ '<td>' + arrayCurrentUser[k].nb_spec_by_sp + '</td>'
				+ '</tr>';	
			}
			/**/
			htmlPopup = htmlPopup
				+ htmlDetailPopup
				+ '</table>';

			marker.bindPopup(htmlPopup);
		}
		else {
			marker.bindPopup(title);
		}

	    markers.addLayer(marker);
	    
	}

    var map = L.map('map').setView([40.0484, 116.286976], 3);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);
    map.addLayer(markers);
    map.fitBounds(markers.getBounds());
    renderLegend(data.title);
}

function hexToRGB(hex, alpha) { //OK Uxxx, gère la transparence sur la légende
    var r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

    if (alpha) {
        return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
    } else {
        return "rgb(" + r + ", " + g + ", " + b + ")";
    }
}

function renderLegend(dataLegend) { //OK Uxxx
	
	if (element = document.getElementById("legend")) 
	{
		element.parentNode.removeChild(element);
	};
	
	htmlResult = ''
		+ '<div id = "legend">Commercial';
	
	htmlResultDetail = '';
	
	for (var i = 0; i < dataLegend.length; i++) {
		htmlResultDetail = htmlResultDetail
			+ '<div class = "category-' + dataLegend[i].display_order + ' legenditem" style = "border-right-width: 12px; border-right-style: solid; border-right-color: ' + hexToRGB(dataLegend[i].color, 0.7) + '">'
			+ dataLegend[i].first_name + ' ' + dataLegend[i].name
			+ '</div>';
	}
	
	htmlResult = htmlResult 
		+ htmlResultDetail
		+ '</div>';
    
    
    //console.log(htmlResult);
    $('body').append(htmlResult);
    setMovableLegend("legend");
}

function setMovableLegend(divId) { //OK Uxxx
	var dragItem = document.querySelector("#" + divId);
	var container = document.querySelector("#" + divId);
	
	var active = false;
	var currentX;
	var currentY;
	var initialX;
	var initialY;
	var xOffset = 0;
	var yOffset = 0;
	
	container.addEventListener("touchstart", dragStart, false);
	container.addEventListener("touchend", dragEnd, false);
	container.addEventListener("touchmove", drag, false);

	container.addEventListener("mousedown", dragStart, false);
	container.addEventListener("mouseup", dragEnd, false);
	container.addEventListener("mousemove", drag, false);
	
	function dragStart(e) 
	{
      if (e.type === "touchstart") {
        initialX = e.touches[0].clientX - xOffset;
        initialY = e.touches[0].clientY - yOffset;
      } else {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
      }

      if (e.target === dragItem) {
        active = true;
      }
    }

    function dragEnd(e) 
    {
      initialX = currentX;
      initialY = currentY;

      active = false;
    }

    function drag(e) 
    {
      if (active) {
      
        e.preventDefault();
      
        if (e.type === "touchmove") {
          currentX = e.touches[0].clientX - initialX;
          currentY = e.touches[0].clientY - initialY;
        } else {
          currentX = e.clientX - initialX;
          currentY = e.clientY - initialY;
        }

        xOffset = currentX;
        yOffset = currentY;

        setTranslate(currentX, currentY, dragItem);
      }
    }

    function setTranslate(xPos, yPos, el) 
    {
      el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
    }
}

//FIN Cartographie

//DEBUT Commercial
//DEBUT Création
function createSalesProPage() { //OK Uxxx
	if (alreadyConnected()) 
	{ //à mettre au début de chaque fonction Page
		if (! document.getElementById("#content") || ! document.getElementById("#left_menu")) {
			populateApp();
		}
			//populateApp();
			//window.alert("newrppspage");
		var htmlRender = ''
			+ '<div class = "action" id="action_choix_agence"></div>'
			+ '<div class = "action" id="action_comm_agence"></div>'
			+ '<div class = "action" id="action_creer_comm_input"></div>'
			+ '<div class = "action" id="action_creer_comm_select"></div>'
			+ '<div class = "action" id="action_creer_comm_recap"></div>'
			+ '<div class = "action" id="action_creer_comm_result"></div>'
			+ '<div class = "action" id="action_creer_comm_after"></div>'
			;
				
		document.getElementById("content").innerHTML = htmlRender;
		currentUserAgencySelectCU();
	}
	else
	{
		router.navigate('');
	}
	
	//Il faut récupérer : 
	/* 
	 1 - l'agence sélectionnée de l'utilisateur connecté (1 seule) : appel de currentUserAgencySelect si il y a plusieurs agences dans son profil
	 2 - les rôles possibles (dans la table rpps_mstr_role_can_create)
	 3 - les régions possibles (dans la table rpps_mstr_agency_region)

	*/

}

function currentUserAgencySelectCU() { //OK Uxxx
	
	htmlRender = '';
	htmlRender = htmlRender 
		+ '<div class = "agency_list" id = "agency_list" style="cursor: pointer;" onclick = "toggleDiv(\'agency_list_result\');">Choisir une agence'
		+ '</div>'
		+ '<div class = "agency_list_result" id = "agency_list_result">'
		+ '</div>'
		;
	
	document.getElementById("action_choix_agence").innerHTML = htmlRender;
	
	
	htmlResult = ''
		+ '<table class="rwd-table">'
		+ '<tr>'
			+ '<th>Agence</th>'
			+ '<th>Action</th>'
		+ '</tr>';
	htmlResultDetail = '';
	for (var i = 0; i < user_data.agency_array.length; i++) {
		htmlResultDetail = htmlResultDetail
			+ '<tr>'
				+ '<td data-th="Agence">' + user_data.agency_array[i].agency_name + '</td>'
				+ '<td data-th="Action">Sélectionner&nbsp;<img id="currentUserAgencySelectCU_' + user_data.agency_array[i].agency_id + '" onclick = "getAgencySalesProCU(' + '\'' + user_data.agency_array[i].agency_token + '\'' + ');" title="Relancer" class = "img_in_table" style="cursor: pointer;" src="img/next_step.png"/></td>'
			+ '</tr>';
	}
	htmlResult = htmlResult
		+ htmlResultDetail
		+ '</table>';
	$("#agency_list_result").html(htmlResult).fadeIn();
}

function getAgencySalesProCU(agency_token) { //OK Uxxx
	
	agency_token_uri = encodeURIComponent(agency_token);
	user_token_uri = encodeURIComponent(user_token);
	
	htmlRender = '';
	htmlRender = htmlRender 
		+ '<div class = "agency_sales_pro" id = "agency_sales_pro" style="cursor: pointer;" onclick = "toggleDiv(\'agency_sales_pro_result\');">Liste des commerciaux'
		+ '</div>'
		+ '<div class = "agency_sales_pro_result" id = "agency_sales_pro_result">'
		+ '</div>'
		;
	
	document.getElementById("action_comm_agence").innerHTML = htmlRender;
	
    var url = host + "WebServices/Agency/WS_Get_Sales_Pro_By_Agency.php?agency_token=" + agency_token_uri + "&user_token=" + user_token_uri;
    console.log(url);


    var xhr = new XMLHttpRequest();
    xhr.timeout = 2000;
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
			//console.log(xhr);
			var response = JSON.parse(xhr.responseText);
			//console.log(response);
			switch(response.status_message) {
			case "fatal_error_agency_id":
        		logout();
        		break;
			default:
				htmlResult = ''
					+ '<table class="rwd-table">'
					+ '<tr>'
						+ '<th>Information</th>'
						+ '<th>Action</th>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Information">' + response.status_message + '</td>'
						+ '<td data-th="Action"></td>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Information"></td>'
						+ '<td data-th="Action">Relancer&nbsp;<img id="getAgencySalesProCU" title="Relancer" class = "img_in_table" style="cursor: pointer;" src="img/retry.png"/></td>'
					+ '</tr>'
				+ '</table>';
				$("#agency_sales_pro_result").html(htmlResult).fadeIn();
				$("#getAgencySalesProCU").click(function() {
					getAgencySalesProCU(agency_token);
				})
				break;
			case "no_agency_sales_pro":
				htmlResult = ''
					+ '<table class="rwd-table">'
						+ '<tr>'
							+ '<th>Information</th>'
							+ '<th>Action</th>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Information">' + response.status_message + '</td>'
							+ '<td data-th="Action"></td>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Information"></td>'
							+ '<td data-th="Action">Créer&nbsp;<img id = "getAgencySalesProCU" title="Créer" class = "img_in_table" style="cursor: pointer;" src="img/next_step.png"/></td>'
						+ '</tr>'
					+ '</table>';
				$("#agency_sales_pro_result").html(htmlResult).fadeIn();
				$("#getAgencySalesProCU").click(function() {
					//toggleDiv("agency_sales_pro_result"); on ne masque pas car on a besoin des couleurs
					createSalesProFormInput(agency_token);
				})
				break;
			case "agency_sales_pro":
				htmlResult = ''
					+ '<table class="rwd-table">'
						+ '<tr>'
							+ '<th>Nom</th>'
							+ '<th>Prénom</th>'
							+ '<th>Email</th>'
							+ '<th>Région</th>'
							+ '<th>Couleur carte</th>'
							+ '<th>Action</th>'
						+ '</tr>';
				htmlResultDetail = '';
				for (var i = 0; i < response.data.length; i++) {
					htmlResultDetail = htmlResultDetail 
						+ '<tr>'
							+ '<td data-th="Nom">' + response.data[i]['last_name'] + '</td>' 
							+ '<td data-th="Prénom">' + response.data[i]['first_name'] + '</td>'
							+ '<td data-th="Email">' + response.data[i]['email'] + '</td>'
							+ '<td data-th="Région">' + capitalizeWords(response.data[i]['region']) + '</td>'
							+ '<td data-th="Couleur carte" bgcolor = ' + response.data[i]['color'] + '></td>'
							+ '<td data-th="Action"></td>'
						+ '</tr>';
				}
				htmlResult = htmlResult 
					+ htmlResultDetail
						+ '<tr>'
							+ '<td data-th="Nom"></td>'
							+ '<td data-th="Prénom"></td>'
							+ '<td data-th="Email"></td>'
							+ '<td data-th="Région"></td>'
							+ '<td data-th="Couleur carte"></td>'
							+ '<td data-th="Action">Créer&nbsp;<img id = "getAgencySalesProCU" title="Vérifier" class = "img_in_table" style="cursor: pointer;" src="img/next_step.png"/></td>'
						+ '</tr>'
					+ '</table>';
				$("#agency_sales_pro_result").html(htmlResult).fadeIn();
				$("#getAgencySalesProCU").click(function() {
					//toggleDiv("agency_sales_pro_result"); on ne masque pas car on a besoin des couleurs
					createSalesProFormInput(agency_token);
				})
				break;
			}
        }
    };
    xhr.ontimeout = function () {
    	htmlResult = ''
			+ '<table class="rwd-table">'
				+ '<tr>'
					+ '<th>Information</th>'
					+ '<th>Action</th>'
				+ '</tr>'
				+ '<tr>'
					+ '<td data-th="Information">Timeout</td>'
					+ '<td data-th="Action"></td>'
				+ '</tr>'
				+ '<tr>'
					+ '<td data-th="Information"></td>'
					+ '<td data-th="Action">Relancer&nbsp;<img id = "getAgencySalesProCU" title="Relancer" class = "img_in_table" style="cursor: pointer;" src="img/retry.png"/></td>'
				+ '</tr>'
			+ '</table>';
		$("#agency_sales_pro_result").html(htmlResult).fadeIn();
		$("#getAgencySalesProCU").click(function() {
			getAgencySalesProCU(agency_token);
			//toggleDiv("agency_sales_pro_result"); on ne masque pas car on a besoin des couleurs
		})
    };
    xhr.open("GET", url, true);
    xhr.send();
}

function validateEmail(email) { //OK Uxxx
	var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	if(email.match(mailformat)) {
		return true;
	}
	else {
		return false;
	}
}

function createSalesProFormInput(agency_token) { //OK Uxxx
	
	//agency_token_uri = encodeURIComponent(agency_token);
	//user_token_uri = encodeURIComponent(user_token);
	
	htmlRender = '';
	htmlRender = htmlRender 
		+ '<div class = "agency_create_sales_pro_input" id = "agency_create_sales_pro_input" style="cursor: pointer;" onclick = "toggleDiv(\'agency_create_sales_pro_input_result\');">Nouveau commercial 1/3'
		+ '</div>'
		+ '<div class = "agency_create_sales_pro_input_result" id = "agency_create_sales_pro_input_result">'
		+ '</div>'
		;
	
	document.getElementById("action_creer_comm_input").innerHTML = htmlRender;
	
	htmlResult = ''
		+ '<table class="rwd-table">'
		+ '<tr>'
			+ '<th>Email</th>'
			+ '<th>Nom</th>'
			+ '<th>Prénom</th>'
			+ '<th>Action</th>'
		+ '</tr>'
		+ '<tr>'
			+ '<td data-th="Email"><input id="sales_pro_email" type="text" class="form-control"></td>'
			+ '<td data-th="Nom"><input id="sales_pro_name" type="text" class="form-control"></td>'
			+ '<td data-th="Prénom"><input id="sales_pro_first_name" type="text" class="form-control"></td>'
			+ '<td data-th="Action"></td>'
		+ '</tr>'
		+ '<tr>'
			+ '<td data-th="Email"></td>'
			+ '<td data-th="Nom"></td>'
			+ '<td data-th="Prénom"></td>'
			+ '<td data-th="Action">Région, rôle et couleur&nbsp;<img id="createSalesProFormInput" title="Région et rôle" class = "img_in_table" style="cursor: pointer;" src="img/next_step.png"/></td>'
		+ '</tr>'
		+ '</table>';
	
	$("#agency_create_sales_pro_input_result").html(htmlResult).fadeIn();
	
	$("#createSalesProFormInput").click(function() {
		//console.log('createSalesProFormInput_click');
		next = true;
		email = document.getElementById("sales_pro_email");
		last_name = document.getElementById("sales_pro_name");
		first_name = document.getElementById("sales_pro_first_name");
		
		//console.log(email.value);
		//console.log(last_name.value);
		//console.log(first_name.value);
		
		if (validateEmail(email.value)) {
			email.style.borderColor = "";
		}
		else {
			next = false;
			email.style.borderColor = "red";
		}

		if (last_name.value === "") {
			next = false;
			last_name.style.borderColor = "red";
		}
		else {
			last_name.style.borderColor = "";
		}
		
		if (first_name.value === "") {
			next = false;
			first_name.style.borderColor = "red";
		}
		else {
			first_name.style.borderColor = "";
		}

		if (next) {
			new_sales_pro = {};
			
			new_sales_pro.last_name = last_name.value.toUpperCase();
			new_sales_pro.first_name = capitalizeWords(first_name.value);
			new_sales_pro.email = email.value;
			createSalesProFormSelect(agency_token, new_sales_pro);
		}
		//toggleDiv("createSalesProFormInput"); on ne masque pas car on a besoin de vérifier les données
	})
	
	
	
}

function updateOptionArray(data_type) { //OK Uxxx
	//console.log(data_type);
	var values = [];
	var cbs = document.forms[data_type + "_list"].elements[data_type];
	for(var i = 0; i<cbs.length; i++){
	  if(cbs[i].checked){
	    values.push(cbs[i].value);
	  } 
	}
	//console.log(values);
	return values;
}

function createSalesProFormSelect(agency_token, new_sales_pro) { //OK Uxxx
	//console.log('createSalesProFormSelect');
	
	htmlRender = '';
	htmlRender = htmlRender 
		+ '<div class = "agency_create_sales_pro_select" id = "agency_create_sales_pro_select" style="cursor: pointer;" onclick = "toggleDiv(\'agency_create_sales_pro_select_result\');">Nouveau commercial 2/3'
		+ '</div>'
		+ '<div class = "agency_create_sales_pro_select_result" id = "agency_create_sales_pro_select_result">'
		+ '</div>'
		;
	
	document.getElementById("action_creer_comm_select").innerHTML = htmlRender;
	
	htmlResult = ''
		+ '<table class="rwd-table">'
		+ '<tr>'
			+ '<th>Région</th>'
			+ '<th>Rôle</th>'
			+ '<th>Couleur</th>'
			+ '<th>Action</th>'
		+ '</tr>';

	//console.log(agency_token);
	
	selected_agency_array = user_data.agency_array.filter(x => x.agency_token == agency_token)[0];
	//console.log(selected_agency_array);
	selected_agency_id = selected_agency_array.agency_id;
	//console.log(selected_agency_id);
	
	selected_region_array = user_data.region_array.filter(x => x.agency_id == selected_agency_id);
	//console.log(selected_region_array);

 

	
	new_sp_region = [];
	htmlSelectRegion = ''
		+ '<form id = "region_list">';
	is_checked = ""; //non coché par défaut
	for (var i = 0; i < selected_region_array.length; i++) {
		htmlSelectRegion = htmlSelectRegion
			+ '<input type = "checkbox" name = "region" value = "'
			+ selected_region_array[i].region_id
			+ '" '
			//+ 'id = "region_'
			//+ user_data.region_array[i].region_id 
			//+ '" '
			+ is_checked
			+ ' onclick="'
			+ 'new_sp_region = updateOptionArray(' + '\'' + 'region' + '\'' + ');">'
			+ capitalizeWords(selected_region_array[i].libelle)
			+ '<br>'
	}
	
	//console.log(new_sp_region);
	
	htmlSelectRegion = htmlSelectRegion
	+ '</form>';
	
	
	htmlSelectRole = '<select id="new_sp_role">';

	for (var i = 0; i < user_data.can_create_roles.length; i++) {
		htmlSelectRole = htmlSelectRole
			+ '<option value = "'
			+ user_data.can_create_roles[i].creatable_role_id
			//+ 'id = "region_'
			//+ user_data.region_array[i].region_id 
			//+ '" '
			+ '">'
			+ capitalizeWords(user_data.can_create_roles[i].label)
			+ '</option>'
	}
	
	
	htmlSelectColor = ''
		+ '<input id = "colorPicker" value="#276cb8"/>';
	
	htmlResult = htmlResult
		+ '<tr>'
			+ '<td data-th="Région">' + htmlSelectRegion + '</td>'
			+ '<td data-th="Rôle">' + htmlSelectRole + '</td>'
			+ '<td data-th="Couleur">' + htmlSelectColor + '</td>'
			+ '<td data-th="Action"></td>'
		+ '</tr>'
		+ '<tr>'
			+ '<td data-th="Région"></td>'
			+ '<td data-th="Rôle"></td>'
			+ '<td data-th="Couleur"></td>'
			+ '<td data-th="Action">Récap&nbsp;<img id="createSalesProFormSelect" title="Récap" class = "img_in_table" style="cursor: pointer;" src="img/next_step.png"/></td>'
		+ '</tr>'
		+ '</table>';
	
	
	
	
	$("#agency_create_sales_pro_select_result").html(htmlResult).fadeIn();
	
	$("#colorPicker").spectrum({
			type: "color",
			hideAfterPaletteSelect: "true",
			//showInput: "true",
			showAlpha: "false"
		});
	
	$("#createSalesProFormSelect").click(function() {
		next = true;
		
		//console.log(last_name);
		//console.log(first_name);
		//console.log(email);
		
		//console.log(new_sp_region.length);
		
		if (new_sp_region.length == 0) {
			next = false;
			region_list.style.borderColor = "red";
			region_list.style.borderStyle = "solid";
			region_list.style.borderWidth = "1px";
		} 
		else {
			region_list.style.borderStyle = "none";
			region_list.style.borderWidth = "0px";
			region_list.style.borderColor = "";
		}

		
		var x = document.getElementById("new_sp_role");
		role_id = x.options[x.selectedIndex].value;
		//console.log(role_id);
		
		var t = $("#colorPicker").spectrum("get");
		color = t.toHexString();
		
		//console.log(color);
		
		
		new_sales_pro.new_sp_region = new_sp_region;
		new_sales_pro.role_id = role_id;
		new_sales_pro.color = color.toUpperCase();
		
		
		
		if (next) {
			//console.log(new_sales_pro);
			createSalesProRecap(agency_token, new_sales_pro);
		}

		
	})
}

function createSalesProRecap(agency_token, new_sales_pro) { //OK Uxxx
	
	console.log(new_sales_pro);
	
	htmlRender = '';
	htmlRender = htmlRender 
		+ '<div class = "agency_create_sales_pro_recap" id = "agency_create_sales_pro_recap" style="cursor: pointer;" onclick = "toggleDiv(\'agency_create_sales_pro_recap_result\');">Nouveau commercial 3/3'
		+ '</div>'
		+ '<div class = "agency_create_sales_pro_recap_result" id = "agency_create_sales_pro_recap_result">'
		+ '</div>'
		;
	
	document.getElementById("action_creer_comm_recap").innerHTML = htmlRender;
	/**/
	htmlResult = ''
		+ '<table class="rwd-table">'
			+ '<tr>'
				+ '<th>Nom</th>'
				+ '<th>Prénom</th>'
				+ '<th>Email</th>'
				+ '<th>Région</th>'
				+ '<th>Couleur carte</th>'
				+ '<th>Rôle</th>'
				+ '<th>Action</th>'
			+ '</tr>';
	htmlResultDetail = '';
	
	htmlResultDetail = htmlResultDetail 
		+ '<tr>'
			+ '<td data-th="Nom">' + new_sales_pro.last_name + '</td>' 
			+ '<td data-th="Prénom">' + new_sales_pro.first_name + '</td>'
			+ '<td data-th="Email">' + new_sales_pro.email + '</td>';
	
	htmlResultDetail = htmlResultDetail
			+ '<td data-th="Région">';
		
		
	
	
	region_id_array = user_data.region_array.map(x => x['region_id']);
	
	//console.log(region_id_array);
	
	/* */
	for (var i = 0; i < new_sales_pro.new_sp_region.length; i++) {
		current_region_id = region_id_array.indexOf(new_sales_pro.new_sp_region[i]);
		//console.log(current_region_id);
		htmlResultDetail = htmlResultDetail
				+ capitalizeWords(user_data.region_array[current_region_id].libelle)
				+ '<br>';
			
	}
	
	/* */
	htmlResultDetail = htmlResultDetail
			+ '</td>';
	
	
	role_id_array = user_data.can_create_roles.map(x => x['creatable_role_id']);
	console.log(role_id_array);
	
	current_role_id = role_id_array.indexOf(new_sales_pro.role_id);
	
	console.log(user_data.can_create_roles);
	
	htmlResultDetail = htmlResultDetail
			+ '<td data-th="Couleur carte" bgcolor = ' + new_sales_pro.color + '>' + new_sales_pro.color + '</td>'
			+ '<td data-th="Rôle">' + user_data.can_create_roles[current_role_id].label + '</td>' 
			+ '<td data-th="Action"></td>'
		+ '</tr>';
	htmlResult = htmlResult 
		+ htmlResultDetail
			+ '<tr>'
				+ '<td data-th="Nom"></td>'
				+ '<td data-th="Prénom"></td>'
				+ '<td data-th="Email"></td>'
				+ '<td data-th="Région"></td>'
				+ '<td data-th="Couleur carte"></td>'
				+ '<td data-th="Rôle"></td>'
				+ '<td data-th="Action">Valider&nbsp;<img id = "createSalesProRecap" title="Vérifier" class = "img_in_table" style="cursor: pointer;" src="img/next_step.png"/></td>'
			+ '</tr>'
		+ '</table>';
	$("#agency_create_sales_pro_recap_result").html(htmlResult).fadeIn();
	$("#createSalesProRecap").click(function() {
		//toggleDiv("agency_sales_pro_result"); on ne masque pas car on a besoin des couleurs
		createSalesPro(agency_token, new_sales_pro);
	})
	
	
	
}

function createSalesPro(agency_token, new_sales_pro) { //OK Uxxx, si user existe, on met une demande d'envoi de message
	
	new_sales_pro.agency_token = agency_token;
	new_sales_pro.user_token = user_token;
	new_sales_pro_json = JSON.stringify(new_sales_pro);
	
	new_sales_pro_uri = encodeURIComponent(new_sales_pro_json);

	//console.log(new_sales_pro_uri);
	
	htmlRender = '';
	htmlRender = htmlRender 
		+ '<div class = "agency_create_sales_pro" id = "agency_create_sales_pro" style="cursor: pointer;" onclick = "toggleDiv(\'agency_create_sales_pro_result\');">Résultat de la création'
		+ '</div>'
		+ '<div class = "agency_create_sales_pro_result" id = "agency_create_sales_pro_result">'
		+ '</div>'
		;
	
	document.getElementById("action_creer_comm_result").innerHTML = htmlRender;
	
    var url = host + "WebServices/User/WS_Create_User.php?new_user_data=" + new_sales_pro_uri;
    console.log(url);
	
    /* tout reprendre avec les vrais retours */
    var xhr = new XMLHttpRequest();
    xhr.timeout = 2000;
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
			//console.log(xhr);
			var response = JSON.parse(xhr.responseText);
			console.log(response);
			switch(response.status_message) {
			default:
				htmlResult = ''
					+ '<table class="rwd-table">'
					+ '<tr>'
						+ '<th>Information</th>'
						+ '<th>Action</th>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Information">' + response.status_message + '</td>'
						+ '<td data-th="Action"></td>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Information"></td>'
						+ '<td data-th="Action">Relancer&nbsp;<img id="createSalesPro" title="Relancer" class = "img_in_table" style="cursor: pointer;" src="img/retry.png"/></td>'
					+ '</tr>'
				+ '</table>';
				$("#agency_create_sales_pro_result").html(htmlResult).fadeIn();
				$("#createSalesPro").click(function() {
					createSalesPro(agency_token, new_sales_pro);
				})
				break;
			case "user_email_already_exists":
				htmlResult = ''
					+ '<table class="rwd-table">'
					+ '<tr>'
						+ '<th>Information</th>'
						+ '<th>Action</th>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Information">' + response.status_message + '</td>'
						+ '<td data-th="Action"></td>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Information"></td>'
						+ '<td data-th="Action">Message&nbsp;<img id="createSalesPro" title="Message" class = "img_in_table" style="cursor: pointer;" src="img/message.png"/></td>'
					+ '</tr>'
				+ '</table>';
				$("#agency_create_sales_pro_result").html(htmlResult).fadeIn();
				$("#createSalesPro").click(function() {
					createSalesProPage();
				})
				break;
			case "create_user_completed":
				htmlResult = ''
					+ '<table class="rwd-table">'
						+ '<tr>'
							+ '<th>Information</th>'
							+ '<th>Action</th>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Information">' + response.status_message + '</td>'
							+ '<td data-th="Action"></td>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Information"></td>'
							+ '<td data-th="Action">Résultat&nbsp;<img id = "createSalesPro" title="Résultat" class = "img_in_table" style="cursor: pointer;" src="img/next_step.png"/></td>'
						+ '</tr>'
					+ '</table>';
				$("#agency_create_sales_pro_result").html(htmlResult).fadeIn();
				$("#createSalesPro").click(function() {
					//toggleDiv("doctor_data_change_result");
					//toggleDiv("agency_sales_pro_result"); on ne masque pas car on a besoin des couleurs
					getAgencySalesProAfter(agency_token);
				})
				break;
			}
        }
    };
    xhr.ontimeout = function () {
    	htmlResult = ''
			+ '<table class="rwd-table">'
				+ '<tr>'
					+ '<th>Information</th>'
					+ '<th>Action</th>'
				+ '</tr>'
				+ '<tr>'
					+ '<td data-th="Information">Timeout</td>'
					+ '<td data-th="Action"></td>'
				+ '</tr>'
				+ '<tr>'
					+ '<td data-th="Information"></td>'
					+ '<td data-th="Action">Relancer&nbsp;<img id = "createSalesPro" title="Relancer" class = "img_in_table" style="cursor: pointer;" src="img/retry.png"/></td>'
				+ '</tr>'
			+ '</table>';
		$("#agency_create_sales_pro_result").html(htmlResult).fadeIn();
		$("#createSalesPro").click(function() {
			createSalesPro(agency_token, new_sales_pro);
			//toggleDiv("agency_sales_pro_result"); on ne masque pas car on a besoin des couleurs
		})
    };
    xhr.open("GET", url, true);
    xhr.send();
    

}

function getAgencySalesProAfter(agency_token) { //OK Uxxx, on revient peut-être un niveau trop haut (sélection de la région plutôt que récap, mais permet d'assuer un état stable
	
	agency_token_uri = encodeURIComponent(agency_token);
	user_token_uri = encodeURIComponent(user_token);
	
	htmlRender = '';
	htmlRender = htmlRender 
		+ '<div class = "agency_sales_pro_after" id = "agency_sales_pro_after" style="cursor: pointer;" onclick = "toggleDiv(\'agency_sales_pro_after_result\');">Liste des commerciaux'
		+ '</div>'
		+ '<div class = "agency_sales_pro_after_result" id = "agency_sales_pro_after_result">'
		+ '</div>'
		;
	
	document.getElementById("action_creer_comm_after").innerHTML = htmlRender;
	
    var url = host + "WebServices/Agency/WS_Get_Sales_Pro_By_Agency.php?agency_token=" + agency_token_uri + "&user_token=" + user_token_uri;
    //console.log(url);


    var xhr = new XMLHttpRequest();
    xhr.timeout = 2000;
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
			//console.log(xhr);
			var response = JSON.parse(xhr.responseText);
			console.log(response);
			switch(response.status_message) {
			case "fatal_error_agency_id":
        		logout();
        		break;
			default:
				htmlResult = ''
					+ '<table class="rwd-table">'
					+ '<tr>'
						+ '<th>Information</th>'
						+ '<th>Action</th>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Information">' + response.status_message + '</td>'
						+ '<td data-th="Action"></td>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Information"></td>'
						+ '<td data-th="Action">Relancer&nbsp;<img id="getAgencySalesProAfter" title="Relancer" class = "img_in_table" style="cursor: pointer;" src="img/retry.png"/></td>'
					+ '</tr>'
				+ '</table>';
				$("#agency_sales_pro_after_result").html(htmlResult).fadeIn();
				$("#getAgencySalesProAfter").click(function() {
					getAgencySalesProAfter(agency_token);
				})
				break;
			case "no_agency_sales_pro":
				htmlResult = ''
					+ '<table class="rwd-table">'
						+ '<tr>'
							+ '<th>Information</th>'
							+ '<th>Action</th>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Information">' + response.status_message + '</td>'
							+ '<td data-th="Action"></td>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Information"></td>'
							+ '<td data-th="Action">Terminer&nbsp;<img id = "getAgencySalesProAfter" title="Terminer" class = "img_in_table" style="cursor: pointer;" src="img/next_step.png"/></td>'
						+ '</tr>'
					+ '</table>';
				$("#agency_sales_pro_after_result").html(htmlResult).fadeIn();
				$("#getAgencySalesProAfter").click(function() {
					createSalesProPage();
				})
				break;
			case "agency_sales_pro":
				htmlResult = ''
					+ '<table class="rwd-table">'
						+ '<tr>'
							+ '<th>Nom</th>'
							+ '<th>Prénom</th>'
							+ '<th>Email</th>'
							+ '<th>Région</th>'
							+ '<th>Couleur carte</th>'
							+ '<th>Action</th>'
						+ '</tr>';
				htmlResultDetail = '';
				for (var i = 0; i < response.data.length; i++) {
					htmlResultDetail = htmlResultDetail 
						+ '<tr>'
							+ '<td data-th="Nom">' + response.data[i]['last_name'] + '</td>' 
							+ '<td data-th="Prénom">' + response.data[i]['first_name'] + '</td>'
							+ '<td data-th="Email">' + response.data[i]['email'] + '</td>'
							+ '<td data-th="Région">' + capitalizeWords(response.data[i]['region']) + '</td>'
							+ '<td data-th="Couleur carte" bgcolor = ' + response.data[i]['color'] + '>' + response.data[i]['color'] + '</td>'
							+ '<td data-th="Action"></td>'
						+ '</tr>';
				}
				htmlResult = htmlResult 
					+ htmlResultDetail
						+ '<tr>'
							+ '<td data-th="Nom"></td>'
							+ '<td data-th="Prénom"></td>'
							+ '<td data-th="Email"></td>'
							+ '<td data-th="Région"></td>'
							+ '<td data-th="Couleur carte"></td>'
							+ '<td data-th="Action">Terminer&nbsp;<img id = "getAgencySalesProAfter" title="Terminer" class = "img_in_table" style="cursor: pointer;" src="img/next_step.png"/></td>'
						+ '</tr>'
					+ '</table>';
				$("#agency_sales_pro_after_result").html(htmlResult).fadeIn();
				$("#getAgencySalesProAfter").click(function() {
					//Il faut supprimer les div précédents (
					createSalesProPage();
				})
				break;
			}
        }
    };
    xhr.ontimeout = function () {
    	htmlResult = ''
			+ '<table class="rwd-table">'
				+ '<tr>'
					+ '<th>Information</th>'
					+ '<th>Action</th>'
				+ '</tr>'
				+ '<tr>'
					+ '<td data-th="Information">Timeout</td>'
					+ '<td data-th="Action"></td>'
				+ '</tr>'
				+ '<tr>'
					+ '<td data-th="Information"></td>'
					+ '<td data-th="Action">Relancer&nbsp;<img id = "getAgencySalesProAfter" title="Relancer" class = "img_in_table" style="cursor: pointer;" src="img/retry.png"/></td>'
				+ '</tr>'
			+ '</table>';
		$("#agency_sales_pro_after_result").html(htmlResult).fadeIn();
		$("#getAgencySalesProAfter").click(function() {
			getAgencySalesProAfter(agency_token);
			//toggleDiv("agency_sales_pro_result"); on ne masque pas car on a besoin des couleurs
		})
    };
    xhr.open("GET", url, true);
    xhr.send();
}

//FIN Création

//DEBUT Associer commercial / Médecin
/*
Explications : 
On peut mettre à jour les liens Docteur / Utilisateur indépendament pour chaque région
On peut donc afficher, pour chaque région de l'utilisateur connecté, la liste des médecins ainsi que leur commercial
de référence actuel.

createDoctorSalesProLinkPage : 
	crée la liste des div
currentUserAgencySelectDSPL : 
	affiche la liste des agences de l'utilisateur
getAgencyDoctors : 
	récupère la liste des régions, médecins, des commerciaux et des spécialités d'une agence, 
	filtré sur les régions accessibles à l'utilisateur connecté
createDoctorsFilter : 
	crée les filtres par région sur Commercial et Spécialité
filterDoctors : 
	récupère les données des listes créées précedemment et applique les filtres sur les données
editDoctorSalesProLink : 
	basé sur le tableau "modif_doctor_sales_pro_link"
		si le docteur est déjà présent dans ce tableau, on ne fait rien (il est affiché dans la partie suivante)
		si le docteur n'est pas présent dans ce tableau, on l'ajoute 
resultModifDiv : 
	si on a des données dans "modif_doctor_sales_pro_link" pour la région en cours, on recrée la liste des médecins 
	qui doivent être modifiés avec la valeur du commercial actuel ou celle du nouveau si elle a été postionnée
selectElement : 
	permet de mettre la bonne valeur dans la liste de sélection des commerciaux (soit la nouvelle, soit l'ancienne si pas modifiée)
temporaryChangeDoctorSalesProLink : 
	à chaque changement de la sélection dans la liste des commerciaux, on met à jour "modif_doctor_sales_pro_link"
	pour la région concernée, avec le token du nouveau commercial choisi
cancelTemporaryChangeDoctorSalesProLink : 
	supprime, pour la région en cours, le lien "médecin / utilisateur" qui est présent dans "modif_doctor_sales_pro_link"
validateModifDiv : 
	basé sur resultModifDiv, si on a au moins un élément pour la région en cours, on crée un div qui permet
	d'enregistrer les données en base
saveNewDoctorsSalesProLink : 
	enregistre les modifications en base et met à jour le tableau d'entrée
*/

function createDoctorSalesProLinkPage() {
	if (alreadyConnected()) 
	{ //à mettre au début de chaque fonction Page
		if (! document.getElementById("#content") || ! document.getElementById("#left_menu")) {
			populateApp();
		}
		var htmlRender = ''
			+ '<div class = "action" id="action_choix_agence"></div>'
			+ '<div class = "action" id="action_listing_doctors"></div>'
			+ '<div class = "action" id="action_creer_comm_input"></div>'
			+ '<div class = "action" id="action_creer_comm_select"></div>'
			+ '<div class = "action" id="action_creer_comm_recap"></div>'
			+ '<div class = "action" id="action_creer_comm_result"></div>'
			+ '<div class = "action" id="action_creer_comm_after"></div>'
			;
		document.getElementById("content").innerHTML = htmlRender;
		currentUserAgencySelectDSPL();
	}
	else
	{
		router.navigate('');
	}
	
	//Il faut récupérer : 
	/* 
	 1 - l'agence sélectionnée de l'utilisateur connecté (1 seule) : appel de currentUserAgencySelectDSPL si il y a plusieurs agences dans son profil
	 2 - les rôles possibles (dans la table rpps_mstr_role_can_create)
	 3 - les régions possibles (dans la table rpps_mstr_agency_region)
	*/

}

function currentUserAgencySelectDSPL() { //OK Uxxx
	
	htmlRender = '';
	htmlRender = htmlRender 
		+ '<div class = "agency_list" id = "agency_list" style="cursor: pointer;" onclick = "toggleDiv(\'agency_list_result\');">Choisir une agence'
		+ '</div>'
		+ '<div class = "agency_list_result" id = "agency_list_result">'
		+ '</div>'
		;
	
	document.getElementById("action_choix_agence").innerHTML = htmlRender;
	
	
	htmlResult = ''
		+ '<table class="rwd-table">'
		+ '<tr>'
			+ '<th>Agence</th>'
			+ '<th>Action</th>'
		+ '</tr>';
	htmlResultDetail = '';
	for (var i = 0; i < user_data.agency_array.length; i++) {
		htmlResultDetail = htmlResultDetail
			+ '<tr>'
				+ '<td data-th="Agence">' + user_data.agency_array[i].agency_name + '</td>'
				+ '<td data-th="Action">Sélectionner&nbsp;<img id="currentUserAgencySelectDSPL_' + user_data.agency_array[i].agency_id + '" onclick = "getAgencyDoctors(' + '\'' + user_data.agency_array[i].agency_token + '\'' + ');" title="Relancer" class = "img_in_table" style="cursor: pointer;" src="img/next_step.png"/></td>'
			+ '</tr>';
	}
	htmlResult = htmlResult
		+ htmlResultDetail
		+ '</table>';
	$("#agency_list_result").html(htmlResult).fadeIn();
}

function getAgencyDoctors(agency_token) { //OK Uxxx ; no_user_region_agency à gérer
	 //par région et par spécialité, trié par ordre alphabétique
	agency_token_uri = encodeURIComponent(agency_token);
	user_token_uri = encodeURIComponent(user_token);
	
	htmlRender = '';
	htmlRender = htmlRender 
		+ '<div class = "agency_doctors_by_region" id = "agency_doctors_by_region" style="cursor: pointer;" onclick = "toggleDiv(\'agency_doctors_by_region_result\');">Liste des médecins par région'
		+ '</div>'
		+ '<div class = "agency_doctors_by_region_result" id = "agency_doctors_by_region_result">'
		+ '</div>'
		;
	
	document.getElementById("action_listing_doctors").innerHTML = htmlRender;
	
	
    var url = host + "WebServices/Agency/WS_Get_Doctors_By_Agency.php?agency_token=" + agency_token_uri + "&user_token=" + user_token_uri;
    console.log(url);
    
    var xhr = new XMLHttpRequest();
    xhr.timeout = 2000;
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
			//console.log(xhr);
			var response = JSON.parse(xhr.responseText);
			console.log(response);
			switch(response.status_message) {
			case "fatal_error_agency_id":
        		logout();
        		break;
			default: //erreur
				htmlResult = ''
					+ '<table class="rwd-table">'
					+ '<tr>'
						+ '<th>Information</th>'
						+ '<th>Action</th>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Information">' + response.status_message + '</td>'
						+ '<td data-th="Action"></td>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Information"></td>'
						+ '<td data-th="Action">Relancer&nbsp;<img id="getAgencyDoctors" title="Relancer" class = "img_in_table" style="cursor: pointer;" src="img/retry.png"/></td>'
					+ '</tr>'
				+ '</table>';
				$("#agency_doctors_by_region_result").html(htmlResult).fadeIn();
				$("#getAgencyDoctors").click(function() {
					getAgencyDoctors(agency_token);
				})
				break;
			case "no_user_region_agency":
				htmlResult = ''
					+ '<table class="rwd-table">'
						+ '<tr>'
							+ '<th>Information</th>'
							+ '<th>Action</th>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Information">' + response.status_message + '</td>'
							+ '<td data-th="Action"></td>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Information"></td>'
							+ '<td data-th="Action">Terminer&nbsp;<img id = "getAgencyDoctors" title="Créer" class = "img_in_table" style="cursor: pointer;" src="img/next_step.png"/></td>'
						+ '</tr>'
					+ '</table>';
				$("#agency_doctors_by_region_result").html(htmlResult).fadeIn();
				$("#getAgencyDoctors").click(function() {
					//toggleDiv("doctor_data_change_result");
					//toggleDiv("agency_sales_pro_result"); on ne masque pas car on a besoin des couleurs
					//createSalesProFormInput(agency_token); // on propose de créer un commercial
				})
				break;
			case "agency_doctors":
				doc = response.data;
				//console.log(doc);
				//On crée 4 div par région, un avec le nom de la région, et un avec les résultat, que l'on pourra réduire
				result_div = document.getElementById('agency_doctors_by_region_result');
				
				htmlRender = '';
				
				for (var i = 0; i < doc.region_array.length; i++) {
					//region_id = doc.region_array[i].region_id;
					htmlRender = htmlRender 
						+ '<div class = "doctor_region" id = "doctor_region_' + doc.region_array[i].region_id + '" style="cursor: pointer;" onclick = "toggleDiv(\'doctor_region_result_' + doc.region_array[i].region_id + '\');">Région ' + capitalizeWords(doc.region_array[i].libelle)
						+ '</div>'
						+ '<div class = "doctor_region_result" id = "doctor_region_result_' + doc.region_array[i].region_id + '">'
							+ '<div class = "doctor_filters" id = "doctor_filters_' + doc.region_array[i].region_id + '">'
							+ '</div>'
							+ '<div class = "doctor_listing_result" id = "doctor_listing_result_' + doc.region_array[i].region_id + '">'
							+ '</div>'
							+ '<div class = "doctor_listing_modif" id = "doctor_listing_modif_' + doc.region_array[i].region_id + '">'
							+ '</div>'
							+ '<div class = "doctor_listing_validate_update" id = "doctor_listing_validate_update_' + doc.region_array[i].region_id + '">'
							+ '</div>'
							+ '<div class = "doctor_listing_update_result" id = "doctor_listing_update_result_' + doc.region_array[i].region_id + '">'
							+ '</div>'
						+ '</div>'
						;
					//On crée le tableau qui va stocker les modifs : 
					modif_doctor_sales_pro_link[doc.region_array[i].region_id] = [];
				}
				//console.log(modif_doctor_sales_pro_link);
				document.getElementById('agency_doctors_by_region_result').innerHTML = htmlRender;
				
				createDoctorsFilter(doc);
				break;
			}
        }
    };
    xhr.ontimeout = function () {
    	console.log(timeout);
    	htmlResult = ''
			+ '<table class="rwd-table">'
				+ '<tr>'
					+ '<th>Information</th>'
					+ '<th>Action</th>'
				+ '</tr>'
				+ '<tr>'
					+ '<td data-th="Information">Timeout</td>'
					+ '<td data-th="Action"></td>'
				+ '</tr>'
				+ '<tr>'
					+ '<td data-th="Information"></td>'
					+ '<td data-th="Action">Relancer&nbsp;<img id = "getAgencyDoctors" title="Relancer" class = "img_in_table" style="cursor: pointer;" src="img/retry.png"/></td>'
				+ '</tr>'
			+ '</table>';
		$("#agency_doctors_by_region_result").html(htmlResult).fadeIn();
		$("#getAgencyDoctors").click(function() {
			getAgencyDoctors(agency_token);
			//toggleDiv("agency_sales_pro_result"); on ne masque pas car on a besoin des couleurs
		})
    };
    xhr.open("GET", url, true);
    xhr.send();  
}

function getAgencyDoctorsRegionId(region_id, doc) { //passer doc en paramètre et le mettre à jour ; KO pour le moment
	
	
	console.log("doctor_listing_result_" + region_id);
	document.getElementById("doctor_listing_result_" + region_id).innerHTML = "";
	
	console.log("doctor_listing_modif_" + region_id);
	document.getElementById("doctor_listing_modif_" + region_id).innerHTML = "";
	
	console.log("doctor_listing_validate_update_" + region_id);
	document.getElementById("doctor_listing_validate_update_" + region_id).innerHTML = "";
	
	console.log("doctor_listing_update_result_" + region_id);
	document.getElementById("doctor_listing_update_result_" + region_id).innerHTML = "";
	
	
	region_id_uri = encodeURIComponent(region_id);
	
	console.log(modif_doctor_sales_pro_link);
	
	modif_doctor_sales_pro_link[region_id] = []; 
	
	console.log(modif_doctor_sales_pro_link);
	
	var url = host + "WebServices/Region/WS_Get_Doctors_By_Region.php?region_id=" + region_id_uri;
    console.log(url);
    
    var xhr = new XMLHttpRequest();
    xhr.timeout = 2000;
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
			//console.log(xhr);
			var response = JSON.parse(xhr.responseText);
			console.log(response);
			switch(response.status_message) {
			default: //erreur
				window.alert('mise à jour ok ; erreur récupération : ' + response.status_message) //si on est là, la mise à jour a été effectuée
				break;
			case "region_doctors":
				
				region_code_array = doc.region_array.filter(x => x.region_id == region_id)[0];
				region_code = region_code_array.code; //erreur ici
				
				console.log(response.data);
				doc.region_doctors_array[region_code] = response.data[region_code];
				console.log(doc);
				
				filterDoctors(region_id, doc);
				break;
			}
        }
    };
    xhr.ontimeout = function () {
    	console.log("timeout");
    	htmlResult = ''
			+ '<table class="rwd-table">'
				+ '<tr>'
					+ '<th>Information</th>'
					+ '<th>Action</th>'
				+ '</tr>'
				+ '<tr>'
					+ '<td data-th="Information">Timeout</td>'
					+ '<td data-th="Action"></td>'
				+ '</tr>'
				+ '<tr>'
					+ '<td data-th="Information"></td>'
					+ '<td data-th="Action">Relancer&nbsp;<img id = "getAgencyDoctorsRegionId_' + region_id + '" title="Relancer" class = "img_in_table" style="cursor: pointer;" src="img/retry.png"/></td>'
				+ '</tr>'
			+ '</table>';
		$("#doctor_listing_result_" + region_id).html(htmlResult).fadeIn();
		$("#getAgencyDoctorsRegionId_" + region_id).click(function() {
			getAgencyDoctorsRegionId(region_id, doc);
			//toggleDiv("agency_sales_pro_result"); on ne masque pas car on a besoin des couleurs
		})
    };
    xhr.open("GET", url, true);
    xhr.send(); 
    
    
}

function createDoctorsFilter(doc) { //OK Uxxx

	//console.log('createDoctorsFilterListingResultDiv');
	//console.log(doc);
	
	for(var i = 0; i < doc.region_array.length; i++) {
		region_code_array = doc.region_array.filter(x => x.region_id == doc.region_array[i].region_id)[0];
		region_code = region_code_array.code;
		//console.log(region_code);
		region_speciality = doc.region_speciality[region_code].speciality;
		//console.log(region_speciality);
		region_sales_pro = doc.region_sales_pro[region_code].sales_pro;
		//console.log(region_sales_pro);

		htmlSelectSpeciality = '<select id="select_speciality_' + doc.region_array[i].region_id + '">'
			+ '<option value = -1>'
			+ 'Tous'
			+ '</option>';
		for (var j = 0; j < region_speciality.length; j++) {
			htmlSelectSpeciality = htmlSelectSpeciality
				+ '<option value = "'
				+ region_speciality[j].profession_id
				+ '">'
				+ capitalizeWords(region_speciality[j].doc_speciality)
				+ '</option>'
		}
		
		htmlSelectSpeciality = htmlSelectSpeciality
		+ '</select>';
		
		
		htmlSelectSalesPro = '<select id = "select_sales_pro_' + doc.region_array[i].region_id + '">'
			+ '<option value = -1>'
			+ 'Tous'
			+ '</option>';
		
		//console.log(region_sales_pro.length);
		
		for (var k = 0; k < region_sales_pro.length; k++) {
			htmlSelectSalesPro = htmlSelectSalesPro
				+ '<option value = "'
				+ region_sales_pro[k].token
				+ '">'
				+ capitalizeWords(region_sales_pro[k].first_name)
				+ ' '
				+ capitalizeWords(region_sales_pro[k].last_name)
				+ '</option>'
		}
		
		htmlSelectSalesPro = htmlSelectSalesPro
			+ '</select>';
		
		
		htmlFilter = ''
			+ '<table class="rwd-table">'
				+ '<tr>'
					+ '<th>Filtre</th>'
					+ '<th>Spécialité</th>'
					+ '<th>Commercial</th>'
					+ '<th>Action</th>'
				+ '</tr>'
				+ '<tr>'
					+ '<td data-th="Filtre"></td>' 
					+ '<td data-th="Spécialité">' + htmlSelectSpeciality + '</td>'
					+ '<td data-th="Commercial">' + htmlSelectSalesPro + '</td>'
					+ '<td data-th="Action"></td>'
				+ '</tr>'
				+ '<tr>'
					+ '<td data-th="Filtre"></td>' 
					+ '<td data-th="Spécialité"></td>'
					+ '<td data-th="Commercial"></td>'
					+ '<td data-th="Action">Filtrer&nbsp<img id = "getAgencyDoctors" title="Filtrer" class = "img_in_table" style="cursor: pointer;" onclick = "filterDoctors(' + doc.region_array[i].region_id + ', doc);" src="img/next_step.png"/></td>'
				+ '</tr>'
			+ '</table>';
			
			document.getElementById("doctor_filters_" + doc.region_array[i].region_id).innerHTML = htmlFilter;	
	}
}

function filterDoctors(region_id, doc) { //OK Uxxx
	//console.log('filterDoctors');
	//console.log(modif_doctor_sales_pro_link[region_id]);
	//console.log(region_id);
	
	region_code_array = doc.region_array.filter(x => x.region_id == region_id)[0];
	region_code = region_code_array.code;
	doc_region_array = doc.region_doctors_array[region_code].doctors;
	region_sales_pro = doc.region_sales_pro[region_code].sales_pro;
	//console.log('avant filtre');
	//console.log(doc_region_array);
	
	//console.log(region_sales_pro);
	
	var select_speciality = document.getElementById("select_speciality_" + region_id);
	var filter_speciality = select_speciality.options[select_speciality.selectedIndex].value
	
	var select_sales_pro = document.getElementById("select_sales_pro_" + region_id);
	var filter_sales_pro = select_sales_pro.options[select_sales_pro.selectedIndex].value
	
	
	//console.log('filter_speciality');	
	//console.log(filter_speciality);
	console.log('filter_sales_pro');
	console.log(filter_sales_pro);
	
	if (filter_speciality != -1) {
		//on a un filtre sur la spécialité
		doc_region_array = doc_region_array.filter(x => x.profession_id == filter_speciality);
	}
	
	//console.log('après filtre spe');
	//console.log(doc_region_array);
	
	
	if (filter_sales_pro != -1) {
		//on a un filtre sur la spécialité
		doc_region_array = doc_region_array.filter(x => x.token == filter_sales_pro);
	}
	
	//console.log('après filtre sp');
	//console.log(doc_region_array);
	
	htmlListing = '';
	htmlListing = htmlListing
		+ '<table class="rwd-table">'
			+ '<tr>'
				+ '<th>Identifiant</th>'
				+ '<th>Civilité</th>'
				+ '<th>Nom</th>'
				+ '<th>Prénom</th>'
				+ '<th>Spécialité</th>'
				+ '<th>Commercial</th>'
				+ '<th>Modifier</th>'
			+ '</tr>';
	
	for (var i = 0; i < doc_region_array.length; i++) {
		
	
		label_sales_pro_array = region_sales_pro.filter(x => x.token == doc_region_array[i].token)[0];
		//console.log(label_sales_pro_array);
				
		htmlListing = htmlListing 
				+ '<tr>'
					+ '<td data-th="Identifiant">' + doc_region_array[i].doc_identifiant + '</td>' 
					+ '<td data-th="Civilité">' + doc_region_array[i].doc_civilite + '</td>'
					+ '<td data-th="Nom">' + doc_region_array[i].doc_name + '</td>'
					+ '<td data-th="Prénom">' + doc_region_array[i].doc_first_name + '</td>'
					+ '<td data-th="Spécialité">' + doc_region_array[i].doc_speciality + '</td>'
					+ '<td data-th="Commercial">' + label_sales_pro_array.first_name + ' ' + label_sales_pro_array.last_name + '</td>'
					+ '<td data-th="Modifier">&nbsp<img id = "filterDoctors" title="Modifier" class = "img_in_table" style="cursor: pointer;" onclick = "editDoctorSalesProLink(' + region_id + ',' + '\'' + doc_region_array[i].doc_identifiant + '\'' + ', ' + '\'' + doc_region_array[i].token + '\'' + ', doc);" src="img/edit.png"/></td>'
				+ '</tr>';

	}
	htmlListing = htmlListing 
	+ '</table>'

	document.getElementById("doctor_listing_result_" + region_id).innerHTML = htmlListing;	
	
}

function editDoctorSalesProLink(region_id, doc_identifiant, sales_pro_token_orig, doc) { // OK Uxxx
	
	already_modified_doctor = modif_doctor_sales_pro_link[region_id].find(x => x.doc_identifiant == doc_identifiant);
	console.log(already_modified_doctor);
	
	region_code_array = doc.region_array.filter(x => x.region_id == region_id)[0];
	region_code = region_code_array.code;
	
	region_sales_pro = doc.region_sales_pro[region_code].sales_pro;
	
	if (already_modified_doctor === undefined) {
		console.log('premiere modif on crée') //il s'agit de la première modification du médecin dans cette session, la ligne n'existe pas dans le tableau

		doc_data = doc.region_doctors_array[region_code].doctors.filter(x => x.doc_identifiant == doc_identifiant)[0];
		sales_pro_data = doc.region_sales_pro[region_code].sales_pro.filter(x => x.token == sales_pro_token_orig)[0];
		//sales_pro_data = region_sales_pro.filter(x => x.sales_pro_token == sales_pro_token_orig)[0];
		//console.log('region_sales_pro');
		//console.log(region_sales_pro);
		console.log(doc_data);
		//console.log(sales_pro_data);

		lineToPush = {};
		lineToPush.doc_identifiant = doc_identifiant;
		lineToPush.doc_name = doc_data.doc_name;
		lineToPush.doc_first_name = doc_data.doc_first_name;
		lineToPush.doc_speciality = doc_data.doc_speciality;
		
		lineToPush.sales_pro_token_orig = sales_pro_token_orig;
		lineToPush.sales_pro_name_orig = sales_pro_data.last_name;
		lineToPush.sales_pro_first_name_orig = sales_pro_data.first_name;

		
		lineToPush.sales_pro_token_new = '';
		lineToPush.sales_pro_name_new = '';
		lineToPush.sales_pro_first_name_new = '';
		
		modif_doctor_sales_pro_link[region_id].push(lineToPush);
		
		resultModifDiv(region_id, doc);
		
		//console.log(modif_doctor_sales_pro_link[region_id]);

	} //manque un ELSE ?
}	

function resultModifDiv(region_id, doc) { //OK Uxxx

	//console.log('dans resultModifDiv');
	region_code_array = doc.region_array.filter(x => x.region_id == region_id)[0];
	region_code = region_code_array.code;
	
	region_sales_pro = doc.region_sales_pro[region_code].sales_pro;
	
	if (modif_doctor_sales_pro_link[region_id].length > 0) { //on crée les div de récapitulatif des modifications et d'enregistrement

		htmlModif = ''
			+ '<table class="rwd-table">'
			+ '<tr>'
				+ '<th>Identifiant</th>'
				+ '<th>Nom</th>'
				+ '<th>Spécialité</th>'
				+ '<th>Ancien commercial</th>'
				+ '<th>Nouveau commercial</th>'
				+ '<th>Annuler</th>'
			+ '</tr>';
		
		for (var i = 0; i < modif_doctor_sales_pro_link[region_id].length; i++) {
			
			htmlSelectSalesPro = '<select id = "select_sales_pro_modif_' + region_id + '_' + modif_doctor_sales_pro_link[region_id][i].doc_identifiant + '" onchange = "temporaryChangeDoctorSalesProLink(' + '\'' + modif_doctor_sales_pro_link[region_id][i].doc_identifiant + '\'' + ', ' + region_id + ', doc);">';
			
			for (var k = 0; k < region_sales_pro.length; k++) {
				htmlSelectSalesPro = htmlSelectSalesPro
					+ '<option value = "'
					+ region_sales_pro[k].token
					+ '">'
					+ capitalizeWords(region_sales_pro[k].first_name)
					+ ' '
					+ capitalizeWords(region_sales_pro[k].last_name)
					+ '</option>'
			}
			
			htmlSelectSalesPro = htmlSelectSalesPro
				+ '</select>';
			
			
			//console.log('dans for');
	
			label_sales_pro = modif_doctor_sales_pro_link[region_id][i].sales_pro_first_name_orig + ' ' + modif_doctor_sales_pro_link[region_id][i].sales_pro_name_orig;
			//console.log(label_sales_pro_array);
					
			htmlModif = htmlModif 
					+ '<tr>'
						+ '<td data-th="Identifiant">' + modif_doctor_sales_pro_link[region_id][i].doc_identifiant + '</td>' 
						+ '<td data-th="Nom">' + modif_doctor_sales_pro_link[region_id][i].doc_name + '</td>'
						+ '<td data-th="Spécialité">' + modif_doctor_sales_pro_link[region_id][i].doc_speciality + '</td>'
						+ '<td data-th="Ancien commercial">' + label_sales_pro + '</td>'
						+ '<td data-th="Nouveau commercial">' + htmlSelectSalesPro + '</td>'
						+ '<td data-th="Annuler">&nbsp<img id = "editDoctorSalesProLink" title="Annuler" class = "img_in_table" style="cursor: pointer;" onclick = "cancelTemporaryChangeDoctorSalesProLink(' + '\'' + modif_doctor_sales_pro_link[region_id][i].doc_identifiant + '\'' + ', ' + region_id + ', doc);" src="img/ko.png"/></td>'
					+ '</tr>';
		}
		
		htmlModif = htmlModif 
		+ '</table>'
	
		document.getElementById("doctor_listing_modif_" + region_id).innerHTML = htmlModif;	
		
		//document.getElementById("doctor_listing_modif_" + region_id).scrollIntoView();
		
		for (var i = 0; i < modif_doctor_sales_pro_link[region_id].length; i++) {
			//permet de mettre soit le commercial d'origine soit le nouveau commercial choisi dans la nouvelle liste de choix
			//console.log('token new : ');
			//console.log(modif_doctor_sales_pro_link[region_id][i].sales_pro_token_new);
			selectElement('select_sales_pro_modif_' + region_id + '_' + modif_doctor_sales_pro_link[region_id][i].doc_identifiant, modif_doctor_sales_pro_link[region_id][i].sales_pro_token_new == '' ? modif_doctor_sales_pro_link[region_id][i].sales_pro_token_orig : modif_doctor_sales_pro_link[region_id][i].sales_pro_token_new);
		}
		
		validateModifDiv(region_id, doc);
		
	}
	else { //On supprime les div de récapitulatif des modifications et d'enregistrement
		htmlModif = '' 
			+ '<div class = "doctor_listing_modif" id = "doctor_listing_modif_' + region_id + '">'
			+ '</div>';
		document.getElementById("doctor_listing_modif_" + region_id).innerHTML = htmlModif;	
		
		htmlValidate = ''
			//+ '<div class = "doctor_listing_validate_update" id = "doctor_listing_validate_update_' + doc.region_array[i].region_id + '">ENREGISTREMENT'
			+ '<div class = "doctor_listing_validate_update" id = "doctor_listing_validate_update_' + region_id + '">'
			+ '</div>';
		document.getElementById("doctor_listing_validate_update_" + region_id).innerHTML = htmlValidate;	
	}
}

function selectElement(id, valueToSelect) { //OK Uxxx
	console.log('dans select element');
    let element = document.getElementById(id);
    element.value = valueToSelect;
}

function temporaryChangeDoctorSalesProLink(doc_identifiant, region_id, doc) { //OK Uxxx
	
	region_code_array = doc.region_array.filter(x => x.region_id == region_id)[0];
	region_code = region_code_array.code;
	region_sales_pro = doc.region_sales_pro[region_code].sales_pro;

	//console.log(region_sales_pro);
	
	var select_new_sales_pro = document.getElementById("select_sales_pro_modif_" + region_id + '_' + doc_identifiant);
	var filter_new_sales_pro = select_new_sales_pro.options[select_new_sales_pro.selectedIndex].value;
	
	sales_pro_data_new = doc.region_sales_pro[region_code].sales_pro.filter(x => x.token == filter_new_sales_pro)[0];
	
	//console.log('modif');
	modif_doctor_sales_pro_link[region_id].filter(x => x.doc_identifiant == doc_identifiant)[0].sales_pro_token_new = filter_new_sales_pro;
	modif_doctor_sales_pro_link[region_id].filter(x => x.doc_identifiant == doc_identifiant)[0].sales_pro_name_new = sales_pro_data_new.last_name;
	modif_doctor_sales_pro_link[region_id].filter(x => x.doc_identifiant == doc_identifiant)[0].sales_pro_first_name_new = sales_pro_data_new.first_name;
	
	//console.log(modif_doctor_sales_pro_link);

}	

function cancelTemporaryChangeDoctorSalesProLink(doc_identifiant, region_id, doc) { //OK Uxxx
	
	console.log(doc_identifiant + ' ; ' + region_id);
	console.log('avant remove');
	console.log(modif_doctor_sales_pro_link[region_id]);
	modif_doctor_sales_pro_link[region_id] = modif_doctor_sales_pro_link[region_id].filter(x => x.doc_identifiant != doc_identifiant);
	console.log('après remove');
	console.log(modif_doctor_sales_pro_link[region_id]);
	//on rafraichit le div modif
	resultModifDiv(region_id, doc);
}	
	
function validateModifDiv(region_id, doc) { //OK Uxxx
	console.log('length : ' + modif_doctor_sales_pro_link[region_id].length);
	htmlValidate = ''
			+ '<table class="rwd-table">'
			+ '<tr>'
				+ '<th>Information</th>'
				+ '<th>Enregistrer</th>'
			+ '</tr>'
			+ '<tr>'
				+ '<td data-th="Information">' + modif_doctor_sales_pro_link[region_id].length + ' modification(s)' + '</td>' 
				+ '<td data-th="Action"></td>'
			+ '</tr>'
			+ '<tr>'
				+ '<td data-th="Information"></td>' 
				+ '<td data-th="Action">Enregistrer&nbsp<img id = "editDoctorSalesProLink" title="Enregistrer" class = "img_in_table" style="cursor: pointer;" onclick = "saveNewDoctorsSalesProLink(' + region_id + ', doc);" src="img/next_step.png"/></td>'
			+ '</tr>'
		+ '</table>';
	document.getElementById("doctor_listing_validate_update_" + region_id).innerHTML = htmlValidate;	
}

function saveNewDoctorsSalesProLink(region_id, doc) {
	

	user_token_uri = encodeURIComponent(user_token);
	region_id_uri = encodeURIComponent(region_id);
	console.log(modif_doctor_sales_pro_link[region_id]);
	
	const keys_to_keep = ['doc_identifiant', 'sales_pro_token_new'];

	const redux = array => array.map(o => keys_to_keep.reduce((acc, curr) => {
	  acc[curr] = o[curr];
	  return acc;
	}, {}));

	modif_doctor_sales_pro_link_light = redux(modif_doctor_sales_pro_link[region_id]);
	
	console.log(modif_doctor_sales_pro_link_light);
	
	modif_doctor_sales_pro_link_light_json = JSON.stringify(modif_doctor_sales_pro_link_light);
	console.log(modif_doctor_sales_pro_link_light_json);
	
	modif_doctors_sales_pro_link_light_uri  = encodeURIComponent(modif_doctor_sales_pro_link_light_json);
	console.log(modif_doctors_sales_pro_link_light_uri);
	
    var url = host + "WebServices/Region/WS_Update_Doctor_Sales_Pro_Link_By_Region.php?region_id=" + region_id_uri + "&dspl=" + modif_doctors_sales_pro_link_light_uri + "&user_token=" + user_token_uri;
    console.log(url);

    var xhr = new XMLHttpRequest();
    xhr.timeout = 2000;
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
			//console.log(xhr);
			var response = JSON.parse(xhr.responseText);
			console.log(response);
			switch(response.status_message) {
			default: //erreur
				htmlResult = ''
					+ '<table class="rwd-table">'
					+ '<tr>'
						+ '<th>Information</th>'
						+ '<th>Action</th>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Information">' + response.status_message + '</td>'
						+ '<td data-th="Action"></td>'
					+ '</tr>'
					+ '<tr>'
						+ '<td data-th="Information"></td>'
						+ '<td data-th="Action">Relancer&nbsp;<img id="saveNewDoctorsSalesProLink_' + region_id + '" title="Relancer" class = "img_in_table" style="cursor: pointer;" src="img/retry.png"/></td>'
					+ '</tr>'
				+ '</table>';
				$("#doctor_listing_update_result_" + region_id).html(htmlResult).fadeIn();
				$("#saveNewDoctorsSalesProLink").click(function() {
					saveNewDoctorsSalesProLink(region_id);
				})
				break;
			case "update_complete":
				htmlResult = ''
					+ '<table class="rwd-table">'
						+ '<tr>'
							+ '<th>Information</th>'
							+ '<th>Action</th>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Information">' + response.status_message + '</td>'
							+ '<td data-th="Action"></td>'
						+ '</tr>'
						+ '<tr>'
							+ '<td data-th="Information"></td>'
							+ '<td data-th="Action">Terminer&nbsp;<img id = "saveNewDoctorsSalesProLink_' + region_id + '" title="Terminer" class = "img_in_table" style="cursor: pointer;" src="img/next_step.png"'
							+ ' onclick = "getAgencyDoctorsRegionId(' + region_id + ', doc);"/></td>'
						+ '</tr>'
					+ '</table>';
				$("#doctor_listing_update_result_" + region_id).html(htmlResult).fadeIn();
				$("#saveNewDoctorsSalesProLink").click(function() {
					//on appelle la fonction qui met à jour le div de la région
					getAgencyDoctorsRegionId(region_id, doc);
					//On réinitialise le tableau de la région qui a été enregistré
					//modif_doctor_sales_pro_link[region_id] = [];
					//console.log(modif_doctor_sales_pro_link[region_id]);
					//On met à jour le div du listing des docteurs
					//console.log('filter');
					//filterDoctors(region_id, doc);
					
					//toggleDiv("doctor_data_change_result");
					//toggleDiv("agency_sales_pro_result"); on ne masque pas car on a besoin des couleurs
					//createSalesProFormInput(agency_token); // on propose de créer un commercial
				})
				break;
			}
        }
    };
    xhr.ontimeout = function () {
    	console.log(timeout);
    	htmlResult = ''
			+ '<table class="rwd-table">'
				+ '<tr>'
					+ '<th>Information</th>'
					+ '<th>Action</th>'
				+ '</tr>'
				+ '<tr>'
					+ '<td data-th="Information">Timeout</td>'
					+ '<td data-th="Action"></td>'
				+ '</tr>'
				+ '<tr>'
					+ '<td data-th="Information"></td>'
					+ '<td data-th="Action">Relancer&nbsp;<img id = "saveNewDoctorsSalesProLink_' + region_id + '" title="Relancer" class = "img_in_table" style="cursor: pointer;" src="img/retry.png"/></td>'
				+ '</tr>'
			+ '</table>';
		$("#doctor_listing_update_result_" + region_id).html(htmlResult).fadeIn();
		$("#saveNewDoctorsSalesProLink").click(function() {
			saveNewDoctorsSalesProLink(region_id);
			
		})
    };
    xhr.open("GET", url, true);
    xhr.send(); 
}


//FIN Commercial
