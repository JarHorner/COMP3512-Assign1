const companyListURL = 'https://www.randyconnolly.com/funwebdev/3rd/api/stocks/compasnies.php';

let map;
/* creates a Map element, more properties are set when a specific company is clicked */
function initMap() {
    map = new google.maps.Map(document.querySelector('#location'), {
        mapTypeId: 'satellite'
    });
}

let companies = [];
let companyStock = [];
const filterBox = document.querySelector('#filter');
const companyList = document.querySelector('#companylist');
const credits = document.querySelector("#our-credits");
let localCompanies = localStorage.getItem('companies');
if (!localCompanies) {
    fetch(companyListURL)
        .then( response => {
            if(response.ok)
                return response.json() 
            else
                throw new Error("Response from json failed!")
        })
        .then( data => {
            companies.push(...data);
            let json = JSON.stringify(data);
            localStorage.setItem("companies", json);
            populateCompanyList(companies);
        })
        .catch( error => console.log(`found a ${error}`) );
} else {
    companies = JSON.parse(localStorage.getItem('companies'));
    populateCompanyList(companies);
}
/* Adds a handler to search for a company typed in the textbox
(refer to findMatches function) */
filterBox.addEventListener('keyup', findMatches);
/* Adds a handler to the "Clear" button to repopulate the list when clicked 
(refer to clearButton function) */
document.querySelector(".reset").addEventListener('click', clearButton);

/* When the user scrolls over the icon, credits open in view for 5 seconds */
document.querySelector('.fa-bar-chart')
        .addEventListener('mouseover', () => {
            credits.style.display = "block";
            setTimeout( () => {
                credits.style.display = "none";
            }, 5000);
        });



/* UTILITY FUNCTIONS */

/* Adds each company either from local storage or API to a list, also adding
event delegation to the list of company (refer to displayInformation) */
function populateCompanyList(companies) {
    companies.forEach( company => {
        let li = document.createElement('li');
        li.textContent = company.name;
        companyList.appendChild(li);
    });
    companyList.style.display = "inline-block";
    document.querySelector('.lds-roller').style.display = "none";
    companyList.addEventListener("click", displayInformation);
}

/* Populates multiple sections on the webpage when the element clicked matches
a 'li' element. It uses multiple sub-functions within for clarity
(refer to populateCompanyInformation, populateMap, populateStockData) */
function displayInformation(e) {
    if (!e.target.matches('li')) return
    const company = companies.find( c => c.name == e.target.textContent);
    populateCompanyInformation(company)
    populateMap(company);
    populateStockData(company);
}

/* Empties the company list, then re-creates it along  with changing all
company-related panels to not  display */
function clearButton() {
    companyList.innerHTML = '';
    companies.forEach( company => {
        let li = document.createElement('li');
        li.textContent = company.name;
        companyList.appendChild(li);
    });
    document.querySelector('#location').style.display = 'none';
    document.querySelector('#company-information').style.display = 'none';
    document.querySelector('#stocktable').style.display = "none";
}

/* Finds the matches within the input box (refer to compare Companies),
 and populates a list accordingly */
function findMatches() {
    const matches = compareCompanies(this.value, companies);

    companyList.innerHTML = '';

    matches.forEach( company => {
        let li = document.createElement('li');
        li.textContent = company.name;
        companyList.appendChild(li);
    });
}

/* Returns a filtered array, looking through the  array for matching pairs 
starting from the beginning of the name. */
function compareCompanies(wordToFind, companies) {
    return companies.filter( comp => {
        const regex = new RegExp(`^${wordToFind}`, 'gi');
        return comp.name.match(regex);
    });
}

/* Populates company information panel with coontent related to company 'clicked' */
function populateCompanyInformation(company) {
    document.querySelector('.name-logo').style.display = 'flex';
    document.querySelector('.other-details').style.display = 'flex';
    const logo = document.querySelector(".logo");
    const name = document.querySelector('.company-name');
    const symbol = document.querySelector('.company-symbol');
    const sector = document.querySelector('.sector');
    const subIndustry = document.querySelector('.sub-industry');
    const address = document.querySelector('.address');
    const website = document.querySelector('.website');
    const exchange = document.querySelector('.exchange');
    const description = document.querySelector('.description');
    logo.src = `./logos/${company.symbol}.svg`;
    name.textContent = company.name;
    symbol.textContent = company.symbol;
    sector.textContent = company.sector;
    subIndustry.textContent = company.subindustry;
    address.textContent = company.address;
    website.textContent = company.website;
    website.href = company.website;
    exchange.textContent = company.exchange;
    description.textContent = company.description;
}

