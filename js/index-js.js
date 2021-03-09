const companyListURL = 'https://www.randyconnolly.com/funwebdev/3rd/api/stocks/companies.php';

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
    populateDescription(company);
    populateFinancials(company);
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
    document.querySelector('.chartsBtn').style.display = "none";
    document.querySelector('.calculations').style.display = "none";
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
    document.querySelector('#company-information').style.display = 'block';
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
            companyStock = data;
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
            document.querySelector('.chartsBtn').style.display = "block";
            //calculates each row average, min, and max (refer to each method)
            calculatingAverage();
            calculatingMin();
            calculatingMax();
            document.querySelector('.calculations').style.display = "block";
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
    dir = "asc";
   
    while (switching) {

      switching = false;
      rows = table.rows;
      for (i = 1; i < (rows.length - 1); i++) {
        shouldSwitch = false;
        
        x = rows[i].querySelectorAll("td")[columnNum];
        y = rows[i + 1].querySelectorAll("td")[columnNum];
        
        if (dir == "asc" && !(columnNum == 0)) {
            if (Number(x.innerHTML) > Number(y.innerHTML)) {
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
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
        switchcount ++;
      } else {
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
        case 'Open($)':
            return 1;
        case 'Close($)':
            return 2;
        case 'Low($)':
            return 3;
        case 'High($)':
            return 4;
        case 'Volume':
            return 5;
    }
}

/* loops through each row of stock data and creates an average for each column */
function calculatingAverage() {
    let  x, average, n;
    const table = document.querySelector("table.data");
    const rows  =  table.rows;
    const averageRow  =  document.querySelector("table.calculations #average-row");
    averageRow.innerHTML =  "";
    //adds Title of row to front
    let td =  document.createElement('td');
    td.innerHTML  = "<b>Average:<b>";
    averageRow.appendChild(td);
    //adds Title of row to front
    for (let c = 1;  c  < 6;  c++)  {
        n  =  0;
        average  = 0;
        //start at 1 to skip header row
        for (let i = 1; i < (rows.length - 1); i++) {

            x = rows[i].querySelectorAll("td")[c];
            average += Number(x.innerHTML);
            n++;
        }
        average = average/n;
        td =  document.createElement('td')
        if (c == 5) {
            td.innerHTML = average.toFixed(0);
            averageRow.appendChild(td);  
        } else {
            td.innerHTML = `$${average.toFixed(4)}`;
            averageRow.appendChild(td);
        }
    }
}

/* loops through each row of stock data and finds the min for each column */
function calculatingMin() {
    let  x, min;
    const table = document.querySelector("table.data");
    const rows  =  table.rows;
    const minRow  =  document.querySelector("table.calculations #min-row");
    minRow.innerHTML =  "";
    //adds Title of row to front
    let td =  document.createElement('td');
    td.innerHTML  = "<b>Min:<b>";
    minRow.appendChild(td);
    //start at 1 to skip date column
    for (let c = 1;  c  < 6;  c++)  {
        //start min as first row entry
        min  = Number(rows[c].querySelectorAll("td")[c].innerHTML);
        //start at 1 to skip header row
        for (let i = 1; i < (rows.length - 1); i++) {

            x = rows[i].querySelectorAll("td")[c];
            if (Number(x.innerHTML) < min) {
                min = Number(x.innerHTML);
            }
        }
        td =  document.createElement('td');
        if (c == 5) {
            td.innerHTML  =  min.toFixed(0);
            minRow.appendChild(td);  
        } else {
            td.innerHTML = `$${min.toFixed(4)}`;
            minRow.appendChild(td);
        }
    }
}

/* loops through each row of stock data and finds the max for each column */
function calculatingMax() {
    let  x, max;
    const table = document.querySelector("table.data");
    const rows  =  table.rows;
    const maxRow  =  document.querySelector("table.calculations #max-row");
    maxRow.innerHTML =  "";
    //adds Title of row to front
    let td =  document.createElement('td');
    td.innerHTML  = "<b>Max:<b>";
    maxRow.appendChild(td);
    //start at 1 to skip date column
    for (let c = 1;  c < 6;  c++)  {
        //start max as first row entry
        max = Number(rows[c].querySelectorAll("td")[c].innerHTML);
        //start at 1 to skip header row
        for (let i = 1; i < (rows.length - 1); i++) {

            x = rows[i].querySelectorAll("td")[c];
            if (Number(x.innerHTML) > max) {
                max = Number(x.innerHTML);
            }
        }
        td =  document.createElement('td');
        if (c == 5) {
            td.innerHTML  =  max.toFixed(0);
            maxRow.appendChild(td);  
        } else {
            td.innerHTML  =  `$${max.toFixed(4)}`;
            maxRow.appendChild(td);
        }
    }
}

/* populates the description section on the second screen, with a button
to speak the description */
function populateDescription(company) {
    const title = document.querySelector('.description .title');
    title.textContent = `${company.name} (${company.symbol})`;
    const description = document.querySelector('.company-desc');
    description.textContent = company.description;
    document.querySelector('.speakBtn').addEventListener('click', (e) => {
        const utterance = new SpeechSynthesisUtterance(description.textContent);
        speechSynthesis.speak(utterance);
    });
}

/* checks too see if the company has financials, if not a heading is inserted instead
of a table. If the company does, a table is populated with that information */
function populateFinancials(company) {
    const finacials = company.financials;
    console.log(finacials);
    const section =  document.querySelector('#finance-section');
    const h1 = document.createElement('h1');
    const companyFinance = document.querySelector(".financial-table tbody");
    if (!finacials) {
        document.querySelector('.financial-table').style.display = "none";
        h1.className = "noInfo";
        h1.innerHTML = "No Financial Information Available";
        section.appendChild(h1);
        setTimeout( () => { section.removeChild(h1)}, 20000);
    } else {
        let td1 = document.createElement('td');
        td1.innerHTML = "<b>Year:<b>";
        const year = document.querySelector('.year');
        year.appendChild(td1);
        for (let i=0; i < finacials.years.length; i++) {
            const tdYear = document.createElement('td');
            tdYear.textContent = finacials.years[i];
            year.appendChild(tdYear);
        }
        const td2 = document.createElement('td');
        td2.innerHTML = "<b>Revenue:<b>";
        const revenue = document.querySelector('.revenue');
        revenue.appendChild(td2);
        for (let i=0; i < finacials.revenue.length; i++) {
            const tdRevenue = document.createElement('td');
            tdRevenue.textContent = finacials.revenue[i];
            revenue.appendChild(tdRevenue);
        }
        const td3 = document.createElement('td');
        td3.innerHTML = "<b>Earnings:<b>";
        const earnings = document.querySelector('.earnings');
        earnings.appendChild(td3);
        for (let i=0; i < finacials.earnings.length; i++) {
            const tdEarnings = document.createElement('td');
            tdEarnings.textContent = finacials.earnings[i];
            earnings.appendChild(tdEarnings);
        }
        const td4 = document.createElement('td');
        td4.innerHTML = "<b>Assests:<b>";
        const assets = document.querySelector('.assets');
        assets.appendChild(td4);
        for (let i=0; i < finacials.assets.length; i++) {
            const tdAssests = document.createElement('td');
            tdAssests.textContent = finacials.assets[i];
            assets.appendChild(tdAssests);
        }
        const td5 = document.createElement('td');
        td5.innerHTML = "<b>Liabilities:<b>";
        const liabilities = document.querySelector('.liabilities');
        liabilities.appendChild(td5);
        for (let i=0; i < finacials.liabilities.length; i++) {
            const tdLiabilities = document.createElement('td');
            tdLiabilities.textContent = finacials.liabilities[i];
            liabilities.appendChild(tdLiabilities);
        }
}
}


/* button to switch UI to secondary */
document.querySelector(".chartsBtn").addEventListener('click', () => {
    document.querySelectorAll('.main').forEach( section => {
        section.style.display = 'none';
    });
    document.querySelectorAll('.second').forEach( section => {
        section.style.display = 'block';
    });

 });

  /* button to switch UI to deafult */
  document.querySelector(".closeBtn").addEventListener('click', () => {
    document.querySelectorAll('.second').forEach( section => {
        section.style.display = 'none';
    });
    document.querySelectorAll('.main').forEach( section => {
        section.style.display = 'block';
    });
  });
