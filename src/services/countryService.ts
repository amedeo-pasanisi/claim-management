const API_BASE_URL = "http://localhost:8000";

export type ApiCountry = {
  id: string;
  name: string;
  flagUrl: string;
};

export type CountryCreateRequest = {
  name: string;
  flagUrl: string;
};

export type CountryUpdateRequest = {
  name: string;
  flagUrl: string;
};

class CountryService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    return response.json();
  }

  async getAllCountries(): Promise<ApiCountry[]> {
    const response = await fetch(`${API_BASE_URL}/countries`);
    return this.handleResponse<ApiCountry[]>(response);
  }

  async getCountryById(id: string): Promise<ApiCountry> {
    const response = await fetch(`${API_BASE_URL}/countries/${id}`);
    return this.handleResponse<ApiCountry>(response);
  }

  async createCountry(data: CountryCreateRequest): Promise<ApiCountry> {
    const response = await fetch(`${API_BASE_URL}/countries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return this.handleResponse<ApiCountry>(response);
  }

  async updateCountry(id: string, data: CountryUpdateRequest): Promise<ApiCountry> {
    const response = await fetch(`${API_BASE_URL}/countries/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return this.handleResponse<ApiCountry>(response);
  }

  async deleteCountry(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/countries/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
  }
}

export const countryService = new CountryService();