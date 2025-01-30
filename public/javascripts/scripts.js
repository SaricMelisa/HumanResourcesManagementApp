function toggleMenu() {
    const menu = document.getElementById("dropdownMenu");
    menu.classList.toggle("show");
  }
  
  
  window.onclick = function(event) {
    const menu = document.getElementById("dropdownMenu");
    if (!event.target.matches('.hamburger')) {
      if (menu.classList.contains('show')) {
        menu.classList.remove('show');
      }
    }
  };
