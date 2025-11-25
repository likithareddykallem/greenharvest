// main.js - light behavior for forms (static frontend)
document.addEventListener('DOMContentLoaded', function(){
    // prevent real submission for demo pages
    const forms = document.querySelectorAll('form');
    forms.forEach(f => {
      f.addEventListener('submit', function(e){
        e.preventDefault();
        // show a friendly alert
        alert('This is a static demo. Backend will be integrated later.');
      });
    });
  });
