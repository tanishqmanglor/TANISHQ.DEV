gsap.registerPlugin(ScrollTrigger);

// 1. SMOOTH SCROLLING
if (typeof Lenis !== 'undefined') {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

// 2. CUSTOM CURSOR
const cursor = document.getElementById("cursor");
if (cursor) {
    gsap.set(cursor, { xPercent: -50, yPercent: -50 });
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.1, ease: "power3.out" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.1, ease: "power3.out" });

    if (window.matchMedia("(pointer: fine)").matches) {
        window.addEventListener("mousemove", (e) => {
            xTo(e.clientX);
            yTo(e.clientY);
        });
        const hoverables = ".mouse-hover, .nav-item, .project, .btn, .socials a, .cv-btn, .toc-link, .cs-tag, .project-link, .tech-pill";
        document.body.addEventListener('mouseover', (e) => {
            if (e.target.closest(hoverables)) cursor.classList.add("hovered");
        });
        document.body.addEventListener('mouseout', (e) => {
            if (e.target.closest(hoverables)) cursor.classList.remove("hovered");
        });
    }
}

// 3. PRELOADER & HERO LOGIC (CINEMATIC VERSION)
const preloader = document.querySelector(".preloader-container");
if (preloader) {
    const isReload = performance.getEntriesByType("navigation")[0]?.type === 'reload';

    // If user has visited before (and didn't reload manually), skip animation
    if (sessionStorage.getItem("visited") === "true" && !isReload) {
        gsap.set(".preloader-container", { display: "none" });
        
        // Set elements to visible state immediately
        gsap.set(".hero-text", { y: 0, opacity: 1 });
        gsap.set(".hero-sub", { opacity: 1, y: 0 });
        if(document.querySelector(".cv-wrapper")) gsap.set(".cv-wrapper", { opacity: 1 });
        
        // --- FIX: Ensure Nav is visible for returning users ---
        gsap.set("nav", { y: 0, opacity: 1 }); 
        
        document.body.style.overflow = "";
    } else {
        // FIRST VISIT ANIMATION
        sessionStorage.setItem("visited", "true");
        document.body.style.overflow = "hidden";

        // --- FIX: Hide Nav initially so it doesn't overlap loader ---
        gsap.set("nav", { y: -50, opacity: 0 });

        const tl = gsap.timeline();

        // 1. Reveal Loader Elements
        tl.to(".loader-text", { opacity: 1, duration: 0.5, ease: "power2.out" });
        
        // 2. Count from 0 to 100
        const counterObj = { value: 0 };
        const counterEl = document.querySelector(".counter");
        
        tl.to(counterObj, {
            value: 100,
            duration: 2.5,
            ease: "power3.inOut",
            onUpdate: () => {
                if(counterEl) counterEl.textContent = Math.floor(counterObj.value);
            }
        });

        // 3. The "Exit" - Slide the curtain UP
        tl.to(".loader-text, .loader-meta", { opacity: 0, duration: 0.3 }); // Fade out text first
        
        tl.to(".preloader-container", {
            yPercent: -100, // Slide Up
            duration: 1.2,
            ease: "power4.inOut",
            onComplete: () => {
                document.body.style.overflow = "";
                gsap.set(".preloader-container", { display: "none" });
            }
        });

        // 4. Hero Section Entrance
        tl.from(".hero-text", { 
            y: 100, 
            opacity: 0, 
            duration: 1.2, 
            stagger: 0.1, 
            ease: "power4.out" 
        }, "-=0.8");

        // NEW FIXED CODE
        tl.fromTo(".hero-sub", 
            { y: 30, opacity: 0 },      // Start State
            { y: 0, opacity: 1, duration: 1, ease: "power3.out" }, // End State
            "-=0.6"
        );

        if(document.querySelector(".cv-wrapper")) {
            tl.from(".cv-wrapper", { 
                y: 30, 
                opacity: 0, 
                duration: 1, 
                ease: "power3.out" 
            }, "-=0.8");
        }

        // --- FIX: Reveal Nav smoothly after loader finishes ---
        tl.to("nav", { 
            y: 0, 
            opacity: 1, 
            duration: 1, 
            ease: "power3.out" 
        }, "-=1.0"); // Overlaps slightly with hero animation
    }
}

