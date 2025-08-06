const axios = require('axios');
const { WeatherData, WeatherRecommendation, FarmAlert } = require('../models/Weather');

class WeatherService {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
  }

  /**
   * Fetch current weather and forecast for given coordinates
   */
  async fetchWeatherData(latitude, longitude) {
    try {
      const [currentResponse, forecastResponse] = await Promise.all([
        axios.get(`${this.baseUrl}/weather`, {
          params: {
            lat: latitude,
            lon: longitude,
            appid: this.apiKey,
            units: 'metric'
          }
        }),
        axios.get(`${this.baseUrl}/forecast`, {
          params: {
            lat: latitude,
            lon: longitude,
            appid: this.apiKey,
            units: 'metric',
            cnt: 40 // 5 days forecast
          }
        })
      ]);

      const currentData = currentResponse.data;
      const forecastData = forecastResponse.data;

      // Process current weather
      const current = {
        temperature: currentData.main.temp,
        feelsLike: currentData.main.feels_like,
        humidity: currentData.main.humidity,
        pressure: currentData.main.pressure,
        windSpeed: currentData.wind?.speed || 0,
        windDirection: currentData.wind?.deg || 0,
        visibility: currentData.visibility / 1000, // Convert to km
        uvIndex: 0, // Would need UV API call
        cloudCover: currentData.clouds.all,
        dewPoint: this.calculateDewPoint(currentData.main.temp, currentData.main.humidity),
        condition: {
          main: currentData.weather[0].main,
          description: currentData.weather[0].description,
          icon: currentData.weather[0].icon
        }
      };

      // Process forecast (daily aggregates)
      const forecast = this.processForecastData(forecastData.list);

      // Check for weather alerts
      const alerts = this.generateWeatherAlerts(current, forecast);

      const weatherData = {
        location: {
          latitude,
          longitude,
          city: currentData.name,
          country: currentData.sys.country
        },
        current,
        forecast,
        alerts,
        lastUpdated: new Date(),
        source: 'OpenWeatherMap'
      };

      return weatherData;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw new Error('Failed to fetch weather data');
    }
  }

  /**
   * Process 5-day forecast into daily summaries
   */
  processForecastData(forecastList) {
    const dailyForecasts = {};

    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toISOString().split('T')[0];

      if (!dailyForecasts[dateKey]) {
        dailyForecasts[dateKey] = {
          date: new Date(dateKey),
          temps: [],
          humidity: [],
          precipitation: { probability: 0, amount: 0 },
          windSpeeds: [],
          conditions: []
        };
      }

      const daily = dailyForecasts[dateKey];
      daily.temps.push(item.main.temp);
      daily.humidity.push(item.main.humidity);
      daily.windSpeeds.push(item.wind?.speed || 0);
      daily.conditions.push({
        main: item.weather[0].main,
        description: item.weather[0].description,
        icon: item.weather[0].icon
      });

      // Precipitation
      if (item.rain) {
        daily.precipitation.amount += item.rain['3h'] || 0;
        daily.precipitation.probability = Math.max(daily.precipitation.probability, item.pop * 100);
      }
      if (item.snow) {
        daily.precipitation.amount += item.snow['3h'] || 0;
        daily.precipitation.probability = Math.max(daily.precipitation.probability, item.pop * 100);
      }
    });

    // Convert to final format
    return Object.values(dailyForecasts).map(daily => ({
      date: daily.date,
      tempMin: Math.min(...daily.temps),
      tempMax: Math.max(...daily.temps),
      humidity: Math.round(daily.humidity.reduce((a, b) => a + b) / daily.humidity.length),
      precipitation: {
        probability: Math.round(daily.precipitation.probability),
        amount: Math.round(daily.precipitation.amount * 10) / 10
      },
      windSpeed: Math.round(daily.windSpeeds.reduce((a, b) => a + b) / daily.windSpeeds.length * 10) / 10,
      condition: this.getMostCommonCondition(daily.conditions)
    }));
  }

  /**
   * Generate weather alerts based on current and forecast data
   */
  generateWeatherAlerts(current, forecast) {
    const alerts = [];

    // Heat warning
    if (current.temperature > 35) {
      alerts.push({
        type: 'heat_warning',
        severity: current.temperature > 40 ? 'extreme' : 'high',
        title: 'Extreme Heat Warning',
        description: `Temperature is ${current.temperature}°C. Take immediate action to protect animals from heat stress.`,
        startTime: new Date(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isActive: true
      });
    }

    // Cold warning
    if (current.temperature < 0) {
      alerts.push({
        type: 'cold_warning',
        severity: current.temperature < -10 ? 'extreme' : 'high',
        title: 'Freezing Temperature Warning',
        description: `Temperature is ${current.temperature}°C. Protect animals from freezing conditions.`,
        startTime: new Date(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isActive: true
      });
    }

    // Strong wind warning
    if (current.windSpeed > 20) {
      alerts.push({
        type: 'storm_warning',
        severity: current.windSpeed > 30 ? 'high' : 'medium',
        title: 'Strong Wind Warning',
        description: `Wind speed is ${current.windSpeed} m/s. Secure loose items and provide shelter.`,
        startTime: new Date(),
        endTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
        isActive: true
      });
    }

    // Heavy precipitation warning
    const nextDayPrecip = forecast.length > 0 ? forecast[0].precipitation.amount : 0;
    if (nextDayPrecip > 25) {
      alerts.push({
        type: 'flood_warning',
        severity: nextDayPrecip > 50 ? 'high' : 'medium',
        title: 'Heavy Precipitation Warning',
        description: `${nextDayPrecip}mm of precipitation expected. Prepare drainage and shelter.`,
        startTime: new Date(),
        endTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
        isActive: true
      });
    }

    return alerts;
  }

  /**
   * Generate farming recommendations based on weather
   */
  async generateRecommendations(userId, weatherData, animalTypes = ['all']) {
    try {
      const recommendations = [];
      const { current, forecast } = weatherData;

      // Temperature-based recommendations
      if (current.temperature > 30) {
        recommendations.push({
          category: 'shelter',
          priority: 'high',
          title: 'Heat Stress Prevention',
          description: `High temperature (${current.temperature}°C) detected. Provide shade, increase water availability, and consider adjusting feeding times to cooler parts of the day.`,
          actionRequired: true,
          timeframe: 'immediate',
          applicableAnimals: animalTypes
        });
      }

      if (current.temperature < 5) {
        recommendations.push({
          category: 'shelter',
          priority: 'high',
          title: 'Cold Weather Protection',
          description: `Low temperature (${current.temperature}°C) detected. Provide windbreaks, additional bedding, and increase energy-rich feed.`,
          actionRequired: true,
          timeframe: 'immediate',
          applicableAnimals: animalTypes
        });
      }

      // Humidity recommendations
      if (current.humidity > 80) {
        recommendations.push({
          category: 'health',
          priority: 'medium',
          title: 'High Humidity Management',
          description: `High humidity (${current.humidity}%) increases disease risk. Ensure good ventilation and monitor for respiratory issues.`,
          actionRequired: false,
          timeframe: 'within 24 hours',
          applicableAnimals: animalTypes
        });
      }

      // Precipitation recommendations
      const upcomingRain = forecast.some(day => day.precipitation.probability > 70);
      if (upcomingRain) {
        recommendations.push({
          category: 'general',
          priority: 'medium',
          title: 'Prepare for Rain',
          description: 'Heavy rain expected in the next few days. Check shelter conditions and ensure proper drainage.',
          actionRequired: true,
          timeframe: 'within 24 hours',
          applicableAnimals: animalTypes
        });
      }

      // Grazing recommendations
      if (current.temperature > 15 && current.temperature < 25 && current.humidity < 70) {
        recommendations.push({
          category: 'grazing',
          priority: 'low',
          title: 'Optimal Grazing Conditions',
          description: 'Weather conditions are ideal for grazing. Consider extended pasture time.',
          actionRequired: false,
          timeframe: 'today',
          applicableAnimals: ['cattle', 'goat', 'sheep']
        });
      }

      // Breeding recommendations
      if (current.temperature > 20 && current.temperature < 28 && current.humidity < 60) {
        recommendations.push({
          category: 'breeding',
          priority: 'low',
          title: 'Favorable Breeding Conditions',
          description: 'Weather conditions are favorable for breeding activities.',
          actionRequired: false,
          timeframe: 'this week',
          applicableAnimals: animalTypes
        });
      }

      // Save recommendations
      await WeatherRecommendation.create({
        owner: userId,
        weatherConditions: {
          temperature: current.temperature,
          humidity: current.humidity,
          precipitation: forecast[0]?.precipitation.amount || 0,
          windSpeed: current.windSpeed,
          condition: current.condition.main
        },
        recommendations,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // Valid for 24 hours
        isActive: true
      });

      return recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw new Error('Failed to generate weather recommendations');
    }
  }

  /**
   * Create farm alerts based on weather conditions
   */
  async createWeatherAlerts(userId, weatherData) {
    try {
      const alerts = [];
      const { current, alerts: weatherAlerts } = weatherData;

      for (const weatherAlert of weatherAlerts) {
        if (weatherAlert.isActive) {
          const alert = {
            owner: userId,
            type: 'weather',
            category: this.mapSeverityToCategory(weatherAlert.severity),
            title: weatherAlert.title,
            message: weatherAlert.description,
            source: 'weather_service',
            recommendations: this.getAlertRecommendations(weatherAlert.type),
            expiresAt: weatherAlert.endTime
          };

          alerts.push(alert);
        }
      }

      // Create alerts in database
      if (alerts.length > 0) {
        await FarmAlert.insertMany(alerts);
      }

      return alerts;
    } catch (error) {
      console.error('Error creating weather alerts:', error);
      throw new Error('Failed to create weather alerts');
    }
  }

  /**
   * Helper methods
   */
  calculateDewPoint(temperature, humidity) {
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * temperature) / (b + temperature)) + Math.log(humidity / 100);
    return (b * alpha) / (a - alpha);
  }

  getMostCommonCondition(conditions) {
    const conditionCounts = {};
    conditions.forEach(condition => {
      const key = condition.main;
      conditionCounts[key] = (conditionCounts[key] || 0) + 1;
    });

    const mostCommon = Object.keys(conditionCounts).reduce((a, b) => 
      conditionCounts[a] > conditionCounts[b] ? a : b
    );

    return conditions.find(c => c.main === mostCommon);
  }

  mapSeverityToCategory(severity) {
    switch (severity) {
      case 'extreme': return 'emergency';
      case 'high': return 'critical';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'info';
    }
  }

  getAlertRecommendations(alertType) {
    const recommendationMap = {
      'heat_warning': [
        {
          action: 'Provide shade and fresh water',
          priority: 'urgent',
          description: 'Ensure all animals have access to shade and unlimited fresh water'
        },
        {
          action: 'Adjust feeding schedule',
          priority: 'high',
          description: 'Feed during cooler parts of the day (early morning, late evening)'
        }
      ],
      'cold_warning': [
        {
          action: 'Provide shelter and windbreaks',
          priority: 'urgent',
          description: 'Ensure animals have access to dry, draft-free shelter'
        },
        {
          action: 'Increase energy-rich feed',
          priority: 'high',
          description: 'Provide additional calories to help animals maintain body temperature'
        }
      ],
      'storm_warning': [
        {
          action: 'Secure loose items',
          priority: 'urgent',
          description: 'Remove or secure any loose equipment, feeders, or structures'
        },
        {
          action: 'Move animals to shelter',
          priority: 'high',
          description: 'Bring animals to sturdy, enclosed shelters'
        }
      ]
    };

    return recommendationMap[alertType] || [];
  }
}

module.exports = new WeatherService(); 