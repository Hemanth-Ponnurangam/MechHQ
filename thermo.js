function renderThermo(container) {
    // 1. Inject the HTML UI
    container.innerHTML = `
        <div class="module-content">
            <h2>Thermodynamics: Ideal Otto Cycle</h2>
            <p>Analyze the air-standard cycle for spark-ignition engines.</p>
            
            <div style="display: flex; flex-wrap: wrap; gap: 20px; margin-top: 20px;">
                <!-- Controls -->
                <div style="flex: 1; min-width: 300px; background: #111; padding: 20px; border-radius: 8px; border: 1px solid #333;">
                    <label>Compression Ratio (r): <span id="r-val" style="color: var(--accent);">10</span></label>
                    <input type="range" id="r-slider" min="8" max="14" step="0.1" value="10" style="width: 100%; margin-bottom: 15px;">
                    
                    <label>Heat Added q_in (kJ/kg): <span id="qin-val" style="color: var(--accent);">800</span></label>
                    <input type="range" id="qin-slider" min="500" max="2000" step="50" value="800" style="width: 100%; margin-bottom: 15px;">
                    
                    <label>Initial Temp T1 (K): <span id="t1-val" style="color: var(--accent);">300</span></label>
                    <input type="range" id="t1-slider" min="250" max="400" step="10" value="300" style="width: 100%; margin-bottom: 15px;">

                    <div style="margin-top: 20px; padding: 15px; background: #000; border-left: 4px solid var(--accent);">
                        <h3 style="margin-top: 0; color: #aaa;">Results</h3>
                        <p>Thermal Efficiency (η): <strong id="eff-out" style="color: #fff; font-size: 1.2em;">0%</strong></p>
                        <p>Peak Pressure (P3): <strong id="p3-out" style="color: #fff;">0 kPa</strong></p>
                        <p>Peak Temp (T3): <strong id="t3-out" style="color: #fff;">0 K</strong></p>
                    </div>
                </div>

                <!-- Native Canvas Graph -->
                <div style="flex: 2; min-width: 300px; background: #111; padding: 20px; border-radius: 8px; border: 1px solid #333; display: flex; flex-direction: column; align-items: center;">
                    <h3 style="margin-top: 0; color: #888;">P-V Diagram</h3>
                    <canvas id="pv-canvas" width="500" height="400" style="max-width: 100%; background: #050505; border: 1px solid #222; border-radius: 4px;"></canvas>
                </div>
            </div>
        </div>
    `;

    // 2. Constants for Air
    const gamma = 1.4;
    const Cv = 0.718; // kJ/kgK
    const P1 = 100; // kPa

    // 3. DOM Elements
    const rSlider = document.getElementById('r-slider');
    const qinSlider = document.getElementById('qin-slider');
    const t1Slider = document.getElementById('t1-slider');
    const canvas = document.getElementById('pv-canvas');
    const ctx = canvas.getContext('2d');

    // 4. Main Calculation & Drawing Function
    function updateCycle() {
        const r = parseFloat(rSlider.value);
        const qin = parseFloat(qinSlider.value);
        const T1 = parseFloat(t1Slider.value);

        // Update Labels
        document.getElementById('r-val').innerText = r;
        document.getElementById('qin-val').innerText = qin;
        document.getElementById('t1-val').innerText = T1;

        // --- THERMO MATH ---
        const V1 = 1; // Normalized max volume
        const V2 = V1 / r;
        
        // State 2 (Isentropic Compression)
        const P2 = P1 * Math.pow(r, gamma);
        const T2 = T1 * Math.pow(r, gamma - 1);
        
        // State 3 (Isochoric Heat Addition)
        const T3 = T2 + (qin / Cv);
        const P3 = P2 * (T3 / T2);
        const V3 = V2;
        
        // State 4 (Isentropic Expansion)
        const V4 = V1;
        const P4 = P3 * Math.pow((1/r), gamma);

        // Efficiency Equation
        const efficiency = (1 - (1 / Math.pow(r, gamma - 1))) * 100;

        // Update UI Outputs
        document.getElementById('eff-out').innerText = efficiency.toFixed(1) + '%';
        document.getElementById('p3-out').innerText = Math.round(P3).toLocaleString() + ' kPa';
        document.getElementById('t3-out').innerText = Math.round(T3).toLocaleString() + ' K';

        // --- DRAWING THE P-V DIAGRAM ON CANVAS ---
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Margins and scaling
        const margin = 40;
        const width = canvas.width - margin * 2;
        const height = canvas.height - margin * 2;
        
        // Max values for scaling (dynamically pad top by 10%)
        const maxP = P3 * 1.1; 
        const maxV = V1 * 1.1;

        function getX(v) { return margin + (v / maxV) * width; }
        function getY(p) { return canvas.height - margin - (p / maxP) * height; }

        // Draw Axes
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(margin, margin / 2);
        ctx.lineTo(margin, canvas.height - margin);
        ctx.lineTo(canvas.width - margin / 2, canvas.height - margin);
        ctx.stroke();

        // Axis Labels
        ctx.fillStyle = '#888';
        ctx.font = "14px sans-serif";
        ctx.fillText("Volume (V)", canvas.width / 2, canvas.height - 10);
        ctx.save();
        ctx.translate(15, canvas.height / 2 + 40);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText("Pressure (P)", 0, 0);
        ctx.restore();

        // Draw The Cycle Data
        ctx.strokeStyle = '#00ffcc'; // Teal accent
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.beginPath();

        // Curve 1 -> 2: Compression (P*V^gamma = C)
        ctx.moveTo(getX(V1), getY(P1));
        for (let v = V1; v >= V2; v -= 0.01) {
            let p = P1 * Math.pow((V1 / v), gamma);
            ctx.lineTo(getX(v), getY(p));
        }

        // Line 2 -> 3: Heat Addition (Constant V)
        ctx.lineTo(getX(V3), getY(P3));

        // Curve 3 -> 4: Expansion (P*V^gamma = C)
        for (let v = V3; v <= V4; v += 0.01) {
            let p = P3 * Math.pow((V3 / v), gamma);
            ctx.lineTo(getX(v), getY(p));
        }

        // Line 4 -> 1: Heat Rejection (Constant V)
        ctx.lineTo(getX(V1), getY(P1));
        
        ctx.stroke();
        
        // Fill the area under the curve
        ctx.fillStyle = 'rgba(0, 255, 204, 0.1)';
        ctx.fill();

        // Draw State Points (1, 2, 3, 4)
        ctx.fillStyle = '#fff';
        const points = [[V1, P1, "1"], [V2, P2, "2"], [V3, P3, "3"], [V4, P4, "4"]];
        points.forEach(pt => {
            ctx.beginPath();
            ctx.arc(getX(pt[0]), getY(pt[1]), 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillText(pt[2], getX(pt[0]) + 10, getY(pt[1]) - 10);
        });
    }

    // 5. Event Listeners for real-time interaction
    rSlider.addEventListener('input', updateCycle);
    qinSlider.addEventListener('input', updateCycle);
    t1Slider.addEventListener('input', updateCycle);

    // Initial Render
    updateCycle();
}
