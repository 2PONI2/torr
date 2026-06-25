// ===========================
// ПРЕЛОАДЕР
// ===========================
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.classList.add('preloader--hidden');
    }, 1800);
});

// ===========================
// КАСТОМНЫЙ КУРСОР
// ===========================
// (Этот блок оставлен как есть, если у вас есть #cursor и #cursor-ring в HTML)
const cursor = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');
const body = document.body;

let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (cursor) {
        cursor.style.left = mouseX - 4 + 'px';
        cursor.style.top = mouseY - 4 + 'px';
    }
});

function animateRing() {
    ringX += (mouseX - ringX) * 0.1;
    ringY += (mouseY - ringY) * 0.1;
    if (cursorRing) {
        cursorRing.style.left = ringX - 18 + 'px';
        cursorRing.style.top = ringY - 18 + 'px';
    }
    requestAnimationFrame(animateRing);
}
if(cursorRing) animateRing();

const interactiveElements = document.querySelectorAll('a, button, .btn, [data-magnetic], .game-card, .feature-card, .step-card, .faq-item__question, .filter-tag, input, .download-link');
interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => body.classList.add('cursor--hover'));
    el.addEventListener('mouseleave', () => body.classList.remove('cursor--hover'));
});

// ===========================
// МАГНИТНЫЙ ЭФФЕКТ
// ===========================
document.querySelectorAll('[data-magnetic]').forEach(el => {
    el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate(0, 0)';
    });
});

// ===========================
// СЛЕЖЕНИЕ ЗА КУРСОРОМ ДЛЯ ОРБЫ (СВЕЧЕНИЕ ПОРТАЛА)
// ===========================
const orb = document.getElementById('hero-orb');
if (orb) {
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 25;
        const y = (e.clientY / window.innerHeight - 0.5) * 25;
        orb.style.transform = `translate(${x}px, ${y}px)`;
    });
}

// ===========================
// REVEAL ПРИ СКРОЛЛЕ (Секции)
// ===========================
// Находим все элементы с классом .reveal (добавьте его к секциям в HTML)
const revealElements = document.querySelectorAll('.reveal');

function revealOnScroll() {
    const windowHeight = window.innerHeight;
    
    revealElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        // Элемент проявится, когда его верхняя часть окажется на 85% от высоты экрана
        if (rect.top < windowHeight * 0.85) {
            el.classList.add('reveal--active');
        }
    });
}

// Слушаем скролл
window.addEventListener('scroll', revealOnScroll);
// Запускаем один раз при загрузке, чтобы проверить, может что-то уже видно
window.addEventListener('load', revealOnScroll);

// ===========================
// АРROW PATH: Идеально ровная Z-линия (ступеньками)
// ===========================
const arrowSvg = document.getElementById('arrowSvg');
const arrowPath = document.getElementById('arrowPath');
const arrowMover = document.getElementById('arrowMover');
const whoSection = document.getElementById('whoweare');
const whoTrack = document.getElementById('whoTrack');

let pathLength = 1;

function buildArrowPath() {
    const cards = Array.from(whoTrack.querySelectorAll('.who-card'));
    if (cards.length < 2) return;

    const containerRect = whoTrack.getBoundingClientRect();
    const svgW = containerRect.width || 1000;
    const svgH = containerRect.height || 600;
    
    arrowSvg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);
    arrowSvg.style.width = svgW + 'px';
    arrowSvg.style.height = svgH + 'px';

    const points = cards.map(card => {
        const rect = card.getBoundingClientRect();
        return {
            startX: rect.left + rect.width / 2 - containerRect.left,
            exitY: rect.bottom - containerRect.top,
            entryY: rect.top - containerRect.top,
            width: rect.width
        };
    });

    let d = '';

    for (let i = 0; i < points.length - 1; i++) {
        const curr = points[i];
        const next = points[i+1];

        const startX = curr.startX;
        const startY = curr.exitY;
        const endX = next.startX;
        const endY = next.entryY;

        const midY = (startY + endY) / 2;

        if (i === 0) {
            d += `M ${startX} ${startY}`;
        }

        d += ` V ${midY} H ${endX} V ${endY}`;
    }

    arrowPath.setAttribute('d', d.trim());
    
    try {
        pathLength = arrowPath.getTotalLength() || 1;
    } catch(e) {
        pathLength = 1;
    }
    updateArrow();
}

