/* ==========================================================================
   SKILLARA ENGINE - CORE BEHAVIORS & INTERACTIVE CANVASES
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initHeroCanvas();
  initProblemSlides();
  initTransformationCanvas();
  initRevealTriggers();
  initCapabilitiesTabs();
  initWaitlistForm();
  initTelemetryPanel();
});

/* ==========================================================================
   SECTION 1: HERO CANVAS (F1 AERODYNAMICS FLOW SIMULATOR)
   ========================================================================== */
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width, height;
  let mouse = { x: -1000, y: -1000, tx: -1000, ty: -1000, active: false };
  let flowLines = [];
  const lineCount = 35;
  const flowSpeed = 2.5;
  
  // Dynamic metrics
  const flowRateEl = document.getElementById('telemetry-flow-rate');

  function resize() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
    initLines();
  }
  
  class FlowLine {
    constructor(y) {
      this.reset(true);
      this.y = y;
    }
    
    reset(initPhase = false) {
      this.x = initPhase ? Math.random() * width : -100;
      this.points = [];
      this.historyLength = 20 + Math.random() * 20;
      this.color = Math.random() > 0.85 ? '#e30613' : 'rgba(255, 255, 255, 0.12)';
      this.thickness = this.color === '#e30613' ? 1.5 : 1;
    }
    
    update() {
      this.x += flowSpeed;
      if (this.x > width + 100) {
        this.reset();
      }
      
      // Calculate cursor aerodynamic deflection
      let currentY = this.y;
      if (mouse.active) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radius = 220; // Deflection field radius
        
        if (dist < radius) {
          const force = (radius - dist) / radius;
          // Curve airflow smoothly around cursor
          const angle = Math.atan2(dy, dx);
          currentY += Math.sin(angle) * force * 70;
        }
      }
      
      this.points.push({ x: this.x, y: currentY });
      if (this.points.length > this.historyLength) {
        this.points.shift();
      }
    }
    
    draw() {
      if (this.points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(this.points[0].x, this.points[0].y);
      for (let i = 1; i < this.points.length; i++) {
        ctx.lineTo(this.points[i].x, this.points[i].y);
      }
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.thickness;
      ctx.stroke();
    }
  }

  function initLines() {
    flowLines = [];
    const spacing = height / (lineCount + 1);
    for (let i = 1; i <= lineCount; i++) {
      flowLines.push(new FlowLine(i * spacing));
    }
  }

  // Handle Mouse interaction
  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.tx = e.clientX - rect.left;
    mouse.ty = e.clientY - rect.top;
    mouse.active = true;
    
    // Update dynamic flow readout for F1 telemetry feel
    if (flowRateEl) {
      const velocity = (flowSpeed * 100 + Math.abs(mouse.tx - mouse.x) * 1.5).toFixed(1);
      flowRateEl.textContent = `${velocity} m/s`;
    }
  });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  // Render loop
  function render() {
    ctx.clearRect(0, 0, width, height);
    
    // Smooth cursor interpolation
    mouse.x += (mouse.tx - mouse.x) * 0.1;
    mouse.y += (mouse.ty - mouse.y) * 0.1;
    
    // Telemetry crosshairs at cursor
    if (mouse.active && mouse.x > 0 && mouse.x < width) {
      ctx.strokeStyle = 'rgba(227, 6, 19, 0.15)';
      ctx.lineWidth = 0.5;
      
      // Horizontal crosshair
      ctx.beginPath();
      ctx.moveTo(0, mouse.y);
      ctx.lineTo(width, mouse.y);
      ctx.stroke();
      
      // Vertical crosshair
      ctx.beginPath();
      ctx.moveTo(mouse.x, 0);
      ctx.lineTo(mouse.x, height);
      ctx.stroke();
      
      // Crosshair coordinate labels
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.font = '8px Space Grotesk';
      ctx.fillText(`X:${Math.round(mouse.x)} Y:${Math.round(mouse.y)}`, mouse.x + 10, mouse.y - 10);
    }
    
    // Draw flows
    flowLines.forEach(line => {
      line.update();
      line.draw();
    });
    
    requestAnimationFrame(render);
  }

  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(render);
}

