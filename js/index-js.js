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
            const table = document.querySelector('table.data');
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

function calculatingAverage() {
    let  x, average, n;
    const table = document.querySelector("table.data");
    const averageRow  =  document.querySelector("table.calculations #average-row");
    averageRow.innerHTML =  "";
    let td =  document.createElement('td');
    td.innerHTML  = "<b>Average:<b>";
    averageRow.appendChild(td);
    const rows  =  table.rows;

    for (let c = 1;  c  < 6;  c++)  {
        n  =  0;
        average  = 0;
        for (let i = 1; i < (rows.length - 1); i++) {

            x = rows[i].querySelectorAll("td")[c];
            average += Number(x.innerHTML);
            n++;
        }
        average = (average/n).toFixed(3);
        td =  document.createElement('td');
        td.innerHTML  =  average;
        averageRow.appendChild(td);
    }
}

function calculatingMin() {
    let  x, min;
    const table = document.querySelector("table.data");
    const minRow  =  document.querySelector("table.calculations #min-row");
    minRow.innerHTML =  "";
    let td =  document.createElement('td');
    td.innerHTML  = "<b>Min:<b>";
    minRow.appendChild(td);
    const rows  =  table.rows;

    for (let c = 1;  c  < 6;  c++)  {
        //start min as first row entry
        min  = Number(rows[c].querySelectorAll("td")[c].innerHTML);
        for (let i = 1; i < (rows.length - 1); i++) {

            x = rows[i].querySelectorAll("td")[c];
            if (Number(x.innerHTML) < min) {
                min = Number(x.innerHTML);
            }
        }
        td = document.createElement('td');
        td.innerHTML  =  min;
        minRow.appendChild(td);
    }
}

function calculatingMax() {
    let  x, max;
    const table = document.querySelector("table.data");
    const maxRow  =  document.querySelector("table.calculations #max-row");
    maxRow.innerHTML =  "";
    let td =  document.createElement('td');
    td.innerHTML  = "<b>Max:<b>";
    maxRow.appendChild(td);
    const rows  =  table.rows;

    for (let c = 1;  c  < 6;  c++)  {
        max = Number(rows[c].querySelectorAll("td")[c].innerHTML);
        for (let i = 1; i < (rows.length - 1); i++) {

            x = rows[i].querySelectorAll("td")[c];
            if (Number(x.innerHTML) > max) {
                max = Number(x.innerHTML);
            }
        }
        td =  document.createElement('td');
        td.innerHTML  =  max;
        maxRow.appendChild(td);
    }
}

function listAvg(list) {
	var allVals = 0.0;
	list.forEach((i) => allVals += parseFloat(i));
	return allVals / list.length;
}

