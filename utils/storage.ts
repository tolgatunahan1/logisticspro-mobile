import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Carrier {
  id: string;
  name: string;
  phone: string;
  plate: string;
  vehicleType: string;
  createdAt: number;
  updatedAt: number;
}

export interface Company {
  id: string;
  name: string;
  phone: string;
  address: string;
  contactPerson: string;
  createdAt: number;
  updatedAt: number;
}

const CARRIERS_STORAGE_KEY = "@nakliyeci_carriers";
const COMPANIES_STORAGE_KEY = "@nakliyeci_companies";

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Carrier functions
export const getCarriers = async (): Promise<Carrier[]> => {
  try {
    const stored = await AsyncStorage.getItem(CARRIERS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.error("Failed to get carriers:", error);
    return [];
  }
};

export const saveCarriers = async (carriers: Carrier[]): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(CARRIERS_STORAGE_KEY, JSON.stringify(carriers));
    return true;
  } catch (error) {
    console.error("Failed to save carriers:", error);
    return false;
  }
};

export const addCarrier = async (carrier: Omit<Carrier, "id" | "createdAt" | "updatedAt">): Promise<Carrier | null> => {
  try {
    const carriers = await getCarriers();
    const newCarrier: Carrier = {
      ...carrier,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    carriers.unshift(newCarrier);
    await saveCarriers(carriers);
    return newCarrier;
  } catch (error) {
    console.error("Failed to add carrier:", error);
    return null;
  }
};

export const updateCarrier = async (id: string, updates: Partial<Omit<Carrier, "id" | "createdAt">>): Promise<boolean> => {
  try {
    const carriers = await getCarriers();
    const index = carriers.findIndex((c) => c.id === id);
    if (index === -1) return false;
    
    carriers[index] = {
      ...carriers[index],
      ...updates,
      updatedAt: Date.now(),
    };
    await saveCarriers(carriers);
    return true;
  } catch (error) {
    console.error("Failed to update carrier:", error);
    return false;
  }
};

export const deleteCarrier = async (id: string): Promise<boolean> => {
  try {
    const carriers = await getCarriers();
    const filtered = carriers.filter((c) => c.id !== id);
    await saveCarriers(filtered);
    return true;
  } catch (error) {
    console.error("Failed to delete carrier:", error);
    return false;
  }
};

export const searchCarriers = (carriers: Carrier[], query: string): Carrier[] => {
  if (!query.trim()) return carriers;
  const lowerQuery = query.toLowerCase().trim();
  return carriers.filter(
    (c) =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.phone.includes(lowerQuery) ||
      c.plate.toLowerCase().includes(lowerQuery)
  );
};

// Company functions
export const getCompanies = async (): Promise<Company[]> => {
  try {
    const stored = await AsyncStorage.getItem(COMPANIES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.error("Failed to get companies:", error);
    return [];
  }
};

export const saveCompanies = async (companies: Company[]): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(COMPANIES_STORAGE_KEY, JSON.stringify(companies));
    return true;
  } catch (error) {
    console.error("Failed to save companies:", error);
    return false;
  }
};

export const addCompany = async (company: Omit<Company, "id" | "createdAt" | "updatedAt">): Promise<Company | null> => {
  try {
    const companies = await getCompanies();
    const newCompany: Company = {
      ...company,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    companies.unshift(newCompany);
    await saveCompanies(companies);
    return newCompany;
  } catch (error) {
    console.error("Failed to add company:", error);
    return null;
  }
};

export const updateCompany = async (id: string, updates: Partial<Omit<Company, "id" | "createdAt">>): Promise<boolean> => {
  try {
    const companies = await getCompanies();
    const index = companies.findIndex((c) => c.id === id);
    if (index === -1) return false;
    
    companies[index] = {
      ...companies[index],
      ...updates,
      updatedAt: Date.now(),
    };
    await saveCompanies(companies);
    return true;
  } catch (error) {
    console.error("Failed to update company:", error);
    return false;
  }
};

export const deleteCompany = async (id: string): Promise<boolean> => {
  try {
    const companies = await getCompanies();
    const filtered = companies.filter((c) => c.id !== id);
    await saveCompanies(filtered);
    return true;
  } catch (error) {
    console.error("Failed to delete company:", error);
    return false;
  }
};

export const searchCompanies = (companies: Company[], query: string): Company[] => {
  if (!query.trim()) return companies;
  const lowerQuery = query.toLowerCase().trim();
  return companies.filter(
    (c) =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.phone.includes(lowerQuery) ||
      c.contactPerson.toLowerCase().includes(lowerQuery) ||
      c.address.toLowerCase().includes(lowerQuery)
  );
};

export const VEHICLE_TYPES = [
  { label: "Kamyon", value: "kamyon" },
  { label: "Kamyonet", value: "kamyonet" },
  { label: "Tır", value: "tir" },
  { label: "Açık Kasa", value: "acik_kasa" },
  { label: "Kapalı Kasa", value: "kapali_kasa" },
];

export const getVehicleTypeLabel = (value: string): string => {
  const found = VEHICLE_TYPES.find((v) => v.value === value);
  return found ? found.label : value;
};
