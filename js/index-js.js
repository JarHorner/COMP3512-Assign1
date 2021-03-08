const companyListURL = 'https://www.randyconnolly.com/funwebdev/3rd/api/stocks/companies.php';
//remember for stockData, add the symbol # at the end of the url (symbol=) using a queryString.
let stockDataURL = 'https://www.randyconnolly.com/funwebdev/3rd/api/stocks/history.php?symbol=';

let map;
/* creates a Map element, more properties are set when a specific company is clicked */
function initMap() {
    map = new google.maps.Map(document.querySelector('#location'), {
        mapTypeId: 'satellite'
    });
}

const companies = [];
const filterBox = document.querySelector('#filter');
const companyList = document.querySelector('#companylist');
const companyInfo = document.querySelector(".co-info");

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
           document.querySelector('#company-information').style.display = 'none';
           document.querySelector('#stocktable').style.display = "none";

        });

// Get the credits
var credits = document.querySelector("#our-credits");
// Get the icon that opens the credits
var icon = document.querySelector(".fa-bar-chart");

/* When the user scrolls over the icon, credits open in view for 5 seconds 
Heavily inspired by https://www.w3schools.com/howto/howto_css_modals.asp */
document.querySelector('.fa-bar-chart')
        .addEventListener('mouseover', () => {
            credits.style.display = "block";
            setTimeout( () => {
                credits.style.display = "none";
            }, 5000);
        });

/* When the user clicks anywhere outside of the credits, close it. alternative to 
the 5 second wait */
window.onclick = function(event) {
    if (event.target == credits) {
        credits.style.display = "none";
    }
  }

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

/*function to populate company information*/
function populateCompanyInformation(company) {
    document.querySelector('#company-information').style.display = 'block';
    document.querySelector('.name-logo').style.display = 'flex';
    document.querySelector('.other-details').style.display = 'flex';
    const item = document.querySelector('.company-name');
    const symbol = document.querySelector('.company-symbol');
    const sector = document.querySelector('.sector');
    const subIndustry = document.querySelector('.sub-industry');
    const address = document.querySelector('.address');
    const website = document.querySelector('.website');
    const exchange = document.querySelector('.exchange');
    const companyDescription = document.querySelector('.company-description');
    item.textContent = company.name;
    symbol.textContent = company.symbol;
    sector.textContent = company.sector;
    subIndustry.textContent = company.subindustry;
    address.textContent = company.address;
    website.textContent = company.website;
    exchange.textContent = company.exchange;
    companyDescription.textContent = company.description;
    
    const logo = document.querySelector(".logo");
    logo.src = `./logos/${company.symbol}.svg`;
}

/* populated the 'map' section with the cooordinates of the specific company */
function populateMap(company) {
    map.setZoom(18);
    map.setCenter(new google.maps.LatLng(company.latitude, company.longitude));
    document.querySelector('#location').style.display = "block";
}


let companyStock = [];
function populateStockData(company) {
    document.querySelector('.roller2').style.display = "block";
    stockDataURL = `https://www.randyconnolly.com/funwebdev/3rd/api/stocks/history.php?symbol=${company.symbol}`;
    fetch(stockDataURL)
        .then((res) => {
            if (res.ok) return res.json();
            else
                throw new Error("Response from json failed! check URL or internet connection.");
        })
        .then((data) => {
            companyStock = data;
            
            const date = document.querySelector(".date");
            const open = document.querySelector(".open");
            const close = document.querySelector(".close");
            const low = document.querySelector(".low");
            const high = document.querySelector(".high");
            const volume = document.querySelector(".volume");


            const stockdata = document.querySelector("table.data tbody")
            stockdata.innerHTML = '';
            console.log(companyStock)
            companyStock.forEach((item) => {
                const tr = document.createElement('tr');
                const tdDate = document.createElement('td');
                const tdOpen = document.createElement('td');
                const tdClose = document.createElement('td');
                const tdLow = document.createElement('td');
                const tdHigh = document.createElement('td');
                const tdVolume = document.createElement('td');
                tdDate.textContent = item.date;
                tdOpen.textContent = item.open;
                tdClose.textContent = item.close;
                tdLow.textContent = item.low;
                tdHigh.textContent = item.high;
                tdVolume.textContent = item.volume;
                tr.appendChild(tdDate);
                tr.appendChild(tdOpen);
                tr.appendChild(tdClose);
                tr.appendChild(tdLow);
                tr.appendChild(tdHigh);
                tr.appendChild(tdVolume);
                stockdata.appendChild(tr);
            });
            document.querySelector('.roller2').style.display = "none";
            document.querySelector('#stocktable').style.display = "block";
        })
        .catch((error) => console.log(`found a ${error}`));
}