function updateArrow() {
    const cards = Array.from(whoTrack.querySelectorAll('.who-card'));
    if (cards.length < 2) return;

    // Получаем координаты первой и последней карточки относительно экрана
    const firstRect = cards[0].getBoundingClientRect();
    const lastRect = cards[cards.length - 1].getBoundingClientRect();

    const windowHeight = window.innerHeight;

    // Рассчитываем прогресс:
    // Начало (0%): когда ВЕРХ первой карточки касается НИЗА экрана
    // Конец (100%): когда НИЗ последней карточки касается ВЕРХА экрана
    const startOffset = windowHeight - firstRect.top; 
    const totalDistance = (windowHeight - firstRect.top) + lastRect.bottom;

    let progress = startOffset / totalDistance;
    
    // Ограничиваем прогресс от 0 до 1
    progress = Math.max(0, Math.min(1, progress));

    try {
        const point = arrowPath.getPointAtLength(progress * pathLength);
        arrowMover.setAttribute('cx', point.x);
        arrowMover.setAttribute('cy', point.y);
        
        // Плавное появление/исчезновение по краям
        let opacity = 1;
        if (progress < 0.05) opacity = progress / 0.05;
        if (progress > 0.95) opacity = (1 - progress) / 0.05;
        arrowMover.style.opacity = Math.max(0, Math.min(1, opacity));
        
    } catch(e) {}
}

window.addEventListener('scroll', updateArrow);
window.addEventListener('resize', () => {
    setTimeout(buildArrowPath, 100);
});
window.addEventListener('load', () => {
    setTimeout(buildArrowPath, 150);
});

// Первичная отрисовка
setTimeout(buildArrowPath, 100);
setTimeout(buildArrowPath, 500);

// ===========================
// FAQ АККОРДЕОН
// ===========================
document.querySelectorAll('[data-faq]').forEach(item => {
    const btn = item.querySelector('.faq-item__question');
    btn.addEventListener('click', () => {
        item.classList.toggle('faq-item--open');
    });
});

// ===========================
// КАНВАС С ЧАСТИЦАМИ
// ===========================
const canvas = document.getElementById('bg-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    const maxParticles = 50;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
        constructor() {
            this.reset(true);
        }
        reset(initial = false) {
            this.x = initial ? Math.random() * canvas.width : Math.random() * canvas.width;
            this.y = initial ? Math.random() * canvas.height : canvas.height + 20;
            this.size = Math.random() * 1.5 + 0.3;
            this.speedY = -(Math.random() * 0.25 + 0.08);
            this.speedX = (Math.random() - 0.5) * 0.2;
            this.opacity = Math.random() * 0.35 + 0.04;
            this.life = 0;
            this.maxLife = 500 + Math.random() * 500;
        }
        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            this.life++;
            if (this.life > this.maxLife || this.y < -20) this.reset();
        }
        draw() {
            const fadeIn = Math.min(1, this.life / 50);
            const fadeOut = Math.min(1, (this.maxLife - this.life) / 100);
            const alpha = this.opacity * fadeIn * fadeOut;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(168, 85, 247, ${alpha})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < maxParticles; i++) {
        particles.push(new Particle());
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 70) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(6, 182, 212, ${0.05 * (1 - dist / 70)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animateParticles);
    }
    animateParticles();
}


// ======================================================
// НОВЫЙ КОД: ВРАЩЕНИЕ ПОРТАЛА ПРИ СКРОЛЛЕ
// ======================================================
const portalSwirl = document.getElementById('portalSwirl');

if (portalSwirl) {
    let currentRotation = 0;
    let targetRotation = 0;
    let isScrolling = false;

    // Слушаем скролл
    window.addEventListener('scroll', () => {
        // Чем выше скролл, тем больше добавляем градусов
        // 0.2 - это скорость вращения (чем больше число, тем быстрее крутится)
        targetRotation += window.scrollY * 0.15; 
        isScrolling = true;
    });

    // Плавная анимация вращения (60 кадров в секунду)
    function rotatePortal() {
        if (portalSwirl) {
            // Плавно подтягиваем текущий угол к целевому (эффект инерции)
            currentRotation += (targetRotation - currentRotation) * 0.08;
            portalSwirl.style.transform = `rotate(${currentRotation}deg)`;
        }
        requestAnimationFrame(rotatePortal);
    }
    rotatePortal();
}