import { useState, useEffect } from "react";
import { OPERATIONS, JOB_ORDER_CATEGORIES } from "@/lib/jobOrderCategories";

const STORAGE_KEY = "custom_job_categories";

type CustomCategories = {
  [key: string]: string[];
};

export const useCustomCategories = () => {
  const [customCategories, setCustomCategories] = useState<CustomCategories>({});

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setCustomCategories(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to parse custom categories:", error);
      }
    }
  }, []);

  const saveToStorage = (categories: CustomCategories) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    setCustomCategories(categories);
  };

  const addCustomCategory = (operation: string, categoryName: string): { success: boolean; message: string } => {
    const trimmedName = categoryName.trim();
    
    if (!trimmedName) {
      return { success: false, message: "Category name cannot be empty" };
    }

    if (!OPERATIONS.includes(operation)) {
      return { success: false, message: "Invalid operation type" };
    }

    // Check if category already exists in predefined list
    const predefinedCategories = (JOB_ORDER_CATEGORIES as any)[operation] || [];
    if ((predefinedCategories as string[]).includes(trimmedName)) {
      return { success: false, message: "This category already exists in the predefined list" };
    }

    // Check if category already exists in custom list
    const existingCustom = customCategories[operation] || [];
    if (existingCustom.includes(trimmedName)) {
      return { success: false, message: "This custom category already exists" };
    }

    // Add the new custom category
    const updated = {
      ...customCategories,
      [operation]: [...existingCustom, trimmedName],
    };
    
    saveToStorage(updated);
    return { success: true, message: "Custom category added successfully" };
  };

  const getCategories = (operation: string): string[] => {
    const predefined = (JOB_ORDER_CATEGORIES as any)[operation] || [];
    const custom = customCategories[operation] || [];
    return [...predefined, ...custom];
  };

  const removeCustomCategory = (operation: string, categoryName: string): boolean => {
    const existingCustom = customCategories[operation] || [];
    const updated = {
      ...customCategories,
      [operation]: existingCustom.filter(cat => cat !== categoryName),
    };
    saveToStorage(updated);
    return true;
  };

  return {
    customCategories,
    addCustomCategory,
    getCategories,
    removeCustomCategory,
  };
};
