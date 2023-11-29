// Data arrays
var whispers = [];
var heartbeats = [];
var starry_skies = [];

// Fetch prompts from JSON files
function fetchPrompts() {
  // Show the loading indicator
  document.getElementById('loadingIndicator').style.display = 'block';

  // Hide menu and error message initially
  document.getElementById('categories').style.display = 'none';
  document.getElementById('errorMessage').style.display = 'none';

  Promise.all([
      fetch('./whispers.json').then(response => response.json()),
      fetch('./heartbeats.json').then(response => response.json()),
      fetch('./starry_skies.json').then(response => response.json())
  ])
  .then(data => {
      // Data is an array of results from the above promises
      whispers = data[0];
      heartbeats = data[1];
      starry_skies = data[2];

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

function createSVGCard(prompt, svgNS, cardWidth, cardHeight) {
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
          font-size: 14px;
          fill: white;
      }
  `;
  card.appendChild(style);

  var defs = document.createElementNS(svgNS, "defs");
  var clipPath = document.createElementNS(svgNS, "clipPath");
  clipPath.setAttribute("id", "clipHeart");
  var clipRect = document.createElementNS(svgNS, "rect");
  clipRect.setAttribute("width", cardWidth - borderThickness);
  clipRect.setAttribute("height", cardHeight - borderThickness);
  clipRect.setAttribute("x", borderThickness / 2);
  clipRect.setAttribute("y", borderThickness / 2);
  clipRect.setAttribute("rx", borderRadius - borderThickness / 2);
  clipPath.appendChild(clipRect);
  defs.appendChild(clipPath);
  card.appendChild(defs);

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

  // Add heart shape in the background
  // var heart = document.createElementNS(svgNS, "path");
  // heart.setAttribute("id", "heart");
  // heart.setAttribute("d", "M 12 7 C 12 7 8 3 4 7 C 0 11 4 20 12 28 C 20 20 24 11 20 7 C 16 3 12 7 12 7 Z");
  // heart.setAttribute("transform", "translate(-100, 100) rotate(-45) scale(10)");
  // heart.setAttribute("fill", heartColor);
  // heart.style.opacity = '0.6'; // Make the heart unobtrusive
  // card.appendChild(heart);

  var useClipPath = document.createElementNS(svgNS, "use");
  useClipPath.setAttribute("clip-path", "url(#clipHeart)");
  useClipPath.setAttribute("href", "#heart");
  card.appendChild(useClipPath);

  // Create text element for wrapping
  var text = document.createElementNS(svgNS, "text");
  text.setAttribute("fill", "white");
  text.style.fontSize = "28px";
  card.appendChild(text);

  // // Add SVG to the DOM temporarily for text wrapping
  // card.style.position = 'absolute';
  // card.style.visibility = 'hidden'; // Hide but allow rendering
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

  var prompts = [];
  switch (category) {
      case 'whispers':
          prompts = whispers;
          break;
      case 'heartbeats':
          prompts = heartbeats;
          break;
      case 'starry_skies':
          prompts = starry_skies;
          break;
  }

  var randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
  var cardDisplay = document.getElementById("cardDisplay");
  cardDisplay.innerHTML = ''; // Clear previous content
  var img = document.createElement('img');
  createSVGCard(randomPrompt, svgNS, cardWidth, cardHeight).then(url => {
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
