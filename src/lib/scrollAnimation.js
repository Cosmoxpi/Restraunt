export function setupScrollAnimations() {
  // Utility for handling scroll animations
  const isInViewport = (element) => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
      rect.bottom >= 0
    );
  };

  const handleScrollAnimation = () => {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach((element) => {
      if (isInViewport(element) && !element.classList.contains('animated')) {
        element.classList.add('fade-in-up', 'animated');
      }
    });
  };

  window.addEventListener('scroll', handleScrollAnimation);
  setTimeout(handleScrollAnimation, 100);

  return () => {
    window.removeEventListener('scroll', handleScrollAnimation);
  };
}

export const scrollToElement = (elementId) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
};