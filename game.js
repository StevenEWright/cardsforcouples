// Data arrays
var appetizers = [];
var main_courses = [];
var desserts = [];
var cocktails = [];

// Fetch prompts from JSON files
function fetchPrompts() {
  // Show the loading indicator
  document.getElementById('loadingIndicator').style.display = 'block';

  // Hide menu and error message initially
  document.getElementById('categories').style.display = 'none';
  document.getElementById('errorMessage').style.display = 'none';

  Promise.all([
      fetch('./appetizers.json').then(response => response.json()),
      fetch('./main_courses.json').then(response => response.json()),
      fetch('./desserts.json').then(response => response.json()),
      fetch('./cocktails.json').then(response => response.json())
  ])
  .then(data => {
      // Data is an array of results from the above promises
      appetizers = data[0];
      main_courses = data[1];
      desserts = data[2];
      cocktails = data[3];

      // Hide loading indicator and show menu
      showMenu();
  })
  .catch(error => {
      console.error('Error fetching prompts:', error);
      // Hide loading indicator and show error message
      document.getElementById('loadingIndicator').style.display = 'none';
      document.getElementById('errorMessage').style.display = 'block';
  });
}

// Call fetchPrompts when the window loads
window.onload = fetchPrompts;

function createSVGCard(prompt, category, svgNS, cardWidth, cardHeight) {
  var borderThickness = 5; // Proportional border thickness
  var borderRadius = 15;
  var backgroundColor = "#73628A"; // Updated background color
  var heartColor = "#EFCEFA"; // Heart color

  // Create the main SVG element
  var card = document.createElementNS(svgNS, "svg");
  card.setAttribute("width", cardWidth);
  card.setAttribute("height", cardHeight);
  card.setAttribute("viewBox", `0 0 ${cardWidth} ${cardHeight}`);
  
  var style = document.createElementNS(svgNS, "style");
  style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap');

      text {
          font-family: 'Open Sans', sans-serif;
          fill: white;
      }
  `;
  card.appendChild(style);

  // Background Rectangle with Border
  var rect = document.createElementNS(svgNS, "rect");
  rect.setAttribute("x", borderThickness / 2);
  rect.setAttribute("y", borderThickness / 2);
  rect.setAttribute("width", cardWidth - borderThickness);
  rect.setAttribute("height", cardHeight - borderThickness);
  rect.setAttribute("fill", backgroundColor);
  rect.setAttribute("stroke", "white");
  rect.setAttribute("stroke-width", borderThickness);
  rect.setAttribute("rx", borderRadius - borderThickness / 2);
  card.appendChild(rect);

  // Category Text at the top
  var categoryText = document.createElementNS(svgNS, "text");
  categoryText.setAttribute("x", "50%");
  categoryText.setAttribute("y", "20");
  categoryText.setAttribute("text-anchor", "middle");
  categoryText.style.fontSize = "18px";
  categoryText.textContent = category;
  card.appendChild(categoryText);

  // Create text element for prompt
  var text = document.createElementNS(svgNS, "text");
  text.setAttribute("x", "50%");
  text.setAttribute("y", "50%");
  text.setAttribute("text-anchor", "middle");
  text.style.fontSize = "28px";
  card.appendChild(text);

  // Website at the bottom
  var websiteText = document.createElementNS(svgNS, "text");
  websiteText.setAttribute("x", "50%");
  websiteText.setAttribute("y", cardHeight - 20);
  websiteText.setAttribute("text-anchor", "middle");
  websiteText.style.fontSize = "12px";
  websiteText.textContent = "CardsForCouples.app";
  card.appendChild(websiteText);

  // // Add SVG to the DOM temporarily for text wrapping
  document.body.appendChild(card);

  // Wrap the text
  wrapText(card, text, prompt, cardWidth - 20 - borderThickness, svgNS, cardWidth, cardHeight);

  // Give some time for the browser to render SVG
  return new Promise(resolve => {
      setTimeout(() => {
          // Convert SVG to Data URL
          var serializer = new XMLSerializer();
          var svgBlob = new Blob([serializer.serializeToString(card)], {type: 'image/svg+xml'});
          var url = URL.createObjectURL(svgBlob);

          // Clean up: remove the temporary SVG
          document.body.removeChild(card);

          resolve(url);
      }, 0); // Timeout can be adjusted if needed
  });
}


function wrapText(svgElement, textElement, text, maxWidth, svgNS, cardWidth, cardHeight) {
  var words = text.split(/\s+/);
  var lines = [];
  var line = '';
  var lineHeight = 1.2; // Line height in em
  var fontSize = 28; // Font size in px

  words.forEach(function(word) {
      var testLine = line + word + ' ';
      var tspan = document.createElementNS(svgNS, "tspan");
      tspan.textContent = testLine;
      textElement.appendChild(tspan);

      if (tspan.getComputedTextLength() > maxWidth && line !== '') {
          lines.push(line);
          line = word + ' ';
      } else {
          line = testLine;
      }

      textElement.removeChild(tspan);
  });

  if (line) {
      lines.push(line.trim());
  }

  var totalTextHeight = lines.length * lineHeight * fontSize;
  var startY = (cardHeight - totalTextHeight) / 2;

  lines.forEach(function(line, i) {
      var tspan = document.createElementNS(svgNS, "tspan");
      tspan.setAttribute("x", cardWidth / 2);
      tspan.setAttribute("y", startY + i * lineHeight * fontSize);
      tspan.setAttribute("text-anchor", "middle");
      tspan.textContent = line;
      textElement.appendChild(tspan);
  });
}

function displayRandomPrompt(category) {
  var svgNS = "http://www.w3.org/2000/svg";
  var cardWidth = 600;
  var cardHeight = 300;

  var title = "";
  var prompts = [];
  switch (category) {
      case 'appetizers':
          title = "Appetizers";
          prompts = appetizers;
          break;
      case 'main_courses':
          title = "Main Courses";
          prompts = main_courses;
          break;
      case 'desserts':
          title = "Desserts";
          prompts = desserts;
          break;
      case 'cocktails':
          title = "Cocktails";
          prompts = cocktails;
          break;
  }

  var randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
  var cardDisplay = document.getElementById("cardDisplay");
  cardDisplay.innerHTML = ''; // Clear previous content
  var img = document.createElement('img');
  createSVGCard(randomPrompt, title, svgNS, cardWidth, cardHeight).then(url => {
    img.src = url;
  });
  cardDisplay.appendChild(img);

  // Show card and hide menu
  document.getElementById('loadingIndicator').style.display = 'none';
  document.getElementById("categories").style.display = 'none';
  document.getElementById("cardDisplay").style.display = 'block';
}

function showMenu() {
  // Hide card and show menu
  document.getElementById('loadingIndicator').style.display = 'none';
  document.getElementById("categories").style.display = 'flex';
  document.getElementById("cardDisplay").style.display = 'none';
}
