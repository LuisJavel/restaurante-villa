document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.navbar');
    const formReserva = document.getElementById('formReserva');
    const mensajeExito = document.getElementById('mensajeExito');
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }

    const heroPage = document.querySelector('.hero-page');
    const heroPageOverlay = document.querySelector('.hero-page-overlay');

    function handleNavbarScroll() {
        if (!navbar) return;

        const scrollY = window.scrollY;
        const hero = document.querySelector('.hero');
        const heroPage = document.querySelector('.hero-page');
        const heroHeight = hero?.offsetHeight || window.innerHeight;
        const heroPageHeight = heroPage?.offsetHeight || 0;
        const targetHeight = hero ? heroHeight : heroPageHeight;

        if (scrollY > 50) {
            navbar.classList.add('scrolled');
            navbar.classList.remove('light');
        } else {
            navbar.classList.remove('scrolled');
            if (heroPage) {
                navbar.classList.remove('light');
            } else if (scrollY > heroHeight - 100) {
                navbar.classList.add('light');
            }
        }
    }

    window.addEventListener('scroll', handleNavbarScroll, { passive: true });
    handleNavbarScroll();

    if (formReserva) {
        formReserva.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(formReserva);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/api/reservas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    formReserva.style.display = 'none';
                    mensajeExito.classList.remove('oculto');
                    formReserva.reset();
                }
            } catch (error) {
                console.error('Error al enviar la reserva:', error);
                alert('Hubo un error al procesar su reserva. Intente de nuevo.');
            }
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.caracteristica, .galeria-item, .menu-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    document.addEventListener('click', (e) => {
        if (!navMenu?.contains(e.target) && !menuToggle?.contains(e.target)) {
            navMenu?.classList.remove('active');
            menuToggle?.classList.remove('active');
        }
    });
});

document.head.insertAdjacentHTML('beforeend', `
<style>
.visible {
    opacity: 1 !important;
    transform: translateY(0) !important;
}
</style>
`);