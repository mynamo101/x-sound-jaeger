import {debounce, enableScrolling, disableScrolling} from "@js/global.js"

document.addEventListener('DOMContentLoaded', function () {
    if (!customElements.get('custom-slider')) {
        customElements.define(
        'custom-slider',
        class CustomSlider extends HTMLElement {
            constructor() {
            super();
    
            this.slider = this;
            this.flkty = null;
            this.lastSlide;
    
            this.prevButton = this.querySelector('.slider-arrow[name="left"]');
            this.nextButton = this.querySelector('.slider-arrow[name="right"]');
            this.scrollbarThumb = this.querySelector('.slider-scrollbar-thumb');
    
            this.init();
    
            if (this.prevButton) {
                this.prevButton.addEventListener('click', () => {
                this.flkty.previous();
                });
            }
    
            if (this.nextButton) {
                this.nextButton.addEventListener('click', () => {
                this.flkty.next();
                });
            }
            }
    
            init() {
            this.flkty = new Flickity(this.slider.querySelector('.slider-inner'), {
                cellAlign: 'left',
                contain: true,
                wrapAround: false,
                prevNextButtons: false,
                pageDots: false,
                draggable: true,
                selectedAttraction: window.matchMedia('(max-width: 991px)').matches ? 0.12 : 0.05, //speed
                friction: 0.8, //bounciness
                dragThreshold: 10,
                on: {
                    scroll: () => {
                        this.updateScrollbar();
                        this.disableArrows();
                    },
                    dragMove: () => {
                        this.moveCursor();
                    }
                },
            });
    
            this.getLastSlide();
            this.disableArrows();
            this.updateScrollbar();
    
            window.addEventListener(
                'resize',
                debounce(() => {
                    this.flkty.resize();
                    this.getLastSlide();
                    this.updateScrollbar();
                }, 100)
            );
            }

            moveCursor() {
                let customCursor = document.querySelector('.custom-cursor');

                if(document.querySelector('html').getAttribute('data-cursor') != "Normal"){
                    const cursorX = event.pageX;
                    const cursorY = event.pageY - scrollY;
                
                    customCursor.style.left = `${cursorX}px`;
                    customCursor.style.top = `${cursorY}px`;
                } 
            }
    
            disableArrows() {
                if (!this.flkty) return;

                if (this.flkty.selectedIndex <= 0) {
                    this.prevButton.disabled = true;
                    this.nextButton.disabled = false;
                } else if (this.flkty.selectedIndex >= this.lastSlide) {
                    this.nextButton.disabled = true;
                    this.prevButton.disabled = false;
                } else {
                    this.nextButton.disabled = false;
                    this.prevButton.disabled = false;
                }
            }
    
            getLastSlide() {
                const innerSlider = this.slider.querySelector('.flickity-slider');
                const containerSize = innerSlider.offsetWidth;
                const slides = this.slider.querySelectorAll('.slider-inner .flickity-slider > *');
                let totalWidth = 0;
        
                slides.forEach((slide, index) => {
                    totalWidth += slides[slides.length - index - 1].offsetWidth;
                    if (totalWidth <= containerSize) {
                        this.lastSlide = slides.length - index - 1;
                    }
                });
            }

            updateScrollbar() {
                if (!this.flkty) return;
            
                const scrollbar = this.querySelector('.slider-scrollbar');
                const thumbWidth = this.scrollbarThumb.offsetWidth;
                const maxX = scrollbar.offsetWidth - thumbWidth;
                
                // Calculate progress and clamp the result to the max value
                const progress = this.flkty.selectedIndex / this.lastSlide;
                const transformX = progress * maxX;
                
                // Ensure the thumb does not go beyond the container (maxX)
                this.scrollbarThumb.style.transform = `translateX(${Math.min(transformX, maxX)}px)`;
            
                // Update thumb width based on visible ratio
                const visibleRatio = this.flkty.size.innerWidth / this.flkty.slideableWidth;
                const thumbWidthNew = scrollbar.offsetWidth * visibleRatio;
                this.scrollbarThumb.style.width = `${thumbWidthNew}px`;
            }
        }
        );
    }

    if (!customElements.get('custom-header')) {
        customElements.define('custom-header', class CustomHeader extends HTMLElement {
            constructor() {
                super(); 
                
                this.setNavigation(this);
                this.menuTypeHandler();
            }

            setNavigation(){
                const menuBtn = this.querySelector('.menu-button');
                const menu = this.querySelector('.navbar-links-outer');
                const navbar = this;
                menu.style.transition = 'opacity 0.3s var(--ease-transition)';
            
                menuBtn.addEventListener('click', e => menuHandler(e));
                window.addEventListener('resize', debounce(() => {menuOnResize()}, 100)); //leave at 100, if smaller there is a bug with scrolling to the top

                this.querySelectorAll('.links-dropdown').forEach(dropdown => {
                    let label = dropdown.querySelector('.links-label');
                    label.addEventListener('click', e => this.openCloseLinksOnMobile(dropdown));
                    window.addEventListener('resize', debounce(() => {this.secondaryLinksOnResize(dropdown)}, 10));
                })
            
                function menuHandler(e){ 
                    if(menu.getAttribute('isopen') == 'true'){
                        closeMenu();
                    }else{
                        openMenu();
                    }
                }
            
                function closeMenu(){
                    enableScrolling();
            
                    if(window.matchMedia('(max-width: 991px)').matches){
                        setTimeout(() => {
                            menu.style.display = 'none';
                            menu.setAttribute("isopen", false);
                        }, 300);
                        menu.style.opacity = '0';
                    }
                
                    menuBtn.querySelector('.first-line').style.position = 'static';
                    menuBtn.querySelector('.first-line').style.transform = 'rotateZ(0deg)';
                    menuBtn.querySelector('.second-line').style.position = 'static';
                    menuBtn.querySelector('.second-line').style.transform = 'rotateZ(0deg)';
                    menuBtn.querySelector('.mobile-line').style.opacity = '1';
                }
                
                function openMenu(){
                    disableScrolling();
                    menu.setAttribute("isopen", true);
                
                    menu.style.display = 'flex';
                        setTimeout(() => {
                            menu.style.opacity = '1';
                    }, 10);
                
                    
                    menu.style.height = `calc(100dvh - ${navbar.offsetHeight}px)`;
                    menuBtn.querySelector('.first-line').style.position = 'absolute';
                    menuBtn.querySelector('.first-line').style.transform = 'rotateZ(-45deg)';
                    menuBtn.querySelector('.second-line').style.position = 'absolute';
                    menuBtn.querySelector('.second-line').style.transform = 'rotateZ(45deg)';
                    menuBtn.querySelector('.mobile-line').style.opacity = '0';
                }
                
                function menuOnResize(){
                    if(window.matchMedia('(max-width: 991px)').matches){
                        menu.classList.remove('desktop-navbar')
                        if(menu.getAttribute('isopen') == 'true'){
                            //disableScrolling();
                        }
                    }else{
                        menu.classList.add('desktop-navbar');
                        enableScrolling();
                    }
                }
            }          

            openCloseLinksOnMobile(link){
                if(window.matchMedia('(max-width: 991px)').matches){
                    let container = link.querySelector('.secondary-links');
                    if(container.offsetHeight == 0){
                        container.style.height = 'auto';
                        link.querySelector('.dropdown-arrow-svg').style.transform = "rotateZ(180deg) translateX(-100%)";
                    }else{
                        container.style.height = '0px'
                        link.querySelector('.dropdown-arrow-svg').style.transform = "rotateZ(360deg) translateX(100%)";
                    }
                }
            }
            
            secondaryLinksOnResize(link){
                let container = link.querySelector('.secondary-links');
                if(window.matchMedia('(max-width: 991px)').matches){
                    container.style.height = '0px'
                    link.querySelector('.dropdown-arrow-svg').style.transform = "rotateZ(0deg) translateX(100%)";
                }else{
                    container.style.height = 'auto';
                    link.querySelector('.dropdown-arrow-svg').style.transform = "rotateZ(0deg) translateX(0%)";
                }
            }


            menuTypeHandler(){
                let prevScrollPos = window.pageYOffset;
                const header = document.querySelector('.header');
                const menu = document.querySelector('.navbar-links-outer');
                header.classList.remove('sticky-header');
                header.style.transform = 'translateY(0)';
                
                const animatedMenu = () => {            
                    if(menu.getAttribute('isopen') != 'true' && header.getAttribute('data-navigation-bar-type') == 'Animated'){
                        const currentScrollPos = window.pageYOffset;
                        let isAtTop = true;
                        
                        if ((prevScrollPos > currentScrollPos) && (currentScrollPos > header.offsetHeight)) {
                            // Scrolling up
                            header.style.transform = 'translateY(0)';
                            header.classList.add('sticky-header');
                            isAtTop = false;
                        } else if(!isAtTop || currentScrollPos > header.offsetHeight) {
                            // Scrolling down            
                            header.style.transform = 'translateY(-100%)';
                        }
            
                        if(currentScrollPos == 0){
                            header.classList.remove('sticky-header');
                            isAtTop = true;
                        }
            
                        prevScrollPos = currentScrollPos;
                    }
                }

                if(header.getAttribute('data-navigation-bar-type') == 'Animated'){
                    window.addEventListener('scroll', animatedMenu);
                }

                if(header.getAttribute('data-navigation-bar-type') == 'Sticky'){
                    header.classList.add('sticky-header');                
                }
            }      
        })
    }

    if (!customElements.get('custom-pagination')) {
        customElements.define('custom-pagination', class CustomPagination extends HTMLElement {
            constructor() {
                super(); 
                
                this.loadMoreBtn = this.querySelector(".pagination-button");               
                
                if(this.loadMoreBtn){
                    this.loadMoreBtn.addEventListener("click", () => {
                        this.loadMorePosts();
                    });
                }
            }
    
            loadMorePosts(cleanList = false) {
                let currentPage = parseInt(this.getAttribute("data-current-page"));
                let nextPage = cleanList ? "" : currentPage + 1;
                let lastPage = parseInt(this.getAttribute("data-last-page"))
                let subUrl = this.getAttribute("data-url")
                let startUrl = window.location;        

                if(this.getAttribute('data-is-archivepage') == "true"){
                    let tagName = document.querySelector('archive-tags').getAttribute('data-current-tag');
                    if(tagName != "all-tags"){
                        subUrl = `/tags/${tagName}/`
                    }              
                }           
                
                let url = startUrl.origin + `${subUrl}${nextPage}`;
    
                // Make the AJAX request
                fetch(url)
                    .then(response => response.text())
                    .then(data => {
                        let parser = new DOMParser();
                        let html = parser.parseFromString(data, "text/html");
                        let grid = document.querySelector(".pagination-grid");
                        let newPosts = html.querySelector(".pagination-grid").innerHTML;
                        
                        // Append the new posts to the existing ones
                        cleanList ? grid.innerHTML = newPosts : grid.insertAdjacentHTML("beforeend", newPosts);  
                        
                        this.setAttribute("data-current-page", nextPage);
                        
                        if(cleanList){
                            document.querySelector(".hero-number").innerHTML = html.querySelector("custom-pagination").getAttribute('data-total-posts');

                            this.setAttribute("data-current-page", 1);
                            nextPage = 1;
                            lastPage = html.querySelector("custom-pagination").getAttribute('data-last-page');
                            this.setAttribute("data-last-page", lastPage);                    
                        }
                        nextPage >= lastPage ? this.loadMoreBtn.style.display = "none" : this.loadMoreBtn.style.display = "flex";
                        
                        document.querySelector('custom-cursor').setCursor();
                    })
                    .catch(error => {
                        console.error("Error loading more posts:", error);
                    });
            }
        })
    }

    if (!customElements.get('archive-tags')) {
        customElements.define('archive-tags', class ArchiveTags extends HTMLElement {
            constructor() {
                super(); 

                this.querySelectorAll('.archive-tag-button').forEach(button => {
                    button.addEventListener('change', this.archiveButtonChange.bind(this))
                })
            }

            archiveButtonChange(e){  
                this.setAttribute('data-current-tag', e.target.id);
                
                document.querySelector('custom-pagination').loadMorePosts(true);
            }
        })
    }    if (!customElements.get('custom-membership')) {
        customElements.define('custom-membership', class CustomMembership extends HTMLElement {
            constructor() {
                super(); 
                // No longer need tab switching functionality
            }
        })
    }

    if (!customElements.get('custom-cursor')) {
        customElements.define('custom-cursor', class CustomCursor extends HTMLElement {
            constructor() {
                super(); 
    
                this.cursorInited = false;
                this.initialWidth, this.initialHeight;
                this.customCursor = document.querySelector('.custom-cursor');

                if(document.querySelector('html').getAttribute('data-cursor') != "Normal"){
                    this.setCursor(this);
                }          
            }

            updateCursorPosition(event) {
                const cursorX = event.pageX;
                const cursorY = event.pageY - scrollY;
            
                this.customCursor.style.left = `${cursorX}px`;
                this.customCursor.style.top = `${cursorY}px`;
            }
          
            scalecustomCursor() {
              this.customCursor.style.width = `${this.initialWidth * 2}px`;
              this.customCursor.style.height = `${this.initialHeight * 2}px`;
            }
          
            resetcustomCursor() {
              this.customCursor.style.width = `${this.initialWidth}px`;
              this.customCursor.style.height = `${this.initialHeight}px`;
            }

            hideCursor = () => {
                this.customCursor.classList.add('hidden'); 
            }
            
            showCursor = () => {
                if(document.querySelector('html').getAttribute('data-cursor') != "Normal"){
                  this.customCursor.classList.remove('hidden');
                } 
            }

            setCursor(){
                let attribute = document.querySelector('html').getAttribute('data-cursor');             
                let sliders = document.querySelectorAll('.slider-inner');
                let labels = document.querySelectorAll('label')
              
                const iframes = document.querySelectorAll('iframe');
                                    
                iframes.forEach((iframe) => {
                  iframe.removeEventListener('mouseenter', this.hideCursor.bind(this));  
                  iframe.removeEventListener('mouseleave', this.showCursor.bind(this));
                  iframe.addEventListener('mouseenter', this.hideCursor.bind(this));  
                  iframe.addEventListener('mouseleave', this.showCursor.bind(this));
                });
              
              
                switch (attribute) {
                  case 'Normal':
                    this.customCursor.classList.add('hidden');  
                    document.body.style.cursor = ""; 
                    break;
              
                  case 'Custom':
                    this.customCursor.classList.remove('hidden');
                    document.body.style.cursor = "none";   
                    break;
              
                  case 'Custom and Normal':
                    this.customCursor.classList.remove('hidden'); 
                    document.body.style.cursor = "";   
                    break;
              
                  default:
                    this.customCursor.classList.add('hidden');
                    document.body.style.cursor = ""; 
                    break;
                }

                if(!this.cursorInited){
                  this.initialWidth = this.customCursor.offsetWidth;
                  this.initialHeight = this.customCursor.offsetHeight;
                }
              
                const elementsToScale = document.querySelectorAll('a, input, button, textarea, .links-label, .toggle-heading, .post-content img, select');
                elementsToScale.forEach((element) => {
                  attribute == 'Custom' ? element.style.cursor = 'none' : element.style.cursor = '';
              
                  element.removeEventListener('mouseenter', this.scalecustomCursor.bind(this));
                  element.removeEventListener('mouseleave', this.resetcustomCursor.bind(this));
                  element.addEventListener('mouseenter', this.scalecustomCursor.bind(this));
                  element.addEventListener('mouseleave', this.resetcustomCursor.bind(this));
                });
              
                sliders.forEach((slider) => {
                  attribute == 'Custom' ? slider.style.cursor = 'none' : slider.style.cursor = '';
                })
              
                labels.forEach((label) => {
                  attribute == 'Custom' ? label.style.cursor = 'none' : label.style.cursor = '';
                })
              
                document.addEventListener('mousemove', this.updateCursorPosition.bind(this));         
                this.cursorInited = true;
              }
        })
    }

    if (!customElements.get('reading-progress')) {
        customElements.define('reading-progress', class ReadingProgress extends HTMLElement {
            constructor() {
                super(); 
            
                this.readingProgressBar();
            }

            readingProgress = () => {
                const progressBar = document.getElementById('progress-bar');
                const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
                const scrollTop = window.scrollY;
                const progress = (scrollTop / scrollableHeight) * 100;
                progressBar.style.width = progress + '%';
            }

            readingProgressBar(){
                const progressBar = document.getElementById('progress-bar');
                if(!progressBar) return;
              
                const progressBarData = document.querySelector('article').getAttribute('data-use-reading-progress-bar');                       
              
                window.removeEventListener('scroll', this.readingProgress);
              
                if(progressBarData == "true"){
                  window.addEventListener('scroll', this.readingProgress);
                  progressBar.style.display = "block";
                }else{
                  progressBar.style.display = "none";
                }
              }
        })
    }
})