/* ==========================================================================
   SECTION 2: THE PROBLEM (DRAMATIC DOCK ROTATING STATEMENTS)
   ========================================================================== */
function initProblemSlides() {
  const slides = document.querySelectorAll('.problem-slide');
  const progressFill = document.getElementById('problem-progress');
  const section = document.getElementById('problem');
  if (slides.length === 0 || !section) return;
  
  let activeIndex = 0;
  let intervalId = null;
  
  function triggerSlideCycle() {
    slides.forEach((slide, idx) => {
      slide.classList.remove('active');
      if (idx === activeIndex) {
        slide.classList.add('active');
        // Trigger temporary typography glitch effect
        const text = slide.querySelector('.problem-statement');
        if (text) {
          text.setAttribute('data-text', text.textContent);
        }
      }
    });
    
    if (progressFill) {
      const progress = ((activeIndex + 1) / slides.length) * 100;
      progressFill.style.height = `${progress}%`;
    }
    
    activeIndex = (activeIndex + 1) % slides.length;
  }
  
  // Set up intersection observer to only animate when in view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        triggerSlideCycle();
        intervalId = setInterval(triggerSlideCycle, 2800);
      } else {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }
    });
  }, { threshold: 0.3 });
  
  observer.observe(section);
}

/* ==========================================================================
   SECTION 3: TRANSFORMATION CANVAS (CHAOS TO CONVERGENCE CONSTELLATION)
   ========================================================================== */
