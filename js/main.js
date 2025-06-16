const headerElement = document.querySelector("header")
const typeWriterElement = document.getElementById("typewriter");
const navElement = document.querySelector("nav");
const navLinksElements = document.querySelectorAll("nav ul li a");
const mobileMenuToggleElement = document.querySelector(".mobile-menu-toggle");
const formElement = document.querySelector("form");
const sectionElements = document.querySelectorAll("section");

const animateElements = document.querySelectorAll(".project-card, .timeline-item, .education-item, .contact-info, .contact-form");

const typewriterLines = [
    "Low-Level Software Developer",
    "Systems Programmer",
    "C/C++ Systems Developer",
    "Real-time Software Developer"
];

const typingSpeed = 50;
const deletingSpeed = 30;
const variation = 80;
const pauseAfterTyping = 2000;
const pauseAfterDeleting = 1000;

let lineIndex = Math.floor(Math.random() * typewriterLines.length);
let characterIndex = 0;
let isDeleting = false;
let delay = typingSpeed;
let lastTime = 0;

function toggleMobileMenu()
{
    mobileMenuToggleElement.classList.toggle("active");
    navElement.classList.toggle("active");

    // Update ARIA attributes for accessibility
    const isExpanded = navElement.classList.contains("active");
    // mobileMenuToggleElement.setAttribute("aria-expanded", isExpanded);

    // Add a visual focus indication when the menu is opened
    if (isExpanded)
    {
        const firstNavLink = navLinksElements[0];
        if (firstNavLink)
        {
            setTimeout(() => firstNavLink.focus(), 100);
        }
    }
}

mobileMenuToggleElement.addEventListener("click", toggleMobileMenu);
mobileMenuToggleElement.addEventListener("keydown", function(event) {
    // Activate on Enter or Space key
    if ((event.key === "Enter") || (event.key === " "))
    {
        event.preventDefault();

        toggleMobileMenu();
    }
});

document.addEventListener("click", (event) => {
    if (!event.target.closest("nav") && !event.target.closest(".mobile-menu-toggle") && navElement.classList.contains("active"))
    {
        toggleMobileMenu();
    }
});

navLinksElements.forEach(link => {
    link.addEventListener("click", () => {
        if (navElement.classList.contains("active"))
        {
            toggleMobileMenu();
        }
    });
});

document.querySelectorAll("a[href^='#']").forEach(anchor => {
    anchor.addEventListener("click", function(event) {
        event.preventDefault();

        const targetId = this.getAttribute("href");

        if (targetId === "#")
        {
            return;
        }

        const targetElement = document.querySelector(targetId);

        if (targetElement)
        {
            // const headerHeight = document.querySelector("header").offsetHeight;
            const headerHeight = Math.floor(document.querySelector("header").getBoundingClientRect().height);
            const scrollOffset = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;
            // const scrollOffset = targetElement.offsetTop - headerHeight;

            window.scrollTo({
                top: scrollOffset,
                behavior: "smooth"
            });

            history.pushState(null, null, targetId);
        }
    });
});

document.addEventListener("submit", (event) => {
    event.preventDefault();

    alert("Form submission is not implemented yet.");

    formElement.reset();
});

const observer = new IntersectionObserver((entries) => {
    const visibleEntry = entries.find(entry => entry.isIntersecting);

    if (visibleEntry)
    {
        document.querySelector("nav ul li a.active")?.classList.remove("active");
        document.querySelector(`nav ul li a[href="#${visibleEntry.target.id}"]`)?.classList.add("active");
    }
},
{
    threshold: 0.6
});

sectionElements.forEach(element => {
    observer.observe(element);
});

document.addEventListener("DOMContentLoaded", () => {
    // Set initial ARIA attributes
    // mobileMenuToggleElement.setAttribute('aria-expanded', 'false');
    // mobileMenuToggleElement.setAttribute('aria-controls', 'primary-navigation');
    // navElement.setAttribute("id", "primary-navigation");

    // Intersection Observer for animations
    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting)
                {
                    entry.target.classList.remove("animate-out");
                    entry.target.classList.add("animate-in");
                }
                else
                {
                    entry.target.classList.remove("animate-in");
                    entry.target.classList.add("animate-out");
                }
            });
        },
        {
            threshold: 0.3
        });

        animateElements.forEach(element => {
            observer.observe(element);
        });
    }
    else
    {
        // Fallback for browsers that don't support IntersectionObserver
        animateElements.forEach(element => {
            element.classList.add("animate-in");
        });
    }
});

function isPunctuation(character)
{
    return [',', '.', '–', '-', '!', '?'].includes(character);
}

function addChar(character)
{
    const span = document.createElement("span");
    span.textContent = character;
    // span.style.opacity = "0";
    // span.style.transition = "opacity 1.0s ease";

    // typewriter.appendChild(span);

    // requestAnimationFrame(() => span.style.opacity = "1");

    // span.style.animationDelay = `${characterIndex * 0.05}s`;
    typeWriterElement.append(span);
}

function updateText()
{
    const text = typewriterLines[lineIndex];

    if (isDeleting)
    {
        if (typewriter.lastChild)
        {
            typewriter.removeChild(typewriter.lastChild);
        }

        characterIndex--;
    }
    else
    {
        addChar(text[characterIndex]);

        characterIndex++;
    }

    if ((!isDeleting) && (characterIndex === text.length))
    {
        isDeleting = true;
        delay = pauseAfterTyping;
    }
    else if (isDeleting && (characterIndex === 0))
    {
        isDeleting = false;
        lineIndex = Math.floor(Math.random() * typewriterLines.length);
        delay = pauseAfterDeleting;
    }
    else
    {
        const base = isDeleting ? deletingSpeed : typingSpeed;
        const extra = isPunctuation(text[characterIndex - 1] || "") ? 150 : 0;

        delay = base + Math.random() * variation + extra;
    }
}

function tick(timestamp)
{
    if (!lastTime)
    {
        lastTime = timestamp;
    }

    const elapsed = timestamp - lastTime;

    if (elapsed >= delay)
    {
        updateText();
        lastTime = timestamp;
    }

    requestAnimationFrame(tick);
}

requestAnimationFrame(tick);
