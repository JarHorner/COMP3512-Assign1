const companyListURL = 'https://www.randyconnolly.com/funwebdev/3rd/api/stocks/companies.php';
//remember for stockData, add the symbol # at the end of the url (symbol=) using a queryString.
const stockDataURL = 'https://www.randyconnolly.com/funwebdev/3rd/api/stocks/history.php?symbol=';

let map;
/* creates a Map element, more properties are set when a specific coompany is clicked */
function initMap() {
    map = new google.maps.Map(document.querySelector('#location'), {
        mapTypeId: 'satellite'
    });
}

const companies = [];
const filterBox = document.querySelector('#filter');
const companyList = document.querySelector('#companylist')

fetch(companyListURL)
    .then( response => {
        if(response.ok)
            return response.json() 
        else
            throw new Error("Response from json failed! check URL or internet connection.")
    })
    .then( data => {
        //need to save JSON to localStorage here 
        companies.push(...data);
        companies.forEach( company => {
            let li = document.createElement('li');
            li.textContent = company.name;
            companyList.appendChild(li);
        });
        companyList.style.display = "inline-block";
        document.querySelector('.lds-roller').style.display = "none";
        companyList.addEventListener("click", displayInformation);
    })
    .catch( error => console.log(`found a ${error}`) );

filterBox.addEventListener('keyup', findMatches);

/* adds a handler to the "Clear" button to repopulate the list when clicked */
document.querySelector(".reset")
        .addEventListener('click', () => {
            companyList.innerHTML = '';
            companies.forEach( company => {
                let li = document.createElement('li');
                li.textContent = company.name;
                companyList.appendChild(li);
           });
           document.querySelector('#location').style.display = 'none';
           //in the future, will change the display of each section to 'none' 
        });

// Get the credits
var credits = document.querySelector("#our-credits");
// Get the icon that opens the credits
var icon = document.querySelector(".fa-bar-chart");

/* When the user clicks on the button, opens up the credits in view for 5 seconds 
Heavily inspired by https://www.w3schools.com/howto/howto_css_modals.asp */
document.querySelector('.fa-bar-chart')
        .addEventListener('mouseover', () => {
            credits.style.display = "block";
            setTimeout( () => {
                credits.style.display = "none";
            }, 5000);
        });

/* When the user clicks anywhere outside of the credits, close it. alternative to
the 5 second wait
window.onclick = function(event) {
    if (event.target == credits) {
        credits.style.display = "none";
    }
  } */ 

/* Function that find the matches within the input box, and populates a list accordingly */
function findMatches() {
    const matches = compareCompanies(this.value, companies);

    companyList.innerHTML = '';

    matches.forEach( company => {
        let li = document.createElement('li');
        li.textContent = company.name;
        companyList.appendChild(li);
    });
}

/* Function that returns a filtered array, looking through the company array for matching pairs 
starting from the beginning of the name. */
function compareCompanies(wordToFind, companies) {
    return companies.filter( comp => {
        const regex = new RegExp(`^${wordToFind}`, 'gi');
        return comp.name.match(regex);
    });
}

/* Function that populates multiple sections on the webpage when the element clicked matches
a 'li' element. It uses multiple sub-functions within for clarity */
function displayInformation(e) {
    if (!e.target.matches('li')) return
    const company = companies.find( c => c.name == e.target.textContent);
    populateCompanyInformation(company)
    populateMap(company);
    populateStockData(company);
}

function populateCompanyInformation(company) {
    
}

/* poopulated the 'map' section with the cooordinates of the specific company */
function populateMap(company) {
    map.setZoom(18);
    map.setCenter(new google.maps.LatLng(company.latitude, company.longitude));
    document.querySelector('#location').style.display = "block";
}

function populateStockData(company) {

}