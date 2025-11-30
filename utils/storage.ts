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
  transactionType: "income" | "expense";
  amount: number;
  description: string;
  timestamp: number;
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

export interface CommissionShare {
  personName: string;
  amount: number;
  completedJobId: string;
}

export interface Debt {
  id: string;
  personName: string;
  totalAmount: number;
  paidAmount: number;
  payments: { date: number; amount: number }[];
  type: 'debt' | 'commission';
  createdAt: number;
  updatedAt: number;
}

export interface DashboardWidgetSettings {
  statCardsVisible: boolean;
  menuCardsVisible: boolean;
  revenueWidgetVisible: boolean;
  commissionWidgetVisible: boolean;
}

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Dashboard Widget Settings - Firebase based with uid
export const getDashboardWidgetSettings = async (uid: string): Promise<DashboardWidgetSettings> => {
  try {
    const snapshot = await get(ref(firebaseDatabase, `users/${uid}/settings/dashboardWidgets`));
    if (snapshot.exists()) {
      return snapshot.val() as DashboardWidgetSettings;
    }
    // Default settings
    return {
      statCardsVisible: true,
      menuCardsVisible: true,
      revenueWidgetVisible: true,
      commissionWidgetVisible: true,
    };
  } catch (error) {
    return {
      statCardsVisible: true,
      menuCardsVisible: true,
      revenueWidgetVisible: true,
      commissionWidgetVisible: true,
    };
  }
};