function initTransformationCanvas() {
  const canvas = document.getElementById('transformation-canvas');
  const section = document.getElementById('transformation');
  const statement = document.querySelector('.transformation-statement');
  const pctEl = document.getElementById('convergence-pct');
  
  if (!canvas || !section) return;
  const ctx = canvas.getContext('2d');
  
  let width, height;
  let nodes = [];
  const nodeCount = 55;
  let scrollProgress = 0;
  
  function resize() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
    setupConstellation();
  }
  
  class ConstellationNode {
    constructor() {
      // Ordered technical coordinate mesh
      this.targetX = width * 0.15 + Math.random() * (width * 0.7);
      this.targetY = height * 0.2 + Math.random() * (height * 0.6);
      
      // Chaotic floating coordinate
      this.driftX = Math.random() * width;
      this.driftY = Math.random() * height;
      
      // Float vector physics
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      
      this.color = Math.random() > 0.88 ? '#e30613' : '#ffffff';
    }
    
    update(progress) {
      // Drift chaos simulation
      this.driftX += this.vx;
      this.driftY += this.vy;
      
      // Wrap around canvas
      if (this.driftX < 0 || this.driftX > width) this.vx *= -1;
      if (this.driftY < 0 || this.driftY > height) this.vy *= -1;
      
      // Interpolate based on scroll depth progress
      this.x = this.driftX + (this.targetX - this.driftX) * progress;
      this.y = this.driftY + (this.targetY - this.driftY) * progress;
    }
    
    draw() {
      ctx.beginPath();
      // Enlarged nodes for high-contrast visible engineering finish
      ctx.arc(this.x, this.y, this.color === '#e30613' ? 4.5 : 2.5, 0, Math.PI * 2);
      ctx.fillStyle = this.color === '#e30613' 
        ? `rgba(227, 6, 19, ${0.55 + scrollProgress * 0.45})` 
        : `rgba(255, 255, 255, ${0.45 + scrollProgress * 0.55})`;
      ctx.fill();
    }
  }
  
  function setupConstellation() {
    nodes = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push(new ConstellationNode());
    }
  }
  
  // Track scroll depth across Section 3
  window.addEventListener('scroll', () => {
    const rect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // Calculate how much of Section 3 is visible/scrolled
    if (rect.top <= viewportHeight && rect.bottom >= 0) {
      const totalRange = rect.height + viewportHeight;
      const scrolled = viewportHeight - rect.top;
      let rawProgress = scrolled / totalRange;
      
      // Compress and clamp to make transformation feel immediate and punchy
      let pct = (rawProgress - 0.2) * 1.8;
      scrollProgress = Math.max(0, Math.min(1, pct));
      
      // Update text UI convergence status
      if (pctEl) {
        pctEl.textContent = `${Math.round(scrollProgress * 100)}%`;
      }
      
      if (scrollProgress > 0.6) {
        statement.classList.add('visible');
      } else {
        statement.classList.remove('visible');
      }
    }
  });

  // Render loop
  function render() {
    ctx.clearRect(0, 0, width, height);
    
    // Draw alignment grids as coordinates locked to convergence
    if (scrollProgress > 0.3) {
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.09 * scrollProgress})`; // increased grid line visibility
      ctx.lineWidth = 0.85;
      
      // Grid boxes
      const gridCount = 8;
      for (let i = 1; i < gridCount; i++) {
        // Horizontals
        ctx.beginPath();
        ctx.moveTo(0, (height / gridCount) * i);
        ctx.lineTo(width, (height / gridCount) * i);
        ctx.stroke();
        
        // Verticals
        ctx.beginPath();
        ctx.moveTo((width / gridCount) * i, 0);
        ctx.lineTo((width / gridCount) * i, height);
        ctx.stroke();
      }
    }
    
    // Update & draw nodes
    nodes.forEach(node => {
      node.update(scrollProgress);
      node.draw();
    });
    
    // Draw connection lines. At high progress, connect adjacent nodes.
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Max connection distance decreases as we converge to keep constellation organized
        const maxDist = 90 + (1 - scrollProgress) * 50;
        if (dist < maxDist) {
          // Significantly higher opacities and line thicknesses for absolute high-tech precision visibility
          ctx.strokeStyle = nodes[i].color === '#e30613' || nodes[j].color === '#e30613'
            ? `rgba(227, 6, 19, ${(0.62 - dist / maxDist) * scrollProgress})`
            : `rgba(255, 255, 255, ${(0.32 - dist / maxDist) * scrollProgress})`;
          
          ctx.lineWidth = nodes[i].color === '#e30613' || nodes[j].color === '#e30613' ? 1.25 : 0.85;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }
    
    requestAnimationFrame(render);
  }
  
  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(render);
}

/* ==========================================================================
   SECTION 4: SKILLARA REVEAL TYPOGRAPHIC TRIGGER
   ========================================================================== */
function initRevealTriggers() {
  const revealSection = document.getElementById('reveal');
  const revealItems = document.querySelectorAll('.reveal-item');
  const revealDesc = document.querySelector('.reveal-desc');
  
  if (!revealSection) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        revealItems.forEach((item, index) => {
          setTimeout(() => {
            item.classList.add('visible');
          }, index * 300);
        });
        
        if (revealDesc) {
          revealDesc.classList.add('visible');
        }
      }
    });
  }, { threshold: 0.3 });
  
  observer.observe(revealSection);
}

/* ==========================================================================
   SECTION 5: CAPABILITIES MODULE SWITCHER
   ========================================================================== */
function initCapabilitiesTabs() {
  const tabs = document.querySelectorAll('.cap-tab');
  const panels = document.querySelectorAll('.capability-panel');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-target');
      
      // Set active tab status
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Switch active panels
      panels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === target) {
          panel.classList.add('active');
          // Re-trigger visual animations inside panels
          triggerPanelAnimation(panel);
        }
      });
    });
  });
  
  function triggerPanelAnimation(panel) {
    // Dynamic resets for canvas SVG vectors
    const barGraph = panel.querySelector('.telemetry-bar-graph');
    if (barGraph) {
      const bars = barGraph.querySelectorAll('.graph-bar');
      bars.forEach(bar => {
        const val = bar.style.getPropertyValue('--val');
        bar.style.height = '0%';
        setTimeout(() => {
          bar.style.height = val;
        }, 100);
      });
    }
  }
}

/* ==========================================================================
   SECTION 6: EXCLUSIVITY TERMINAL SUBMISSIONS & INTEGRATION
   ========================================================================== */
function initWaitlistForm() {
  const form = document.getElementById('waitlist-form');
  const submitBtn = document.getElementById('submit-btn');
  const btnText = submitBtn ? submitBtn.querySelector('.btn-submit-text') : null;
  const btnLoading = submitBtn ? submitBtn.querySelector('.btn-submit-loading') : null;
  const messageEl = document.getElementById('form-message');
  
  // Terminal slide-in transition observer
  const section = document.getElementById('exclusivity');
  const terminal = document.querySelector('.glass-terminal');
  if (section && terminal) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          terminal.classList.add('visible');
        }
      });
    }, { threshold: 0.2 });
    observer.observe(section);
  }
  
  if (!form || !submitBtn) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name') ? document.getElementById('name').value.trim() : '';
    const email = document.getElementById('email').value.trim();
    const college = document.getElementById('college').value.trim();
    const interest = document.getElementById('interest') ? document.getElementById('interest').value : '';
    
    // Visual processing state
    submitBtn.disabled = true;
    if (btnText && btnLoading) {
      btnText.classList.add('hidden');
      btnLoading.classList.remove('hidden');
    }
    
    // Clear old status indicators
    if (messageEl) {
      messageEl.className = 'form-feedback hidden';
      messageEl.textContent = '';
    }
    
    try {
      const { data, error } = await window.supabase
        .from('waitlist')
        .insert([{ name, email, college, interest }])
        .select();

      if (error) {
        messageEl.className = 'form-feedback error';
        if (error.code === '23505') {
          messageEl.textContent = 'DUPLICATE_NODE: Email already exists in the system.';
        } else {
          messageEl.textContent = error.message || 'TRANSMISSION_FAILED: System validation reject.';
        }
      } else {
        const nodeId = `SKL-${String(data[0].id).padStart(4, '0')}`;
        const queuePosition = data[0].id;

        messageEl.className = 'form-feedback success';
        messageEl.innerHTML = `TRANSMISSION_COMPLETE: Node registered.<br>POSITION: <span class="red-accent">${queuePosition}</span> // ID: <span class="red-accent">${nodeId}</span>`;

        form.reset();

        const panel = document.getElementById('telemetry-panel');
        if (panel) {
          setTimeout(() => {
            panel.classList.add('open');
            if (window.fetchTelemetry) {
              window.fetchTelemetry();
            }
          }, 800);
        }
      }
    } catch (error) {
      console.error('Waitlist submission failed:', error);
      messageEl.className = 'form-feedback error';
      messageEl.textContent = error?.message || 'SYSTEM_FAULT: Connection timeout. Node failed to link.';
    } finally {
      // Restore submit button
      submitBtn.disabled = false;
      if (btnText && btnLoading) {
        btnText.classList.remove('hidden');
        btnLoading.classList.add('hidden');
      }
    }
  });
}

