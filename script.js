const API_KEY = "a71b657df07c1226730daac45d849043";

        const btnBusca = document.getElementById('btn-busca');
        const inputCidade = document.getElementById('input-cidade');
        const container = document.getElementById('container-clima');
        const bodyApp = document.getElementById('body-app');
        const iconContainer = document.getElementById('icon-container');

        const iconSol = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-yellow-300"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
        const iconLua = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

        const coresClima = {
            Limpo: 'bg-orange-400',
            Nuvens: 'bg-slate-500',
            Chuva: 'bg-blue-800',
            Tempestade: 'bg-zinc-900',
            Chuvisco: 'bg-cyan-700',
            Neve: 'bg-sky-200',
            Default: 'bg-sky-500' 
        };

        let currentCondition = 'Default';

        if(localStorage.getItem('theme') === 'dark') {
            bodyApp.classList.add('dark-mode');
        }
        updateIcon();
        applyTheme();

        async function fetchWeather() {
            const cidade = inputCidade.value.trim();
            if (!cidade) return;

            btnBusca.innerHTML = '<div class="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>';

            try {
                const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cidade)}&units=metric&lang=pt_br&appid=${API_KEY}`;
                const response = await fetch(url);
                const data = await response.json();

                if (data.cod !== 200) {
                    alert("❌ Cidade não encontrada.");
                    resetBtn();
                    return;
                }

                const urlForecast = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cidade)}&units=metric&lang=pt_br&appid=${API_KEY}`;
                const resForecast = await fetch(urlForecast);
                const dataForecast = await resForecast.json();

                updateUI(data, dataForecast);

            } catch (err) {
                console.error(err);
                alert("Erro de conexão.");
            } finally {
                resetBtn();
            }
        }

        function resetBtn() {
            const isMobile = window.innerWidth < 768;
            btnBusca.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg> <span class="md:hidden ml-2 font-bold">Buscar</span>`;
        }

        function updateUI(current, forecast) {
            container.classList.remove('hidden');
            
            document.getElementById('cidade-nome').innerText = current.name;
            document.getElementById('pais-nome').innerText = current.sys.country;
            document.getElementById('temp-valor').innerText = `${Math.round(current.main.temp)}°C`;
            document.getElementById('clima-desc').innerText = current.weather[0].description;
            document.getElementById('clima-icon').src = `https://openweathermap.org/img/wn/${current.weather[0].icon}@4x.png`;

            const condicaoAPI = current.weather[0].main;
            currentCondition = coresClima[condicaoAPI] ? condicaoAPI : 'Default';
            applyTheme();

            const sug = document.getElementById('sugestao-frase');
            if (condicaoAPI === 'Chuva' || condicaoAPI === 'Chuvisco') sug.innerText = "☔ Leve o guarda-chuva.";
            else if (condicaoAPI === 'Tempestade') sug.innerText = "⛈️ Tempestade! Cuidado.";
            else if (current.main.temp > 30) sug.innerText = "🔥 Calorão! Beba água.";
            else if (current.main.temp < 15) sug.innerText = "❄️ Está frio, se agasalhe.";
            else sug.innerText = "✨ Clima bom para sair.";

            const grid = document.getElementById('forecast-grid');
            grid.innerHTML = '';
            
            const list = forecast.list.filter(item => item.dt_txt.includes("12:00:00")).slice(0, 4);

            list.forEach(item => {
                const dia = new Date(item.dt * 1000).toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
                grid.innerHTML += `
                    <div class="glass p-3 md:p-4 rounded-xl flex flex-col items-center text-white hover:bg-white/10 transition-colors">
                        <span class="font-bold uppercase text-xs mb-1 opacity-80">${dia}</span>
                        <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" class="w-10 h-10 md:w-12 md:h-12">
                        <span class="text-lg md:text-xl font-bold">${Math.round(item.main.temp)}°C</span>
                    </div>
                `;
            });
        }

        function applyTheme() {
            const isDark = bodyApp.classList.contains('dark-mode');
            Object.values(coresClima).forEach(classe => bodyApp.classList.remove(classe));
            
            if (!isDark) {
                const corParaAplicar = coresClima[currentCondition] || coresClima['Default'];
                bodyApp.classList.add(corParaAplicar);
            }
        }

        function updateIcon() {
            const isDark = bodyApp.classList.contains('dark-mode');
            iconContainer.innerHTML = isDark ? iconSol : iconLua;
        }

        document.getElementById('btn-tema').onclick = () => {
            bodyApp.classList.toggle('dark-mode');
            localStorage.setItem('theme', bodyApp.classList.contains('dark-mode') ? 'dark' : 'light');
            applyTheme();
            updateIcon();
        };

        btnBusca.onclick = fetchWeather;
        inputCidade.onkeypress = (e) => { if(e.key === 'Enter') fetchWeather(); };