/* centers the Google map with cooordinates of the specific company */
function populateMap(company) {
    map.setZoom(18);
    map.setCenter(new google.maps.LatLng(company.latitude, company.longitude));
    document.querySelector('#location').style.display = "block";
}

/* Populates the stock data section, by fetching a specific API then building a table
to oorganize the data. An event handler is added  to the headers, to sort each category
(refer to organizeData) */
function populateStockData(company) {
    const stockDataURL = `https://www.randyconnolly.com/funwebdev/3rd/api/stocks/history.php?symbol=${company.symbol}`;
    document.querySelector('#stocktable').style.display = "none";
    document.querySelector('.roller2').style.display = "block";
    fetch(stockDataURL)
        .then((res) => {
            if (res.ok) return res.json();
            else
                throw new Error("Response from json failed!");
        })
        .then((data) => {
            companyStock.push(...data);

            const stockdata = document.querySelector("table.data tbody");
            const stockHeaders = document.querySelector("table.data thead tr");
            stockdata.innerHTML = '';
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
            stockHeaders.addEventListener('click', organizeData);
            document.querySelector('.roller2').style.display = "none";
            document.querySelector('#stocktable').style.display = "block";
        })
        .catch((error) => console.log(`found a ${error}`));
}

/* allows  each column of stock data to be organized ascending or descending,
by finding which column was clicked (refer to columnNumber) and re-organizing the data.
Heavily inspired by https://www.w3schools.com/howto/howto_js_sort_table.asp, with some
changing to fit this table  */
function organizeData(e) {
    let table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.querySelector("table.data");
    switching = true;
    const columnNum = columnNumber(e.target.textContent);
    // Set the sorting direction to ascending:
    dir = "asc";
    /* Make a loop that will continue until
    no switching has been done: */
    while (switching) {
      // Start by saying: no switching is done:
      switching = false;
      rows = table.rows;
      /* Loop through all table rows (except the
      first, which contains table headers): */
      for (i = 1; i < (rows.length - 1); i++) {
        // Start by saying there should be no switching:
        shouldSwitch = false;
        /* Get the two elements you want to compare,
        one from current row and one from the next: */
        x = rows[i].querySelectorAll("td")[columnNum];
        y = rows[i + 1].querySelectorAll("td")[columnNum];
        /* Check if the two rows should switch place,
        based on the direction, asc or desc: */
        if (dir == "asc" && !(columnNum == 0)) {
            if (Number(x.innerHTML) > Number(y.innerHTML)) {
                // If so, mark as a switch and break the loop:
                shouldSwitch = true;
                break;
            }
        } else if (dir == "asc" && columnNum == 0) {
            if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                shouldSwitch = true;
                break;
            }
        } else if (dir == "desc" && !(columnNum == 0)) {
            if (Number(x.innerHTML) < Number(y.innerHTML)) {
                // If so, mark as a switch and break the loop:
                shouldSwitch = true;
                break;
            } 
        } else if (dir == "desc" && columnNum == 0) {
            if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                shouldSwitch = true;
                break;
            }
          }
        }
      if (shouldSwitch) {
        /* If a switch has been marked, make the switch
        and mark that a switch has been done: */
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
        // Each time a switch is done, increase this count by 1:
        switchcount ++;
      } else {
        /* If no switching has been done AND the direction is "asc",
        set the direction to "desc" and run the while loop again. */
        if (switchcount == 0 && dir == "asc") {
          dir = "desc";
          switching = true;
        }
      }
    }
}

/* determines the column number clicked on */
function columnNumber(name) {
    switch(name) {
        case 'Date':
            return 0;
        case 'Open':
            return 1;
        case 'Close':
            return 2;
        case 'Low':
            return 3;
        case 'High':
            return 4;
        case 'Volume':
            return 5;
    }
}