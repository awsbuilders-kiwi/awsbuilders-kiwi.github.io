document.addEventListener('DOMContentLoaded', function() {
    const accordion = document.querySelector('.accordion-header');
    const content = document.querySelector('.accordion-content');
    
    accordion.addEventListener('click', function() {
        this.classList.toggle('active');
        
        if (content.style.maxHeight) {
            content.style.maxHeight = null;
        } else {
            content.style.maxHeight = content.scrollHeight + "px";
        }
    });
});