export const updateDashboardWidgetSettings = async (
  uid: string,
  settings: DashboardWidgetSettings
): Promise<boolean> => {
  try {
    await set(ref(firebaseDatabase, `users/${uid}/settings/dashboardWidgets`), settings);
    return true;
  } catch (error) {
    return false;
  }
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

export const updateCarrier = async (uid: string, carrierId: string, updates: Partial<Carrier>): Promise<boolean> => {
  try {
    await update(ref(firebaseDatabase, `users/${uid}/data/carriers/${carrierId}`), {
      ...updates,
      updatedAt: Date.now(),
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const deleteCarrier = async (uid: string, carrierId: string): Promise<boolean> => {
  try {
    await remove(ref(firebaseDatabase, `users/${uid}/data/carriers/${carrierId}`));
    return true;
  } catch (error) {
    return false;
  }
};

export const getVehicleTypeLabel = (type: string): string => {
  const labels: { [key: string]: string } = {
    "10-ton": "10 Tonluk",
    "20-ton": "20 Tonluk",
    "30-ton": "30 Tonluk",
    "40-ton": "40 Tonluk",
    "50-ton": "50 Tonluk",
    "60-ton": "60 Tonluk",
    "doseme": "Döşeme",
    "platformlu": "Platformlu",
    "kapali": "Kapalı",
  };
  return labels[type] || type;
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

export const updateCompany = async (uid: string, companyId: string, updates: Partial<Company>): Promise<boolean> => {
  try {
    await update(ref(firebaseDatabase, `users/${uid}/data/companies/${companyId}`), {
      ...updates,
      updatedAt: Date.now(),
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const deleteCompany = async (uid: string, companyId: string): Promise<boolean> => {
  try {
    await remove(ref(firebaseDatabase, `users/${uid}/data/companies/${companyId}`));
    return true;
  } catch (error) {
    return false;
  }
};

// Job functions - Firebase based with uid
export const getJobs = async (uid: string): Promise<PlannedJob[]> => {
  try {
    const snapshot = await get(ref(firebaseDatabase, `users/${uid}/data/plannedJobs`));
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
    await set(ref(firebaseDatabase, `users/${uid}/data/plannedJobs/${newJob.id}`), newJob);
    return newJob;
  } catch (error) {
    return null;
  }
};

export const updateJob = async (uid: string, jobId: string, updates: Partial<PlannedJob>): Promise<boolean> => {
  try {
    await update(ref(firebaseDatabase, `users/${uid}/data/plannedJobs/${jobId}`), {
      ...updates,
      updatedAt: Date.now(),
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const deleteJob = async (uid: string, jobId: string): Promise<boolean> => {
  try {
    await remove(ref(firebaseDatabase, `users/${uid}/data/plannedJobs/${jobId}`));
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
      j.loadingLocation.toLowerCase().includes(lowerQuery) ||
      j.deliveryLocation.toLowerCase().includes(lowerQuery) ||
      j.cargoType.toLowerCase().includes(lowerQuery)
  );
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

export const updateCompletedJob = async (uid: string, jobId: string, updates: Partial<CompletedJob>): Promise<boolean> => {
  try {
    await update(ref(firebaseDatabase, `users/${uid}/data/completedJobs/${jobId}`), {
      ...updates,
      updatedAt: Date.now(),
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const deleteCompletedJob = async (uid: string, jobId: string): Promise<boolean> => {
  try {
    await remove(ref(firebaseDatabase, `users/${uid}/data/completedJobs/${jobId}`));
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
      j.loadingLocation.toLowerCase().includes(lowerQuery) ||
      j.deliveryLocation.toLowerCase().includes(lowerQuery) ||
      j.cargoType.toLowerCase().includes(lowerQuery)
  );
};

export const markCommissionAsPaid = async (uid: string, jobId: string, isPaid: boolean): Promise<boolean> => {
  try {
    await update(ref(firebaseDatabase, `users/${uid}/data/completedJobs/${jobId}`), {
      commissionPaid: isPaid,
      updatedAt: Date.now(),
    });
    return true;
  } catch (error) {
    return false;
  }
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

export const updateIBAN = async (uid: string, ibanId: string, updates: Partial<IBAN>): Promise<boolean> => {
  try {
    await update(ref(firebaseDatabase, `users/${uid}/data/ibans/${ibanId}`), {
      ...updates,
      updatedAt: Date.now(),
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const deleteIBAN = async (uid: string, ibanId: string): Promise<boolean> => {
  try {
    await remove(ref(firebaseDatabase, `users/${uid}/data/ibans/${ibanId}`));
    return true;
  } catch (error) {
    return false;
  }
};

// Carrier Availability functions - Firebase based (public)
export const getCarrierAvailabilities = async (): Promise<CarrierAvailability[]> => {
  try {
    const snapshot = await get(ref(firebaseDatabase, "public/carrierAvailabilities"));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.values(data) as CarrierAvailability[];
    }
    return [];
  } catch (error) {
    return [];
  }
};

export const addCarrierAvailability = async (availability: Omit<CarrierAvailability, "id" | "createdAt">): Promise<CarrierAvailability | null> => {
  try {
    const newAvailability: CarrierAvailability = {
      ...availability,
      id: generateId(),
      createdAt: Date.now(),
    };
    await set(ref(firebaseDatabase, `public/carrierAvailabilities/${newAvailability.id}`), newAvailability);
    return newAvailability;
  } catch (error) {
    return null;
  }
};

export const updateCarrierAvailability = async (id: string, updates: Partial<CarrierAvailability>): Promise<boolean> => {
  try {
    await update(ref(firebaseDatabase, `public/carrierAvailabilities/${id}`), updates);
    return true;
  } catch (error) {
    return false;
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

// Debt functions - Firebase based with uid
export const getDebts = async (uid: string): Promise<Debt[]> => {
  try {
    const snapshot = await get(ref(firebaseDatabase, `users/${uid}/data/debts`));
    if (snapshot.exists()) {
      return Object.values(snapshot.val()) as Debt[];
    }
    return [];
  } catch (error) {
    return [];
  }
};

export const addDebt = async (uid: string, debt: Omit<Debt, "id" | "createdAt" | "updatedAt">): Promise<Debt | null> => {
  try {
    const newDebt: Debt = {
      ...debt,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await set(ref(firebaseDatabase, `users/${uid}/data/debts/${newDebt.id}`), newDebt);
    return newDebt;
  } catch (error) {
    return null;
  }
};

export const updateDebtPayment = async (uid: string, debtId: string, paymentAmount: number): Promise<boolean> => {
  try {
    const debtRef = ref(firebaseDatabase, `users/${uid}/data/debts/${debtId}`);
    const snapshot = await get(debtRef);
    if (!snapshot.exists()) return false;
    
    const debt = snapshot.val() as Debt;
    const newPaidAmount = Math.min(debt.paidAmount + paymentAmount, debt.totalAmount);
    const newPayment = { date: Date.now(), amount: paymentAmount };
    
    await update(debtRef, {
      paidAmount: newPaidAmount,
      payments: [...(debt.payments || []), newPayment],
      updatedAt: Date.now(),
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const saveCommissionShares = async (uid: string, completedJobId: string, shares: CommissionShare[]): Promise<boolean> => {
  try {
    for (const share of shares) {
      const existingDebt = await get(ref(firebaseDatabase, `users/${uid}/data/debts`));
      let debtId = null;
      
      if (existingDebt.exists()) {
        const debts = existingDebt.val();
        debtId = Object.keys(debts).find(
          (key) => debts[key].personName === share.personName
        );
      }
      
      if (debtId) {
        // Update existing debt - add to totalAmount
        const debtRef = ref(firebaseDatabase, `users/${uid}/data/debts/${debtId}`);
        const snapshot = await get(debtRef);
        if (snapshot.exists()) {
          const debt = snapshot.val() as Debt;
          await update(debtRef, {
            totalAmount: debt.totalAmount + share.amount,
            updatedAt: Date.now(),
          });
        }
      } else {
        // Create new debt with commission type
        await addDebt(uid, {
          personName: share.personName,
          totalAmount: share.amount,
          paidAmount: 0,
          payments: [],
          type: 'commission',
        });
      }
    }
    return true;
  } catch (error) {
    console.error("Commission share save error:", error);
    return false;
  }
};
