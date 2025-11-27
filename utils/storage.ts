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

export interface PlannedJob {
  id: string;
  companyId: string;
  cargoType: string;
  tonnage: string;
  dimensions: string;
  loadingLocation: string;
  deliveryLocation: string;
  loadingDate: number;
  deliveryDate: number;
  transportationCost: string;
  commissionCost: string;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface CompletedJob {
  id: string;
  companyId: string;
  carrierId: string;
  plannedJobId: string;
  cargoType: string;
  tonnage: string;
  dimensions: string;
  loadingLocation: string;
  deliveryLocation: string;
  loadingDate: number;
  deliveryDate: number;
  transportationCost: string;
  commissionCost: string;
  completionDate: number;
  notes: string;
  commissionPaid: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CompanyWallet {
  id: string;
  totalBalance: number;
  totalEarned: number;
  totalPaid: number;
  transactions: WalletTransaction[];
  createdAt: number;
  updatedAt: number;
}

export interface WalletTransaction {
  id: string;
  completedJobId: string;
  amount: number;
  type: "income" | "payment";
  description: string;
  createdAt: number;
}

export interface IBAN {
  id: string;
  ibanNumber: string;
  nameSurname: string;
  createdAt: number;
  updatedAt: number;
}

export interface CarrierAvailability {
  id: string;
  carrierId?: string; // Kayıtlı nakliyeci için - isteğe bağlı
  carrierName: string; // Nakliyeci adı (kayıtlı/kayıtsız)
  carrierPhone?: string; // Telefon numarası
  currentLocation: string; // Şu anda bulunduğu yer
  destinationLocation: string; // Gideceği yer
  capacity: "dolu" | "kısmiDolu" | "boş"; // Kapasite durumu
  loadType?: string; // Ne tür yüke uygun (isteğe bağlı)
  notes: string; // Ek notlar
  createdAt: number;
  expiresAt: number; // Ne zaman silinecek (12 saat sonrası vs)
}

const CARRIERS_STORAGE_KEY = "@nakliyeci_carriers";
const COMPANIES_STORAGE_KEY = "@nakliyeci_companies";
const JOBS_STORAGE_KEY = "@nakliyeci_jobs";
const COMPLETED_JOBS_STORAGE_KEY = "@nakliyeci_completed_jobs";
const IBANS_STORAGE_KEY = "@nakliyeci_ibans";
const COMPANY_WALLET_STORAGE_KEY = "@nakliyeci_company_wallet";
const CARRIER_AVAILABILITY_STORAGE_KEY = "@nakliyeci_carrier_availability";

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
    const beforeCount = carriers.length;
    const filtered = carriers.filter((c) => c.id !== id);
    
    if (filtered.length === beforeCount) {
      console.warn("Carrier not found with id:", id);
      return false;
    }
    
    const jsonData = JSON.stringify(filtered);
    await AsyncStorage.setItem(CARRIERS_STORAGE_KEY, jsonData);
    
    // Verify write succeeded
    const verify = await AsyncStorage.getItem(CARRIERS_STORAGE_KEY);
    if (!verify || verify !== jsonData) {
      console.error("Carrier delete verification failed");
      return false;
    }
    
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
    const beforeCount = companies.length;
    const filtered = companies.filter((c) => c.id !== id);
    
    if (filtered.length === beforeCount) {
      console.warn("Company not found with id:", id);
      return false;
    }
    
    const jsonData = JSON.stringify(filtered);
    await AsyncStorage.setItem(COMPANIES_STORAGE_KEY, jsonData);
    
    // Verify write succeeded
    const verify = await AsyncStorage.getItem(COMPANIES_STORAGE_KEY);
    if (!verify || verify !== jsonData) {
      console.error("Company delete verification failed");
      return false;
    }
    
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

// Job functions
export const getJobs = async (): Promise<PlannedJob[]> => {
  try {
    const stored = await AsyncStorage.getItem(JOBS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.error("Failed to get jobs:", error);
    return [];
  }
};

export const saveJobs = async (jobs: PlannedJob[]): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
    return true;
  } catch (error) {
    console.error("Failed to save jobs:", error);
    return false;
  }
};

export const addJob = async (job: Omit<PlannedJob, "id" | "createdAt" | "updatedAt">): Promise<PlannedJob | null> => {
  try {
    const jobs = await getJobs();
    const newJob: PlannedJob = {
      ...job,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    jobs.unshift(newJob);
    await saveJobs(jobs);
    return newJob;
  } catch (error) {
    console.error("Failed to add job:", error);
    return null;
  }
};

export const updateJob = async (id: string, updates: Partial<Omit<PlannedJob, "id" | "createdAt">>): Promise<boolean> => {
  try {
    const jobs = await getJobs();
    const index = jobs.findIndex((j) => j.id === id);
    if (index === -1) return false;
    
    jobs[index] = {
      ...jobs[index],
      ...updates,
      updatedAt: Date.now(),
    };
    await saveJobs(jobs);
    return true;
  } catch (error) {
    console.error("Failed to update job:", error);
    return false;
  }
};

export const deleteJob = async (id: string): Promise<boolean> => {
  try {
    const jobs = await getJobs();
    const beforeCount = jobs.length;
    const filtered = jobs.filter((j) => j.id !== id);
    
    if (filtered.length === beforeCount) {
      console.warn("Job not found with id:", id);
      return false;
    }
    
    const jsonData = JSON.stringify(filtered);
    await AsyncStorage.setItem(JOBS_STORAGE_KEY, jsonData);
    
    // Verify write succeeded
    const verify = await AsyncStorage.getItem(JOBS_STORAGE_KEY);
    if (!verify || verify !== jsonData) {
      console.error("Job delete verification failed");
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Failed to delete job:", error);
    return false;
  }
};

export const searchJobs = (jobs: PlannedJob[], query: string): PlannedJob[] => {
  if (!query.trim()) return jobs;
  const lowerQuery = query.toLowerCase().trim();
  return jobs.filter(
    (j) =>
      j.cargoType.toLowerCase().includes(lowerQuery) ||
      j.loadingLocation.toLowerCase().includes(lowerQuery) ||
      j.deliveryLocation.toLowerCase().includes(lowerQuery)
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

// Completed Job functions
export const getCompletedJobs = async (): Promise<CompletedJob[]> => {
  try {
    const stored = await AsyncStorage.getItem(COMPLETED_JOBS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.error("Failed to get completed jobs:", error);
    return [];
  }
};

export const saveCompletedJobs = async (jobs: CompletedJob[]): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(COMPLETED_JOBS_STORAGE_KEY, JSON.stringify(jobs));
    return true;
  } catch (error) {
    console.error("Failed to save completed jobs:", error);
    return false;
  }
};

export const addCompletedJob = async (job: Omit<CompletedJob, "id" | "createdAt" | "updatedAt">): Promise<CompletedJob | null> => {
  try {
    const jobs = await getCompletedJobs();
    const newJob: CompletedJob = {
      ...job,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    jobs.unshift(newJob);
    await saveCompletedJobs(jobs);
    return newJob;
  } catch (error) {
    console.error("Failed to add completed job:", error);
    return null;
  }
};

export const updateCompletedJob = async (id: string, updates: Partial<Omit<CompletedJob, "id" | "createdAt">>): Promise<boolean> => {
  try {
    const jobs = await getCompletedJobs();
    const index = jobs.findIndex((j) => j.id === id);
    if (index === -1) return false;
    
    jobs[index] = {
      ...jobs[index],
      ...updates,
      updatedAt: Date.now(),
    };
    await saveCompletedJobs(jobs);
    return true;
  } catch (error) {
    console.error("Failed to update completed job:", error);
    return false;
  }
};

export const deleteCompletedJob = async (id: string): Promise<boolean> => {
  try {
    const completedJobs = await getCompletedJobs();
    const jobToDelete = completedJobs.find((j) => j.id === id);
    
    if (!jobToDelete) return false;

    // Planlı işi geri yükle
    if (jobToDelete.plannedJobId) {
      const plannedJobs = await getJobs();
      const plannedJobExists = plannedJobs.some((j) => j.id === jobToDelete.plannedJobId);
      
      if (!plannedJobExists) {
        const restoredJob: PlannedJob = {
          id: jobToDelete.plannedJobId,
          companyId: jobToDelete.companyId,
          cargoType: jobToDelete.cargoType,
          tonnage: jobToDelete.tonnage,
          dimensions: jobToDelete.dimensions,
          loadingLocation: jobToDelete.loadingLocation,
          deliveryLocation: jobToDelete.deliveryLocation,
          loadingDate: jobToDelete.loadingDate,
          deliveryDate: jobToDelete.deliveryDate,
          transportationCost: jobToDelete.transportationCost,
          commissionCost: jobToDelete.commissionCost,
          createdAt: jobToDelete.createdAt,
          updatedAt: Date.now(),
        };
        plannedJobs.unshift(restoredJob);
        const jobJsonData = JSON.stringify(plannedJobs);
        await AsyncStorage.setItem(JOBS_STORAGE_KEY, jobJsonData);
      }
    }
    
    // Sefer sil
    const beforeCount = completedJobs.length;
    const filtered = completedJobs.filter((j) => j.id !== id);
    
    if (filtered.length === beforeCount) {
      console.warn("Completed job not found with id:", id);
      return false;
    }
    
    const jsonData = JSON.stringify(filtered);
    await AsyncStorage.setItem(COMPLETED_JOBS_STORAGE_KEY, jsonData);
    
    // Verify write succeeded
    const verify = await AsyncStorage.getItem(COMPLETED_JOBS_STORAGE_KEY);
    if (!verify || verify !== jsonData) {
      console.error("Completed job delete verification failed");
      return false;
    }
    
    // Cüzdanı güncelle
    const wallet = await getCompanyWallet();
    await saveCompanyWallet(wallet);
    
    return true;
  } catch (error) {
    console.error("Failed to delete completed job:", error);
    return false;
  }
};

export const searchCompletedJobs = (jobs: CompletedJob[], query: string): CompletedJob[] => {
  if (!query.trim()) return jobs;
  const lowerQuery = query.toLowerCase().trim();
  return jobs.filter(
    (j) =>
      j.cargoType.toLowerCase().includes(lowerQuery) ||
      j.loadingLocation.toLowerCase().includes(lowerQuery) ||
      j.deliveryLocation.toLowerCase().includes(lowerQuery) ||
      j.notes.toLowerCase().includes(lowerQuery)
  );
};

// IBAN functions
export const getIBANs = async (): Promise<IBAN[]> => {
  try {
    const stored = await AsyncStorage.getItem(IBANS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.error("Failed to get IBANs:", error);
    return [];
  }
};

export const saveIBANs = async (ibans: IBAN[]): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(IBANS_STORAGE_KEY, JSON.stringify(ibans));
    return true;
  } catch (error) {
    console.error("Failed to save IBANs:", error);
    return false;
  }
};

export const addIBAN = async (iban: Omit<IBAN, "id" | "createdAt" | "updatedAt">): Promise<IBAN | null> => {
  try {
    const ibans = await getIBANs();
    const newIBAN: IBAN = {
      ...iban,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    ibans.unshift(newIBAN);
    await saveIBANs(ibans);
    return newIBAN;
  } catch (error) {
    console.error("Failed to add IBAN:", error);
    return null;
  }
};

export const deleteIBAN = async (id: string): Promise<boolean> => {
  try {
    const ibans = await getIBANs();
    const beforeCount = ibans.length;
    const filtered = ibans.filter((i) => i.id !== id);
    
    if (filtered.length === beforeCount) {
      console.warn("IBAN not found with id:", id);
      return false;
    }
    
    const jsonData = JSON.stringify(filtered);
    await AsyncStorage.setItem(IBANS_STORAGE_KEY, jsonData);
    
    // Verify write succeeded
    const verify = await AsyncStorage.getItem(IBANS_STORAGE_KEY);
    if (!verify || verify !== jsonData) {
      console.error("IBAN delete verification failed");
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Failed to delete IBAN:", error);
    return false;
  }
};

// Company Wallet functions
export const getCompanyWallet = async (): Promise<CompanyWallet> => {
  try {
    // Gerçekleşen seferleri oku
    const completedJobs = await getCompletedJobs();
    
    // Ödenmişlerin toplam tutarını hesapla
    const totalBalance = completedJobs
      .filter((job) => job.commissionPaid)
      .reduce((sum, job) => sum + (parseFloat(job.commissionCost) || 0), 0);
    
    // Tüm komisyonların toplam tutarını hesapla
    const totalEarned = completedJobs
      .reduce((sum, job) => sum + (parseFloat(job.commissionCost) || 0), 0);
    
    // Depolanmış veriyi al (geçmiş işlemler için)
    const stored = await AsyncStorage.getItem(COMPANY_WALLET_STORAGE_KEY);
    let transactions: WalletTransaction[] = [];
    if (stored) {
      const parsedWallet = JSON.parse(stored);
      const allTransactions = parsedWallet.transactions || [];
      // Silinmiş seferlerin transaction'larını filtrele
      const completedJobIds = new Set(completedJobs.map((job) => job.id));
      transactions = allTransactions.filter(
        (tx: WalletTransaction) => completedJobIds.has(tx.completedJobId)
      );
    }
    
    const wallet: CompanyWallet = {
      id: generateId(),
      totalBalance,
      totalEarned,
      totalPaid: totalEarned - totalBalance,
      transactions,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    return wallet;
  } catch (error) {
    console.error("Failed to get company wallet:", error);
    return {
      id: generateId(),
      totalBalance: 0,
      totalEarned: 0,
      totalPaid: 0,
      transactions: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }
};

export const saveCompanyWallet = async (wallet: CompanyWallet): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(COMPANY_WALLET_STORAGE_KEY, JSON.stringify(wallet));
    return true;
  } catch (error) {
    console.error("Failed to save company wallet:", error);
    return false;
  }
};

export const markCommissionAsPaid = async (completedJobId: string): Promise<boolean> => {
  try {
    // Sefer işaretini değiştir
    const jobs = await getCompletedJobs();
    const jobIndex = jobs.findIndex((j) => j.id === completedJobId);
    if (jobIndex === -1) return false;

    const job = jobs[jobIndex];
    const carriers = await getCarriers();
    const carrier = carriers.find((c) => c.id === job.carrierId);
    const carrierName = carrier?.name || "Bilinmeyen Nakliyeci";

    jobs[jobIndex] = {
      ...job,
      commissionPaid: true,
      updatedAt: Date.now(),
    };
    await saveCompletedJobs(jobs);

    // Transaction ekle
    const wallet = await getCompanyWallet();
    const commissionAmount = parseFloat(job.commissionCost) || 0;
    const description = `${carrierName} - ${job.loadingLocation} → ${job.deliveryLocation}`;
    
    wallet.transactions.push({
      id: generateId(),
      completedJobId,
      amount: commissionAmount,
      type: "income",
      description,
      createdAt: Date.now(),
    });
    wallet.updatedAt = Date.now();
    await saveCompanyWallet(wallet);

    return true;
  } catch (error) {
    console.error("Failed to mark commission as paid:", error);
    return false;
  }
};

export const getUnpaidCommissions = async (): Promise<CompletedJob[]> => {
  try {
    const jobs = await getCompletedJobs();
    return jobs.filter((j) => !j.commissionPaid);
  } catch (error) {
    console.error("Failed to get unpaid commissions:", error);
    return [];
  }
};

// Carrier Availability functions
export const getCarrierAvailabilities = async (): Promise<CarrierAvailability[]> => {
  try {
    const stored = await AsyncStorage.getItem(CARRIER_AVAILABILITY_STORAGE_KEY);
    if (stored) {
      const availabilities = JSON.parse(stored);
      // Süresi geçenleri filtrele
      const now = Date.now();
      const filtered = availabilities.filter((a: CarrierAvailability) => a.expiresAt > now);
      // Güncellenmiş listeyi kaydet
      if (filtered.length !== availabilities.length) {
        await saveCarrierAvailabilities(filtered);
      }
      return filtered;
    }
    return [];
  } catch (error) {
    console.error("Failed to get carrier availabilities:", error);
    return [];
  }
};

export const saveCarrierAvailabilities = async (availabilities: CarrierAvailability[]): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(CARRIER_AVAILABILITY_STORAGE_KEY, JSON.stringify(availabilities));
    return true;
  } catch (error) {
    console.error("Failed to save carrier availabilities:", error);
    return false;
  }
};

export const addCarrierAvailability = async (
  availability: Omit<CarrierAvailability, "id" | "createdAt">
): Promise<CarrierAvailability | null> => {
  try {
    const availabilities = await getCarrierAvailabilities();
    const newAvailability: CarrierAvailability = {
      ...availability,
      id: generateId(),
      createdAt: Date.now(),
    };
    availabilities.unshift(newAvailability);
    await saveCarrierAvailabilities(availabilities);
    return newAvailability;
  } catch (error) {
    console.error("Failed to add carrier availability:", error);
    return null;
  }
};

export const deleteCarrierAvailability = async (id: string): Promise<boolean> => {
  try {
    const availabilities = await getCarrierAvailabilities();
    const filtered = availabilities.filter((a) => a.id !== id);
    await saveCarrierAvailabilities(filtered);
    return true;
  } catch (error) {
    console.error("Failed to delete carrier availability:", error);
    return false;
  }
};

export const updateCarrierAvailability = async (
  id: string,
  updates: Partial<Omit<CarrierAvailability, "id" | "createdAt">>
): Promise<CarrierAvailability | null> => {
  try {
    const availabilities = await getCarrierAvailabilities();
    const index = availabilities.findIndex((a) => a.id === id);
    if (index === -1) return null;

    const updated: CarrierAvailability = {
      ...availabilities[index],
      ...updates,
    };
    availabilities[index] = updated;
    await saveCarrierAvailabilities(availabilities);
    return updated;
  } catch (error) {
    console.error("Failed to update carrier availability:", error);
    return null;
  }
};

// Data Export and Delete Functions (GDPR Compliance)
export const exportAllData = async (): Promise<object> => {
  try {
    const carriers = await getCarriers();
    const companies = await getCompanies();
    const jobs = await getJobs();
    const completedJobs = await getCompletedJobs();
    const ibans = await getIBANs();
    const wallet = await getCompanyWallet();
    const availabilities = await getCarrierAvailabilities();

    const exportData = {
      exportDate: new Date().toISOString(),
      carriers,
      companies,
      plannedJobs: jobs,
      completedJobs,
      ibans,
      companyWallet: wallet,
      carrierAvailabilities: availabilities,
    };

    return exportData;
  } catch (error) {
    console.error("Failed to export data:", error);
    return {};
  }
};

export const deleteAllData = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(CARRIERS_STORAGE_KEY);
    await AsyncStorage.removeItem(COMPANIES_STORAGE_KEY);
    await AsyncStorage.removeItem(JOBS_STORAGE_KEY);
    await AsyncStorage.removeItem(COMPLETED_JOBS_STORAGE_KEY);
    await AsyncStorage.removeItem(IBANS_STORAGE_KEY);
    await AsyncStorage.removeItem(COMPANY_WALLET_STORAGE_KEY);
    await AsyncStorage.removeItem(CARRIER_AVAILABILITY_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("Failed to delete all data:", error);
    return false;
  }
};