// 4. PAGE TRANSITIONS
document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !link.hasAttribute('download') && link.target !== '_blank') {
            e.preventDefault();
            let curtain = document.querySelector('.page-transition-curtain');
            if (!curtain) {
                curtain = document.createElement('div');
                curtain.classList.add('page-transition-curtain');
                curtain.style.cssText = `
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: #000; z-index: 10000;
                    transform: scaleY(0); transform-origin: bottom; pointer-events: none;
                `;
                document.body.appendChild(curtain);
            }
            gsap.to(curtain, {
                scaleY: 1,
                duration: 0.8,
                ease: "power4.inOut",
                onComplete: () => { window.location.href = href; }
            });
        }
    });
});

// 5. NAV SCROLL EFFECT
const nav = document.querySelector('nav');
if (nav) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
    });
}

// 6. ANIMATIONS
const hero = document.getElementById("hero");
if (hero) {
    gsap.to("#hero", {
        scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: 1 },
        y: 100,
        opacity: 0.5,
    });
}

const revealItems = document.querySelectorAll(".project, .reveal-text");
if (revealItems.length > 0) {
    revealItems.forEach((item) => {
        gsap.from(item, {
            scrollTrigger: { trigger: item, start: "top 90%" },
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
        });
    });
}

// 7. IMAGE REVEAL LOGIC
const revealContainers = document.querySelectorAll(".reveal-container");
if (revealContainers.length > 0) {
    revealContainers.forEach((container) => {
        const curtain = container.querySelector(".reveal-curtain");
        const img = container.querySelector("img");
        
        let tl = gsap.timeline({
            scrollTrigger: {
                trigger: container,
                start: "top 80%",
            }
        });

        tl.to(curtain, { scaleY: 0, duration: 1.5, ease: "power4.inOut" });
        if(img) {
            tl.to(img, { scale: 1, filter: "grayscale(0%)", duration: 1.5, ease: "power4.out" }, "-=1.5");
        }
    });
}

// 8. MAGNETIC BUTTONS
const magnets = document.querySelectorAll(".nav-item, .submit-btn, .btn, .socials a, .cv-btn, .cs-tag, .tech-pill");
magnets.forEach((magnet) => {
    magnet.addEventListener("mousemove", (e) => {
        const bounding = magnet.getBoundingClientRect();
        const strength = 30; 
        const newX = (e.clientX - bounding.left) / magnet.offsetWidth - 0.5;
        const newY = (e.clientY - bounding.top) / magnet.offsetHeight - 0.5;

        gsap.to(magnet, { duration: 1, x: newX * strength, y: newY * strength, ease: "power4.out" });
    });

    magnet.addEventListener("mouseleave", () => {
        gsap.to(magnet, { duration: 1, x: 0, y: 0, ease: "elastic.out(1, 0.3)" });
    });
});

// 9. MOBILE MENU
const menuToggle = document.querySelector(".menu-toggle");
if (menuToggle) {
    const mobileMenu = document.querySelector(".mobile-menu");
    const mobileLinks = document.querySelectorAll(".mobile-link");
    let isMenuOpen = false;

    // Toggle Menu Open/Close
    menuToggle.addEventListener("click", () => {
        if (!isMenuOpen) {
            // OPEN
            gsap.to(mobileMenu, { y: 0, autoAlpha: 1, duration: 0.6, ease: "power4.inOut" });
            gsap.fromTo(mobileLinks, { y: 50, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, delay: 0.2 });
            
            menuToggle.classList.add("active");
            mobileMenu.classList.add("active");
            document.body.style.overflow = "hidden"; // FREEZE BACKGROUND
        
            isMenuOpen = true;
        } else {
            // CLOSE
            gsap.to(mobileMenu, { y: "-100%", autoAlpha: 0, duration: 0.6 });
            
            menuToggle.classList.remove("active");
            mobileMenu.classList.remove("active");
            document.body.style.overflow = ""; // UNFREEZE
            isMenuOpen = false;
        }
    });

    // Close Menu when a link is clicked
    mobileLinks.forEach(link => {
        link.addEventListener("click", () => {
            gsap.to(mobileMenu, { y: "-100%", autoAlpha: 0, duration: 0.6 });
            
            menuToggle.classList.remove("active");
            mobileMenu.classList.remove("active");
            document.body.style.overflow = ""; // UNFREEZE
            isMenuOpen = false;
        });
    });
}

