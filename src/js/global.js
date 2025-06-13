export function debounce(fn, delay) {
  let timerId;
  return function(...args) {
    if (timerId) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      fn(...args);
      timerId = null;
    }, delay);
  };
}

let scrollPosition = 0;

export function disableScrolling() {
  scrollPosition = window.pageYOffset;
  document.body.style.overflow = 'hidden';
  /* document.body.style.position = 'fixed'; */
  document.body.style.top = `-${scrollPosition}px`;
  document.body.style.width = '100%';
  //document.documentElement.style.scrollBehavior = 'auto';
  
}
  
export function enableScrolling() {
  document.body.style.removeProperty('overflow');
  /* document.body.style.removeProperty('position'); */
  document.body.style.removeProperty('top');
  document.body.style.removeProperty('width');
  window.scrollTo(0, scrollPosition);
  //document.documentElement.style.scrollBehavior = 'smooth';
}

let lenis;

export function setSmoothScroll() {
  if(window.safari !== undefined) return;

  if (lenis) {
    lenis.destroy();
  }

  let attribute = document.querySelector('html').getAttribute('data-smooth-scroll');
  let speed = 0;
  
  switch (attribute) {
    case 'Subtle':
      speed = 0.4;    
      break;

    case 'Moderate':
      speed = 0.7;    
      break;

    case 'Intense':
      speed = 1.2;    
      break;

    default:
      speed = 0.7;
      break;
  }

  lenis = new Lenis({
    duration: speed,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false
  })

  function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
  }

  requestAnimationFrame(raf);

  if(attribute == 'None' && lenis){
    lenis.destroy();
  }
}

export function setCustomScrollbar(){
  if(window.safari !== undefined) return;

  let attribute = document.querySelector('html').getAttribute('data-use-custom-scrollbar');

  attribute == 'true' ? document.body.classList.add('custom-scrollbar') : document.body.classList.remove('custom-scrollbar');
}

export function pageLoadLetterAnimation() {
  let heading = document.querySelector('.letter-animation');
  if(!heading) return;
  let text = heading.textContent;
  let delay = 0;

  heading.textContent = '';

  const letters = text.split('');

  heading.style.opacity = 1;

  letters.forEach((letter, index) => {
    const span = document.createElement('span');
    span.textContent = letter;
    span.style.animationDelay = `${index * 0.1}s`;
    heading.appendChild(span);

    if(letter == " "){
      span.innerHTML = "&nbsp;"
    }

    span.animate(
      {
        opacity: [0, 1],
        transform: ["translateY(100%)", "translateY(0%)"]
      },
      {
          duration: 1000,
          delay: delay,
          easing: "cubic-bezier(0.215, 0.610, 0.355, 1.000)",
          fill: "forwards"
      }
    )

    delay += 30;
  });

  //number animation
  let numbers = document.querySelector('.hero-number-animation');

  if(numbers){
    numbers.animate(
      {
        opacity: [0, 1],
        transform: ["translateY(100%)", "translateY(0%)"]
      },
      {
          duration: 1000,
          delay: delay,
          easing: "cubic-bezier(0.215, 0.610, 0.355, 1.000)",
          fill: "forwards"
      }
    )
  }
}

export function pageLoadAnimations() {
  let delay = 200;
  document.querySelectorAll('.horizontal-line-animation').forEach(item => {
    item.animate(
      {
          width: ['0%', '100%']
      },
      {
          duration: 1200,
          delay: 200,
          easing: "cubic-bezier(0.215, 0.610, 0.355, 1.000)",
          fill: "forwards"
      }
    );
  })

  document.querySelectorAll('.vertical-animation').forEach(item => {
    delay = item.getAttribute('data-delay')
    let translate = "30px"
    
    if(item.classList.contains('navbar-inner')){
        translate = "-5px"
    }
    
    item.animate(
      {
          opacity: [0, 1],
          transform: [`translateY(${translate})`, "translateY(0)"]
      },
      {
          duration: 1000,
          delay: delay,
          easing: "cubic-bezier(0.215, 0.610, 0.355, 1.000)",
          fill: "forwards"
      }
    );
  })

  document.querySelectorAll('.hidden-animation').forEach(item => {
    item.animate(
      {
          opacity: [0, 1],
      },
      {
          duration: 800,
          delay: 200,
          easing: "linear",
          fill: "forwards"
      }
    );
  })

  //Adding a class here instead of animation because there was a problem with Lightense & this animation
  let postContent = document.querySelector('.post-content');
  if(postContent){
      postContent.classList.add('visible-content')
  }   
}

export function setToggle() {
  const toggleHeadingElements = document.getElementsByClassName("toggle-heading");
  
  const toggleFn = function(event) {
      const targetElement = event.target;
      const parentElement = targetElement.closest('.toggle-card');
      var toggleState = parentElement.getAttribute("data-toggle-state");
      if (toggleState === 'close') {
          parentElement.setAttribute('data-toggle-state', 'open');
      } else {
          parentElement.setAttribute('data-toggle-state', 'close');
      }
  };

  for (let i = 0; i < toggleHeadingElements.length; i++) {
      toggleHeadingElements[i].addEventListener('click', toggleFn, false);
  }
}

export function setLightense(){
  window.addEventListener('DOMContentLoaded', function () {
      const imagesInAnchors = document.querySelectorAll('.post-content a img');
  
      imagesInAnchors.forEach((img) => {
          img.classList.add('no-lightense');  
      });
  
      Lightense('.post-content img:not(.no-lightense)', {
          background: 'var(--background-color)'
      });
  }, false);
}

export function copyUrlToClipboard(parentElement){
  let parent = document.querySelector(`.${parentElement}`)
  let alert = parent.querySelector('.clipboard-alert');

  parent.querySelector('.clipboard-link').addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href);
      alert.style.display = "block";

      setTimeout(function () {
          alert.style.display = "none";
      }, 3000);
  })
}

export async function setImageGallery() {
  const images = document.querySelectorAll('.gallery-image img');

  const waitForImageLoad = (img) =>
    new Promise((resolve) => {
      if (img.complete && img.naturalWidth > 0) {
        resolve();
      } else {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      }
    });

  await Promise.all(Array.from(images).map((img) => waitForImageLoad(img)));

  images.forEach((image) => {
    const container = image.closest('.gallery-image');
    if (container) {
      const width = image.naturalWidth;
      const height = image.naturalHeight;
      const ratio = width / height;
      container.style.flex = `${ratio} 1 0%`;
    }
  });
}

export function formatDate(date){
  return new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

