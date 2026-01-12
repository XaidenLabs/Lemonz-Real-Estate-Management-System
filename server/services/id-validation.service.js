const axios = require("axios");
const FormData = require("form-data");
const {
  REGION_MAPPING,
  SECURITY_FEATURE_REQUIREMENTS,
  VALIDATION_RULES,
} = require("../utils");

class IDVerificationService {
  constructor() {
    this.apiInstances = {};
  }

  getRegionForCountry(countryCode) {
    for (const [region, countries] of Object.entries(REGION_MAPPING)) {
      if (countries.includes(countryCode)) {
        return region;
      }
    }
    return "US";
  }

  async validateDocument(result, documentType, countryCode) {
    const validationRules = this.getValidationRules(documentType, countryCode);
    const validationResults = {
      isValid: true,
      errors: [],
    };

    for (const field of validationRules.requiredFields) {
      if (!result[field]) {
        validationResults.errors.push(`Missing required field: ${field}`);
        validationResults.isValid = false;
      }
    }

    if (
      validationRules.documentNumberFormat &&
      !validationRules.documentNumberFormat.test(result.document_number)
    ) {
      validationResults.errors.push("Invalid document number format");
      validationResults.isValid = false;
    }

    if (validationRules.ageCheck) {
      const age = this.calculateAge(result.dob);
      if (age < validationRules.minAge || age > validationRules.maxAge) {
        validationResults.errors.push(
          `Age ${age} is outside valid range (${validationRules.minAge}-${validationRules.maxAge})`
        );
        validationResults.isValid = false;
      }
    }

    if (validationRules.expiryRequired) {
      if (!result.expiry_date) {
        validationResults.errors.push("Missing expiry date");
        validationResults.isValid = false;
      } else {
        const daysUntilExpiry = this.calculateDaysUntilExpiry(
          result.expiry_date
        );
        if (daysUntilExpiry < validationRules.expiryMinDays) {
          validationResults.errors.push(
            `Document expires in ${daysUntilExpiry} days (minimum ${validationRules.expiryMinDays} days required)`
          );
          validationResults.isValid = false;
        }
      }
    }

    if (validationRules.securityFeatures) {
      for (const feature of validationRules.securityFeatures) {
        const securityRequirements = SECURITY_FEATURE_REQUIREMENTS[feature];
        const featureResult = result.security_features?.[feature];

        if (
          !featureResult ||
          featureResult.confidence < securityRequirements.minConfidence
        ) {
          validationResults.errors.push(
            `Failed security feature check: ${feature}`
          );
          validationResults.isValid = false;
        }
      }
    }

    return validationResults;
  }

  getValidationRules(documentType, countryCode) {
    if (VALIDATION_RULES[countryCode]?.[documentType]) {
      return VALIDATION_RULES[countryCode][documentType];
    }
    return VALIDATION_RULES[documentType] || VALIDATION_RULES["ID"];
  }

  calculateAge(dateOfBirth) {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  }

  calculateDaysUntilExpiry(expiryDate) {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  async verifyDocument(imageBuffer, countryCode, documentType = null) {
    try {
      // MOCK IMPLEMENTATION FOR DEVELOPMENT
      console.log("Mocking ID Verification for:", countryCode, documentType);

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      return {
        success: true,
        data: {
          documentNumber: "A12345678",
          documentType: documentType || "ID",
          expiryDate: "2030-01-01",
          issueDate: "2020-01-01",
          issuingCountry: countryCode,
          firstName: "Mock",
          lastName: "User",
          dateOfBirth: "1990-01-01",
          age: 30,
          address: "123 Mock Lane, Lagos",
          nationality: "NG",
        },
        verification: {
          isValid: true,
          errors: [],
          authenticityScore: 0.99,
          securityFeatures: {},
          faceDetection: {},
        },
        rawResult: { mock: true },
      };
    } catch (error) {
      console.error("Mock Verification Error", error);
      throw new Error("Mock verification failed");
    }
  }
}

module.exports = {
  IDVerificationService,
};