// 11. CINEMATIC MOBILE SCROLL HIGHLIGHT
if (window.matchMedia("(max-width: 768px)").matches) {
    const projects = document.querySelectorAll('.project');
    
    // Config: When 60% of the item is visible, trigger the effect
    const observerOptions = {
        root: null,
        rootMargin: "-20% 0px -20% 0px", // Focus area is the center 60% of screen
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // ACTIVE STATE (In Center)
                gsap.to(entry.target, {
                    scale: 1.03,                 // Subtle zoom
                    backgroundColor: "#0a0a0a",  // Darker background
                    borderColor: "rgba(255,255,255,0.8)", // Bright border
                    boxShadow: "0 10px 30px -10px rgba(255,255,255,0.15)", // Soft Glow
                    duration: 0.6,
                    ease: "power3.out"
                });
                
                // Animate the Title inside
                gsap.to(entry.target.querySelector("h2"), {
                    color: "#fff",
                    x: 10,                       // Slide text right
                    duration: 0.6
                });

                // Animate the Meta text (Date/Type)
                gsap.to(entry.target.querySelector(".project-meta"), {
                    color: "#ccc",
                    duration: 0.6
                });

            } else {
                // INACTIVE STATE (scrolled away)
                gsap.to(entry.target, {
                    scale: 1,
                    backgroundColor: "transparent",
                    borderColor: "#222",        // Back to dim border
                    boxShadow: "none",
                    duration: 0.6,
                    ease: "power3.out"
                });

                gsap.to(entry.target.querySelector("h2"), {
                    color: "#888",
                    x: 0,                       // Slide text back
                    duration: 0.6
                });

                gsap.to(entry.target.querySelector(".project-meta"), {
                    color: "#666",
                    duration: 0.6
                });
            }
        });
    }, observerOptions);

    projects.forEach(p => observer.observe(p));
}

// 12. PROJECT PREVIEW REVEAL
const previewEl = document.getElementById('preview-img');
const projectLinks = document.querySelectorAll('.project-link');

if (previewEl && projectLinks.length > 0) {
    projectLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            const imgUrl = link.getAttribute('data-img');
            if (imgUrl) {
                previewEl.style.backgroundImage = `url('${imgUrl}')`;
                
                gsap.to(previewEl, { 
                    opacity: 1, 
                    scale: 1, 
                    duration: 0.4, 
                    ease: "power2.out" 
                });
            }
        });

        link.addEventListener('mouseleave', () => {
            gsap.to(previewEl, { 
                opacity: 0, 
                scale: 0.8, 
                duration: 0.3, 
                ease: "power2.in" 
            });
        });

        link.addEventListener('mousemove', (e) => {
            // Optional: Move image slightly with cursor
            const x = (e.clientX - window.innerWidth / 2) * 0.15;
            const y = (e.clientY - window.innerHeight / 2) * 0.15;
            
            gsap.to(previewEl, { 
                x: x, 
                y: y, 
                duration: 0.5, 
                ease: "power1.out" 
            });
        });
    });
}

// 13. DYNAMIC YEAR
const yearSpan = document.getElementById("year");
if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
}

// ACCESSIBILITY: Detect Keyboard vs Mouse
window.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        document.body.classList.add('user-is-tabbing');
    }
});

window.addEventListener('mousemove', () => {
    document.body.classList.remove('user-is-tabbing');
});

// --- AMBIENT GLOW FOLLOWER ---
const glow = document.getElementById("ambient-glow");

if (glow) {
    // We use a slower duration (1.5) for a "floating" feel
    const glowX = gsap.quickTo(glow, "x", { duration: 1.5, ease: "power3.out" });
    const glowY = gsap.quickTo(glow, "y", { duration: 1.5, ease: "power3.out" });

    window.addEventListener("mousemove", (e) => {
        glowX(e.clientX);
        glowY(e.clientY);
    });
}