/* populate secondary view */
function populateCharts() {
	console.log(companyStock);
	console.log(companies);
	const opens = companyStock.map((s) => s.open);
	const closes = companyStock.map((s) => s.close);
	const lows = companyStock.map((s) => s.low);
	const highs = companyStock.map((s) => s.high);
	const opensAvg = listAvg(opens);
	const closesAvg = listAvg(closes);
	const lowsAvg = listAvg(lows);
	const highsAvg = listAvg(highs);
	const openMin = Math.min(...opens);
	const openMax = Math.max(...opens);
	const closeMin = Math.min(...closes);
	const closeMax = Math.max(...closes);
	const lowMin = Math.min(...opens);
	const lowMax = Math.max(...opens);
	const highMin = Math.min(...highs);
	const highMax = Math.max(...highs);
	const smallestOverall = Math.min([openMin, closeMin, lowMin, highMin]);
	const largestOverall = Math.max([openMax, closeMax, lowMax, highMax]);
	var data = [
		[opensAvg, opensAvg, openMin, openMax],
		[closesAvg, closesAvg, closeMin, closeMax],
		[lowsAvg, lowsAvg, lowMin, lowMax],
		[highsAvg, highsAvg, highMin, highMax]
	];
	console.log(data);
	var option = {
	    xAxis: {
		data: ['open', 'close', 'low', 'high']
	    },
	    yAxis: {
	    },
	    series: [{
		type: 'k',
		data: data
	    }]
	};
	const cEle = document.getElementById('candlechart');
	console.log(cEle);
	var candleChart = echarts.init(cEle);
	candleChart.setOption(option);

	// line chart
	// https://echarts.apache.org/examples/en/editor.html?c=bar-label-rotation
	const lineChart = document.getElementById('barchart');
	var app = {};
var posList = [
    'left', 'right', 'top', 'bottom',
    'inside',
    'insideTop', 'insideLeft', 'insideRight', 'insideBottom',
    'insideTopLeft', 'insideTopRight', 'insideBottomLeft', 'insideBottomRight'
];
	
app.configParameters = {
    rotate: {
        min: -90,
        max: 90
    },
    align: {
        options: {
            left: 'left',
            center: 'center',
            right: 'right'
        }
    },
    verticalAlign: {
        options: {
            top: 'top',
            middle: 'middle',
            bottom: 'bottom'
        }
    },
    position: {
        options: posList.reduce(function (map, pos) {
            map[pos] = pos;
            return map;
        }, {})
    },
    distance: {
        min: 0,
        max: 100
    }
};
	app.config = {
    rotate: 90,
    align: 'left',
    verticalAlign: 'middle',
    position: 'insideBottom',
    distance: 15,
    onChange: function () {
        var labelOption = {
            normal: {
                rotate: app.config.rotate,
                align: app.config.align,
                verticalAlign: app.config.verticalAlign,
                position: app.config.position,
                distance: app.config.distance
            }
        };
        myChart.setOption({
            series: [{
                label: labelOption
            }, {
                label: labelOption
            }, {
                label: labelOption
            }, {
                label: labelOption
            }]
        });
    }
};


var labelOption = {
    show: true,
    position: app.config.position,
    distance: app.config.distance,
    align: app.config.align,
    verticalAlign: app.config.verticalAlign,
    rotate: app.config.rotate,
    formatter: '{c}  {name|{a}}',
    fontSize: 16,
    rich: {
        name: {
        }
    }
};	
	// TODO: VERY BAD PRACTICE!!!! DEPENDS ON GLOBAL VARIABLED BEING SET A CERTAIN WAY!
	const companySymbol = companyStock[0].symbol;
	const company = companies.filter((c) => c.symbol === companySymbol)[0];
	console.log(company);
	try {
		let f = company.financials;
		let seriesTemplateObject = {
			name: '', // SET NAME
			type: 'bar',
			label: labelOption,
			barGap: 0,
			emphasis: { focus: 'series' },
			data: [] // SET DATA
		};
		var years = f.years;
		var series = [];

		// a deep copy of the template is made, then slight modifications are added before pushing to series list.
		let revSeries = JSON.parse(JSON.stringify(seriesTemplateObject));
		revSeries.name = 'Revenue';
		revSeries.data = f.revenue;
		let earnSeries = JSON.parse(JSON.stringify(seriesTemplateObject));
		earnSeries.name = 'Earnings';
		earnSeries.data = f.earnings;
		let assetsSeries = JSON.parse(JSON.stringify(seriesTemplateObject));
		assetsSeries.name = 'Assets';
		assetsSeries.data = f.assets;
		let liabSeries = JSON.parse(JSON.stringify(seriesTemplateObject));
		liabSeries.name = 'Liabilities';
		liabSeries.data = f.liabilities;
		
		series.push(revSeries);
		series.push(earnSeries);
		series.push(assetsSeries);
		series.push(liabSeries);

	} catch {
		lineChart.textContent = 'This company has no financials data.';
	}
	const barChart = echarts.init(document.getElementById('barchart'));
	const barOption = {
		legend: {
			data: ['Revenue', 'Earnings', 'Assets', 'Liabilities']
		},
		toolbox: {
			show: true,
			orient: 'vertical',
			left: 'right',
			top: 'center',
		},
	    xAxis: [
		{
		    type: 'category',
		    axisTick: {show: false},
		    data: years
		}
	    ],
	    yAxis: [
		{
		    type: 'value'
		}
	    ],
	    series: series
	};
		
	barChart.setOption(barOption);

	// line chart
	// https://echarts.apache.org/examples/en/editor.html?c=multiple-y-axis
	const lineChartEle = document.getElementById('linechart');

	const volumeData = companyStock.map((s) => s.volume);
	const closeData = companyStock.map((s) => s.close);
	const lowestVolume = Math.min(...volumeData);
	const lowestClose = Math.min(...closeData);
	const highestVolume = Math.max(...volumeData);
	const highestClose = Math.max(...closeData);

var colors = ['#5470C6', '#91CC75'];

const lineOption = {
    color: colors,

    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'cross'
        }
    },
    grid: {
        right: '20%'
    },
    legend: {
        data: ['Close Value', 'Volume']
    },
    xAxis: [
        {
            type: 'category',
            axisTick: {
                alignWithLabel: true
            },
            //data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
        }
    ],
    yAxis: [
        {
            type: 'value',
            name: 'Close Value',
            min: (lowestClose * 0.8),
            max: (highestClose * 1.2),
            position: 'left',
            axisLine: {
                show: true,
                lineStyle: {
                    color: colors[0]
                }
            },
            axisLabel: {
                formatter: '${value}/share'
            }
        },
        {
            type: 'value',
            name: 'Volume',
            min: (lowestVolume * 0.8),
            max: (highestVolume * 1.2),
            position: 'right',
            axisLine: {
                show: true,
                lineStyle: {
                    color: colors[1]
                }
            },
            axisLabel: {
                formatter: '${value}'
            }
        }
    ],
    series: [
        {
            name: 'Close Value',
            type: 'line',
            data: closeData
        },
        {
            name: 'Volume',
            type: 'line',
            yAxisIndex: 1,
            data: volumeData
        },
    ]
};
	const lineChartMultiY = echarts.init(lineChartEle);
	lineChartMultiY.setOption(lineOption);
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
