export interface GUSCompanyData {
  nip: string;
  name: string;
  status: 'active' | 'inactive';
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  regon?: string;
  krs?: string;
}

export interface GUSValidationResult {
  isValid: boolean;
  isActive: boolean;
  company?: GUSCompanyData;
  error?: string;
}

export class GUSService {
  private readonly whiteListUrl = 'https://wl-api.mf.gov.pl/api/search/nip';
  private readonly regonUrl = 'https://wyszukiwarkaregon.stat.gov.pl/appBIR/index.aspx';

  /**
   * Validate NIP and get company data from GUS White List API
   */
  async validateNIP(nip: string): Promise<GUSValidationResult> {
    try {
      // Clean NIP - remove spaces, dashes
      const cleanNIP = nip.replace(/[\s-]/g, '');

      // Basic NIP format validation
      if (!/^\d{10}$/.test(cleanNIP)) {
        return {
          isValid: false,
          isActive: false,
          error: 'Invalid NIP format. Must be 10 digits.'
        };
      }

      // Call White List API
      const response = await fetch(`${this.whiteListUrl}/${cleanNIP}?date=${new Date().toISOString().split('T')[0]}`);

      if (!response.ok) {
        throw new Error(`GUS API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      // Check if company exists and is active
      if (!data.result || !data.result.subject) {
        return {
          isValid: false,
          isActive: false,
          error: 'Company not found in GUS registry'
        };
      }

      const subject = data.result.subject;
      const isActive = subject.statusVat === 'Czynny'; // Active VAT status

      const companyData: GUSCompanyData = {
        nip: cleanNIP,
        name: subject.name || 'N/A',
        status: isActive ? 'active' : 'inactive',
        address: {
          street: subject.workingAddress || subject.registeredAddress || 'N/A',
          city: this.extractCity(subject.workingAddress || subject.registeredAddress || ''),
          postalCode: this.extractPostalCode(subject.workingAddress || subject.registeredAddress || ''),
          country: 'Poland'
        },
        regon: subject.regon,
        krs: subject.krs
      };

      return {
        isValid: true,
        isActive,
        company: companyData
      };

    } catch (error) {
      console.error('GUS API validation error:', error);
      return {
        isValid: false,
        isActive: false,
        error: `GUS validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Extract city from address string
   */
  private extractCity(address: string): string {
    // Polish address format: "ul. Street 123, 00-000 City"
    const cityMatch = address.match(/\d{2}-\d{3}\s+([^,]+)/);
    return cityMatch ? cityMatch[1].trim() : 'N/A';
  }

  /**
   * Extract postal code from address string
   */
  private extractPostalCode(address: string): string {
    const postalMatch = address.match(/(\d{2}-\d{3})/);
    return postalMatch ? postalMatch[1] : 'N/A';
  }

  /**
   * Validate NIP checksum (Polish algorithm)
   */
  private validateNIPChecksum(nip: string): boolean {
    const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
    const digits = nip.split('').map(Number);

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += digits[i] * weights[i];
    }

    const checksum = sum % 11;
    return checksum === digits[9];
  }
}

export const gusService = new GUSService();
