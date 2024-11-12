// List of headers to cycle through
//    "<center><img src=\"images/AWSBUILDERSKIWI.png\"></center><text class=\"heading_subtitle\">NZs Premiere Tech Connection Hub! Link up with Presenters and Members today!</text>",

const headers = [
    "<br /><h1 class=\"hb\">! Mi Casa, Su Casa !<br>Discord server available for your remote presentations</h1>",

    `<table width=100%><tr bgcolor=white><Td>YOUR AMAZING VOLUNTEER COMMUNITY PRESENTERS</Td></tr></table>
    <div class=\"bannerrow\">
      <div class=\"presenterbannercolumn\">
        <img src=\"images/presenter-banners/younext.png\"></a>
      </div>
      <div class=\"presenterbannercolumn\">
        <a href=\"https://www.chiwaichan.co.nz\"><img src=\"images/presenter-banners/2.png\"></a>
      </div>
      <div class=\"presenterbannercolumn\">
        <a href=\"https://awsfanboy.kiwi\"><img src=\"images/presenter-banners/4.png\"></a>
      </div>
    </div>`,

    "<br /><h1 class=\"hb\">Connect with the community on Discord today</h1>",

    `<table width=100%><tr bgcolor=white><Td>YOUR AMAZING VOLUNTEER COMMUNITY PRESENTERS</Td></tr></table>
    <div class=\"bannerrow\">
      <div class=\"presenterbannercolumn\">
        <a href=\"https://chamila.dev/blog\"><img src=\"images/presenter-banners/3.png\"></a>
      </div>
      <div class=\"presenterbannercolumn\">
        <a href=\"https://linkedin.com/ramstack\"><img src=\"images/presenter-banners/5.png\"></a>
      </div>
      <div class=\"presenterbannercolumn\">
        <a href=\"https://dunlop.geek.nz\"><img src=\"images/presenter-banners/1.png\"></a> 
      </div>
    </div>`,

    "<center><img src=\"images/AWSBUILDERSKIWI.png\"></center><text class=\"heading_subtitle\">NZs Premiere Tech Connection Hub! Link up with Presenters and Members today!</text>",
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
  setInterval(changeHeader, 4000);
  