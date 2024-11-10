// List of headers to cycle through
const headers = [
    "<br /><h1>! Mi Casa, Su Casa !<br>Free discord server for your remote presentations.</h1>",
    "<br /><h1>Join Our Community on Discord Today</h1>",
    "<img src='images/presenter-banners/1.png' height=85%>",
    "<img src='images/presenter-banners/2.png' height=85%>",
    "<img src='images/presenter-banners/3.png' height=85%>",
    "<img src='images/presenter-banners/5.png' height=85%>"
  ];
  
  let currentIndex = 0;
  
  function changeHeader() {
    // Select the header content div
    const headerContent = document.getElementById('headerbarContent');
  
    // Trigger slide-out animation before changing content
    headerContent.style.animation = 'none'; // Reset animation
    void headerContent.offsetWidth;          // Trigger reflow to reset animation
    headerContent.style.animation = 'slide-in 1s ease forwards';
  
    // Update content and cycle to the next index
    headerContent.innerHTML = `${headers[currentIndex]}`;
    currentIndex = (currentIndex + 1) % headers.length;
  }
  
  // Change header every 3 seconds
  setInterval(changeHeader, 3000);
  