const companyListURL = 'https://www.randyconnolly.com/funwebdev/3rd/api/stocks/companies.php';
//remember for stockData, add the symbol # at the end of the url (symbol=) using a queryString.
const stockDataURL = 'https://www.randyconnolly.com/funwebdev/3rd/api/stocks/history.php?symbol=';

function initMap() {
    
}


const companies = [];
const filterBox = document.querySelector('#filter');
const companyList = document.querySelector('#companylist')

fetch(companyListURL)
    .then( response => {
        if(response.ok)
            return response.json() 
        else
            throw new Error("Response from json failed! check fetch.")
    })
    .then( data => {
        companies.push(...data);
        companies.forEach( company => {
            let li = document.createElement('li');
            li.textContent = company.name;
            companyList.appendChild(li);
        });
        companyList.style.display = "inline-block";
        document.querySelector('.lds-roller').style.display = "none";
    })
    .catch( error => console.log(`found a ${error}`) );

filterBox.addEventListener('keyup', findMatches);

//adds a handler to reset the list when clicked
document.querySelector(".reset")
        .addEventListener('click', () => {
            companyList.innerHTML = '';
            companies.forEach( company => {
                let li = document.createElement('li');
                li.textContent = company.name;
                companyList.appendChild(li);
           });
        })


//Function that find the matches within the input box, and populates a list accordingly
function findMatches() {
    const matches = compareCompanies(this.value, companies);

    companyList.innerHTML = '';

    matches.forEach( company => {
        let li = document.createElement('li');
        li.textContent = company.name;
        companyList.appendChild(li);
    });
}

//Function that returns a filtered array, looking through the company array for matching pairs 
//starting from the beginning of the name.
function compareCompanies(wordToFind, companies) {
    return companies.filter( comp => {
        const regex = new RegExp(`^${wordToFind}`, 'gi');
        return comp.name.match(regex);
    });
}