/* ==========================================================================
   LIVE TELEMETRY PANEL DRAWER SYSTEM (ADMIN TELEMETRY OVERLAY)
   ========================================================================== */
function initTelemetryPanel() {
  const panel = document.getElementById('telemetry-panel');
  const toggleBtn = document.getElementById('toggle-telemetry');
  const closeBtn = document.getElementById('close-telemetry');
  
  if (!panel) return;
  
  // Elements inside Telemetry overlay
  const totalCountEl = document.getElementById('tel-total-queue');
  const fillBarEl = document.getElementById('tel-bar-fill');
  const topCollegesEl = document.getElementById('tel-top-universities');
  const recentFeedEl = document.getElementById('tel-recent-feed');
  
  // Specification readouts
  const specPingEl = document.getElementById('tel-spec-ping');
  const specSignalEl = document.getElementById('tel-spec-signal');
  const specTimeEl = document.getElementById('tel-spec-time');
  
  let pollingInterval = null;
  
  function openPanel() {
    panel.classList.add('open');
    fetchTelemetry();
    // Poll telemetry data every 5 seconds while open
    if (!pollingInterval) {
      pollingInterval = setInterval(fetchTelemetry, 5000);
    }
  }
  
  function closePanel() {
    panel.classList.remove('open');
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  }
  
  if (toggleBtn) toggleBtn.addEventListener('click', openPanel);
  if (closeBtn) closeBtn.addEventListener('click', closePanel);
  
  // Telemetry toggler by keyboard T key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'T' || e.key === 't') {
      // Verify user is not typing in a form input
      if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (panel.classList.contains('open')) {
          closePanel();
        } else {
          openPanel();
        }
      }
    }
  });
  
  // API Fetch implementation
  async function fetchTelemetry() {
    try {
      if (!window.supabase) return;

      const startTime = performance.now();
      const totalResult = await window.supabase
        .from('waitlist')
        .select('id', { count: 'exact', head: true });
      const rowsResult = await window.supabase
        .from('waitlist')
        .select('college, timestamp')
        .order('timestamp', { ascending: false })
        .limit(10);
      const endTime = performance.now();
      const clientPing = (endTime - startTime).toFixed(1);

      if (totalResult.error) {
        console.error('Telemetry total count error:', totalResult.error);
      }

      const totalQueue = Number(totalResult.count) || 0;
      if (totalCountEl) {
        totalCountEl.textContent = String(totalQueue).padStart(4, '0');
      }

      if (fillBarEl) {
        const percentage = Math.min(100, (totalQueue / 100) * 100);
        fillBarEl.style.width = `${percentage}%`;
      }

      let rows = [];
      if (rowsResult.error) {
        console.warn('Telemetry recent rows error:', rowsResult.error);
        const fallbackResult = await window.supabase
          .from('waitlist')
          .select('college, created_at')
          .order('created_at', { ascending: false })
          .limit(10);
        if (!fallbackResult.error) {
          rows = fallbackResult.data || [];
        }
      } else {
        rows = rowsResult.data || [];
      }

      const recentNodes = rows.slice(0, 5);
      const collegeCounts = rows.reduce((acc, row) => {
        const college = (row.college || '').trim();
        if (!college) return acc;
        acc[college] = (acc[college] || 0) + 1;
        return acc;
      }, {});

      const topNodes = Object.entries(collegeCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([college, count]) => ({ college, count }));

      if (topCollegesEl) {
        if (topNodes.length === 0) {
          topCollegesEl.innerHTML = '<div class="list-item empty-state font-mono">Awaiting system signals...</div>';
        } else {
          topCollegesEl.innerHTML = topNodes.map(item => `
            <div class="tel-item">
              <span class="tel-item-name font-mono">${item.college.toUpperCase()}</span>
              <span class="tel-item-count font-mono">${item.count} NODES</span>
            </div>
          `).join('');
        }
      }

      if (recentFeedEl) {
        if (recentNodes.length === 0) {
          recentFeedEl.innerHTML = '<div class="feed-item empty-state font-mono">Stream inactive. Submit node to initialize...</div>';
        } else {
          recentFeedEl.innerHTML = recentNodes.map(node => {
            const timestamp = node.timestamp || node.created_at || null;
            const timeFormatted = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--';
            const college = node.college || 'Unknown College';
            return `
              <div class="feed-node">
                <div class="feed-node-meta">
                  <span class="feed-node-mail font-mono" style="color: var(--accent-red); font-weight: 600; text-transform: uppercase;">CONNECTION ACTIVE</span>
                  <span class="feed-node-time font-mono">${timeFormatted}</span>
                </div>
                <div class="feed-node-college font-mono" style="font-size: 11px; margin-top: 4px; color: var(--text-white);">Someone from <span class="red-accent" style="font-weight: 700;">${college}</span> joined the waitlist</div>
              </div>
            `;
          }).join('');
        }
      }

      if (specPingEl) specPingEl.textContent = `${clientPing}ms`;
      if (specSignalEl) specSignalEl.textContent = 'N/A';
      if (specTimeEl) {
        const now = new Date();
        specTimeEl.textContent = now.toTimeString().split(' ')[0];
      }

      const footerPing = document.getElementById('footer-ping');
      if (footerPing) {
        footerPing.textContent = `PING // ${clientPing}ms`;
      }
    } catch (error) {
      console.error('Failed to retrieve waitlist statistics:', error);
    }
  }
  
  // Make function available globally so form submit can trigger it
  window.fetchTelemetry = fetchTelemetry;
}
