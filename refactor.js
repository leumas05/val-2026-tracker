const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf-8');

c = c.replace(
    `<div class="block-card blue" style="border-top-color: #95a5a6;">
                    <h3 id="right-block-title">Övriga (Opposition)</h3>`,
    `<div class="block-card grey" style="border-top-color: #555; flex: 0.6; min-width: 150px;">
                    <h3 style="font-size: 1.1rem; color: #bbb;">Utan mandat</h3>
                    <div id="no-mandate-list" style="margin-top: 15px; min-height: 60px; background: #121212; padding: 10px; border-radius: 8px; display: flex; flex-direction: column; gap: 5px;"></div>
                </div>

                <div class="block-card blue" style="border-top-color: #e74c3c;">
                    <h3 id="right-block-title">Opposition</h3>`
);
fs.writeFileSync('index.html', c);
