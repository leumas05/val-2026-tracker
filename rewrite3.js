const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf-8');

const renderDataMatch = /function renderData\(parties\) \{[\s\S]*?(?=<\/script>\s*<\/body>)/;

const js_new = `function getShortName(p) {
            let shortName = p;
            if(p === 'Socialdemokraterna') shortName = 'S';
            else if(p === 'Sverigedemokraterna') shortName = 'SD';
            else if(p === 'Miljöpartiet') shortName = 'MP';
            else if(p === 'Centerpartiet') shortName = 'C';
            else if(p === 'Kristdemokraterna') shortName = 'KD';
            else if(p === 'Moderaterna') shortName = 'M';
            else if(p === 'Liberalerna') shortName = 'L';
            else if(p === 'Vänsterpartiet') shortName = 'V';
            else if(p === 'Övriga partier') shortName = 'ÖVR';
            else if(shortName.length > 5) shortName = shortName.substring(0, 3).toUpperCase();
            return shortName;
        }

        window.APP_PARTIES = {};
        window.SORTABLES_INIT = false;

        function renderData(parties) {
            window.APP_PARTIES = parties;
            const errorDiv = document.getElementById('error-message');
            if (Object.keys(parties).length === 0) {
                errorDiv.innerText = 'Kunde inte hitta några röster i SVT:s data.';
                errorDiv.style.display = 'block';
                return;
            }
            errorDiv.style.display = 'none';
            document.getElementById('data-section').style.display = 'block';

            const partyListDiv = document.getElementById('parties');
            partyListDiv.innerHTML = ''; 
            
            const sortedParties = Object.entries(parties).sort((a, b) => b[1].votes - a[1].votes);
            let totalVotes = 0;
            Object.values(parties).forEach(p => totalVotes += p.votes);

            sortedParties.forEach(([name, data]) => {
                const votes = data.votes;
                const mandates = data.mandates;
                const percent = ((votes / totalVotes) * 100).toFixed(1) + '%';
                const card = document.createElement('div');
                card.className = 'card';
                let mandateText = mandates > 0 ? \`<p style="font-size: 1rem; color: #bbb; font-weight: normal; margin-top: 5px;">\${mandates} mandat</p>\` : '';
                card.innerHTML = \`
                    <h3 style="color: \${partyColors[name] || '#666'}">\${name}</h3>
                    <p>\${formatNumber(votes)} <span style="font-size: 0.9em; color: #999;">(\${percent})</span></p>
                    \${mandateText}
                \`;
                partyListDiv.appendChild(card);
            });

            if (!window.SORTABLES_INIT) {
                new Sortable(document.getElementById('sortable-left'), {
                    group: 'shared',
                    animation: 150,
                    onEnd: updateBlockStats
                });
                new Sortable(document.getElementById('sortable-right'), {
                    group: 'shared',
                    animation: 150,
                    onEnd: updateBlockStats
                });
                window.SORTABLES_INIT = true;
            }

            const leftList = document.getElementById('sortable-left');
            const rightList = document.getElementById('sortable-right');
            const noMandateList = document.getElementById('no-mandate-list');
            
            // Standard för regeringsblocket (M, SD, L, KD)
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
                    // Inga mandat = Inte dragbar, sätt i "Utan mandat"
                    pill.style.cursor = 'default';
                    if (pill.parentElement !== noMandateList) {
                        noMandateList.appendChild(pill);
                    }
                } else {
                    // Har mandat = Dragbar
                    pill.style.cursor = 'grab';
                    // Endast tilldela om den ligger i 'utan mandat' (från förra kommunen) eller inte är kopplad alls
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
        }

        function updateBlockStats() {
            const parties = window.APP_PARTIES;
            if(!parties || Object.keys(parties).length === 0) return;

            const leftPartiesDOM = Array.from(document.getElementById('sortable-left').children)
                .filter(el => el.style.display !== 'none').map(el => el.dataset.party);
            const rightPartiesDOM = Array.from(document.getElementById('sortable-right').children)
                .filter(el => el.style.display !== 'none').map(el => el.dataset.party);

            let leftSum = 0, rightSum = 0;
            let leftMandates = 0, rightMandates = 0;
            let totalVotes = 0;
            Object.values(parties).forEach(p => totalVotes += p.votes);

            leftPartiesDOM.forEach(name => {
                if(parties[name]) {
                    leftSum += parties[name].votes;
                    leftMandates += parties[name].mandates;
                }
            });

            rightPartiesDOM.forEach(name => {
                if(parties[name]) {
                    rightSum += parties[name].votes;
                    rightMandates += parties[name].mandates;
                }
            });

            const leftPercent = totalVotes > 0 ? ((leftSum / totalVotes) * 100).toFixed(1) + '%' : '0%';
            const rightPercent = totalVotes > 0 ? ((rightSum / totalVotes) * 100).toFixed(1) + '%' : '0%';
            
            document.getElementById('left-block-votes').innerHTML = \`\${formatNumber(leftSum)} <span style="font-size: 0.8em; color: #999;">(\${leftPercent})</span>\`;
            document.getElementById('right-block-votes').innerHTML = \`\${formatNumber(rightSum)} <span style="font-size: 0.8em; color: #999;">(\${rightPercent})</span>\`;
            document.getElementById('left-block-mandates').innerText = leftMandates + ' mandat';
            document.getElementById('right-block-mandates').innerText = rightMandates + ' mandat';
            
            const diff = Math.abs(leftSum - rightSum);
            document.getElementById('diff-votes').innerText = formatNumber(diff) + ' röster';
            let diffText = '';
            if (leftSum > rightSum) diffText = 'Övertag för Regering';
            else if (rightSum > leftSum) diffText = 'Övertag för Opposition';
            else diffText = 'Exakt lika!';
            document.getElementById('diff-text').innerText = diffText;

            drawVisualizations(leftPartiesDOM, rightPartiesDOM);
        }

        function drawVisualizations(leftParties, rightParties) {
            const parties = window.APP_PARTIES;
            
            // Partier utan mandat (och övriga) visas i mitten!
            const middleParties = Object.keys(parties).filter(p => !leftParties.includes(p) && !rightParties.includes(p));
            
            // Ordna från vänster till höger i sliden
            const leftToRightOrder = [...leftParties, ...middleParties, ...rightParties.slice().reverse()];

            let totalVotes = 0;
            Object.values(parties).forEach(p => totalVotes += p.votes);

            const orderedData = leftToRightOrder
                .map(name => ({
                    name: name,
                    votes: parties[name] ? parties[name].votes : 0,
                    mandates: parties[name] ? parties[name].mandates : 0,
                    totalMandates: parties[name] ? parties[name].totalMandates : 349,
                    colorStr: partyColors[name] || '#444',
                    hex: partyHexColors[name] || '#444'
                }))
                .filter(p => p.votes > 0);

            // 1. Rak mandatlinje
            const mandateBar = document.getElementById('mandateBar');
            mandateBar.innerHTML = '';
            
            let totalM = 349;
            const validMandates = orderedData.filter(p => p.mandates > 0 && p.totalMandates > 0);
            if (validMandates.length > 0) {
                totalM = validMandates[0].totalMandates;
            }
            
            // Säkerställ att om alla valda partier i kommunen har 0 mandat, hantera det.
            if (totalM === 349 && orderedData.filter(p => p.mandates > 0).length === 0) {
                totalM = 0;
            }

            document.getElementById('mandate-target').innerText = Math.ceil(totalM / 2) + ' mandat';
            document.getElementById('mandate-total-text').innerText = 'Totalt ' + totalM + ' mandat';
            document.getElementById('result-total-mandates').innerText = 'Totalt ' + totalM + ' mandat';

            orderedData.filter(p => p.mandates > 0).forEach(p => {
                const percentage = (p.mandates / totalM) * 100;
                const segment = document.createElement('div');
                segment.className = 'party-segment';
                segment.style.width = percentage + '%';
                segment.style.backgroundColor = p.colorStr;
                segment.title = p.name + ': ' + p.mandates + ' mandat';
                
                if (percentage > 3) {
                    segment.innerText = getShortName(p.name);
                }
                mandateBar.appendChild(segment);
            });

            // 2. Rak röstlinje
            const votesBar = document.getElementById('votesBar');
            votesBar.innerHTML = '';
            orderedData.forEach(p => {
                const percentage = (p.votes / totalVotes) * 100;
                const segment = document.createElement('div');
                segment.className = 'party-segment';
                segment.style.width = percentage + '%';
                segment.style.backgroundColor = p.colorStr;
                segment.title = p.name + ': ' + percentage.toFixed(1) + '%';
                
                if (percentage > 3) {
                    segment.innerText = getShortName(p.name);
                }
                votesBar.appendChild(segment);
            });

            // 3. Halvcirkel Riksdags-graf (Chart.js)
            const chartDataArray = [...orderedData];
            
            if (window.parliamentChartInstance) {
                window.parliamentChartInstance.destroy();
            }

            const ctx = document.getElementById('parliamentChart').getContext('2d');
            window.parliamentChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: chartDataArray.map(p => p.name),
                    datasets: [{
                        data: chartDataArray.map(p => p.mandates),
                        backgroundColor: chartDataArray.map(p => p.hex),
                        borderColor: '#1e1e1e',
                        borderWidth: 2
                    }]
                },
                options: {
                    rotation: 270,
                    circumference: 180,
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.label + ': ' + context.raw + ' mandat';
                                }
                            }
                        }
                    }
                }
            });
        }
`;

html = html.replace(renderDataMatch, js_new);
fs.writeFileSync('index.html', html, 'utf-8');
console.log('Success');
