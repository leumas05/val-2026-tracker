import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Add Sortable.js
html = html.replace(
    '<!-- Chart.js för riksdagsgraf -->\n    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>',
    '<!-- Chart.js för riksdagsgraf -->\n    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>\n    <!-- Sortable.js för drag and drop -->\n    <script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>'
)

# 2. Update HTML Blocks
old_blocks = """        <div class="section">
            <h2>Blocken</h2>
            <div class="blocks-container">
                <div class="block-card red">
                    <h3>S + V + C + MP</h3>
                    <p id="left-block-votes">0</p>
                    <small>röster</small>
                    <p id="left-block-mandates" style="font-size: 1.2rem; color: #bbb; margin-top: 10px;">0 mandat</p>
                </div>
                <div class="block-card blue">
                    <h3>M + SD + KD + L</h3>
                    <p id="right-block-votes">0</p>
                    <small>röster</small>
                    <p id="right-block-mandates" style="font-size: 1.2rem; color: #bbb; margin-top: 10px;">0 mandat</p>
                </div>
            </div>

            <div class="diff-card">
                <h3>Skillnad</h3>
                <p id="diff-votes">0</p>
                <p style="font-size: 1.2rem; margin-top: 5px; font-weight: normal;" id="diff-text"></p>
            </div>
        </div>"""

new_blocks = """        <div class="section">
            <h2>Bygg din egna regering</h2>
            <p style="text-align: center; color: #bbb; margin-bottom: 20px;">Dra och släpp partierna mellan blocken för att se hur maktfördelningen förändras i realtid!</p>
            <div class="blocks-container">
                <div class="block-card red" style="border-top-color: #3498db;">
                    <h3 id="left-block-title">Regering</h3>
                    <p id="left-block-votes">0</p>
                    <small>röster</small>
                    <p id="left-block-mandates" style="font-size: 1.2rem; color: #bbb; margin-top: 10px;">0 mandat</p>
                    <div id="sortable-left" class="sortable-list" style="margin-top: 15px; min-height: 60px; background: #121212; padding: 10px; border-radius: 8px;"></div>
                </div>

                <div class="block-card grey" style="border-top-color: #555; flex: 0.6; min-width: 150px;">
                    <h3 style="font-size: 1.1rem; color: #bbb;">Utan mandat</h3>
                    <div id="no-mandate-list" style="margin-top: 15px; min-height: 60px; background: #121212; padding: 10px; border-radius: 8px; display: flex; flex-direction: column; gap: 5px;"></div>
                </div>

                <div class="block-card blue" style="border-top-color: #e74c3c;">
                    <h3 id="right-block-title">Opposition</h3>
                    <p id="right-block-votes">0</p>
                    <small>röster</small>
                    <p id="right-block-mandates" style="font-size: 1.2rem; color: #bbb; margin-top: 10px;">0 mandat</p>
                    <div id="sortable-right" class="sortable-list" style="margin-top: 15px; min-height: 60px; background: #121212; padding: 10px; border-radius: 8px;"></div>
                </div>
            </div>

            <div class="diff-card">
                <h3>Skillnad mellan Regering och Opposition</h3>
                <p id="diff-votes">0</p>
                <p style="font-size: 1.2rem; margin-top: 5px; font-weight: normal;" id="diff-text"></p>
            </div>
        </div>"""

html = html.replace(old_blocks, new_blocks)

# 3. Replace the old renderData & drawVisualizations with the interactive ones!
# We want to replace from "function renderData(parties) {" until the end of drawVisualizations (right before </script>\n</body>)
match = re.search(r'function renderData\(parties\) \{.*?(?=</script>\s*</body>)', html, re.DOTALL)

js_new = """function getShortName(p) {
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
                let mandateText = mandates > 0 ? `<p style="font-size: 1rem; color: #bbb; font-weight: normal; margin-top: 5px;">${mandates} mandat</p>` : '';
                card.innerHTML = `
                    <h3 style="color: ${partyColors[name]}">${name}</h3>
                    <p>${formatNumber(votes)} <span style="font-size: 0.9em; color: #999;">(${percent})</span></p>
                    ${mandateText}
                `;
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
            
            // Standard för regeringsblocket
            const leftDefaults = ['Moderaterna', 'Sverigedemokraterna', 'Liberalerna', 'Kristdemokraterna'];
            
            Object.keys(parties).forEach(p => {
                const data = parties[p];
                let pill = document.querySelector(`.party-drag-item[data-party="${p}"]`);
                
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
                    // Endast tilldela om den ligger i 'utan mandat' eller inte är kopplad alls
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
            
            document.getElementById('left-block-votes').innerHTML = `${formatNumber(leftSum)} <span style="font-size: 0.8em; color: #999;">(${leftPercent})</span>`;
            document.getElementById('right-block-votes').innerHTML = `${formatNumber(rightSum)} <span style="font-size: 0.8em; color: #999;">(${rightPercent})</span>`;
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
            
            // Partier utan mandat visas i mitten
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
"""

html = html[:match.start()] + js_new + html[match.end():]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
