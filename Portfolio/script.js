/**
 * Premium Portfolio Interactions
 * Native Vanilla JavaScript Document
 */

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Custom Cursor Follower Glow
    const cursor = document.querySelector('.cursor-glow');
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    // 2. Navbar Scroll Effects
    const navbar = document.getElementById('navbar');
    const scrollTopBtn = document.querySelector('.scroll-top');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            navbar.classList.add('scrolled');
            scrollTopBtn.classList.add('visible');
        } else {
            navbar.classList.remove('scrolled');
            scrollTopBtn.classList.remove('visible');
        }
    });

    // 3. Mobile Hamburger Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        // Simple transforming animation on icon
        const icon = hamburger.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close menu on link click
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = hamburger.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });

    // 4. Hero Section Typing Effect
    const textRoles = [
        "CSE Student", 
        "IoT Enthusiast", 
        "AI/ML Developer", 
        "Web Developer"
    ];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typedTextElement = document.querySelector('.typed-text');

    function typeEffect() {
        if(!typedTextElement) return;
        const currentRole = textRoles[roleIndex];
        
        if (isDeleting) {
            charIndex--;
        } else {
            charIndex++;
        }

        typedTextElement.textContent = currentRole.substring(0, charIndex);

        let typeSpeed = isDeleting ? 40 : 80;

        if (!isDeleting && charIndex === currentRole.length) {
            typeSpeed = 2500; // Pause at end of text
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % textRoles.length;
            typeSpeed = 400; // Pause before matching next string
        }

        setTimeout(typeEffect, typeSpeed);
    }
    
    // Start typing effect slightly after load
    setTimeout(typeEffect, 1000);

    // 5. Scroll Reveal Intersection Observer (Subtle enters)
    const revealElements = document.querySelectorAll('.reveal');
    const sketchObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // Animate progress bars if the skills section is revealed
                if (entry.target.classList.contains('skills-container')) {
                    animateSkills();
                }

                // observer.unobserve(entry.target); // Uncomment to animate once only
            }
        });
    }, {
        root: null,
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => sketchObserver.observe(el));

    // Dynamic Skill Bar Progression
    function animateSkills() {
        const skills = document.querySelectorAll('.skill-bar-fill');
        skills.forEach(skill => {
            const width = skill.style.width;
            skill.style.width = '0';
            setTimeout(() => {
                skill.style.width = width;
            }, 300);
        });
    }

    // 6. Project Category Filtering Logic
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Re-assign active
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filterValue = btn.getAttribute('data-filter');
            
            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filterValue === 'all' || filterValue === category) {
                    card.style.display = 'block';
                    // Need a slight timeout to trigger transition appropriately
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0) scale(1)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px) scale(0.95)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 400); // Wait for transition
                }
            });
        });
    });

    // 7. Interactive 3D Tilt Effect on Project Cards
    projectCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Limit tilt degree
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;
            
            const inner = card.querySelector('.project-content');
            if(inner) {
                 inner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            }
        });
        
        card.addEventListener('mouseleave', () => {
            const inner = card.querySelector('.project-content');
            if(inner) {
                inner.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
            }
        });
    });

});
