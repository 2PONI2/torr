// ===========================
// ХЭДЕР СКРОЛЛ
// ===========================
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('header--scrolled');
    } else {
        header.classList.remove('header--scrolled');
    }
});

// ===========================
// БУРГЕР-МЕНЮ
// ===========================
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobile-menu');
if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
        mobileMenu.classList.toggle('mobile-menu--active');
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('mobile-menu--active');
        });
    });
}