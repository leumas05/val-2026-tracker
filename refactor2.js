const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf-8');

// Ersätt hela logiken kring pill-skapandet i renderData
const startStr = "const leftList = document.getElementById('sortable-left');";
const endStr = "updateBlockStats();\n        }";

const startIndex = c.indexOf(startStr);
const endIndex = c.indexOf(endStr) + endStr.length;

const replacement = `const leftList = document.getElementById('sortable-left');
            const rightList = document.getElementById('sortable-right');
            const noMandateList = document.getElementById('no-mandate-list');
            
            // Standard för regeringsblocket
            const leftDefaults = ['Moderaterna', 'Sverigedemokraterna', 'Liberalerna', 'Kristdemokraterna'];
            
            Object.keys(parties).forEach(p => {
                const data = parties[p];
                let pill = document.querySelector(\`.party-drag-item[data-party="\${p}"]\`);
                
                if (!pill) {
                    pill = document.createElement('div');
                    pill.className = 'party-drag-item';
                    pill.dataset.party = p;
                    pill.style.backgroundColor = partyColors[p] || '#444';
                    pill.style.color = 'white';
                    pill.style.padding = '8px';
                    pill.style.marginBottom = '5px';
                    pill.style.borderRadius = '4px';
                    pill.style.fontWeight = 'bold';
                    pill.style.textShadow = '1px 1px 2px rgba(0,0,0,0.5)';
                    pill.innerText = getShortName(p);
                }
                
                pill.style.display = 'block';
                
                if (data.mandates === 0) {
                    pill.style.cursor = 'default';
                    if (pill.parentElement !== noMandateList) {
                        noMandateList.appendChild(pill);
                    }
                } else {
                    pill.style.cursor = 'grab';
                    if (!pill.parentElement || pill.parentElement === noMandateList) {
                        if (leftDefaults.includes(p)) {
                            leftList.appendChild(pill);
                        } else {
                            rightList.appendChild(pill);
                        }
                    }
                }
            });

            Array.from(document.querySelectorAll('.party-drag-item')).forEach(pill => {
                if (!parties[pill.dataset.party]) {
                    pill.style.display = 'none';
                }
            });

            updateBlockStats();
        }`;

c = c.substring(0, startIndex) + replacement + c.substring(endIndex);

// Ersätt drawVisualizations logiken
c = c.replace(
    `const parties = window.APP_PARTIES;
            
            // Ordna från vänster till höger i sliden
            const leftToRightOrder = [...leftParties, ...rightParties.slice().reverse()];`,
    `const parties = window.APP_PARTIES;
            
            // Partier utan mandat visas i mitten
            const middleParties = Object.keys(parties).filter(p => !leftParties.includes(p) && !rightParties.includes(p));
            
            // Ordna från vänster till höger i sliden
            const leftToRightOrder = [...leftParties, ...middleParties, ...rightParties.slice().reverse()];`
);

fs.writeFileSync('index.html', c);
