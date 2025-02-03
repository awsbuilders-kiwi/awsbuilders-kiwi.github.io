document.addEventListener('DOMContentLoaded', () => {
    const resourcesAccordion = document.querySelector('.resources-accordion');
    const accordionHeader = resourcesAccordion.querySelector('.accordion-header');
    const accordionContent = resourcesAccordion.querySelector('.accordion-content');
    const accordionIcon = resourcesAccordion.querySelector('.accordion-icon');
    const resourceslhsbody = document.querySelector('.lhs-body');
    
    // Store the original scroll position
    let originalScrollPosition = 0;

    accordionHeader.addEventListener('click', () => {
        // Toggle the expanded state
        const isExpanded = resourcesAccordion.classList.toggle('expanded');
        accordionContent.classList.toggle('expanded');
        
        // Update the icon
        accordionIcon.textContent = isExpanded ? '−' : '+';
        
        // Toggle lhs-body visibility based on expanded state
        resourceslhsbody.style.display = isExpanded ? 'none' : 'block';
        
        if (isExpanded) {
            // Store the current scroll position before scrolling to top
            originalScrollPosition = window.scrollY;
            resourcesAccordion.scrollIntoView({ behavior: 'smooth' });
        } else {
            // Restore the original scroll position when closing
            window.scrollTo({
                top: originalScrollPosition,
                behavior: 'smooth'
            });
        }
    });
});
