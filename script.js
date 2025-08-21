const apiKey = "862a317858aeecd11c85060c4cbb96d2";
const apiURL = "https://api.openweathermap.org/data/2.5/weather?units=metric";
const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");

// Particle System
class Particle {
    constructor(canvas, weatherType) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.weatherType = weatherType;
        this.reset();
    }

    reset() {
        this.x = Math.random() * this.canvas.width;
        this.y = Math.random() * this.canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 2;
        this.speedY = (Math.random() - 0.5) * 2;
        this.opacity = Math.random() * 0.8 + 0.2;
        this.life = Math.random() * 100 + 50;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life--;

        // Weather-specific behavior
        switch(this.weatherType) {
            case 'rain':
                this.speedY = Math.abs(this.speedY) + 0.5;
                this.size = Math.random() * 2 + 1;
                break;
            case 'snow':
                this.speedY = Math.abs(this.speedY) + 0.3;
                this.speedX = Math.sin(this.y * 0.01) * 0.5;
                this.size = Math.random() * 4 + 2;
                break;
            case 'clouds':
                this.speedX = Math.sin(this.y * 0.005) * 0.3;
                this.speedY = Math.cos(this.x * 0.005) * 0.3;
                this.size = Math.random() * 5 + 3;
                break;
            case 'clear':
                this.speedX = Math.sin(this.y * 0.01) * 0.2;
                this.speedY = Math.cos(this.x * 0.01) * 0.2;
                this.size = Math.random() * 2 + 1;
                break;
        }

        // Wrap around edges
        if (this.x < 0) this.x = this.canvas.width;
        if (this.x > this.canvas.width) this.x = 0;
        if (this.y < 0) this.y = this.canvas.height;
        if (this.y > this.canvas.height) this.y = 0;

        // Reset particle if it's too old
        if (this.life <= 0) {
            this.reset();
        }
    }

    draw() {
        this.ctx.save();
        this.ctx.globalAlpha = this.opacity;
        
        switch(this.weatherType) {
            case 'rain':
                this.ctx.strokeStyle = '#87CEEB';
                this.ctx.lineWidth = this.size;
                this.ctx.beginPath();
                this.ctx.moveTo(this.x, this.y);
                this.ctx.lineTo(this.x, this.y + 10);
                this.ctx.stroke();
                break;
            case 'snow':
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.beginPath();
                this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                this.ctx.fill();
                break;
            case 'clouds':
                this.ctx.fillStyle = '#E6E6FA';
                this.ctx.beginPath();
                this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                this.ctx.fill();
                break;
            case 'clear':
                this.ctx.fillStyle = '#FFD700';
                this.ctx.beginPath();
                this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                this.ctx.fill();
                break;
            default:
                this.ctx.fillStyle = '#E6E6FA';
                this.ctx.beginPath();
                this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                this.ctx.fill();
        }
        
        this.ctx.restore();
    }
}

// Initialize particle system
let particles = [];
let currentWeather = 'clear';
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

function initParticles() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    particles = [];
    const particleCount = 100;
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(canvas, currentWeather));
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
    requestAnimationFrame(animateParticles);
}

function updateParticleWeather(weatherType) {
    currentWeather = weatherType;
    particles.forEach(particle => {
        particle.weatherType = weatherType;
    });
}

// Initialize particles
window.addEventListener('load', () => {
    initParticles();
    animateParticles();
});

window.addEventListener('resize', initParticles);

async function checkWeather(city) {
    try {
        const response = await fetch(`${apiURL}&q=${city}&appid=${apiKey}`);
        
        if (!response.ok) {
            throw new Error('City not found');
        }
        
        var data = await response.json();
        console.log(data);
        
        document.querySelector(".city").innerHTML = data.name;
        document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
        document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
        document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";
        
        // Update weather icon based on weather condition
        const weatherIcon = document.querySelector(".weather-icon");
        const weatherMain = data.weather[0].main.toLowerCase();
        const weatherDescription = data.weather[0].description.toLowerCase();
        
        // Debug logging
        console.log('Weather Main:', weatherMain);
        console.log('Weather Description:', weatherDescription);
        
        // Update particle weather type and weather icon
        if (weatherMain.includes('clear')) {
            weatherIcon.src = "images/clear.png";
            updateParticleWeather('clear');
            console.log('Setting icon to: clear.png');
        } else if (weatherMain.includes('cloud') || weatherDescription.includes('overcast')) {
            weatherIcon.src = "images/clouds.png";
            updateParticleWeather('clouds');
            console.log('Setting icon to: clouds.png');
        } else if (weatherMain.includes('rain') || weatherDescription.includes('rain')) {
            weatherIcon.src = "images/rain.png";
            updateParticleWeather('rain');
            console.log('Setting icon to: rain.png');
        } else if (weatherDescription.includes('drizzle') || weatherDescription.includes('light rain')) {
            weatherIcon.src = "images/drizzle.png";
            updateParticleWeather('rain');
            console.log('Setting icon to: drizzle.png');
        } else if (weatherMain.includes('snow') || weatherDescription.includes('snow')) {
            weatherIcon.src = "images/snow.png";
            updateParticleWeather('snow');
            console.log('Setting icon to: snow.png');
        } else if (weatherMain.includes('mist') || weatherMain.includes('fog') || weatherDescription.includes('mist') || weatherDescription.includes('fog')) {
            weatherIcon.src = "images/mist.png";
            updateParticleWeather('clouds');
            console.log('Setting icon to: mist.png');
        } else if (weatherMain.includes('thunderstorm')) {
            weatherIcon.src = "images/rain.png"; // Use rain image for thunderstorms
            updateParticleWeather('rain');
            console.log('Setting icon to: rain.png (thunderstorm)');
        } else {
            // Default fallback
            weatherIcon.src = "images/clouds.png";
            updateParticleWeather('clouds');
            console.log('Setting icon to: clouds.png (default)');
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('City not found. Please try again.');
    }
}

searchBtn.addEventListener("click", ()=> {
   if (searchBox.value.trim() !== '') {
       checkWeather(searchBox.value);
   }
})

// Allow Enter key to search
searchBox.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        if (searchBox.value.trim() !== '') {
            checkWeather(searchBox.value);
        }
    }
});
