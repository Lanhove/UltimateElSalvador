document.addEventListener('DOMContentLoaded', () => {
  loadWeather();
  loadNews();
});

function loadWeather() {
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=13.6989&longitude=-89.1914&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=America%2FEl_Salvador';
  
  fetch(url)
    .then(res => res.json())
    .then(data => {
      const current = data.current;
      const weatherDiv = document.getElementById('weather');
      weatherDiv.innerHTML = `
        <p><strong>Temperature:</strong> ${current.temperature_2m}°C (feels like ${current.apparent_temperature}°C)</p>
        <p><strong>Humidity:</strong> ${current.relative_humidity_2m}%</p>
        <p><strong>Wind:</strong> ${current.wind_speed_10m} km/h</p>
        <p><strong>Condition:</strong> ${getWeatherDescription(current.weather_code)}</p>
      `;
    })
    .catch(err => {
      document.getElementById('weather').textContent = 'Error loading weather.';
      console.error(err);
    });
}

function getWeatherDescription(code) {
  const codes = {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 51: 'Light drizzle', 61: 'Light rain', 71: 'Light snow',
    80: 'Rain showers', 95: 'Thunderstorm' // add more as needed
  };
  return codes[code] || 'Unknown';
}

function loadNews() {
  // Option A: TheNewsAPI free (replace with your key after signup)
  // const apiKey = 'YOUR_THENewsAPI_KEY_HERE';
  // const url = `https://api.thenewsapi.com/v1/news/top?api_token=${apiKey}&locale=sv&language=es,en&limit=8`;

  // Option B: NewsAPI.org (sign up free at newsapi.org)
  const apiKey = '7c40535137c54077aa96b4aff0aae0b9'; // ← put your key
  const url = `https://newsapi.org/v2/top-headlines?country=sv&apiKey=${apiKey}&pageSize=8`;
  // Or for mix en/es: `https://newsapi.org/v2/everything?q=El+Salvador+OR+Salvador&language=es,en&sortBy=publishedAt&apiKey=${apiKey}&pageSize=8`

  // Temporary placeholder if no key yet (shows dummy or use RSS)
  if (!apiKey || apiKey === 'YOUR_NEWSAPI_KEY_HERE') {
    document.getElementById('news-container').innerHTML = '<p>News loading requires free API key. Sign up at newsapi.org and replace in script.js. Meanwhile, here is placeholder.</p>';
    return;
  }

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('news-container');
      container.innerHTML = '';
      if (data.articles && data.articles.length > 0) {
        data.articles.forEach(article => {
          const div = document.createElement('div');
          div.className = 'news-item';
          div.innerHTML = `
            <h3>${article.title}</h3>
            <p>${article.description || 'No description'}</p>
            <p><small>Source: ${article.source.name} | ${new Date(article.publishedAt).toLocaleDateString()}</small></p>
            <button class="read-btn" onclick="speakNews('${article.title + '. ' + (article.description || '')}')">Read Aloud</button>
            <a href="${article.url}" target="_blank">Read full article →</a>
          `;
          container.appendChild(div);
        });
      } else {
        container.innerHTML = '<p>No news found right now.</p>';
      }
    })
    .catch(err => {
      document.getElementById('news-container').innerHTML = '<p>Error loading news. Check API key.</p>';
      console.error(err);
    });
}

function speakNews(text) {
  if (!('speechSynthesis' in window)) {
    alert("Browser doesn't support speech.");
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-ES'; // Prioritize Spanish neural; fallback to en-US

  let voices = speechSynthesis.getVoices();
  if (voices.length === 0) {
    speechSynthesis.onvoiceschanged = () => {
      voices = speechSynthesis.getVoices();
      setBestVoice(utterance, voices);
      speechSynthesis.speak(utterance);
    };
    return;
  }

  setBestVoice(utterance, voices);
  speechSynthesis.speak(utterance);
}

function setBestVoice(utterance, voices) {
  const preferred = [
    "Microsoft Helena Online (Natural)", // Spanish female neural, good for Latin America
    "Microsoft Alvaro Online (Natural)", // Spanish male
    "Google español de Estados Unidos", 
    "Microsoft Jenny Online (Natural)", // English fallback
    "Google US English"
  ];

  for (const name of preferred) {
    const voice = voices.find(v => v.name.toLowerCase().includes(name.toLowerCase()));
    if (voice) {
      utterance.voice = voice;
      console.log("Voice selected:", voice.name);
      break;
    }
  }

  utterance.rate = 1.05; // Slightly natural pace
  utterance.pitch = 1.0;
}
