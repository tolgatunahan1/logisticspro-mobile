import { firebaseDatabase } from "@/constants/firebase";
import { ref, get, set, update, remove } from "firebase/database";

export interface Carrier {
  id: string;
  name: string;
  phone: string;
  nationalId: string;
  plate: string;
  dorsePlate?: string;
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
  carrierId?: string;
  carrierName: string;
  carrierPhone?: string;
  currentLocation: string;
  destinationLocation: string;
  capacity: "dolu" | "kısmiDolu" | "boş";
  loadType?: string;
  notes: string;
  createdAt: number;
  expiresAt: number;
}

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Carrier functions - Firebase based with uid
export const getCarriers = async (uid: string): Promise<Carrier[]> => {
  try {
    const snapshot = await get(ref(firebaseDatabase, `users/${uid}/data/carriers`));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.values(data) as Carrier[];
    }
    return [];
  } catch (error) {
    return [];
  }
};

export const addCarrier = async (uid: string, carrier: Omit<Carrier, "id" | "createdAt" | "updatedAt">): Promise<Carrier | null> => {
  try {
    const newCarrier: Carrier = {
      ...carrier,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await set(ref(firebaseDatabase, `users/${uid}/data/carriers/${newCarrier.id}`), newCarrier);
    return newCarrier;
  } catch (error) {
    return null;
  }
};

export const updateCarrier = async (uid: string, id: string, updates: Partial<Omit<Carrier, "id" | "createdAt">>): Promise<boolean> => {
  try {
    await update(ref(firebaseDatabase, `users/${uid}/data/carriers/${id}`), {
      ...updates,
      updatedAt: Date.now(),
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const deleteCarrier = async (uid: string, id: string): Promise<boolean> => {
  try {
    await remove(ref(firebaseDatabase, `users/${uid}/data/carriers/${id}`));
    return true;
  } catch (error) {
    return false;
  }
};

export const searchCarriers = (carriers: Carrier[], query: string): Carrier[] => {
  if (!query.trim()) return carriers;
  const lowerQuery = query.toLowerCase().trim();
  return carriers.filter(
    (c) =>
      c.name?.toLowerCase().includes(lowerQuery) ||
      c.phone?.toLowerCase().includes(lowerQuery) ||
      c.plate?.toLowerCase().includes(lowerQuery)
  );
};

// Company functions - Firebase based with uid
export const getCompanies = async (uid: string): Promise<Company[]> => {
  try {
    const snapshot = await get(ref(firebaseDatabase, `users/${uid}/data/companies`));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.values(data) as Company[];
    }
    return [];
  } catch (error) {
    return [];
  }
};

export const addCompany = async (uid: string, company: Omit<Company, "id" | "createdAt" | "updatedAt">): Promise<Company | null> => {
  try {
    const newCompany: Company = {
      ...company,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await set(ref(firebaseDatabase, `users/${uid}/data/companies/${newCompany.id}`), newCompany);
    return newCompany;
  } catch (error) {
    return null;
  }
};

export const updateCompany = async (uid: string, id: string, updates: Partial<Omit<Company, "id" | "createdAt">>): Promise<boolean> => {
  try {
    await update(ref(firebaseDatabase, `users/${uid}/data/companies/${id}`), {
      ...updates,
      updatedAt: Date.now(),
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const deleteCompany = async (uid: string, id: string): Promise<boolean> => {
  try {
    await remove(ref(firebaseDatabase, `users/${uid}/data/companies/${id}`));
    return true;
  } catch (error) {
    return false;
  }
};

export const searchCompanies = (companies: Company[], query: string): Company[] => {
  if (!query.trim()) return companies;
  const lowerQuery = query.toLowerCase().trim();
  return companies.filter(
    (c) =>
      c.name?.toLowerCase().includes(lowerQuery) ||
      c.phone?.toLowerCase().includes(lowerQuery) ||
      c.contactPerson?.toLowerCase().includes(lowerQuery) ||
      c.address?.toLowerCase().includes(lowerQuery)
  );
};

// Job functions - Firebase based with uid
export const getJobs = async (uid: string): Promise<PlannedJob[]> => {
  try {
    const snapshot = await get(ref(firebaseDatabase, `users/${uid}/data/jobs`));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.values(data) as PlannedJob[];
    }
    return [];
  } catch (error) {
    return [];
  }
};

export const addJob = async (uid: string, job: Omit<PlannedJob, "id" | "createdAt" | "updatedAt">): Promise<PlannedJob | null> => {
  try {
    const newJob: PlannedJob = {
      ...job,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await set(ref(firebaseDatabase, `users/${uid}/data/jobs/${newJob.id}`), newJob);
    return newJob;
  } catch (error) {
    return null;
  }
};

export const updateJob = async (uid: string, id: string, updates: Partial<Omit<PlannedJob, "id" | "createdAt">>): Promise<boolean> => {
  try {
    await update(ref(firebaseDatabase, `users/${uid}/data/jobs/${id}`), {
      ...updates,
      updatedAt: Date.now(),
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const deleteJob = async (uid: string, id: string): Promise<boolean> => {
  try {
    await remove(ref(firebaseDatabase, `users/${uid}/data/jobs/${id}`));
    return true;
  } catch (error) {
    return false;
  }
};

export const searchJobs = (jobs: PlannedJob[], query: string): PlannedJob[] => {
  if (!query.trim()) return jobs;
  const lowerQuery = query.toLowerCase().trim();
  return jobs.filter(
    (j) =>
      j.cargoType?.toLowerCase().includes(lowerQuery) ||
      j.loadingLocation?.toLowerCase().includes(lowerQuery) ||
      j.deliveryLocation?.toLowerCase().includes(lowerQuery)
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
  return found ? found.label : (value && value.trim() ? value : "-");
};

// Completed Job functions - Firebase based with uid
export const getCompletedJobs = async (uid: string): Promise<CompletedJob[]> => {
  try {
    const snapshot = await get(ref(firebaseDatabase, `users/${uid}/data/completedJobs`));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.values(data) as CompletedJob[];
    }
    return [];
  } catch (error) {
    return [];
  }
};

export const addCompletedJob = async (uid: string, job: Omit<CompletedJob, "id" | "createdAt" | "updatedAt">): Promise<CompletedJob | null> => {
  try {
    const newJob: CompletedJob = {
      ...job,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await set(ref(firebaseDatabase, `users/${uid}/data/completedJobs/${newJob.id}`), newJob);
    return newJob;
  } catch (error) {
    return null;
  }
};

export const updateCompletedJob = async (uid: string, id: string, updates: Partial<Omit<CompletedJob, "id" | "createdAt">>): Promise<boolean> => {
  try {
    await update(ref(firebaseDatabase, `users/${uid}/data/completedJobs/${id}`), {
      ...updates,
      updatedAt: Date.now(),
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const markCommissionAsPaid = async (uid: string, id: string, isPaid: boolean): Promise<boolean> => {
  try {
    await update(ref(firebaseDatabase, `users/${uid}/data/completedJobs/${id}`), {
      commissionPaid: isPaid,
      updatedAt: Date.now(),
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const deleteCompletedJob = async (uid: string, id: string): Promise<boolean> => {
  try {
    const completedJob = await get(ref(firebaseDatabase, `users/${uid}/data/completedJobs/${id}`));
    if (completedJob.exists()) {
      const job = completedJob.val();
      // Restore planned job if it exists
      if (job.plannedJobId) {
        const plannedJobRef = ref(firebaseDatabase, `users/${uid}/data/jobs/${job.plannedJobId}`);
        const plannedSnapshot = await get(plannedJobRef);
        if (!plannedSnapshot.exists()) {
          const restoredJob: PlannedJob = {
            id: job.plannedJobId,
            companyId: job.companyId,
            cargoType: job.cargoType,
            tonnage: job.tonnage,
            dimensions: job.dimensions,
            loadingLocation: job.loadingLocation,
            deliveryLocation: job.deliveryLocation,
            loadingDate: job.loadingDate,
            deliveryDate: job.deliveryDate,
            transportationCost: job.transportationCost,
            commissionCost: job.commissionCost,
            notes: job.notes || "",
            createdAt: job.createdAt,
            updatedAt: Date.now(),
          };
          await set(plannedJobRef, restoredJob);
        }
      }
    }
    await remove(ref(firebaseDatabase, `users/${uid}/data/completedJobs/${id}`));
    return true;
  } catch (error) {
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

// IBAN functions - Firebase based with uid
export const getIBANs = async (uid: string): Promise<IBAN[]> => {
  try {
    const snapshot = await get(ref(firebaseDatabase, `users/${uid}/data/ibans`));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.values(data) as IBAN[];
    }
    return [];
  } catch (error) {
    return [];
  }
};

export const addIBAN = async (uid: string, iban: Omit<IBAN, "id" | "createdAt" | "updatedAt">): Promise<IBAN | null> => {
  try {
    const newIBAN: IBAN = {
      ...iban,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await set(ref(firebaseDatabase, `users/${uid}/data/ibans/${newIBAN.id}`), newIBAN);
    return newIBAN;
  } catch (error) {
    return null;
  }
};

export const deleteIBAN = async (uid: string, id: string): Promise<boolean> => {
  try {
    await remove(ref(firebaseDatabase, `users/${uid}/data/ibans/${id}`));
    return true;
  } catch (error) {
    return false;
  }
};

// Company Wallet functions - Firebase based with uid
export const getCompanyWallet = async (uid: string): Promise<CompanyWallet> => {
  try {
    const snapshot = await get(ref(firebaseDatabase, `users/${uid}/data/wallet`));
    if (snapshot.exists()) {
      return snapshot.val() as CompanyWallet;
    }
    // Return default wallet
    return {
      id: generateId(),
      totalBalance: 0,
      totalEarned: 0,
      totalPaid: 0,
      transactions: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  } catch (error) {
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

export const updateCompanyWallet = async (uid: string, wallet: CompanyWallet): Promise<boolean> => {
  try {
    await set(ref(firebaseDatabase, `users/${uid}/data/wallet`), {
      ...wallet,
      updatedAt: Date.now(),
    });
    return true;
  } catch (error) {
    return false;
  }
};

// Carrier Availability functions - Firebase based
export const getCarrierAvailabilities = async (): Promise<CarrierAvailability[]> => {
  try {
    const snapshot = await get(ref(firebaseDatabase, `public/carrierAvailabilities`));
    if (snapshot.exists()) {
      const data = snapshot.val();
      if (typeof data === 'object' && data !== null) {
        const result = Object.values(data).filter(item => item && typeof item === 'object') as CarrierAvailability[];
        return result;
      }
    }
    return [];
  } catch (error) {
    console.error("❌ Firebase read error:", error);
    return [];
  }
};

export const addCarrierAvailability = async (availability: Omit<CarrierAvailability, "id" | "createdAt" | "expiresAt">): Promise<CarrierAvailability | null> => {
  try {
    const newAvailability: CarrierAvailability = {
      ...availability,
      id: generateId(),
      createdAt: Date.now(),
      expiresAt: Date.now() + 12 * 60 * 60 * 1000, // 12 hours
    };
    await set(ref(firebaseDatabase, `public/carrierAvailabilities/${newAvailability.id}`), newAvailability);
    await new Promise(resolve => setTimeout(resolve, 300));
    return newAvailability;
  } catch (error) {
    console.error("Write error:", error);
    return null;
  }
};

export const deleteCarrierAvailability = async (id: string): Promise<boolean> => {
  try {
    await remove(ref(firebaseDatabase, `public/carrierAvailabilities/${id}`));
    return true;
  } catch (error) {
    return false;
  }
};

export const searchCarrierAvailabilities = (availabilities: CarrierAvailability[], query: string): CarrierAvailability[] => {
  if (!query.trim()) return availabilities;
  const lowerQuery = query.toLowerCase().trim();
  return availabilities.filter(
    (a) =>
      a.carrierName.toLowerCase().includes(lowerQuery) ||
      a.currentLocation.toLowerCase().includes(lowerQuery) ||
      a.destinationLocation.toLowerCase().includes(lowerQuery)
  );
};
