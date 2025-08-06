const axios = require('axios');
const RegionalConfig = require('../models/RegionalConfig');

class RegionalizationService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 24 * 60 * 60 * 1000; // 24 hours
  }

  // Detect user region from IP, user preferences, or manual selection
  async detectUserRegion(req) {
    try {
      // Priority 1: User's saved preference
      if (req.user?.preferences?.region) {
        return req.user.preferences.region;
      }

      // Priority 2: IP-based detection
      const ip = this.getClientIP(req);
      if (ip && ip !== '127.0.0.1') {
        const geoData = await this.getGeoLocation(ip);
        if (geoData?.country) {
          return this.mapCountryToRegion(geoData.country);
        }
      }

      // Priority 3: Accept-Language header
      const languages = req.headers['accept-language'];
      if (languages) {
        const primaryLang = languages.split(',')[0].split('-')[0];
        return this.mapLanguageToRegion(primaryLang);
      }

      // Fallback to global default
      return 'global_default';
    } catch (error) {
      console.error('Error detecting user region:', error);
      return 'global_default';
    }
  }

  getClientIP(req) {
    return req.headers['x-forwarded-for']?.split(',')[0] ||
           req.headers['x-real-ip'] ||
           req.connection?.remoteAddress ||
           req.socket?.remoteAddress ||
           req.ip;
  }

  async getGeoLocation(ip) {
    const cacheKey = `geo_${ip}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      // Using a free IP geolocation service (replace with preferred service)
      const response = await axios.get(`http://ip-api.com/json/${ip}`, {
        timeout: 5000
      });

      const geoData = {
        country: response.data.countryCode,
        region: response.data.region,
        city: response.data.city,
        timezone: response.data.timezone,
        currency: response.data.currency
      };

      this.cache.set(cacheKey, {
        data: geoData,
        timestamp: Date.now()
      });

      return geoData;
    } catch (error) {
      console.error('Geolocation API error:', error);
      return null;
    }
  }

  mapCountryToRegion(countryCode) {
    const countryRegionMap = {
      // North America
      'US': 'north_america',
      'CA': 'north_america',
      'MX': 'north_america',

      // Europe
      'GB': 'europe',
      'DE': 'europe',
      'FR': 'europe',
      'ES': 'europe',
      'IT': 'europe',
      'NL': 'europe',
      'PL': 'europe',
      'SE': 'europe',
      'NO': 'europe',
      'DK': 'europe',

      // South Asia
      'IN': 'south_asia',
      'PK': 'south_asia',
      'BD': 'south_asia',
      'LK': 'south_asia',
      'NP': 'south_asia',

      // Sub-Saharan Africa
      'KE': 'africa',
      'NG': 'africa',
      'GH': 'africa',
      'UG': 'africa',
      'TZ': 'africa',
      'ZA': 'africa',
      'ET': 'africa',

      // Latin America
      'BR': 'latin_america',
      'AR': 'latin_america',
      'CO': 'latin_america',
      'PE': 'latin_america',
      'CL': 'latin_america',
      'VE': 'latin_america',

      // East Asia
      'CN': 'east_asia',
      'JP': 'east_asia',
      'KR': 'east_asia',
      'TW': 'east_asia',

      // Southeast Asia
      'TH': 'southeast_asia',
      'VN': 'southeast_asia',
      'ID': 'southeast_asia',
      'MY': 'southeast_asia',
      'PH': 'southeast_asia',
      'SG': 'southeast_asia',

      // Middle East
      'SA': 'middle_east',
      'AE': 'middle_east',
      'TR': 'middle_east',
      'IR': 'middle_east',
      'EG': 'middle_east',

      // Oceania
      'AU': 'oceania',
      'NZ': 'oceania'
    };

    return countryRegionMap[countryCode] || 'global_default';
  }

  mapLanguageToRegion(language) {
    const languageRegionMap = {
      'en': 'north_america',
      'es': 'latin_america',
      'pt': 'latin_america',
      'fr': 'europe',
      'de': 'europe',
      'it': 'europe',
      'hi': 'south_asia',
      'bn': 'south_asia',
      'zh': 'east_asia',
      'ja': 'east_asia',
      'ko': 'east_asia',
      'ar': 'middle_east',
      'sw': 'africa',
      'am': 'africa',
      'ha': 'africa',
      'th': 'southeast_asia',
      'vi': 'southeast_asia',
      'id': 'southeast_asia'
    };

    return languageRegionMap[language] || 'global_default';
  }

  // Get comprehensive regional configuration
  async getRegionalConfig(region, useCache = true) {
    const cacheKey = `config_${region}`;
    
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      let config = await RegionalConfig.findOne({ region });
      
      if (!config) {
        // Fallback to global default
        config = await RegionalConfig.findOne({ region: 'global_default' });
      }

      if (config && useCache) {
        this.cache.set(cacheKey, {
          data: config,
          timestamp: Date.now()
        });
      }

      return config;
    } catch (error) {
      console.error('Error fetching regional config:', error);
      return null;
    }
  }

  // Get localized animal breeds for region
  async getRegionalAnimalBreeds(region, animalType) {
    const config = await this.getRegionalConfig(region);
    
    if (!config || !config.animalTypes) {
      return this.getDefaultAnimalBreeds(animalType);
    }

    const regionalAnimal = config.animalTypes.find(
      animal => animal.type === animalType
    );

    return regionalAnimal?.commonBreeds || this.getDefaultAnimalBreeds(animalType);
  }

  getDefaultAnimalBreeds(animalType) {
    const defaultBreeds = {
      cattle: ['Holstein', 'Angus', 'Hereford', 'Jersey'],
      goat: ['Boer', 'Nubian', 'Saanen', 'Alpine'],
      sheep: ['Merino', 'Suffolk', 'Dorper', 'Romney'],
      poultry: ['Rhode Island Red', 'Leghorn', 'Plymouth Rock', 'Sussex'],
      swine: ['Yorkshire', 'Duroc', 'Hampshire', 'Landrace']
    };

    return defaultBreeds[animalType] || [];
  }

  // Get region-specific diseases and treatments
  async getRegionalDiseases(region, animalType, climateZone) {
    const config = await this.getRegionalConfig(region);
    
    // Combine regional diseases with climate-specific ones
    const regionalDiseases = this.getDiseasesForRegion(region, animalType);
    const climateDiseases = this.getDiseasesForClimate(climateZone, animalType);
    
    return [...new Set([...regionalDiseases, ...climateDiseases])];
  }

  getDiseasesForRegion(region, animalType) {
    const regionalDiseases = {
      'tropical_regions': {
        cattle: ['Tick fever', 'Trypanosomiasis', 'Foot and Mouth Disease'],
        goat: ['Peste des Petits Ruminants', 'Contagious Caprine Pleuropneumonia'],
        poultry: ['Newcastle Disease', 'Avian Influenza', 'Fowl Pox']
      },
      'temperate_regions': {
        cattle: ['Bovine Respiratory Disease', 'Mastitis', 'Lameness'],
        goat: ['Caprine Arthritis Encephalitis', 'Johnes Disease'],
        poultry: ['Infectious Bronchitis', 'Marek\'s Disease']
      }
    };

    const regionType = this.getRegionClimateType(region);
    return regionalDiseases[regionType]?.[animalType] || [];
  }

  getDiseasesForClimate(climateZone, animalType) {
    const climateDiseases = {
      'tropical': {
        cattle: ['Heat stress', 'Parasitic infections', 'Mineral deficiencies'],
        goat: ['Internal parasites', 'Skin diseases', 'Heat stress']
      },
      'arid': {
        cattle: ['Dehydration', 'Mineral imbalances', 'Respiratory issues'],
        goat: ['Kidney stones', 'Respiratory diseases']
      },
      'temperate': {
        cattle: ['Cold stress', 'Vitamin deficiencies', 'Joint problems'],
        goat: ['Pneumonia', 'Hoof problems']
      }
    };

    return climateDiseases[climateZone]?.[animalType] || [];
  }

  getRegionClimateType(region) {
    const climateMap = {
      'africa': 'tropical_regions',
      'south_asia': 'tropical_regions',
      'southeast_asia': 'tropical_regions',
      'latin_america': 'tropical_regions',
      'north_america': 'temperate_regions',
      'europe': 'temperate_regions',
      'east_asia': 'temperate_regions',
      'oceania': 'temperate_regions'
    };

    return climateMap[region] || 'temperate_regions';
  }

  // Get climate-specific recommendations
  async getClimateRecommendations(region, season, animalType) {
    const config = await this.getRegionalConfig(region);
    const climateZone = config?.climateData?.zones?.[0] || 'temperate';
    
    const recommendations = {
      'tropical': {
        'wet_season': {
          cattle: [
            'Provide adequate shelter from heavy rains',
            'Monitor for increased parasite load',
            'Ensure proper drainage in animal areas',
            'Supplement with minerals lost through leaching',
            'Check water quality regularly'
          ],
          goat: [
            'Maintain dry sleeping areas',
            'Increase deworming frequency',
            'Provide adequate ventilation',
            'Monitor for respiratory issues'
          ]
        },
        'dry_season': {
          cattle: [
            'Ensure constant access to clean water',
            'Provide shade structures',
            'Adjust feeding times to cooler periods',
            'Supplement feed during fodder shortage',
            'Monitor for heat stress symptoms'
          ],
          goat: [
            'Increase water provision',
            'Provide mineral supplements',
            'Create shade areas',
            'Adjust grazing times'
          ]
        }
      },
      'temperate': {
        'winter': {
          cattle: [
            'Provide windbreaks and adequate shelter',
            'Increase energy-rich feed rations',
            'Ensure water sources don\'t freeze',
            'Monitor for cold stress',
            'Provide bedding for warmth'
          ],
          goat: [
            'Ensure draft-free housing',
            'Increase hay and grain rations',
            'Provide fresh water daily',
            'Monitor for pneumonia'
          ]
        },
        'summer': {
          cattle: [
            'Provide adequate shade',
            'Ensure fresh water availability',
            'Adjust feeding to cooler times',
            'Monitor for heat stress',
            'Provide fans or cooling systems if possible'
          ],
          goat: [
            'Ensure good ventilation',
            'Provide shade structures',
            'Increase water availability',
            'Adjust grazing schedule'
          ]
        }
      }
    };

    return recommendations[climateZone]?.[season]?.[animalType] || [];
  }

  // Get regional market information
  async getRegionalMarketplaces(region) {
    const config = await this.getRegionalConfig(region);
    return config?.marketplaces || [];
  }

  // Get regional government integration requirements
  async getGovernmentRequirements(region) {
    const config = await this.getRegionalConfig(region);
    return config?.governmentIntegrations || [];
  }

  // Get regional pricing information
  getRegionalPricing(region, subscriptionTier) {
    const pricingTiers = {
      'high_income': {
        regions: ['north_america', 'europe', 'oceania'],
        pricing: {
          basic: 29.99,
          premium: 59.99,
          enterprise: 199.99
        }
      },
      'upper_middle_income': {
        regions: ['latin_america', 'east_asia'],
        pricing: {
          basic: 19.99,
          premium: 39.99,
          enterprise: 129.99
        }
      },
      'lower_middle_income': {
        regions: ['south_asia', 'southeast_asia', 'middle_east'],
        pricing: {
          basic: 9.99,
          premium: 19.99,
          enterprise: 69.99
        }
      },
      'low_income': {
        regions: ['africa'],
        pricing: {
          basic: 4.99,
          premium: 9.99,
          enterprise: 29.99
        }
      }
    };

    for (const [tier, config] of Object.entries(pricingTiers)) {
      if (config.regions.includes(region)) {
        return config.pricing[subscriptionTier] || config.pricing.basic;
      }
    }

    // Fallback to basic pricing
    return pricingTiers.high_income.pricing[subscriptionTier] || 29.99;
  }

  // Get localized currency information
  async getRegionalCurrency(region) {
    const config = await this.getRegionalConfig(region);
    
    if (config?.currencies && config.currencies.length > 0) {
      return config.currencies[0]; // Return primary currency
    }

    // Fallback currency mapping
    const currencyMap = {
      'north_america': { code: 'USD', symbol: '$', position: 'before' },
      'europe': { code: 'EUR', symbol: '€', position: 'before' },
      'south_asia': { code: 'INR', symbol: '₹', position: 'before' },
      'africa': { code: 'USD', symbol: '$', position: 'before' },
      'latin_america': { code: 'USD', symbol: '$', position: 'before' },
      'east_asia': { code: 'USD', symbol: '$', position: 'before' },
      'southeast_asia': { code: 'USD', symbol: '$', position: 'before' },
      'middle_east': { code: 'USD', symbol: '$', position: 'before' },
      'oceania': { code: 'AUD', symbol: 'A$', position: 'before' }
    };

    return currencyMap[region] || currencyMap['north_america'];
  }

  // Format currency based on regional preferences
  formatCurrency(amount, region, currencyInfo = null) {
    if (!currencyInfo) {
      currencyInfo = this.getRegionalCurrency(region);
    }

    const formattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);

    return currencyInfo.position === 'before' 
      ? `${currencyInfo.symbol}${formattedAmount}`
      : `${formattedAmount}${currencyInfo.symbol}`;
  }

  // Clear cache (useful for testing or manual refresh)
  clearCache() {
    this.cache.clear();
  }
}

module.exports = new RegionalizationService(); 