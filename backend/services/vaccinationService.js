const { RegionalVaccination, VaccinationRecord, VaccinationAlert } = require('../models/RegionalVaccination');
const regionalizationService = require('./regionalizationService');
const Animal = require('../models/Animal');

class VaccinationService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 12 * 60 * 60 * 1000; // 12 hours
  }

  // Get vaccination schedule for specific region/country
  async getRegionalVaccinationSchedule(region, country, animalType) {
    const cacheKey = `schedule_${region}_${country}_${animalType}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      let schedule = await RegionalVaccination.findOne({
        region: region,
        'countries.code': country,
        animalType: animalType
      });

      // If no country-specific schedule, try regional default
      if (!schedule) {
        schedule = await RegionalVaccination.findOne({
          region: region,
          animalType: animalType
        });
      }

      // If still no schedule, use global default
      if (!schedule) {
        schedule = await RegionalVaccination.findOne({
          region: 'global_default',
          animalType: animalType
        });
      }

      if (schedule) {
        this.cache.set(cacheKey, {
          data: schedule,
          timestamp: Date.now()
        });
      }

      return schedule;
    } catch (error) {
      console.error('Error fetching vaccination schedule:', error);
      return null;
    }
  }

  // Generate vaccination schedule for a new animal
  async generateAnimalVaccinationSchedule(animalId, ownerId) {
    try {
      const animal = await Animal.findById(animalId);
      if (!animal) {
        throw new Error('Animal not found');
      }

      // Get user's region/country
      const region = await regionalizationService.detectUserRegion({ user: { id: ownerId } });
      const country = await this.getUserCountry(ownerId);

      // Get regional vaccination schedule
      const schedule = await this.getRegionalVaccinationSchedule(
        region, 
        country, 
        animal.basicInfo.type
      );

      if (!schedule) {
        throw new Error(`No vaccination schedule found for ${animal.basicInfo.type} in ${region}`);
      }

      // Calculate animal's age in days
      const animalAge = this.calculateAnimalAge(animal.basicInfo.dateOfBirth);
      
      // Generate scheduled vaccinations
      const scheduledVaccinations = [];

      for (const vaccination of schedule.vaccinations) {
        // Primary series
        for (const dose of vaccination.schedule.primarySeries) {
          if (animalAge < dose.ageInDays) {
            const scheduledDate = new Date(
              animal.basicInfo.dateOfBirth.getTime() + 
              dose.ageInDays * 24 * 60 * 60 * 1000
            );

            scheduledVaccinations.push({
              animal: animalId,
              owner: ownerId,
              region: region,
              country: country,
              vaccineName: vaccination.vaccineName,
              scheduledDate: scheduledDate,
              doseNumber: dose.doseNumber,
              isBooster: false,
              status: 'scheduled',
              nextDueDate: scheduledDate,
              metadata: {
                vaccineType: vaccination.vaccineType,
                diseasesPrevented: vaccination.diseasesPrevented,
                administrationRoute: vaccination.administrationRoute,
                isRequired: dose.isRequired,
                notes: dose.notes
              }
            });
          }
        }
      }

      // Save scheduled vaccinations
      const savedRecords = await VaccinationRecord.insertMany(scheduledVaccinations);

      // Create alerts for upcoming vaccinations
      await this.createVaccinationAlerts(savedRecords);

      return savedRecords;
    } catch (error) {
      console.error('Error generating vaccination schedule:', error);
      throw error;
    }
  }

  // Update vaccination schedule when user changes location
  async updateScheduleForLocationChange(ownerId, newRegion, newCountry) {
    try {
      // Get all animals for this owner
      const animals = await Animal.find({ owner: ownerId });

      for (const animal of animals) {
        // Get current pending vaccinations
        const pendingVaccinations = await VaccinationRecord.find({
          animal: animal._id,
          status: 'scheduled',
          administrationDate: { $exists: false }
        });

        // Get new regional schedule
        const newSchedule = await this.getRegionalVaccinationSchedule(
          newRegion,
          newCountry,
          animal.basicInfo.type
        );

        if (newSchedule) {
          // Update pending vaccinations based on new schedule
          await this.reconcileVaccinationSchedule(
            animal._id,
            pendingVaccinations,
            newSchedule,
            newRegion,
            newCountry
          );
        }
      }

      return { success: true, message: 'Vaccination schedules updated for new location' };
    } catch (error) {
      console.error('Error updating vaccination schedule:', error);
      throw error;
    }
  }

  // Reconcile existing schedule with new regional requirements
  async reconcileVaccinationSchedule(animalId, existingSchedule, newSchedule, newRegion, newCountry) {
    try {
      const animal = await Animal.findById(animalId);
      const animalAge = this.calculateAnimalAge(animal.basicInfo.dateOfBirth);

      // Create a map of existing vaccinations
      const existingMap = new Map();
      existingSchedule.forEach(record => {
        existingMap.set(`${record.vaccineName}_${record.doseNumber}`, record);
      });

      // Process new schedule requirements
      const updatedRecords = [];
      const newRecords = [];

      for (const vaccination of newSchedule.vaccinations) {
        for (const dose of vaccination.schedule.primarySeries) {
          if (animalAge < dose.ageInDays) {
            const key = `${vaccination.vaccineName}_${dose.doseNumber}`;
            const existingRecord = existingMap.get(key);

            if (existingRecord) {
              // Update existing record
              existingRecord.region = newRegion;
              existingRecord.country = newCountry;
              existingRecord.scheduledDate = new Date(
                animal.basicInfo.dateOfBirth.getTime() + 
                dose.ageInDays * 24 * 60 * 60 * 1000
              );
              existingRecord.nextDueDate = existingRecord.scheduledDate;
              
              updatedRecords.push(existingRecord);
              existingMap.delete(key);
            } else {
              // Create new record for this vaccination
              const scheduledDate = new Date(
                animal.basicInfo.dateOfBirth.getTime() + 
                dose.ageInDays * 24 * 60 * 60 * 1000
              );

              newRecords.push({
                animal: animalId,
                owner: animal.owner,
                region: newRegion,
                country: newCountry,
                vaccineName: vaccination.vaccineName,
                scheduledDate: scheduledDate,
                doseNumber: dose.doseNumber,
                isBooster: false,
                status: 'scheduled',
                nextDueDate: scheduledDate
              });
            }
          }
        }
      }

      // Save updates
      if (updatedRecords.length > 0) {
        await Promise.all(updatedRecords.map(record => record.save()));
      }

      if (newRecords.length > 0) {
        await VaccinationRecord.insertMany(newRecords);
      }

      // Remove vaccinations that are no longer required in new region
      const obsoleteRecords = Array.from(existingMap.values());
      if (obsoleteRecords.length > 0) {
        await VaccinationRecord.deleteMany({
          _id: { $in: obsoleteRecords.map(r => r._id) }
        });
      }

      return {
        updated: updatedRecords.length,
        added: newRecords.length,
        removed: obsoleteRecords.length
      };
    } catch (error) {
      console.error('Error reconciling vaccination schedule:', error);
      throw error;
    }
  }

  // Get vaccination recommendations based on current conditions
  async getVaccinationRecommendations(ownerId, animalId, options = {}) {
    try {
      const animal = await Animal.findById(animalId);
      const region = options.region || await regionalizationService.detectUserRegion({ user: { id: ownerId } });
      const country = options.country || await this.getUserCountry(ownerId);
      const season = options.season || this.getCurrentSeason();

      const schedule = await this.getRegionalVaccinationSchedule(
        region,
        country,
        animal.basicInfo.type
      );

      if (!schedule) return [];

      const recommendations = [];
      const animalAge = this.calculateAnimalAge(animal.basicInfo.dateOfBirth);

      // Get existing vaccination records
      const existingVaccinations = await VaccinationRecord.find({
        animal: animalId,
        status: 'completed'
      }).sort({ administrationDate: -1 });

      for (const vaccination of schedule.vaccinations) {
        // Check seasonal recommendations
        const seasonalRec = vaccination.seasonalRecommendations.find(
          rec => rec.season === season || rec.months.includes(new Date().getMonth() + 1)
        );

        if (seasonalRec && seasonalRec.isPriority) {
          recommendations.push({
            vaccineName: vaccination.vaccineName,
            reason: `Seasonal priority: ${seasonalRec.reason}`,
            urgency: 'high',
            dueDate: this.calculateOptimalDate(seasonalRec.months),
            type: 'seasonal'
          });
        }

        // Check overdue primary series
        for (const dose of vaccination.schedule.primarySeries) {
          if (animalAge > dose.ageInDays) {
            const hasReceived = existingVaccinations.some(
              record => record.vaccineName === vaccination.vaccineName && 
                       record.doseNumber === dose.doseNumber
            );

            if (!hasReceived && dose.isRequired) {
              recommendations.push({
                vaccineName: vaccination.vaccineName,
                reason: `Overdue primary vaccination (dose ${dose.doseNumber})`,
                urgency: 'critical',
                dueDate: new Date(), // Overdue, should be done ASAP
                type: 'overdue_primary',
                doseNumber: dose.doseNumber
              });
            }
          }
        }

        // Check booster requirements
        const lastVaccination = existingVaccinations.find(
          record => record.vaccineName === vaccination.vaccineName
        );

        if (lastVaccination && vaccination.schedule.boosters.length > 0) {
          const booster = vaccination.schedule.boosters[0];
          const daysSinceLastVaccination = Math.floor(
            (new Date() - lastVaccination.administrationDate) / (1000 * 60 * 60 * 24)
          );

          if (daysSinceLastVaccination >= booster.frequencyInDays) {
            recommendations.push({
              vaccineName: vaccination.vaccineName,
              reason: `Booster vaccination due (${booster.frequency})`,
              urgency: 'medium',
              dueDate: new Date(
                lastVaccination.administrationDate.getTime() + 
                booster.frequencyInDays * 24 * 60 * 60 * 1000
              ),
              type: 'booster'
            });
          }
        }
      }

      // Sort by urgency and due date
      recommendations.sort((a, b) => {
        const urgencyOrder = { 'critical': 3, 'high': 2, 'medium': 1, 'low': 0 };
        if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
          return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
        }
        return new Date(a.dueDate) - new Date(b.dueDate);
      });

      return recommendations;
    } catch (error) {
      console.error('Error getting vaccination recommendations:', error);
      throw error;
    }
  }

  // Record a completed vaccination
  async recordVaccination(vaccinationData) {
    try {
      // Find scheduled vaccination or create new record
      let vaccinationRecord;
      
      if (vaccinationData.scheduledRecordId) {
        vaccinationRecord = await VaccinationRecord.findById(vaccinationData.scheduledRecordId);
        if (!vaccinationRecord) {
          throw new Error('Scheduled vaccination record not found');
        }
      } else {
        vaccinationRecord = new VaccinationRecord({
          animal: vaccinationData.animalId,
          owner: vaccinationData.ownerId,
          region: vaccinationData.region,
          country: vaccinationData.country,
          vaccineName: vaccinationData.vaccineName
        });
      }

      // Update record with administration details
      vaccinationRecord.administrationDate = vaccinationData.administrationDate || new Date();
      vaccinationRecord.doseNumber = vaccinationData.doseNumber;
      vaccinationRecord.isBooster = vaccinationData.isBooster || false;
      vaccinationRecord.batchNumber = vaccinationData.batchNumber;
      vaccinationRecord.manufacturer = vaccinationData.manufacturer;
      vaccinationRecord.expiryDate = vaccinationData.expiryDate;
      vaccinationRecord.administeredBy = vaccinationData.administeredBy;
      vaccinationRecord.administrationSite = vaccinationData.administrationSite;
      vaccinationRecord.dosageGiven = vaccinationData.dosageGiven;
      vaccinationRecord.animalWeight = vaccinationData.animalWeight;
      vaccinationRecord.preVaccinationHealth = vaccinationData.preVaccinationHealth;
      vaccinationRecord.cost = vaccinationData.cost;
      vaccinationRecord.status = 'completed';

      // Calculate next due date
      vaccinationRecord.nextDueDate = await this.calculateNextDueDate(
        vaccinationRecord.animal,
        vaccinationRecord.vaccineName,
        vaccinationRecord.isBooster,
        vaccinationRecord.administrationDate
      );

      await vaccinationRecord.save();

      // Create alert for next vaccination if needed
      if (vaccinationRecord.nextDueDate) {
        await this.createVaccinationAlert({
          owner: vaccinationRecord.owner,
          animal: vaccinationRecord.animal,
          vaccineName: vaccinationRecord.vaccineName,
          dueDate: vaccinationRecord.nextDueDate,
          alertType: vaccinationRecord.isBooster ? 'booster_due' : 'due_soon'
        });
      }

      return vaccinationRecord;
    } catch (error) {
      console.error('Error recording vaccination:', error);
      throw error;
    }
  }

  // Create vaccination alerts
  async createVaccinationAlerts(vaccinationRecords) {
    try {
      const alerts = [];

      for (const record of vaccinationRecords) {
        const daysUntilDue = Math.floor(
          (record.nextDueDate - new Date()) / (1000 * 60 * 60 * 24)
        );

        let alertType = 'due_soon';
        let priority = 'medium';

        if (daysUntilDue < 0) {
          alertType = 'overdue';
          priority = 'high';
        } else if (daysUntilDue <= 7) {
          alertType = 'due_soon';
          priority = 'high';
        } else if (daysUntilDue <= 30) {
          alertType = 'due_soon';
          priority = 'medium';
        }

        alerts.push({
          owner: record.owner,
          animal: record.animal,
          vaccineName: record.vaccineName,
          alertType: alertType,
          dueDate: record.nextDueDate,
          priority: priority,
          message: this.generateAlertMessage(record, daysUntilDue),
          expiryDate: new Date(record.nextDueDate.getTime() + 90 * 24 * 60 * 60 * 1000) // Alert expires 90 days after due date
        });
      }

      if (alerts.length > 0) {
        await VaccinationAlert.insertMany(alerts);
      }

      return alerts;
    } catch (error) {
      console.error('Error creating vaccination alerts:', error);
      throw error;
    }
  }

  // Helper methods
  calculateAnimalAge(dateOfBirth) {
    return Math.floor((new Date() - dateOfBirth) / (1000 * 60 * 60 * 24));
  }

  getCurrentSeason() {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }

  calculateOptimalDate(months) {
    const currentMonth = new Date().getMonth() + 1;
    const targetMonth = months.find(month => month >= currentMonth) || months[0];
    
    const targetDate = new Date();
    targetDate.setMonth(targetMonth - 1, 1);
    
    if (targetMonth < currentMonth) {
      targetDate.setFullYear(targetDate.getFullYear() + 1);
    }
    
    return targetDate;
  }

  async calculateNextDueDate(animalId, vaccineName, isBooster, lastVaccinationDate) {
    try {
      const animal = await Animal.findById(animalId);
      const region = await regionalizationService.detectUserRegion({ user: { id: animal.owner } });
      const country = await this.getUserCountry(animal.owner);

      const schedule = await this.getRegionalVaccinationSchedule(
        region,
        country,
        animal.basicInfo.type
      );

      if (!schedule) return null;

      const vaccination = schedule.vaccinations.find(v => v.vaccineName === vaccineName);
      if (!vaccination) return null;

      if (isBooster && vaccination.schedule.boosters.length > 0) {
        const booster = vaccination.schedule.boosters[0];
        return new Date(
          lastVaccinationDate.getTime() + 
          booster.frequencyInDays * 24 * 60 * 60 * 1000
        );
      } else {
        // Find next dose in primary series
        const currentRecord = await VaccinationRecord.findOne({
          animal: animalId,
          vaccineName: vaccineName,
          status: 'completed'
        }).sort({ doseNumber: -1 });

        if (currentRecord) {
          const nextDose = vaccination.schedule.primarySeries.find(
            dose => dose.doseNumber > currentRecord.doseNumber
          );

          if (nextDose) {
            // Calculate based on animal's birth date and next dose age
            return new Date(
              animal.basicInfo.dateOfBirth.getTime() + 
              nextDose.ageInDays * 24 * 60 * 60 * 1000
            );
          } else {
            // Primary series complete, schedule first booster
            if (vaccination.schedule.boosters.length > 0) {
              const booster = vaccination.schedule.boosters[0];
              return new Date(
                lastVaccinationDate.getTime() + 
                booster.lastVaccinationGap * 24 * 60 * 60 * 1000
              );
            }
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error calculating next due date:', error);
      return null;
    }
  }

  generateAlertMessage(record, daysUntilDue) {
    if (daysUntilDue < 0) {
      return `${record.vaccineName} vaccination is ${Math.abs(daysUntilDue)} days overdue`;
    } else if (daysUntilDue === 0) {
      return `${record.vaccineName} vaccination is due today`;
    } else if (daysUntilDue <= 7) {
      return `${record.vaccineName} vaccination is due in ${daysUntilDue} days`;
    } else {
      return `${record.vaccineName} vaccination is due in ${daysUntilDue} days`;
    }
  }

  async getUserCountry(userId) {
    // This would typically get the user's country from their profile
    // For now, returning a default
    return 'US';
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }
}

module.exports = new VaccinationService(); 