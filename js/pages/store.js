// REVEAL ПРИ СКРОЛЛЕ
        const revealElements = document.querySelectorAll('.reveal');

        function revealOnScroll() {
            const windowHeight = window.innerHeight;
            revealElements.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < windowHeight * 0.9) {
                    el.classList.add('reveal--active');
                }
            });
        }
        window.addEventListener('scroll', revealOnScroll);
        window.addEventListener('load', revealOnScroll);