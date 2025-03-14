import { PlateForm, plateInit } from './plate'; 
import { e1RMInit } from './e1rm';

function loadContent(page: string) {
  const contentDiv = document.getElementById('content'); 
  if (contentDiv) {
    fetch(`${page}.html`)
      .then(response => response.text())
      .then(data => {
        contentDiv.innerHTML = data; 
        if (page === 'plate') {
          let form: PlateForm = { target: 0, bar: 0, collars: 0, reds: 0, blues: 0, yellows: 0, greens: 0, fives: 0, twohalves: 0, frac: 0, fracHalves: 0, fracQuarters: 0 };
          plateInit(form);
        } else if (page === 'e1rm') {
          e1RMInit();
        }
        
      })
      .catch(error => console.error(error));
  }
}

function handlePageChange() {
  const hash = window.location.hash.substring(1); 
  const page = hash || 'home';
  loadContent(page);
}

window.addEventListener('hashchange', handlePageChange);
window.addEventListener('load', handlePageChange);