// --- LIVE LOCAL TIME (IST) ---
function updateLiveClock() {
    const clockElement = document.getElementById("live-clock");
    if (clockElement) {
        // specific time for India (Asia/Kolkata)
        const now = new Date();
        const timeString = now.toLocaleTimeString("en-US", {
            timeZone: "Asia/Kolkata",
            hour12: false, // Use 24-hour format (looks more "dev")
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
        
        clockElement.textContent = timeString + " IST";
    }
}

// Update immediately, then every second
updateLiveClock();
setInterval(updateLiveClock, 1000);

// --- EASTER EGG: MATRIX RAIN ---
const secretCode = "matrix";
let inputSequence = "";
const canvas = document.getElementById("matrix-canvas");
const ctx = canvas ? canvas.getContext("2d") : null;

if (canvas && ctx) {
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";
    const fontSize = 16;
    const columns = Math.floor(width / fontSize);
    const drops = new Array(columns).fill(1); // Y-coordinate of drops
    let matrixInterval;
    let isActive = false;

    // Resize safely
    window.addEventListener("resize", () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    });

    function drawMatrix() {
        // Semi-transparent black to create trail effect
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "#0F0"; // Green Text
        ctx.font = `${fontSize}px 'Fira Code'`;

        for (let i = 0; i < drops.length; i++) {
            const text = characters.charAt(Math.floor(Math.random() * characters.length));
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            // Reset drop to top randomly
            if (drops[i] * fontSize > height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    function toggleMatrix(enable) {
        if (enable) {
            isActive = true;
            // Fade In
            gsap.to(canvas, { opacity: 1, duration: 1 });
            // Start Loop
            matrixInterval = setInterval(drawMatrix, 33);
            
            // Optional: Change Site Colors to Hacker Green temporarily
            document.documentElement.style.setProperty('--accent', '#0F0');
        } else {
            isActive = false;
            // Fade Out
            gsap.to(canvas, { opacity: 0, duration: 1, onComplete: () => {
                clearInterval(matrixInterval);
                ctx.clearRect(0, 0, width, height); // Clean up
            }});
            // Reset Colors
            document.documentElement.style.setProperty('--accent', '#bfa5d8');
        }
    }

    // LISTENER
    window.addEventListener("keydown", (e) => {
        // Add key to sequence
        inputSequence += e.key.toLowerCase();
        
        // Trim sequence to match code length
        if (inputSequence.length > secretCode.length) {
            inputSequence = inputSequence.slice(-secretCode.length);
        }

        // CHECK CODE
        if (inputSequence === secretCode) {
            if (!isActive) {
                toggleMatrix(true);
                console.log("%c SYSTEM BREACH DETECTED ", "background: #000; color: #0f0; font-size: 20px");
            } else {
                toggleMatrix(false); // Type it again to turn off
            }
        }
    });
} // <--- CORRECTLY CLOSED MATRIX BLOCK

// --- TAB TITLE ANIMATION ---
const originalTitle = document.title;
const blurTitle = "System Offline // Come Back"; // The message when they leave

window.addEventListener("blur", () => {
    document.title = blurTitle;
});

window.addEventListener("focus", () => {
    document.title = originalTitle;
}); 

// --- CONSOLE SIGNATURE ---
console.log(
    "%c     T A N I S H Q`` . D E V  ", 
    "color: #050505; background: #bfa5d8; font-size: 20px; font-weight: bold; padding: 10px; border-radius: 5px;"
);
console.log(
    "%c System Online. Welcome to the source code. \n Looking for bugs? Good luck. ", 
    "color: #bfa5d8; font-family: monospace; font-size: 14px;"
);

// --- SYNTHESIZED AUDIO SYSTEM ---
const AudioContext = window.AudioContext || window.webkitAudioContext;

class SystemSound {
    constructor() {
        this.ctx = new AudioContext();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.05; // Low volume (5%)
        this.masterGain.connect(this.ctx.destination);
        this.enabled = false;
    }

    enable() {
        if (!this.enabled) {
            this.ctx.resume().then(() => {
                this.enabled = true;
            });
        }
    }

    playBoot() {
        if (!this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.masterGain);

        // A "Power Up" sweep sound
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(50, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 1.5);
        
        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 1.5);

        osc.start();
        osc.stop(this.ctx.currentTime + 1.5);
    }

    playHover() {
        if (!this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterGain);

        // High-pitch "Blip" (Sine wave)
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    playClick() {
        if (!this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterGain);

        // Low-pitch "Thud" (Square wave)
        osc.type = "square";
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    }
}

// INITIALIZE SYSTEM
const sfx = new SystemSound();

// 1. Unlock Audio on first interaction (Browser Requirement)
window.addEventListener("click", () => sfx.enable(), { once: true });
window.addEventListener("keydown", () => sfx.enable(), { once: true });

// 2. Attach to all interactive elements on ANY page
document.addEventListener("mouseover", (e) => {
    if (e.target.closest("a, button, .project, .nav-item, .tech-pill, .cv-btn")) {
        sfx.playHover();
    }
});

document.addEventListener("mousedown", (e) => {
    if (e.target.closest("a, button, .project, .nav-item, .tech-pill, .cv-btn")) {
        sfx.playClick();
    }
});

// =========================================
// 8. GOD MODE TERMINAL (The "Quake" Console)
// =========================================
const terminal = document.getElementById("cmd-terminal");
const cmdInput = document.getElementById("cmd-input");
const cmdOutput = document.getElementById("cmd-output");
let isTerminalOpen = false;

// Toggle Terminal with Tilde Key (`) or (~)
window.addEventListener("keydown", (e) => {
    if (e.key === "`" || e.key === "~") {
        e.preventDefault(); // Stop typing the character
        toggleTerminal();
    }
});

function toggleTerminal() {
    isTerminalOpen = !isTerminalOpen;
    if (isTerminalOpen) {
        terminal.classList.add("active");
        cmdInput.value = "";
        cmdInput.focus();
        sfx.playClick(); // Mechanical sound
    } else {
        terminal.classList.remove("active");
        cmdInput.blur();
    }
}

// Process Commands
let isAiMode = false;

cmdInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const input = cmdInput.value.trim();
        if (!input) return;

        if (isAiMode) {
            // Route to AI Handler
            printOutput(`<span style="color: #fff">You:</span> ${input}`, true);
            processAiQuery(input);
        } else {
            // Standard Command Handler
            printOutput(`user@swayam:~$ ${input}`);
            executeCommand(input.toLowerCase());
        }
        
        cmdInput.value = "";
        cmdInput.focus();
        // Keep scrolled to bottom
        setTimeout(() => {
            cmdOutput.scrollTop = cmdOutput.scrollHeight;
        }, 50);
    }
});

function printOutput(text, isHTML = false) {
    const line = document.createElement("div");
    if(isHTML) line.innerHTML = text;
    else line.textContent = text;
    cmdOutput.appendChild(line);
}

function executeCommand(cmd) {
    const parts = cmd.split(" ");
    const action = parts[0];
    const arg = parts[1];

    switch (action) {
        
        case "help":
            printOutput(`
  AVAILABLE COMMANDS:
  -------------------
  help            - Show this list
  clear           - Clear terminal
  goto [page]     - Navigate (home, about, work)
  color [hex]     - Hack site colors (e.g., color #00ff00)
  matrix          - Toggle Matrix Rain
  socials         - List social links
  whoami          - Reveal user identity
  blackout/shutdown - Initiate system power cut (fun)
  gravity         - [DANGER] Disable anti-gravity
  theme [name]    - Switch reality (blueprint, paper)
            `);
            break;

        case "clear":
            cmdOutput.innerHTML = "";
            break;

        case "goto":
            if (arg === "home") window.location.href = "index.html";
            else if (arg === "about") window.location.href = "about.html";
            else if (arg === "work") window.location.href = "#work";
            else printOutput("Error: Page not found. Try 'home', 'about', or 'work'.");
            break;

        case "socials":
            printOutput("GitHub | LinkedIn | Instagram | Twitter");
            window.open("https://github.com/tanishqmanglor", "_blank");
            break;

        case "whoami":
            printOutput("Guest User [IP: UNKNOWN]. Access Level: Visitor.");
            break;

        case "matrix":
            if (typeof toggleMatrix === "function") {
                // Hack to toggle: simulate the key press sequence or direct call if exposed
                // Since toggleMatrix is scoped, this might fail if canvas didn't load.
                // But for now, we rely on the existing hack:
                const event = new KeyboardEvent('keydown', {'key': 'm'});
                printOutput("Initializing Matrix Protocol...");
                window.toggleMatrix(true);
                // Simulate typing 'matrix' code
                window.dispatchEvent(new KeyboardEvent('keydown', {'key': 'm'}));
                setTimeout(() => window.dispatchEvent(new KeyboardEvent('keydown', {'key': 'a'})), 50);
                setTimeout(() => window.dispatchEvent(new KeyboardEvent('keydown', {'key': 't'})), 100);
                setTimeout(() => window.dispatchEvent(new KeyboardEvent('keydown', {'key': 'r'})), 150);
                setTimeout(() => window.dispatchEvent(new KeyboardEvent('keydown', {'key': 'i'})), 200);
                setTimeout(() => window.dispatchEvent(new KeyboardEvent('keydown', {'key': 'x'})), 250);
            } else {
                 printOutput("Error: Matrix Module not loaded (Canvas missing?).");
            }
            break;

        case "color":
            if (arg) {
                document.documentElement.style.setProperty('--accent', arg);
                const glow = document.getElementById("ambient-glow");
                if(glow) glow.style.background = `radial-gradient(circle, ${arg}40 0%, rgba(0, 0, 0, 0) 70%)`;
                
                printOutput(`SUCCESS: System accent changed to ${arg}`);
                sfx.playBoot();
            } else {
                printOutput("Error: Please specify a color. (e.g., 'color red' or 'color #00ff00')");
            }
            break;
            case "blackout":
            case "shutdown":
            printOutput("INITIATING SYSTEM POWER CUT...", true);
            setTimeout(() => {
                 window.toggleBlackout();
            }, 800);
            break;

            case "gravity":
            printOutput("WARNING: ARTIFICIAL GRAVITY GENERATORS FAILING...", true);
            setTimeout(() => {
                printOutput("CRITICAL ERROR: STRUCTURE UNSTABLE.");
                initGravity();
            }, 1000);
            break;

        case "theme":
            if (arg === "blueprint") {
                document.body.className = "theme-blueprint";
                printOutput("System reloaded: BLUEPRINT ARCHITECTURE.");
            } else if (arg === "paper") {
                document.body.className = "theme-paper";
                printOutput("System reloaded: ANALOG MODE.");
            } else if (arg === "reset" || arg === "default") {
                document.body.className = "";
                printOutput("System restored to factory settings.");
            } else {
                printOutput("Themes available: blueprint, paper, reset");
            }
            break;
            case "ai":
        case "chat":
            isAiMode = true;
            printOutput("------------------------------------------------");
            printOutput("S.A.M. (System Automated Module) v1.0 ONLINE.");
            printOutput("Connected. Talk to me naturally. Type 'exit' to quit.");
            printOutput("------------------------------------------------");
            break;
        default:
            printOutput(`Command not found: '${cmd}'. Type 'help' for options.`);
    }
}

// --- MOBILE GOD MODE TRIGGERS ---

// 1. SECRET: Triple Tap Logo to Open
const logoTrigger = document.querySelector('.logo');
let tapCount = 0;
let tapTimer;

if (logoTrigger) {
    logoTrigger.addEventListener('click', (e) => {
        tapCount++;
        clearTimeout(tapTimer);
        tapTimer = setTimeout(() => {
            tapCount = 0;
        }, 500);

        if (tapCount === 3) {
            e.preventDefault();
            toggleTerminal();
            tapCount = 0;
            if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
        }
    });
}

// 2. Close Button Logic
const closeCmdBtn = document.getElementById("cmd-close-mobile");
if (closeCmdBtn) {
    closeCmdBtn.addEventListener("click", () => {
        toggleTerminal();
    });
}

// =========================================
// 9. HOLOGRAPHIC TILT EFFECT (3D Cards)
// =========================================
const tiltCards = document.querySelectorAll(".project-link");

if (tiltCards.length > 0) {
    tiltCards.forEach(card => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate center
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Calculate Tilt (Max 15 degrees)
            const rotateX = ((y - centerY) / centerY) * -10; // Negative to tilt correctly
            const rotateY = ((x - centerX) / centerX) * 10;

            // Apply 3D Rotation to the inner Article
            const inner = card.querySelector(".project");
            gsap.to(inner, {
                transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
                duration: 0.1,
                ease: "power1.out"
            });

            // Update CSS Variable for Glare Position
            inner.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
            inner.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
        });

        // Reset on Mouse Leave
        card.addEventListener("mouseleave", () => {
            const inner = card.querySelector(".project");
            gsap.to(inner, {
                transform: `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
                duration: 0.5,
                ease: "elastic.out(1, 0.5)" // Bouncy reset
            });
        });
    });
}
// --- END OF FILE (Extra brace removed) ---


// =========================================
// 10. BLACKOUT PROTOCOL (Flashlight Easter Egg)
// =========================================

// 1. Inject Elements
const blackoutDiv = document.createElement("div");
blackoutDiv.id = "blackout-overlay";
document.body.appendChild(blackoutDiv);

const breaker = document.createElement("div");
breaker.id = "breaker-switch";
breaker.innerHTML = '<div class="lever"></div>';
document.body.appendChild(breaker);

// 2. Flashlight Tracking
document.addEventListener("mousemove", (e) => {
    if (blackoutDiv.classList.contains("active")) {
        const x = e.clientX;
        const y = e.clientY;
        blackoutDiv.style.setProperty("--x", x + "px");
        blackoutDiv.style.setProperty("--y", y + "px");
    }
});

// 3. Toggle Logic
window.toggleBlackout = function() {
    const isActive = blackoutDiv.classList.contains("active");

    if (!isActive) {
        // TURN OFF LIGHTS
        if(sfx) sfx.playClick(); // Use existing sound system
        
        blackoutDiv.classList.add("active");
        
        // Randomly position the breaker switch
        const randX = Math.random() * (window.innerWidth - 100);
        const randY = Math.random() * (window.innerHeight - 150);
        breaker.style.left = randX + "px";
        breaker.style.top = randY + "px";
        breaker.style.display = "block";

        console.log("%c SYSTEM FAILURE DETECTED ", "background: red; color: white; padding: 5px;");
    } else {
        // RESTORE POWER
        if(sfx) sfx.playBoot(); // Play boot sound
        
        blackoutDiv.classList.remove("active");
        breaker.style.display = "none";
        console.log("%c SYSTEM POWER RESTORED ", "background: green; color: white; padding: 5px;");
    }
};

// 4. Breaker Click Event
breaker.addEventListener("click", () => {
    window.toggleBlackout();
});

// =========================================
// 12. BOSS MODE (Panic Button)
// =========================================

// Inject the fake screen
const bossScreen = document.createElement("div");
bossScreen.id = "boss-screen";
bossScreen.innerHTML = `
    <div class="fake-code">
        <span style="color: #c586c0">import</span> React <span style="color: #c586c0">from</span> <span style="color: #ce9178">'react'</span>;<br><br>
        <span style="color: #569cd6">const</span> <span style="color: #dcdcaa">App</span> = () => {<br>
        &nbsp;&nbsp;<span style="color: #4ec9b0">console</span>.<span style="color: #dcdcaa">log</span>(<span style="color: #ce9178">"Project Deadline: ASAP"</span>);<br>
        &nbsp;&nbsp;<span style="color: #c586c0">return</span> (<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&lt;<span style="color: #569cd6">div</span> className=<span style="color: #ce9178">"container"</span>&gt;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span style="color: #569cd6">h1</span>&gt;Compiling Production Build...&lt;/<span style="color: #569cd6">h1</span>&gt;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&lt;/<span style="color: #569cd6">div</span>&gt;<br>
        &nbsp;&nbsp;);<br>
        }<br><br>
        <span style="color: #6a9955">// Press ESC twice to return to portfolio</span>
    </div>
`;
document.body.appendChild(bossScreen);

let escCount = 0;
let escTimer;

window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        escCount++;
        
        // Reset count if too slow
        clearTimeout(escTimer);
        escTimer = setTimeout(() => { escCount = 0; }, 500);

        if (escCount === 2) {
            const screen = document.getElementById("boss-screen");
            if (screen.style.display === "flex") {
                screen.style.display = "none"; // Hide
            } else {
                screen.style.display = "flex"; // Show
                document.title = "index.js - Visual Studio Code"; // Fake Title
            }
            escCount = 0;
        }
    }
});
// =========================================
// 13. GRAVITY SIMULATION (The "Crumble" Effect)
// =========================================
let gravityInterval;
const gravityElements = [];

function initGravity() {
    if (gravityInterval) return; // Already running

    const elements = document.querySelectorAll('p, h1, h2, h3, span, img, .btn, .nav-item, .project-card');
    
    elements.forEach(el => {
        // Store original state to reset later if needed
        const rect = el.getBoundingClientRect();
        
        // We need to set them to fixed/absolute to move them freely
        // This is a "destructive" action for the layout
        el.dataset.origStyle = el.style.cssText;
        el.style.position = 'fixed';
        el.style.left = rect.left + 'px';
        el.style.top = rect.top + 'px';
        el.style.width = rect.width + 'px';
        el.style.margin = '0';
        el.style.transition = 'none'; // Disable CSS transitions for physics
        
        // Random horizontal push + Physics props
        gravityElements.push({
            element: el,
            vx: (Math.random() - 0.5) * 4, // Random horizontal velocity
            vy: 0,                         // Start stationary vertical
            bounciness: Math.random() * 0.5 + 0.3 // Random bounce factor
        });
    });

    // Physics Loop
    gravityInterval = setInterval(() => {
        gravityElements.forEach(obj => {
            // Apply Gravity
            obj.vy += 0.5; 
            
            // Get current pos
            let top = parseFloat(obj.element.style.top);
            let left = parseFloat(obj.element.style.left);
            
            // Move
            top += obj.vy;
            left += obj.vx;
            
            // Floor Collision (Window Bottom)
            if (top + obj.element.offsetHeight > window.innerHeight) {
                top = window.innerHeight - obj.element.offsetHeight;
                obj.vy *= -obj.bounciness; // Bounce
                obj.vx *= 0.95; // Friction
                
                // Stop small jitters
                if (Math.abs(obj.vy) < 1) obj.vy = 0;
            }

            // Wall Collision
            if (left < 0 || left + obj.element.offsetWidth > window.innerWidth) {
                obj.vx *= -1; // Bounce off walls
                if(left < 0) left = 0;
                else left = window.innerWidth - obj.element.offsetWidth;
            }

            // Apply
            obj.element.style.top = top + 'px';
            obj.element.style.left = left + 'px';
            
            // Fun rotation based on velocity
            obj.element.style.transform = `rotate(${obj.vx * 2}deg)`;
        });
    }, 16); // ~60fps

    console.log("%c GRAVITY ENABLED. GOODBYE LAYOUT. ", "background: red; color: white; font-size: 14px;");
}

// =========================================
// 14. S.A.M. ARTIFICIAL INTELLIGENCE LOGIC
// =========================================
function processAiQuery(input) {
    const text = input.toLowerCase();
    let response = "";
    let delay = 600; // Simulated thinking time
    let action = null;

    // --- LOGIC BRAIN ---
    
    // 1. GREETINGS
    if (text.includes("hello") || text.includes("hi ") || text.trim() === "hi") {
        response = "Greetings. I am S.A.M., the system guardian. How can I assist?";
    }
    
    // 2. IDENTITY
    else if (text.includes("who are you") || text.includes("what are you")) {
        response = "I am a simulated intelligence running on Swayam's portfolio. I control the interface logic.";
    }
    else if (text.includes("who is tanishq")) {
        response = "Tanishq is a backchod boy leave in bhopal and  Creative Developer based in India. He specializes in React, MongoDB, and breaking the laws of physics on the web.";
    }
    
    // 3. COMMAND TRIGGERS (NATURAL LANGUAGE)
    else if (text.includes("destroy") || text.includes("collapse") || text.includes("fall")) {
        response = "Initiating structural collapse sequence...";
        action = () => initGravity(); // Triggers your Gravity function
    }
    else if (text.includes("dark") || text.includes("light") || text.includes("blackout")) {
        response = "Toggling lighting systems...";
        action = () => window.toggleBlackout(); // Triggers your Flashlight function
    }
    else if (text.includes("matrix") || text.includes("hack")) {
        response = "Injecting code into the mainframe...";
        action = () => {
             if(window.toggleMatrix) window.toggleMatrix(true);
        };
    }
    else if (text.includes("blueprint")) {
        response = "Switching to architectural view.";
        action = () => document.body.className = "theme-blueprint";
    }
    
    // 4. NAVIGATION
    else if (text.includes("project") || text.includes("work")) {
        response = "Navigating to project sector.";
        action = () => window.location.href = "#work";
    }
    else if (text.includes("contact") || text.includes("email")) {
        response = "Opening communication channels.";
        action = () => window.location.href = "#contact";
    }

    // 5. EXIT
    else if (text === "exit" || text === "quit" || text === "bye") {
        response = "Terminating session. Returning to standard terminal.";
        isAiMode = false;
    }

    // 6. FALLBACK (UNKNOWN)
    else {
        const fallbacks = [
            "Processing... I do not understand that query.",
            "My database is limited. Ask about Tanishq, or try 'destroy site'.",
            "Syntax Error. Please rephrase.",
            "I am programmed to code, not to chat about the weather."
        ];
        response = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    // --- SIMULATE TYPING EFFECT ---
    // Create a loading line first
    const loadingId = "ai-loading-" + Date.now();
    printOutput(`<span id="${loadingId}" style="color: #0f0">S.A.M. ></span> Thinking...`, true);

    setTimeout(() => {
        // Remove "Thinking..." and replace with actual response
        const loader = document.getElementById(loadingId);
        if(loader) loader.parentElement.remove(); // Remove the thinking line
        
        // Type out the response character by character
        const line = document.createElement("div");
        line.innerHTML = `<span style="color: #0f0">S.A.M. ></span> `;
        cmdOutput.appendChild(line);

        let i = 0;
        const typeInterval = setInterval(() => {
            line.innerHTML += response.charAt(i);
            cmdOutput.scrollTop = cmdOutput.scrollHeight;
            i++;
            if (i >= response.length) {
                clearInterval(typeInterval);
                // Execute any attached action after talking
                if (action) {
                    setTimeout(action, 500);
                }
            }
        }, 30); // Typing speed

    }, delay);
}