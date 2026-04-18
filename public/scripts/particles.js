// particles.js - Subtle floating particle background animation
(function() {
  'use strict';

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    return; // Exit early if user prefers reduced motion
  }

  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;

  // Configuration - tune these values
  const CONFIG = {
    particleCount: 50,        // Number of particles (30-80 recommended)
    minSize: 2,               // Minimum particle radius (px)
    maxSize: 4,               // Maximum particle radius (px)
    minSpeed: 0.1,            // Minimum drift speed (px per frame)
    maxSpeed: 0.3,            // Maximum drift speed (px per frame)
    minOpacity: 0.2,          // Minimum opacity (0-1)
    maxOpacity: 0.5,          // Maximum opacity (0-1)
    color: '#00d4ff',         // Particle color (matches your accent)
    connectDistance: 120,     // Distance to draw connecting lines (0 = none)
    lineOpacity: 0.15,        // Opacity of connecting lines
  };

  // Resize canvas to fill window
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  // Particle class
  class Particle {
    constructor() {
      this.reset();
      // Randomize initial position
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * (CONFIG.maxSpeed - CONFIG.minSpeed) + CONFIG.minSpeed;
      this.vy = (Math.random() - 0.5) * (CONFIG.maxSpeed - CONFIG.minSpeed) + CONFIG.minSpeed;
      this.radius = Math.random() * (CONFIG.maxSize - CONFIG.minSize) + CONFIG.minSize;
      this.opacity = Math.random() * (CONFIG.maxOpacity - CONFIG.minOpacity) + CONFIG.minOpacity;
    }

    update() {
      // Move particle
      this.x += this.vx;
      this.y += this.vy;

      // Wrap around screen edges
      if (this.x < -10) this.x = canvas.width + 10;
      if (this.x > canvas.width + 10) this.x = -10;
      if (this.y < -10) this.y = canvas.height + 10;
      if (this.y > canvas.height + 10) this.y = -10;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = hexToRGBA(CONFIG.color, this.opacity);
      ctx.fill();
    }
  }

  // Convert hex color to rgba
  function hexToRGBA(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Draw connecting lines between nearby particles
  function drawConnections() {
    if (CONFIG.connectDistance === 0) return;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < CONFIG.connectDistance) {
          const opacity = (1 - distance / CONFIG.connectDistance) * CONFIG.lineOpacity;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = hexToRGBA(CONFIG.color, opacity);
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particles.forEach(particle => {
      particle.update();
      particle.draw();
    });

    // Draw connections
    drawConnections();

    animationId = requestAnimationFrame(animate);
  }

  // Initialize
  function init() {
    resizeCanvas();
    
    // Create particles
    particles = [];
    for (let i = 0; i < CONFIG.particleCount; i++) {
      particles.push(new Particle());
    }

    // Start animation
    animate();
  }

  // Handle window resize
  window.addEventListener('resize', () => {
    resizeCanvas();
    // Reinitialize particles on significant resize
    if (Math.abs(canvas.width - window.innerWidth) > 100) {
      particles.forEach(p => p.reset());
    }
  });

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  });
})();
